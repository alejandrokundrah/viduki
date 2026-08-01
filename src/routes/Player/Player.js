// Copyright (C) 2017-2026 Smart code 203358507

const React = require('react');
const { useParams, useNavigate } = require('react-router');
const { withCoreSuspender } = require('stremio/common');
const { parseVidukiMedia, getVidukiUrl, getNextFallbackApi, VIDUKI_APIS } = require('stremio/common/viduki');
const { useFullscreen } = require('stremio/common');
const styles = require('./styles');

const ICONS = {
    back: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    ),
    fsEnter: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" /><line x1="21" y1="3" x2="14" y2="10" />
            <polyline points="9 21 3 21 3 15" /><line x1="3" y1="21" x2="10" y2="14" />
        </svg>
    ),
    fsExit: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="8 3 3 3 3 8" /><line x1="3" y1="3" x2="9" y2="9" />
            <polyline points="16 3 21 3 21 8" /><line x1="21" y1="3" x2="15" y2="9" />
            <polyline points="8 21 3 21 3 16" /><line x1="3" y1="21" x2="9" y2="15" />
            <polyline points="16 21 21 21 21 16" /><line x1="21" y1="21" x2="15" y2="15" />
        </svg>
    ),
};

const API_LABELS = {
    1: { short: 'S1', full: 'Multi Server', badge: 'BEST' },
    2: { short: 'S2', full: 'Multi Lang',   badge: 'LANG' },
    3: { short: 'S3', full: 'Multi Embeds', badge: 'ALT'  },
    4: { short: 'S4', full: 'Premium',      badge: 'HD'   },
};

