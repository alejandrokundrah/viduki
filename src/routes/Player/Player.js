// Copyright (C) 2017-2026 Smart code 203358507

const React = require('react');
const { useParams, useNavigate } = require('react-router');
const { withCoreSuspender, useCoreSuspender, useStreamingServer } = require('stremio/common');
const { parseVidukiMedia, getVidukiUrl, getNextFallbackApi, VIDUKI_APIS } = require('stremio/common/viduki');
const { useFullscreen } = require('stremio/common');
const useVideo = require('./useVideo');
const Video = require('./Video');
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
    const { decodeStream } = useCoreSuspender();
    const streamingServer = useStreamingServer();

    const isViduki = typeof stream === 'string' && stream.startsWith('viduki_');
    const video = useVideo();

    const [decodedStream, setDecodedStream] = React.useState(null);

    React.useEffect(() => {
        if (isViduki || typeof stream !== 'string') return;
        try {
            const decoded = decodeStream(stream);
            setDecodedStream(decoded);
        } catch (e) {
            console.error('Failed to decode stream:', e);
        }
    }, [stream, isViduki]);

    React.useEffect(() => {
        if (!isViduki && decodedStream) {
            const streamingServerURL = streamingServer.baseUrl ?
                streamingServer.selected.transportUrl
                :
                null;
            video.load({
                stream: decodedStream,
                subtitles: [],
                streamingServerURL: streamingServerURL,
            });
        }
        return () => {
            if (!isViduki) {
                video.unload();
            }
        };
    }, [decodedStream, isViduki, streamingServer.baseUrl, streamingServer.selected]);

    const initialApi = React.useMemo(() => {
        if (isViduki) {
            const num = parseInt(stream.replace('viduki_', ''), 10);
            if (!isNaN(num) && num >= 1 && num <= 4) return num;
        }
        return 1;
    }, [stream, isViduki]);

    const [currentApi, setCurrentApi] = React.useState(initialApi);
    const [allFailed, setAllFailed] = React.useState(false);
    const [overlayVisible, setOverlayVisible] = React.useState(true);
    const overlayTimer = React.useRef(null);
    const containerRef = React.useRef(null);

    const [fullscreen, , , toggleFullscreen] = useFullscreen();

    const mediaInfo = React.useMemo(() => {
        if (isViduki) {
            return parseVidukiMedia({ type, id, videoId, video: null });
        }
        return null;
    }, [isViduki, type, id, videoId]);

    const iframeUrl = React.useMemo(() => {
        if (!isViduki || !mediaInfo?.mediaId) return null;
        return getVidukiUrl({
            api: currentApi,
            mediaType: mediaInfo.mediaType,
            mediaId: mediaInfo.mediaId,
            season: mediaInfo.season,
            episode: mediaInfo.episode,
            color: 'fcf007',
        });
    }, [isViduki, currentApi, mediaInfo]);

    const addonUrl = React.useMemo(() => {
        if (isViduki || !decodedStream) return null;
        return decodedStream.url || null;
    }, [isViduki, decodedStream]);

    const isTorrentAddon = React.useMemo(() => {
        if (isViduki || !decodedStream) return false;
        return typeof decodedStream.infoHash === 'string' && typeof decodedStream.fileIdx === 'number';
    }, [isViduki, decodedStream]);

    const showOverlay = React.useCallback(() => {
        setOverlayVisible(true);
        clearTimeout(overlayTimer.current);
        overlayTimer.current = setTimeout(() => setOverlayVisible(false), 4000);
    }, []);

    React.useEffect(() => {
        showOverlay();
        return () => clearTimeout(overlayTimer.current);
    }, []);

    React.useEffect(() => {
        const onMove = () => showOverlay();
        window.addEventListener('mousemove', onMove);
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
    }, [currentApi, isViduki]);

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
            <div className={styles['gradient-top']} />

            <div className={styles['overlay-bar']}>
                <button className={styles['back-pill-btn']} onClick={handleBack} title="Back" aria-label="Back">
                    {ICONS.back}
                    <span className={styles['back-btn-text']}>Back</span>
                </button>

                <div className={styles['bar-spacer']} />

                <div className={styles['right-controls']}>
                    {isViduki && VIDUKI_APIS.map((api) => {
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

                    {isViduki && (
                        <button
                            className={styles['server-pill']}
                            style={{ background: 'rgba(252, 240, 7, 0.15)', borderColor: 'rgba(252, 240, 7, 0.5)', color: '#fcf007' }}
                            title="Open Torrent Player"
                            onClick={() => window.dispatchEvent(new CustomEvent('open-webtor-player'))}
                        >
                            <span className={styles['pill-badge']} style={{ background: '#fcf007', color: '#000' }}>P2P</span>
                            <span className={styles['pill-text']}>⚡ Torrent Player</span>
                        </button>
                    )}

                    <div className={styles['divider']} />

                    <button className={styles['icon-btn']} onClick={toggleFullscreen} title="Toggle fullscreen" aria-label="Toggle fullscreen">
                        {fullscreen ? ICONS.fsExit : ICONS.fsEnter}
                    </button>
                </div>
            </div>

            <div className={styles['player-body']}>
                {isViduki ? (
                    allFailed ? (
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
                    )
                ) : addonUrl || isTorrentAddon ? (
                    <Video className={styles['video']} ref={video.containerRef} />
                ) : (
                    <div className={styles['state-screen']}>
                        <div className={styles['state-glow']} />
                        <div className={styles['state-icon']}>✕</div>
                        <div className={styles['state-title']}>Invalid Media</div>
                        <div className={styles['state-msg']}>No playable stream was found for this media.</div>
                        <div className={styles['state-actions']}>
                            <button className={styles['btn-secondary']} onClick={handleBack}>Go Back</button>
                        </div>
                    </div>
                )}

                {!isViduki && (addonUrl || isTorrentAddon) && (
                    <div
                        className={styles['iframe-cover']}
                        onMouseMove={showOverlay}
                        onClick={showOverlay}
                    />
                )}
            </div>
        </div>
    );
};

const PlayerFallback = () => (
    <div className={styles['player-container']} />
);

module.exports = withCoreSuspender(Player, PlayerFallback);