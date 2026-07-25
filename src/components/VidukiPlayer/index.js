// Copyright (C) 2026 Viduki

const React = require('react');
const { useNavigate } = require('react-router');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { Button } = require('stremio/components');
const { useTranslation } = require('react-i18next');
const styles = require('./styles');

const LIVE_TV_SITES = [
    { name: 'TVCL', label: 'TV Channel Index', href: 'https://www.tvchannellists.com/', category: 'TV / Sports' },
    { name: 'NTV', label: 'TV / Sports / Aggregator', href: 'http://ntv.cx/', category: 'TV / Sports' },
    { name: 'StreamSports99', label: 'TV / Sports', href: 'https://streamsports99.su/live-tv', category: 'TV / Sports' },
    { name: 'Famelack', label: 'TV / Sports', href: 'https://famelack.com/', category: 'TV / Sports' },
    { name: 'DaddyLive TV', label: 'TV / Sports', href: 'https://dlhd.pk//24-7-channels.php', category: 'TV / Sports' },
    { name: 'TVPass', label: 'TV / Sports / US Only', href: 'https://tvpass.org/', category: 'TV / Sports' },
    { name: 'SportsBite TV', label: 'TV / Sports', href: 'https://livetv.moviebite.cc/channels', category: 'TV / Sports' },
    { name: 'TitanTV', label: 'Live TV Listings', href: 'https://titantv.com/', category: 'TV / Sports' },
    { name: '1TUbe', label: 'TV / Sports', href: 'https://www.1tube.org/live-tv', category: 'TV / Sports' },
    { name: 'Xumo Play', label: 'TV / US Only', href: 'https://play.xumo.com/networks', category: 'TV / Sports' },
    { name: 'Pluto', label: 'TV / Sports / US Only', href: 'https://pluto.tv/live-tv', category: 'TV / Sports' },
    { name: 'DistroTV', label: 'TV', href: 'https://distro.tv/', category: 'TV / Sports' },
    { name: 'Globe TV', label: 'TV / Sports', href: 'https://globetv.app/', category: 'TV / Sports' },
    { name: 'uFreeTV', label: 'TV', href: 'https://ufreetv.com/', category: 'TV / Sports' },
    { name: 'Cubik TV', label: 'TV / Sports', href: 'https://cubiktv.com/', category: 'TV / Sports' },
    { name: 'WatchTVs', label: 'TV', href: 'https://watchtvs.live/', category: 'TV / Sports' },
    { name: 'Rive Live', label: 'TV / Sports', href: 'https://rivestream.org/iptv', category: 'TV / Sports' },
    { name: 'Zerostream', label: 'TV', href: 'https://zerostream.alwaysdata.net/', category: 'TV / Sports' },
    { name: 'iShowMovies', label: 'TV', href: 'https://ishowmovies.org/live', category: 'TV / Sports' },
    { name: 'FreeInterTV', label: 'TV / Sports', href: 'http://www.freeintertv.com/', category: 'TV / Sports' },
    { name: 'Global Free TV', label: 'TV', href: 'https://www.globalfreetv.com/', category: 'TV / Sports' },
    { name: 'vipotv', label: 'TV / Sports', href: 'https://vipotv.com/', category: 'TV / Sports' },
    { name: 'SquidTV', label: 'TV', href: 'https://www.squidtv.net/', category: 'TV / Sports' },
    { name: 'Heartive', label: 'TV / Sports', href: 'https://heartivetv.pages.dev/live/', category: 'TV / Sports' },
    { name: 'CXtv', label: 'TV / Sports', href: 'https://www.cxtvlive.com/', category: 'TV / Sports' },
];

