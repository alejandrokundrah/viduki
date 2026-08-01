// Copyright (C) 2026 Viduki & Onplay
const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useTranslation } = require('react-i18next');
const { MainNavBars } = require('stremio/components');
const OnplayFooter = require('../../routes/Board/OnplayFooter');
const styles = require('./styles');

const LIVE_TV_SITES = [
    { name: 'TVCL', label: 'TV Channel Index', href: 'https://www.tvchannellists.com/', category: 'TV / Sports', desc: 'Global live channel lists and schedules' },
    { name: 'NTV', label: 'TV / Sports / Aggregator', href: 'http://ntv.cx/', category: 'TV / Sports', desc: 'Premium stream aggregator' },
    { name: 'StreamSports99', label: 'TV / Sports', href: 'https://streamsports99.su/live-tv', category: 'TV / Sports', desc: '24/7 Live sports streams & TV' },
    { name: 'Famelack', label: 'TV / Sports', href: 'https://famelack.com/', category: 'TV / Sports', desc: 'Live event streams & channels' },
    { name: 'DaddyLive TV', label: 'TV / Sports', href: 'https://dlhd.pk//24-7-channels.php', category: 'TV / Sports', desc: '200+ Live HD channels & sports' },
    { name: 'TVPass', label: 'TV / Sports / US Only', href: 'https://tvpass.org/', category: 'TV / Sports', desc: 'US broadcast channels live' },
    { name: 'SportsBite TV', label: 'TV / Sports', href: 'https://livetv.moviebite.cc/channels', category: 'TV / Sports', desc: 'Live match streams & TV' },
    { name: 'TitanTV', label: 'Live TV Listings', href: 'https://titantv.com/', category: 'TV / Sports', desc: 'Comprehensive TV listings guide' },
    { name: '1TUbe', label: 'TV / Sports', href: 'https://www.1tube.org/live-tv', category: 'TV / Sports', desc: 'Free online live TV streams' },
    { name: 'Xumo Play', label: 'TV / US Only', href: 'https://play.xumo.com/networks', category: 'TV / Sports', desc: 'Free live streaming channels' },
    { name: 'Pluto TV', label: 'TV / Sports', href: 'https://pluto.tv/live-tv', category: 'TV / Sports', desc: '100s of free live TV channels' },
    { name: 'DistroTV', label: 'Live TV & Movies', href: 'https://distro.tv/', category: 'TV / Sports', desc: 'Free live TV & on-demand' },
    { name: 'Globe TV', label: 'Global Live TV', href: 'https://globetv.app/', category: 'TV / Sports', desc: 'Worldwide live television' },
    { name: 'uFreeTV', label: 'Live TV Channels', href: 'https://ufreetv.com/', category: 'TV / Sports', desc: 'Free streaming live TV' },
    { name: 'Cubik TV', label: 'TV / Sports', href: 'https://cubiktv.com/', category: 'TV / Sports', desc: 'High quality channel streams' },
    { name: 'WatchTVs', label: 'TV Streaming', href: 'https://watchtvs.live/', category: 'TV / Sports', desc: 'Live sports & network TV' },
    { name: 'Rive Live', label: 'IPTV Aggregator', href: 'https://rivestream.org/iptv', category: 'TV / Sports', desc: 'Free IPTV links & player' },
    { name: 'Zerostream', label: 'Live TV', href: 'https://zerostream.alwaysdata.net/', category: 'TV / Sports', desc: 'Zero lag live channels' },
    { name: 'iShowMovies', label: 'Live TV & Sports', href: 'https://ishowmovies.org/live', category: 'TV / Sports', desc: 'Live movies & network feeds' },
    { name: 'FreeInterTV', label: 'International TV', href: 'http://www.freeintertv.com/', category: 'TV / Sports', desc: 'International TV channels' },
    { name: 'Global Free TV', label: 'World Channels', href: 'https://www.globalfreetv.com/', category: 'TV / Sports', desc: 'Global TV station streams' },
    { name: 'VipoTV', label: 'Live TV & Sports', href: 'https://vipotv.com/', category: 'TV / Sports', desc: 'Live HD channel hub' },
    { name: 'SquidTV', label: 'World TV Directory', href: 'https://www.squidtv.net/', category: 'TV / Sports', desc: 'Web TV channel directory' },
    { name: 'Heartive', label: 'Live Channels', href: 'https://heartivetv.pages.dev/live/', category: 'TV / Sports', desc: 'Fast live stream player' },
    { name: 'CXtv', label: 'Live TV & Radio', href: 'https://www.cxtvlive.com/', category: 'TV / Sports', desc: 'Live broadcasts worldwide' },
];

