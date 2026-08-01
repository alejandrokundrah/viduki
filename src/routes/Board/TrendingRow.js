// Onplay TrendingRow — filters person items, ensures every card has a poster
const React = require('react');
const { useNavigate } = require('react-router-dom');
const styles = require('./TrendingRow.less');

const TMDB_API_KEY = 'c41190049b0e2e1e3433b7b44f9c3fdf';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
const TMDB_FALLBACK = 'https://image.tmdb.org/t/p/w500';

// Static fallback list — all verified high quality TMDB poster URLs
const TRENDING_ITEMS = [
    { rank: 1,  id: 'tt13443470', type: 'series', name: 'Wednesday',                        poster: `${TMDB_FALLBACK}/9PF29Y2XiOfE2Z2eaVhnvR9eeMz.jpg` },
    { rank: 2,  id: 'tt9362120',  type: 'series', name: 'The Last of Us',                   poster: `${TMDB_FALLBACK}/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg` },
    { rank: 3,  id: 'tt1630029',  type: 'movie',  name: 'Avatar: The Way of Water',          poster: `${TMDB_FALLBACK}/t6HIw3zMMDYUZd7yY9W3N9Sq230.jpg` },
    { rank: 4,  id: 'tt10872600', type: 'movie',  name: 'Spider-Man: No Way Home',           poster: `${TMDB_FALLBACK}/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg` },
    { rank: 5,  id: 'tt5433140',  type: 'movie',  name: 'Fast X',                            poster: `${TMDB_FALLBACK}/fiVW06jE7z9YnO4trviM3Oi2i2C.jpg` },
    { rank: 6,  id: 'tt15239678', type: 'movie',  name: 'Dune: Part Two',                   poster: `${TMDB_FALLBACK}/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg` },
    { rank: 7,  id: 'tt21239052', type: 'series', name: 'House of the Dragon',               poster: `${TMDB_FALLBACK}/z2yahl2uefxDCl0nogcRBstwruJ.jpg` },
    { rank: 8,  id: 'tt0944947',  type: 'series', name: 'Game of Thrones',                  poster: `${TMDB_FALLBACK}/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg` },
    { rank: 9,  id: 'tt9140554',  type: 'series', name: 'Stranger Things',                  poster: `${TMDB_FALLBACK}/49WJfeN0moxb9IPfGn8AIqMGskD.jpg` },
    { rank: 10, id: 'tt14452776', type: 'movie',  name: 'Black Panther: Wakanda Forever',    poster: `${TMDB_FALLBACK}/sv1xJUazXeYqALzczSZ3O6nkH75.jpg` },
];

const TrendingRow = ({ items }) => {
    const navigate = useNavigate();
    const [tmdbItems, setTmdbItems] = React.useState([]);

    React.useEffect(() => {
        let isMounted = true;
        fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}`)
            .then(res => res.json())
            .then(async data => {
                if (!isMounted || !data || !Array.isArray(data.results)) return;

                // Filter: keep only movie/tv with a valid poster_path
                const valid = data.results.filter(
                    item => item.media_type !== 'person' && item.poster_path
                ).slice(0, 10);

                if (valid.length === 0) return;

                // Fetch external IDs for each item to get IMDb ID (tt...) for Stremio Cinemeta
                const withImdb = await Promise.all(
                    valid.map(async (item, idx) => {
                        const mediaType = item.media_type === 'tv' ? 'tv' : 'movie';
                        let imdbId = null;
                        try {
                            const extRes = await fetch(`https://api.themoviedb.org/3/${mediaType}/${item.id}/external_ids?api_key=${TMDB_API_KEY}`);
                            const extData = await extRes.json();
                            imdbId = extData.imdb_id;
                        } catch (_) {}

                        return {
                            rank: idx + 1,
                            id: imdbId || (item.id ? `tt${item.id}` : item.id),
                            type: item.media_type === 'tv' ? 'series' : 'movie',
                            name: item.title || item.name || '',
                            poster: `${TMDB_IMG}${item.poster_path}`,
                        };
                    })
                );

                if (isMounted) {
                    setTmdbItems(withImdb);
                }
            })
            .catch(err => console.warn('TMDB trending fetch failed:', err));

        return () => { isMounted = false; };
    }, []);

    const list = tmdbItems.length > 0
        ? tmdbItems
        : (items && items.length > 0
            ? items.slice(0, 10).map((item, idx) => ({
                rank: idx + 1,
                id: item.id,
                type: item.type || 'movie',
                name: item.name,
                poster: item.poster || item.posterShape,
            }))
            : TRENDING_ITEMS);

    return (
        <div id="trending-section" className={styles['trending-section']}>
            <h2 className={styles['section-title']}>Latest &amp; Trending</h2>

            <div className={styles['trending-scroll-container']}>
                {list.map((item) => (
                    <div
                        key={item.rank}
                        className={styles['trending-card']}
                        onClick={() => navigate(`/metadetails/${item.type}/${item.id}`)}
                    >
                        <div className={styles['rank-number']}>{item.rank}</div>
                        <div className={styles['poster-wrapper']}>
                            <img
                                src={item.poster}
                                alt={item.name}
                                className={styles['poster-img']}
                                loading="lazy"
                                onError={(e) => {
                                    // Try w342 size if w500 fails
                                    if (!e.target.dataset.retried) {
                                        e.target.dataset.retried = '1';
                                        e.target.src = item.poster.replace('/w500/', '/w342/');
                                    } else {
                                        // Final fallback: static list poster for that rank
                                        const fallback = TRENDING_ITEMS[item.rank - 1];
                                        e.target.src = fallback
                                            ? fallback.poster
                                            : 'https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg';
                                    }
                                }}
                            />
                            <div className={styles['card-overlay']}>
                                <span className={styles['card-title']}>{item.name}</span>
                            </div>
                            <div className={styles['card-glow']} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

module.exports = TrendingRow;
