import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faCircleHalfStroke, faSnowflake, faMoon, faUser } from '@fortawesome/free-solid-svg-icons';
import Button from '../Button/Button';
import styles from './header.module.scss';

function Header({ title, showTitle = true, logoSrc, searchQuery, onSearchChange, onSearchSubmit, onAuthClick, onClubsClick, themeMode, onThemeToggle, onHomeClick, currentUser, onSignOut, onProfileClick }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const themeIcon = themeMode === 'snow' ? faSnowflake : themeMode === 'night' ? faMoon : faCircleHalfStroke;
    const themeAriaLabel = `Toggle theme mode. Current mode: ${themeMode}`;

    useEffect(() => {
        const handleScroll = () => {

            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        if (isProfileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen]);

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (onSearchSubmit) {
            onSearchSubmit(searchQuery);
        }
    };

    const userInitials = currentUser
        ? currentUser.name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '';

    // Combine base class with the BEM modifier conditionally
    const headerClass = `${styles.header} ${isScrolled ? styles['header--scrolled'] : ''}`;

    return (
        <header className={headerClass}>
            <button className={styles.header__brand} type="button" onClick={onHomeClick}>
                {logoSrc ? (
                    <img className={styles.header__logoImage} src={logoSrc} alt="App logo" />
                ) : (
                    <div className={styles.header__logoPlaceholder} aria-hidden="true">
                        Logo
                    </div>
                )}
                {showTitle ? <h1 className={styles.header__title}>{title}</h1> : null}
            </button>

            <div className={styles.header__right}>

                <a className={styles.header__links} href="#"> About </a>
                <a className={styles.header__links} href="#"> Campuses </a>
                <button type="button" className={styles.header__links} onClick={onClubsClick}>
                    Clubs
                </button>

                <form className={styles.header__searchForm} onSubmit={handleSearchSubmit}>
                    <label className={styles.header__searchWrap}>
                        <FontAwesomeIcon className={styles.header__searchIcon} icon={faMagnifyingGlass} />
                        <input
                            className={styles.header__searchInput}
                            type="search"
                            value={searchQuery}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder="Search clubs"
                        />
                    </label>
                </form>

                {currentUser ? (
                    <div className={styles.header__profile} ref={profileRef}>
                        <button
                            type="button"
                            className={styles.header__avatar}
                            onClick={() => setIsProfileOpen((open) => !open)}
                            aria-label="Open profile menu"
                            aria-expanded={isProfileOpen}
                        >
                            {userInitials || <FontAwesomeIcon icon={faUser} />}
                        </button>

                        {isProfileOpen ? (
                            <div className={styles.header__profilePopover}>
                                <div className={styles.header__profileInfo}>
                                    <p className={styles.header__profileName}>{currentUser.name}</p>
                                    <p className={styles.header__profileRole}>{currentUser.role}</p>
                                </div>
                                <div className={styles.header__profileActions}>
                                    <button
                                        type="button"
                                        className={styles.header__profileLink}
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            onProfileClick();
                                        }}
                                    >
                                        View Profile
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.header__profileLink}
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            onSignOut();
                                        }}
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <Button variant="primary" onClick={onAuthClick}>
                        Sign Up / Login
                    </Button>
                )}

                <Button variant="icon" onClick={onThemeToggle} ariaLabel={themeAriaLabel}>
                    <FontAwesomeIcon className={styles.header__themeIcon} icon={themeIcon} />
                </Button>
            </div>
        </header>
    );
}

export default Header;