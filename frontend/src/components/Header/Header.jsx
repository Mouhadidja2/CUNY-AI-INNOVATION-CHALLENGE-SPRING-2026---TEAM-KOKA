import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faCircleHalfStroke, faSnowflake, faMoon } from '@fortawesome/free-solid-svg-icons';
import Button from '../Button/Button';
import styles from './header.module.scss';

function Header({ title, showTitle = true, logoSrc, searchQuery, onSearchChange, onAuthClick, onClubsClick, themeMode, onThemeToggle, onHomeClick }) {
    const [isScrolled, setIsScrolled] = useState(false);
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

                <Button variant="primary" onClick={onAuthClick}>
                    Sign Up / Login
                </Button>

                <Button variant="ghost" onClick={onThemeToggle} ariaLabel={themeAriaLabel}>
                    <FontAwesomeIcon className={styles.header__themeIcon} icon={themeIcon} />
                </Button>
            </div>
        </header>
    );
}

export default Header;