import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket } from '@fortawesome/free-solid-svg-icons'
import styles from './header.module.scss'

function Header({ title }) {
    return (
        <header className={styles.siteHeader}>
            <p className={styles.siteKicker}>
                <FontAwesomeIcon className={styles.kickerIcon} icon={faRocket} />
                Project Koka
            </p>
            <h1 className={styles.siteTitle}>{title}</h1>
        </header>
    )
}

export default Header
