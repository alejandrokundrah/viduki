// Onplay HeroBanner — auto-rotates through TMDB trending every 20 seconds
const React = require('react');
const { useNavigate } = require('react-router-dom');
const styles = require('./HeroBanner.less');

const TMDB_API_KEY = 'c41190049b0e2e1e3433b7b44f9c3fdf';
const ROTATE_INTERVAL = 20000; // 20 seconds

const HeroBanner = ({ item, onWatch, onMoreInfo }) => {
    const navigate = useNavigate();

    // List of trending items fetched from TMDB
    const [heroList, setHeroList] = React.useState([]);
    // Current index in heroList
    const [currentIndex, setCurrentIndex] = React.useState(0);
    // Fade transition state
    const [fading, setFading] = React.useState(false);

    // Fetch trending movies/tv for the rotating banner using TMDB API key
    React.useEffect(() => {
        let isMounted = true;

        fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}`)
            .then(res => res.json())
            .then(async data => {
                if (!isMounted || !data || !Array.isArray(data.results)) return;

                // Filter out people and items with no backdrop
                const valid = data.results.filter(
                    r => r.media_type !== 'person' && r.backdrop_path
                ).slice(0, 15);

                if (valid.length === 0) return;

                const withImdb = await Promise.all(
                    valid.map(async r => {
                        const mediaType = r.media_type === 'tv' ? 'tv' : 'movie';
                        let imdbId = null;
                        try {
                            const extRes = await fetch(`https://api.themoviedb.org/3/${mediaType}/${r.id}/external_ids?api_key=${TMDB_API_KEY}`);
                            const extData = await extRes.json();
                            imdbId = extData.imdb_id;
                        } catch (_) {}

                        return {
                            id: imdbId || (r.id ? `tt${r.id}` : r.id),
                            type: r.media_type === 'tv' ? 'series' : 'movie',
                            name: r.title || r.name || '',
                            description: r.overview || '',
                            rating: r.vote_average ? r.vote_average.toFixed(1) : null,
                            year: (r.release_date || r.first_air_date || '').slice(0, 4),
                            background: `https://image.tmdb.org/t/p/original${r.backdrop_path}`,
                            genres: [],
                        };
                    })
                );

                if (isMounted) {
                    setHeroList(withImdb);
                    setCurrentIndex(0);
                }
            })
            .catch(err => console.warn('TMDB Hero fetch error:', err));

        return () => { isMounted = false; };
    }, []);

    // Auto-rotate every 20s
    React.useEffect(() => {
        if (heroList.length <= 1) return;

        const timer = setInterval(() => {
            // Trigger fade-out
            setFading(true);
            setTimeout(() => {
                setCurrentIndex(prev => (prev + 1) % heroList.length);
                setFading(false);
            }, 600); // match CSS transition duration
        }, ROTATE_INTERVAL);

        return () => clearInterval(timer);
    }, [heroList]);

    // Allow manual dot navigation
    const goTo = (idx) => {
        if (idx === currentIndex) return;
        setFading(true);
        setTimeout(() => {
            setCurrentIndex(idx);
            setFading(false);
        }, 600);
    };

    // Determine active item (prefer TMDB heroList rotation)
    const activeItem = (heroList.length > 0 && heroList[currentIndex])
        ? heroList[currentIndex]
        : (item
            ? {
                id: item.id,
                type: item.type || 'movie',
                name: item.name || '',
                description: item.description || '',
                background: item.background || item.poster || '',
                rating: null,
                year: '',
            }
            : null);

    const title       = activeItem?.name        || 'Welcome to Onplay';
    const synopsis    = activeItem?.description || 'Discover the latest trending movies and TV shows. Stream anything, anywhere.';
    const bgImage     = activeItem?.background  || 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=1920&q=80';
    const rating      = activeItem?.rating;
    const year        = activeItem?.year;

    const handleWatchNow = () => {
        if (onWatch) { onWatch(); return; }
        if (activeItem?.id) navigate(`/metadetails/${activeItem.type}/${activeItem.id}`);
        else navigate('/discover');
    };

    const handleMoreInfo = () => {
        if (onMoreInfo) { onMoreInfo(); return; }
        if (activeItem?.id) navigate(`/metadetails/${activeItem.type}/${activeItem.id}`);
        else navigate('/discover');
    };

    return (
        <div className={styles['hero-banner-container']}>
            {/* Backdrop — cross-fades on change */}
            <div className={`${styles['hero-backdrop']} ${fading ? styles['fading'] : ''}`}>
                <img
                    key={bgImage}
                    src={bgImage}
                    alt={title}
                    className={styles['backdrop-img']}
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=1920&q=80';
                    }}
                />
                <div className={styles['gradient-overlay']} />
                <div className={styles['radial-overlay']} />
            </div>

            {/* Content */}
            <div className={`${styles['hero-content']} ${fading ? styles['content-fading'] : ''}`}>
                <h1 className={styles['movie-title']}>
                    <span className={styles['main-title']}>{title}</span>
                </h1>

                {/* Metadata row */}
                <div className={styles['metadata-row']}>
                    {rating && (
                        <>
                            <span className={styles['rating-badge']}>⭐ {rating}</span>
                            <span className={styles['meta-dot']}>•</span>
                        </>
                    )}
                    {year && (
                        <>
                            <span className={styles['meta-tag']}>{year}</span>
                            <span className={styles['meta-dot']}>•</span>
                        </>
                    )}
                    <span className={styles['meta-tag']}>
                        {activeItem?.type === 'series' ? 'Series' : 'Movie'}
                    </span>
                </div>

                <p className={styles['synopsis']}>
                    {synopsis.length > 220 ? synopsis.slice(0, 220) + '…' : synopsis}
                </p>

                <div className={styles['action-buttons']}>
                    <button className={styles['btn-watch-now']} onClick={handleWatchNow}>
                        <svg className={styles['btn-icon']} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        <span>Watch Now</span>
                    </button>

                    <button className={styles['btn-more-info']} onClick={handleMoreInfo}>
                        <svg className={styles['btn-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <span>More Info</span>
                    </button>
                </div>
            </div>

            {/* Dot indicators for manual navigation */}
            {heroList.length > 1 && (
                <div className={styles['hero-dots']}>
                    {heroList.map((_, i) => (
                        <button
                            key={i}
                            className={`${styles['hero-dot']} ${i === currentIndex ? styles['hero-dot-active'] : ''}`}
                            onClick={() => goTo(i)}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

module.exports = HeroBanner;
