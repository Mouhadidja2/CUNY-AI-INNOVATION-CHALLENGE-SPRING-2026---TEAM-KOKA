import Button from '../Button/Button'
import styles from './header.module.scss'

function Header({ title, logoSrc, searchQuery, onSearchChange, onAuthClick, onHomeClick }) {
    return (
        <header className={styles.header}>
            <button className={styles.header__brand} type="button" onClick={onHomeClick}>
                {logoSrc ? (
                    <img className={styles.header__logoImage} src={logoSrc} alt="App logo" />
                ) : (
                    <div className={styles.header__logoPlaceholder} aria-hidden="true">
                        Logo
                    </div>
                )}
                <h1 className={styles.header__title}>{title}</h1>
            </button>

            <div className={styles.header__right}>
                <label className={styles.header__searchWrap}>
                    <span className={styles.header__searchLabel}>Search</span>
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
            </div>
        </header>
    )
}

export default Header
