// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useNavigate } = require('react-router');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { Button } = require('stremio/components');
const { useFullscreen } = require('stremio/common/Fullscreen');
const { useHorizontalNavGamepadNavigation } = require('stremio/services/GamepadNavigation');
const { useServices } = require('stremio/services');
const useToast = require('stremio/common/Toast/useToast');
const { usePlatform } = require('stremio/common/Platform');
const SearchBar = require('./SearchBar');
const NavMenu = require('./NavMenu');
const styles = require('./styles');
const { t } = require('i18next');

const HorizontalNavBar = React.memo(({ className, route, query, title, backButton, searchBar, fullscreenButton, navMenu, originPath, hdrInfo, s3s4Mode, s3s4ButtonsVisible, isViduki, vidukiApis, currentApi, onSelectServer, serverSwitcherHidden, onServerSwitcherMouseEnter, onServerSwitcherMouseMove, onVidVaultDownload, ...props }) => {
    const navigate = useNavigate();
    const { chromecast } = useServices();
    const platform = usePlatform();
    const toast = useToast();
    const onCastButtonClick = React.useCallback(() => {
        if (platform.shell.active) {
            toast.show({
                type: 'info',
                title: 'Cast is available in the player menu',
                timeout: 3000
            });
            return;
        }
        if (!chromecast.active) {
            toast.show({
                type: 'error',
                title: 'Cast device not available',
                timeout: 4000
            });
            return;
        }
        chromecast.transport.requestSession();
    }, [chromecast, platform, toast]);
    const onNotificationButtonClick = React.useCallback(() => {
        navigate('/library');
    }, [navigate]);
    const backButtonOnClick = React.useCallback(() => {
        if (originPath) {
            navigate(originPath, { replace: true });
        } else {
            navigate(-1);
        }
    }, [originPath, navigate]);
    const [fullscreen, requestFullscreen, exitFullscreen, , supported, , uiVisible] = useFullscreen();

    const buttonsHidden = React.useMemo(() => {
        if (fullscreen && !uiVisible) {
            return true;
        }
        if (s3s4Mode && !s3s4ButtonsVisible) {
            return true;
        }
        return false;
    }, [fullscreen, uiVisible, s3s4Mode, s3s4ButtonsVisible]);

    const renderNavMenuLabel = React.useCallback(({ ref, className, onClick, children, }) => (
        <Button ref={ref} className={classnames(className, styles['button-container'], styles['menu-button-container'])} tabIndex={-1} onClick={onClick}>
            <Icon className={styles['icon']} name={'person-outline'} />
            {children}
        </Button>
    ), []);
    useHorizontalNavGamepadNavigation(route || className, backButton);
    return (
        <nav {...props} className={classnames(className, styles['horizontal-nav-bar-container'], { [styles['buttons-hidden']]: buttonsHidden })}>
            {
                backButton ?
                    <Button className={classnames(styles['button-container'], styles['back-button-container'], { [styles['nav-element-hidden']]: buttonsHidden })} tabIndex={-1} onClick={backButtonOnClick} title={t('BACK') || 'Back'}>
                        <Icon className={styles['icon']} name={'chevron-back'} />
                    </Button>
                    :
                    <div className={classnames(styles['logo-container'], { [styles['nav-element-hidden']]: buttonsHidden })} onClick={() => navigate('/')}>
                        <img className={styles['brand-logo']} src={require('/assets/images/Onplay Logo.svg')} alt="Onplay" />
                    </div>
            }

            {
                typeof title === 'string' && title.length > 0 ?
                    <h2 className={classnames(styles['title'], { [styles['nav-element-hidden']]: buttonsHidden })}>{title}</h2>
                    :
                    null
            }
            {
                searchBar && route !== 'addons' ?
                    <SearchBar className={classnames(styles['search-bar'], { [styles['nav-element-hidden']]: buttonsHidden })} query={query} active={route === 'search'} />
                    :
                    null
            }
            <div className={classnames(styles['buttons-container'], { [styles['nav-element-hidden']]: buttonsHidden })}>
                {
                    isViduki && Array.isArray(vidukiApis) && vidukiApis.length > 0 ?
                        <div
                            className={classnames(styles['server-switcher-nav'], { [styles['server-switcher-hidden']]: serverSwitcherHidden })}
                            onMouseEnter={onServerSwitcherMouseEnter}
                            onMouseMove={onServerSwitcherMouseMove}
                        >
                            {
                                vidukiApis.map((a) => (
                                    <button
                                        key={a.id}
                                        type="button"
                                        title={a.name}
                                        className={classnames(styles['server-chip-nav'], { [styles['server-chip-nav-active']]: a.id === currentApi })}
                                        onClick={() => typeof onSelectServer === 'function' && onSelectServer(a.id)}
                                    >
                                        {'S' + a.id}
                                    </button>
                                ))
                            }
                            {
                                typeof onVidVaultDownload === 'function' ?
                                    <button
                                        type="button"
                                        title="Download media via VidVault"
                                        className={styles['vidvault-chip-nav']}
                                        onClick={onVidVaultDownload}
                                    >
                                        <Icon className={styles['chip-icon']} name={'download'} />
                                        <span>VidVault</span>
                                    </button>
                                    : null
                            }
                        </div>
                        :
                        null
                }
                {
                    hdrInfo && (hdrInfo.gamma === 'pq' || hdrInfo.gamma === 'hlg') ?
                        <div className={styles['hdr-indicator']} title={hdrInfo.gamma === 'pq' ? 'HDR10' : 'HLG'}>
                            <Icon className={styles['icon']} name={'hdr'} />
                        </div>
                        :
                        null
                }
                <Button className={styles['button-container']} title="Cast" tabIndex={-1} disabled={!chromecast.active && !platform.shell.active} onClick={onCastButtonClick}>
                    <svg className={styles['nav-icon']} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 16.1A9 9 0 0 1 15.9 2"></path>
                        <path d="M2 12A5 5 0 0 1 7 7"></path>
                        <path d="M2 20h.01"></path>
                    </svg>
                </Button>
                <Button className={classnames(styles['button-container'], styles['notification-btn'])} title="Notifications" tabIndex={-1} onClick={onNotificationButtonClick}>
                    <svg className={styles['nav-icon']} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </Button>
                {
                    supported && fullscreenButton ?
                        <Button className={styles['button-container']} title={fullscreen ? t('EXIT_FULLSCREEN') : t('ENTER_FULLSCREEN')} tabIndex={-1} onClick={fullscreen ? exitFullscreen : requestFullscreen}>
                            <Icon className={styles['icon']} name={fullscreen ? 'minimize' : 'maximize'} />
                        </Button>
                        :
                        null
                }
                {
                    navMenu ?
                        <NavMenu renderLabel={renderNavMenuLabel} />
                        :
                        null
                }
            </div>
        </nav>
    );
});

HorizontalNavBar.displayName = 'HorizontalNavBar';

HorizontalNavBar.propTypes = {
    className: PropTypes.string,
    route: PropTypes.string,
    query: PropTypes.string,
    title: PropTypes.string,
    backButton: PropTypes.bool,
    searchBar: PropTypes.bool,
    fullscreenButton: PropTypes.bool,
    navMenu: PropTypes.bool,
    originPath: PropTypes.string,
    hdrInfo: PropTypes.shape({
        gamma: PropTypes.string,
    }),
    s3s4Mode: PropTypes.bool,
    s3s4ButtonsVisible: PropTypes.bool,
    isViduki: PropTypes.bool,
    onVidVaultDownload: PropTypes.func,
    vidukiApis: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        desc: PropTypes.string,
    })),
    currentApi: PropTypes.number,
    onSelectServer: PropTypes.func,
    serverSwitcherHidden: PropTypes.bool,
    onServerSwitcherMouseEnter: PropTypes.func,
    onServerSwitcherMouseMove: PropTypes.func,
};

module.exports = HorizontalNavBar;
