import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import styles from './footer.module.scss'

function Footer({ title }) {
    return (
        <footer className={styles.siteFooter}>
            <p className={styles.footerText}>
                <FontAwesomeIcon className={styles.footerIcon} icon={faGithub} />
                {new Date().getFullYear()} {title}. All rights reserved.
            </p>
        </footer>
    )
}

export default Footer
