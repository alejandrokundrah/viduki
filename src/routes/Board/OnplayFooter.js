// Onplay Footer Component
const React = require('react');
const styles = require('./OnplayFooter.less');

const OnplayFooter = () => {
    return (
        <footer className={styles['onplay-footer']}>
            <div className={styles['footer-columns']}>
                {/* Company */}
                <div className={styles['footer-col']}>
                    <h4 className={styles['col-title']}>Company</h4>
                    <ul className={styles['link-list']}>
                        <li><a href="#/about">About Us</a></li>
                        <li><a href="#/careers">Careers</a></li>
                    </ul>
                </div>

                {/* Need Help */}
                <div className={styles['footer-col']}>
                    <h4 className={styles['col-title']}>Need Help</h4>
                    <ul className={styles['link-list']}>
                        <li><a href="#/help">Visit Help Center?</a></li>
                        <li><a href="#/feedback">Share Feedback</a></li>
                    </ul>
                </div>

                {/* Language Selector */}
                <div className={styles['footer-col']}>
                    <h4 className={styles['col-title']}>View Website in</h4>
                    <div className={styles['lang-selector-pill']}>
                        <svg className={styles['check-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>English</span>
                        <svg className={styles['chevron-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>

                {/* Social Media */}
                <div className={styles['footer-col']}>
                    <h4 className={styles['col-title']}>Social Media</h4>
                    <div className={styles['social-icons']}>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles['social-btn']} title="Instagram">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles['social-btn']} title="Twitter">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                        </a>
                    </div>
                </div>

                {/* App Download Badges */}
                <div className={styles['footer-col']}>
                    <h4 className={styles['col-title']}>Download Our App</h4>
                    <div className={styles['app-badges']}>
                        <div className={styles['app-store-badge']}>
                            <svg className={styles['apple-icon']} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.5c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.8 1.44-.6.7-1.13 1.84-.99 2.94 1.08.08 2.16-.54 2.8-1.34z"/>
                            </svg>
                            <div className={styles['badge-text']}>
                                <span className={styles['small-text']}>Download on the</span>
                                <span className={styles['bold-text']}>App Store</span>
                            </div>
                        </div>

                        <div className={styles['app-store-badge']}>
                            <svg className={styles['play-icon']} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5.3 0 .59.09.83.26l14.28 8.5c.67.4.9 1.27.5 1.94-.13.22-.32.41-.54.54L5.33 21.74c-.24.17-.53.26-.83.26-.83 0-1.5-.67-1.5-1.5z"/>
                            </svg>
                            <div className={styles['badge-text']}>
                                <span className={styles['small-text']}>GET IT ON</span>
                                <span className={styles['bold-text']}>Google Play</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom copyright bar */}
            <div className={styles['footer-bottom-bar']}>
                <div className={styles['copyright-text']}>
                    © 2026 Onplay. All Rights Reserved.
                </div>
                <div className={styles['legal-links']}>
                    <a href="#/terms">Terms Of Use</a>
                    <a href="#/privacy">Privacy Policy</a>
                    <a href="#/faq">FAQ</a>
                </div>
                <div className={styles['footer-logo']}>
                    <img src={require('/assets/images/Onplay Logo.svg')} alt="Onplay" className={styles['logo-img']} />
                </div>
            </div>
        </footer>
    );
};

module.exports = OnplayFooter;
