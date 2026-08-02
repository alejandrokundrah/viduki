// Webtor Torrent Player Modal
const React = require('react');
const PropTypes = require('prop-types');
const styles = require('./styles');

const extractInfohash = (magnet) => {
    if (!magnet) return null;
    const match = magnet.match(/urn:btih:([a-fA-F0-9]{40}|[A-Z2-7]{32})/i) || magnet.match(/([a-fA-F0-9]{40})/);
    return match ? match[1].toLowerCase() : null;
};

const cleanMagnet = (input) => {
    if (!input) return '';
    const trimmed = input.trim();
    if (trimmed.startsWith('magnet:')) return trimmed;
    const hash = extractInfohash(trimmed);
    if (hash) return `magnet:?xt=urn:btih:${hash}`;
    return trimmed;
};

const WebtorPlayer = ({ initialMagnet = '', onClose }) => {
    const [magnetInput, setMagnetInput] = React.useState(initialMagnet);
    const [activeMagnet, setActiveMagnet] = React.useState(cleanMagnet(initialMagnet));
    const [errorMsg, setErrorMsg] = React.useState('');
    const inputRef = React.useRef(null);

    React.useEffect(() => {
        if (initialMagnet) {
            const cleaned = cleanMagnet(initialMagnet);
            setMagnetInput(cleaned);
            setActiveMagnet(cleaned);
        }
    }, [initialMagnet]);

    React.useEffect(() => {
        if (!activeMagnet && inputRef.current) {
            inputRef.current.focus();
        }
    }, [activeMagnet]);

    React.useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handlePlay = () => {
        const cleaned = cleanMagnet(magnetInput);
        if (!cleaned) {
            setErrorMsg('Please paste a valid magnet link or torrent hash');
            return;
        }
        if (!cleaned.startsWith('magnet:')) {
            setErrorMsg('Invalid format. Please enter a magnet link (magnet:?xt=urn:btih:...) or 40-character infohash.');
            return;
        }
        setErrorMsg('');
        setActiveMagnet(cleaned);
    };

    const handleReset = () => {
        setActiveMagnet('');
        setMagnetInput('');
        setErrorMsg('');
    };

    const playerUrl = activeMagnet
        ? `https://webtor.io/show?magnet=${encodeURIComponent(activeMagnet)}`
        : null;

    return (
        <div className={styles['webtor-overlay']} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles['webtor-modal']}>

                <div className={styles['modal-header']}>
                    <div className={styles['header-left']}>
                        <div className={styles['webtor-icon']}>⚡</div>
                        <div>
                            <h2 className={styles['modal-title']}>Webtor Torrent Player</h2>
                            <p className={styles['modal-subtitle']}>Instant P2P streaming in your browser — no download required</p>
                        </div>
                    </div>
                    <button className={styles['close-btn']} onClick={onClose} aria-label="Close modal">✕</button>
                </div>

                {!activeMagnet && (
                    <div className={styles['input-area']}>
                        <div className={styles['input-label']}>
                            <span className={styles['magnet-icon']}>🧲</span>
                            Paste a <strong style={{ color: '#fcf007' }}>magnet link</strong> or <strong style={{ color: '#fcf007' }}>infohash</strong> to stream
                        </div>

                        <div className={styles['input-row']}>
                            <input
                                ref={inputRef}
                                type="text"
                                className={styles['magnet-input']}
                                placeholder="magnet:?xt=urn:btih:... or 40-char infohash"
                                value={magnetInput}
                                onChange={(e) => setMagnetInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handlePlay()}
                            />
                            <button className={styles['play-btn']} onClick={handlePlay}>
                                ▶ Stream Now
                            </button>
                        </div>

                        {errorMsg && <div className={styles['error-msg']}>{errorMsg}</div>}

                        <div className={styles['how-it-works']}>
                            <div className={styles['step']}>
                                <span className={styles['step-num']}>1</span>
                                <span>Copy any magnet link from Torrentio, TPB, YTS, or 1337x</span>
                            </div>
                            <div className={styles['step']}>
                                <span className={styles['step-num']}>2</span>
                                <span>Paste it into the box above</span>
                            </div>
                            <div className={styles['step']}>
                                <span className={styles['step-num']}>3</span>
                                <span>Click <strong style={{ color: '#fcf007' }}>Stream Now</strong> — Webtor buffers &amp; plays live</span>
                            </div>
                        </div>

                        <div className={styles['quick-links']}>
                            <span className={styles['quick-label']}>Torrent providers:</span>
                            {[
                                { name: '🏴‍☠️ The Pirate Bay', url: 'https://thepiratebay.org' },
                                { name: '🎬 YTS (Movies)', url: 'https://yts.mx' },
                                { name: '📺 EZTV (TV Shows)', url: 'https://eztv.re' },
                                { name: '🔗 1337x', url: 'https://1337x.to' },
                                { name: '🌸 Nyaa (Anime)', url: 'https://nyaa.si' },
                            ].map((site) => (
                                <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer" className={styles['quick-link']}>
                                    {site.name}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {activeMagnet && playerUrl && (
                    <div className={styles['player-area']}>
                        <div className={styles['player-topbar']}>
                            <div className={styles['topbar-left']}>
                                <span className={styles['now-streaming']}>🎬 Streaming via Webtor</span>
                            </div>
                            <div className={styles['topbar-right']}>
                                <a
                                    href={playerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles['external-btn']}
                                    title="Open player in a new tab"
                                >
                                    ↗ Open in New Tab
                                </a>
                                <button className={styles['change-btn']} onClick={handleReset}>
                                    ← New Torrent
                                </button>
                            </div>
                        </div>

                        <div className={styles['webtor-container']}>
                            <iframe
                                src={playerUrl}
                                title="Webtor Torrent Player"
                                className={styles['webtor-iframe']}
                                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

WebtorPlayer.propTypes = {
    initialMagnet: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

module.exports = WebtorPlayer;