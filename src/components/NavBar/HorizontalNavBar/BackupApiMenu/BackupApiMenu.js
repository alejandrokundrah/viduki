// Copyright (C) 2026 Viduki & Onplay
const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const useToast = require('stremio/common/Toast/useToast');
const { VIDUKI_BACKUP_APIS } = require('stremio/common/viduki');
const styles = require('./styles');

const BackupApiMenu = React.memo(({ onSelectServer, currentApi }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [menuStyle, setMenuStyle] = React.useState({});
    const containerRef = React.useRef(null);
    const btnRef = React.useRef(null);
    const toast = useToast();

    // Reposition dropdown to fixed coordinates based on button's real screen position
    const openMenu = React.useCallback(() => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            const menuWidth = 320;
            const rightEdge = rect.right;
            const leftPos = Math.max(8, rightEdge - menuWidth);
            setMenuStyle({
                top: (rect.bottom + 8) + 'px',
                left: leftPos + 'px',
                right: 'unset',
            });
        }
        setIsOpen(true);
    }, []);

    React.useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelectServer = React.useCallback((server) => {
        if (typeof onSelectServer === 'function') {
            onSelectServer(server.id);
            toast.show({
                type: 'success',
                title: `${server.name} Selected`,
                message: `Switched to ${server.name} (${server.domain})`,
                timeout: 3500,
            });
        }
        setIsOpen(false);
    }, [onSelectServer, toast]);

    const isBackupActive = VIDUKI_BACKUP_APIS.some((s) => s.id === currentApi);

    return (
        <div ref={containerRef} className={styles['backup-api-menu-container']}>
            <button
                ref={btnRef}
                type="button"
                className={classnames(
                    styles['backup-api-chip-nav'],
                    { [styles['active-open']]: isOpen },
                    { [styles['backup-active']]: isBackupActive && !isOpen }
                )}
                onClick={() => isOpen ? setIsOpen(false) : openMenu()}
                title="Backup Streaming Servers (S7–S13)"
            >
                <svg className={styles['chip-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                </svg>
                <span>
                    {isBackupActive
                        ? 'S' + currentApi + ' ▾'
                        : 'Backup ▾'
                    }
                </span>
            </button>

            {isOpen && (
                <div className={styles['backup-dropdown-menu']} style={menuStyle}>
                    <div className={styles['dropdown-header']}>
                        <span className={styles['header-title']}>⚡ Backup Servers</span>
                        <span className={styles['header-badge']}>S7–S13</span>
                    </div>

                    {VIDUKI_BACKUP_APIS.map((server) => {
                        const isActive = currentApi === server.id;
                        return (
                            <button
                                key={server.id}
                                type="button"
                                className={classnames(
                                    styles['server-item-btn'],
                                    { [styles['is-active']]: isActive }
                                )}
                                onClick={() => handleSelectServer(server)}
                            >
                                <div className={styles['server-item-left']}>
                                    <span className={styles['server-chip-badge']}>S{server.id}</span>
                                    <div className={styles['server-details']}>
                                        <span className={styles['server-name']}>{server.icon} {server.name}</span>
                                        <span className={styles['server-desc']}>{server.domain}</span>
                                    </div>
                                </div>
                                <span className={styles['server-status']}>
                                    {isActive ? 'ACTIVE' : 'USE'}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
});

BackupApiMenu.displayName = 'BackupApiMenu';

BackupApiMenu.propTypes = {
    onSelectServer: PropTypes.func,
    currentApi: PropTypes.number,
};

module.exports = BackupApiMenu;