const LIVE_SPORTS_SITES = [
    { name: 'Streamed.pk', label: 'Stream Aggregator', href: 'https://streamed.pk/', category: 'Live Sports', desc: 'HD football, basketball & combat streams' },
    { name: 'SportyHunter', label: 'Community Aggregator', href: 'https://sportyhunter.space/', category: 'Live Sports', desc: 'Community verified live sports links' },
    { name: 'StreamSports99', label: 'Live Sports', href: 'https://streamsports99.su', category: 'Live Sports', desc: 'Non-stop sports stream feeds' },
    { name: 'Watch Footy', label: 'Football Streams', href: 'https://watchfooty.st/', category: 'Live Sports', desc: 'Premier league & UEFA match streams' },
    { name: 'BINTV', label: 'Sports Aggregator', href: 'https://bintv.net/', category: 'Live Sports', desc: 'All live games & events' },
    { name: 'WatchSports', label: 'Live Match Player', href: 'https://watchsports.to/', category: 'Live Sports', desc: 'Multi-stream sports player' },
    { name: 'DaddyLive Sports', label: 'Sports & TV', href: 'https://dlhd.pk/', category: 'Live Sports', desc: 'Comprehensive sports schedule & links' },
    { name: 'LiveTV.sx', label: 'Match Schedules', href: 'https://livetv.sx/enx/', category: 'Live Sports', desc: 'Live scores & working stream links' },
    { name: 'TimStreams', label: 'Live Sports Events', href: 'https://timstreams.net/', category: 'Live Sports', desc: 'PPV & tournament streams' },
    { name: 'SportDB', label: 'Football Highlights', href: 'https://hoofoot.ru/', category: 'Live Sports', desc: 'Match replays & live links' },
    { name: 'StreamFree', label: 'Free Sports Hub', href: 'https://streamfree.app', category: 'Live Sports', desc: 'Free sports streaming web app' },
    { name: 'Sportsurge', label: 'Sports Aggregator', href: 'https://v2.sportsurge.net/home5/', category: 'Live Sports', desc: 'NBA, NFL, F1, UFC & Soccer' },
    { name: 'TotalSportek', label: 'Match Streams', href: 'https://totalsportek.tips/', category: 'Live Sports', desc: 'Top live match streams' },
    { name: 'DamiTV', label: 'Live Match Hub', href: 'https://dami-tv.pro', category: 'Live Sports', desc: 'Multi-language sports streams' },
    { name: 'FootStreams', label: 'Soccer Streams', href: 'https://footstreams.xyz/', category: 'Live Sports', desc: 'Dedicated soccer stream directory' },
    { name: 'Ask4Sports', label: 'Sports Aggregator', href: 'https://ask4sport.xyz/', category: 'Live Sports', desc: 'Live event stream feeds' },
    { name: 'FSL', label: 'FreeStreams Live', href: 'https://freestreams-live1a.pk/', category: 'Live Sports', desc: 'HD live sports & channel links' },
    { name: 'Footfy', label: 'Football HD', href: 'https://footfy.net/', category: 'Live Sports', desc: 'High quality football matches' },
    { name: '1Ball', label: 'Live Ball Games', href: 'https://1ball.pk/', category: 'Live Sports', desc: 'Basketball & football stream links' },
    { name: 'StreamCorner', label: 'Sports Hub', href: 'https://streamcorner.vu/', category: 'Live Sports', desc: 'Live sports match streams' },
    { name: 'CricHD', label: 'Cricket & Sports', href: 'https://crichd.at/', category: 'Live Sports', desc: 'IPL, Test matches & international sports' },
    { name: 'FalconStreams', label: 'Stream Aggregator', href: 'https://falconstreams.net/', category: 'Live Sports', desc: 'Ultra-fast sports stream links' },
    { name: 'PPV.TO', label: 'Live Boxing & UFC', href: 'https://ppv.to/', category: 'Live Sports', desc: 'Free PPV fights, MMA & WWE' },
    { name: 'VIP Box Sports', label: 'Live Events', href: 'https://www.viprow.co/', category: 'Live Sports', desc: 'All sports disciplines live' },
    { name: 'StreamEast', label: 'Sports Stream Hub', href: 'https://streameast.ga/', category: 'Live Sports', desc: 'Premier HD sports player' },
    { name: 'BuffStream', label: 'Live Match Streams', href: 'https://app.buffstream.io/', category: 'Live Sports', desc: 'NFL, NBA, MLB & Soccer streams' },
    { name: 'RoxieStreams', label: 'Live Events', href: 'https://roxiestreams.su/', category: 'Live Sports', desc: 'Smooth sports streaming feeds' },
    { name: 'Pitsport', label: 'Motorsports F1/MotoGP', href: 'https://pitsport.live/', category: 'Live Sports', desc: 'Formula 1 & MotoGP live racing' },
    { name: 'OvertakeFans', label: 'F1 Streams', href: 'https://overtakefans.com/', category: 'Live Sports', desc: 'F1 replays, timing & live feeds' },
];