const LIVE_SPORTS_SITES = [
    { name: 'Streamed', label: 'Stream Aggregator', href: 'https://streamed.pk/', category: 'Live Sports' },
    { name: 'SportyHunter', label: 'Community Aggregator', href: 'https://sportyhunter.space/', category: 'Live Sports' },
    { name: 'StreamSports99', label: 'Live Sports', href: 'https://streamsports99.su', category: 'Live Sports' },
    { name: 'Watch Footy', label: 'Stream Aggregator', href: 'https://watchfooty.st/', category: 'Live Sports' },
    { name: 'BINTV', label: 'Stream Aggregator', href: 'https://bintv.net/', category: 'Live Sports' },
    { name: 'WatchSports', label: 'Stream Aggregator', href: 'https://watchsports.to/', category: 'Live Sports' },
    { name: 'DaddyLive', label: 'TV / Sports', href: 'https://dlhd.pk/', category: 'Live Sports' },
    { name: 'LiveTV', label: 'Stream Aggregator', href: 'https://livetv.sx/enx/', category: 'Live Sports' },
    { name: 'TimStreams', label: 'Live Events', href: 'https://timstreams.net/', category: 'Live Sports' },
    { name: 'SportDB', label: 'Stream Aggregator', href: 'https://hoofoot.ru/', category: 'Live Sports' },
    { name: 'StreamFree', label: 'Stream Aggregator', href: 'https://streamfree.app', category: 'Live Sports' },
    { name: 'Sportsurge', label: 'Stream Aggregator', href: 'https://v2.sportsurge.net/home5/', category: 'Live Sports' },
    { name: 'TotalSportek', label: 'Stream Aggregator', href: 'https://totalsportek.tips/', category: 'Live Sports' },
    { name: 'DamiTV', label: 'Stream Aggregator', href: 'https://dami-tv.pro', category: 'Live Sports' },
    { name: 'DaddyLiveHD', label: 'Stream Aggregator', href: 'https://daddylive.org/', category: 'Live Sports' },
    { name: 'FootStreams', label: 'Stream Aggregator', href: 'https://footstreams.xyz/', category: 'Live Sports' },
    { name: 'Ask4Sports', label: 'Stream Aggregator', href: 'https://ask4sport.xyz/', category: 'Live Sports' },
    { name: 'FSL', label: 'Stream Aggregator', href: 'https://freestreams-live1a.pk/', category: 'Live Sports' },
    { name: 'Footfy', label: 'Stream Aggregator', href: 'https://footfy.net/', category: 'Live Sports' },
    { name: '1Ball', label: 'Stream Aggregator', href: 'https://1ball.pk/', category: 'Live Sports' },
    { name: 'StreamCorner', label: 'Stream Aggregator', href: 'https://streamcorner.vu/', category: 'Live Sports' },
    { name: 'GamesCentral', label: 'Stream Aggregator', href: 'https://www.gamescentral.top/', category: 'Live Sports' },
    { name: 'CricHD', label: 'Cricket', href: 'https://crichd.at/', category: 'Live Sports' },
    { name: 'FalconStreams', label: 'Stream Aggregator', href: 'https://falconstreams.net/', category: 'Live Sports' },
    { name: 'PPV.TO', label: 'Live Events', href: 'https://ppv.to/', category: 'Live Sports' },
    { name: 'FCTV33', label: 'Live Sports', href: 'https://www.fctv33.lat/', category: 'Live Sports' },
    { name: 'MrGamingStreams', label: 'Live Events', href: 'http://mrgamingstreams.org/', category: 'Live Sports' },
    { name: 'Sports Plus', label: 'Live Sports', href: 'https://en12.sportplus.live/', category: 'Live Sports' },
    { name: 'VIP Box Sports', label: 'Live Events', href: 'https://www.viprow.co/', category: 'Live Sports' },
    { name: 'StreamEast', label: 'Stream Aggregator', href: 'https://streameast.ga/', category: 'Live Sports' },
    { name: 'BuffStream', label: 'Stream Aggregator', href: 'https://app.buffstream.io/', category: 'Live Sports' },
    { name: 'RoxieStreams', label: 'Stream Aggregator', href: 'https://roxiestreams.su/', category: 'Live Sports' },
    { name: 'Sports24', label: 'Live Sports', href: 'https://sports24.cc/', category: 'Live Sports' },
    { name: 'SharkStreams', label: 'Live Sports', href: 'https://sharkstreams.net/', category: 'Live Sports' },
    { name: 'NBAMonster', label: 'Basketball', href: 'https://nbamonster.com/', category: 'Live Sports' },
    { name: 'WebCric', label: 'Cricket', href: 'https://me.webcric.com/', category: 'Live Sports' },
    { name: 'OnHockey', label: 'Hockey', href: 'https://onhockey.tv/', category: 'Live Sports' },
    { name: 'Pitsport', label: 'Motorsports', href: 'https://pitsport.live/', category: 'Live Sports' },
    { name: 'OvertakeFans', label: 'Motorsports', href: 'https://overtakefans.com/', category: 'Live Sports' },
    { name: 'DD12', label: 'Motorsports', href: 'https://dd12streams.com/', category: 'Live Sports' },
    { name: 'NontonGP', label: 'Motorcycle Racing', href: 'https://esp32.nontonx.com/', category: 'Live Sports' },
    { name: 'r/rugbystreams', label: 'Rugby', href: 'https://www.reddit.com/r/rugbystreams/', category: 'Live Sports' },
    { name: 'Tiz-Cycling', label: 'Cycling', href: 'https://tiz-cycling.tv/', category: 'Live Sports' },
    { name: 'Formula Timer', label: 'F1 Live Stats', href: 'https://formula-timer.com/livetiming', category: 'Live Sports' },
    { name: 'EntertainMe', label: 'Live Sports Calendars', href: 'https://www.entertainme.fun/', category: 'Live Sports' },
    { name: 'Futez', label: 'Football Rate/Review', href: 'https://www.futez.com.br/', category: 'Live Sports' },
];

const CATEGORIES = ['All', 'TV / Sports', 'Live Sports'];

const VidukiPlayer = ({ className, ...props }) => {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = React.useState('All');

    const filteredSites = React.useMemo(() => {
        if (activeCategory === 'All') return [...LIVE_TV_SITES, ...LIVE_SPORTS_SITES];
        return [...LIVE_TV_SITES, ...LIVE_SPORTS_SITES].filter((site) => site.category === activeCategory);
    }, [activeCategory]);

    return (
        <div className={classnames(className, styles['viduki-player'])}>
            <div className={styles['header']}>
                <h2 className={styles['title']}>{t('LIVE_TV_SPORTS') || '► Live TV / Sports'}</h2>
                <p className={styles['disclaimer']}>
                    {t('ADBLOCKER_NOTICE') || 'Make sure to install an adblocker (we recommend uBlock Origin) before using live sites. Try a VPN if sites are blocked.'}
                </p>
            </div>
            <div className={styles['category-tabs']}>
                {CATEGORIES.map((cat) => (
                    <Button
                        key={cat}
                        className={classnames(styles['category-tab'], activeCategory === cat ? styles['active'] : null)}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </Button>
                ))}
            </div>
            <div className={styles['sites-grid']}>
                {filteredSites.map((site, index) => (
                    <Button
                        key={index}
                        className={styles['site-card']}
                        title={site.label}
                        href={site.href}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className={styles['site-name']}>{site.name}</div>
                        <div className={styles['site-label']}>{site.label}</div>
                        <div className={styles['site-category']}>{site.category}</div>
                    </Button>
                ))}
            </div>
        </div>
    );
};

VidukiPlayer.propTypes = {
    className: PropTypes.string,
};

module.exports = VidukiPlayer;