const Player = () => {
    const { stream, type, id, videoId } = useParams();
    const navigate = useNavigate();

    const initialApi = React.useMemo(() => {
        if (typeof stream === 'string' && stream.startsWith('viduki_')) {
            const num = parseInt(stream.replace('viduki_', ''), 10);
            if (!isNaN(num) && num >= 1 && num <= 4) return num;
        }
        return 1;
    }, [stream]);

    const [currentApi, setCurrentApi] = React.useState(initialApi);
    const [allFailed, setAllFailed] = React.useState(false);
    const [overlayVisible, setOverlayVisible] = React.useState(true);
    const overlayTimer = React.useRef(null);
    const containerRef = React.useRef(null);

    const [fullscreen, , , toggleFullscreen] = useFullscreen();

    const mediaInfo = React.useMemo(() => {
        return parseVidukiMedia({ type, id, videoId, video: null });
    }, [type, id, videoId]);

    const iframeUrl = React.useMemo(() => {
        if (!mediaInfo.mediaId) return null;
        return getVidukiUrl({
            api: currentApi,
            mediaType: mediaInfo.mediaType,
            mediaId: mediaInfo.mediaId,
            season: mediaInfo.season,
            episode: mediaInfo.episode,
            color: 'fcf007',
        });
    }, [currentApi, mediaInfo]);

    // Auto-hide overlay after 4s of no movement
    const showOverlay = React.useCallback(() => {
        setOverlayVisible(true);
        clearTimeout(overlayTimer.current);
        overlayTimer.current = setTimeout(() => setOverlayVisible(false), 4000);
    }, []);

    React.useEffect(() => {
        showOverlay();
        return () => clearTimeout(overlayTimer.current);
    }, []);

    // Listen to mouse movement at the window level so it fires even from edges
    React.useEffect(() => {
        const onMove = () => showOverlay();
        window.addEventListener('mousemove', onMove);
        // When the iframe steals focus (user clicked inside it), show the overlay briefly
        const onBlur = () => showOverlay();
        window.addEventListener('blur', onBlur);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('blur', onBlur);
        };
    }, [showOverlay]);

    React.useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.type === 'viduki:all-servers-failed') {
                const nextApi = getNextFallbackApi(currentApi);
                if (nextApi) {
                    setCurrentApi(nextApi);
                } else {
                    setAllFailed(true);
                }
            }
            if (event.data?.type === 'MEDIA_DATA') {
                try {
                    const mediaData = event.data.data;
                    if (mediaData) {
                        const existing = JSON.parse(localStorage.getItem('vidukinet-Progress') || '{}');
                        localStorage.setItem('vidukinet-Progress', JSON.stringify({ ...existing, ...mediaData }));
                    }
                } catch (err) {
                    console.error('Viduki progress error:', err);
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [currentApi]);

    const handleBack = React.useCallback(() => navigate(-1), [navigate]);

    const handleSelectApi = React.useCallback((apiId) => {
        setAllFailed(false);
        setCurrentApi(apiId);
        showOverlay();
    }, [showOverlay]);

    const handleRetry = React.useCallback(() => {
        setAllFailed(false);
        setCurrentApi(1);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`${styles['player-container']}${overlayVisible ? '' : ` ${styles['overlay-hidden']}`}`}
        >
            {/* Gradient overlays that fade in/out with the bar */}
            <div className={styles['gradient-top']} />

            {/* Floating overlay bar */}
            <div className={styles['overlay-bar']}>
                {/* Left: back */}
                <button className={styles['back-pill-btn']} onClick={handleBack} title="Back" aria-label="Back">
                    {ICONS.back}
                    <span className={styles['back-btn-text']}>Back</span>
                </button>

                {/* Spacer */}
                <div className={styles['bar-spacer']} />

                {/* Right: server pills + fullscreen grouped */}
                <div className={styles['right-controls']}>
                    {VIDUKI_APIS.map((api) => {
                        const active = currentApi === api.id;
                        const label = API_LABELS[api.id];
                        return (
                            <button
                                key={api.id}
                                className={`${styles['server-pill']}${active ? ` ${styles['server-pill-active']}` : ''}`}
                                title={label.full}
                                onClick={() => handleSelectApi(api.id)}
                            >
                                {active && <span className={styles['pill-badge']}>{label.badge}</span>}
                                <span className={styles['pill-text']}>{label.full}</span>
                            </button>
                        );
                    })}

                    <button
                        className={styles['server-pill']}
                        style={{ background: 'rgba(252, 240, 7, 0.15)', borderColor: 'rgba(252, 240, 7, 0.5)', color: '#fcf007' }}
                        title="Open Webtor Torrent Player"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-webtor-player'))}
                    >
                        <span className={styles['pill-badge']} style={{ background: '#fcf007', color: '#000' }}>P2P</span>
                        <span className={styles['pill-text']}>⚡ Torrent Player</span>
                    </button>

                    <div className={styles['divider']} />

                    <button className={styles['icon-btn']} onClick={toggleFullscreen} title="Toggle fullscreen" aria-label="Toggle fullscreen">
                        {fullscreen ? ICONS.fsExit : ICONS.fsEnter}
                    </button>
                </div>
            </div>

            {/* Player area */}
            <div className={styles['player-body']}>
                {allFailed ? (
                    <div className={styles['state-screen']}>
                        <div className={styles['state-glow']} />
                        <div className={styles['state-icon']}>⚠</div>
                        <div className={styles['state-title']}>All Servers Unavailable</div>
                        <div className={styles['state-msg']}>No stream was found across all Viduki servers for this title. Try playing via Torrent Player below.</div>
                        <div className={styles['state-actions']}>
                            <button className={styles['btn-primary']} style={{ background: '#fcf007', color: '#000' }} onClick={() => window.dispatchEvent(new CustomEvent('open-webtor-player'))}>
                                ⚡ Stream with Torrent Player
                            </button>
                            <button className={styles['btn-secondary']} onClick={handleRetry}>Try Again</button>
                            <button className={styles['btn-secondary']} onClick={handleBack}>Go Back</button>
                        </div>
                    </div>
                ) : !iframeUrl ? (
                    <div className={styles['state-screen']}>
                        <div className={styles['state-glow']} />
                        <div className={styles['state-icon']}>✕</div>
                        <div className={styles['state-title']}>Invalid Media</div>
                        <div className={styles['state-msg']}>A valid TMDB or IMDB ID is required for playback.</div>
                        <div className={styles['state-actions']}>
                            <button className={styles['btn-secondary']} onClick={handleBack}>Go Back</button>
                        </div>
                    </div>
                ) : (
                    <iframe
                        key={iframeUrl}
                        className={styles['player-iframe']}
                        src={iframeUrl}
                        title="Viduki Player"
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowFullScreen
                        referrerPolicy="no-referrer"
                    />
                )}

                {/* Transparent cover — activates only when overlay is hidden so the
                    iframe cannot swallow pointer events. Any move/click on it wakes
                    the overlay back up and then becomes pointer-events:none again. */}
                <div
                    className={styles['iframe-cover']}
                    onMouseMove={showOverlay}
                    onClick={showOverlay}
                />
            </div>
        </div>
    );
};

const PlayerFallback = () => (
    <div className={styles['player-container']} />
);

module.exports = withCoreSuspender(Player, PlayerFallback);