const ADULT_4K_SITES = [
    { name: 'The Pirate Bay - 4K XXX', label: 'TPB 4K Adult Video Torrents', href: 'https://thepiratebay.org/search/4k/0/99/500', category: '18+ TPB 4K', desc: 'Direct TPB 4K Ultra HD adult torrents' },
    { name: 'TPB Porn 2160p', label: 'Pirate Bay 2160p Ultra HD', href: 'https://thepiratebay.org/search/2160p/0/99/500', category: '18+ TPB 4K', desc: '2160p high bitrate adult content' },
    { name: 'TPB XXX Top 100', label: 'Top 100 Adult Torrents', href: 'https://thepiratebay.org/top/500', category: '18+ TPB 4K', desc: 'Top seeded adult torrent releases' },
    { name: '1337x Adult 4K', label: '1337x 2160p XXX Torrents', href: 'https://1337x.to/cat/XXX/1/', category: '18+ TPB 4K', desc: 'Verified 4K XXX uploads on 1337x' },
    { name: 'TorrentGalaxy XXX 4K', label: 'TGx Ultra HD Adult', href: 'https://torrentgalaxy.to/torrents.php?cat=500', category: '18+ TPB 4K', desc: 'Ultra HD adult release catalog' },
    { name: 'BitSearch XXX 4K', label: '4K Adult Torrent Search', href: 'https://bitsearch.to/search?q=4k+xxx', category: '18+ TPB 4K', desc: 'Fast torrent search engine for 4K XXX' },
];

const CATEGORIES = ['All', 'TV / Sports', 'Live Sports', '18+ TPB 4K'];

const VidukiPlayer = ({ className }) => {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = React.useState('All');
    const [searchQuery, setSearchQuery] = React.useState('');

    const allSites = React.useMemo(() => {
        return [...LIVE_TV_SITES, ...LIVE_SPORTS_SITES, ...ADULT_4K_SITES];
    }, []);

    const filteredSites = React.useMemo(() => {
        return allSites.filter((site) => {
            const matchesCategory = activeCategory === 'All' || site.category === activeCategory;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = !q ||
                site.name.toLowerCase().includes(q) ||
                site.label.toLowerCase().includes(q) ||
                (site.desc && site.desc.toLowerCase().includes(q));
            return matchesCategory && matchesSearch;
        });
    }, [allSites, activeCategory, searchQuery]);

    const getCount = (cat) => {
        if (cat === 'All') return allSites.length;
        return allSites.filter((s) => s.category === cat).length;
    };

    return (
        <div className={styles['viduki-page-wrapper']}>
            <MainNavBars className={styles['viduki-content-container']} route={'live-tv'}>
                <div className={styles['viduki-scroll-area']}>
                    {/* Onplay Hero Header */}
                    <div className={styles['viduki-hero']}>
                        <div className={styles['hero-badge']}>
                            <span className={styles['badge-pulse']} />
                            <span>ONPLAY LIVE HUB</span>
                        </div>

                        <h1 className={styles['hero-title']}>
                            Live TV, Sports &amp; Categories
                        </h1>

                        <p className={styles['hero-description']}>
                            Access 50+ live television networks, real-time sports streams, and premium 4K torrent portals.
                        </p>

                        {/* Search & Filter Bar */}
                        <div className={styles['search-filter-box']}>
                            <div className={styles['search-input-wrap']}>
                                <svg className={styles['search-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    type="text"
                                    className={styles['search-input']}
                                    placeholder="Search TV channels, sports, torrent sites..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button className={styles['clear-search']} onClick={() => setSearchQuery('')}>✕</button>
                                )}
                            </div>
                        </div>

                        {/* Category Filter Tabs */}
                        <div className={styles['category-tabs']}>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    className={classnames(styles['category-tab'], activeCategory === cat ? styles['active'] : null)}
                                    onClick={() => setActiveCategory(cat)}
                                >
                                    <span>{cat}</span>
                                    <span className={styles['cat-count']}>{getCount(cat)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Disclaimer Banner */}
                    <div className={styles['disclaimer-banner']}>
                        <span className={styles['disclaimer-icon']}>🛡️</span>
                        <div className={styles['disclaimer-text']}>
                            <strong>Pro Tip:</strong> We recommend using an adblocker (such as uBlock Origin) and a VPN for optimum security and uninterrupted streaming when accessing external channels.
                        </div>
                    </div>

                    {/* Sites Cards Grid */}
                    <div className={styles['sites-grid']}>
                        {filteredSites.map((site, index) => (
                            <a
                                key={index}
                                className={styles['site-card']}
                                href={site.href}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <div className={styles['card-top']}>
                                    <span className={styles['site-category-tag']}>{site.category}</span>
                                    <span className={styles['launch-arrow']}>↗</span>
                                </div>
                                <div className={styles['site-name']}>{site.name}</div>
                                <div className={styles['site-label']}>{site.label}</div>
                                {site.desc && <div className={styles['site-desc']}>{site.desc}</div>}
                                <div className={styles['card-hover-border']} />
                            </a>
                        ))}
                    </div>

                    {filteredSites.length === 0 && (
                        <div className={styles['empty-state']}>
                            <p>No streams found matching "{searchQuery}". Try a different keyword.</p>
                        </div>
                    )}

                    {/* Onplay Footer */}
                    <OnplayFooter />
                </div>
            </MainNavBars>
        </div>
    );
};

VidukiPlayer.propTypes = {
    className: PropTypes.string,
};

module.exports = VidukiPlayer;
module.exports.default = VidukiPlayer;
