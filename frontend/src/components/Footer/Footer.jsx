import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import styles from './footer.module.scss'

function Footer({ title }) {
    return (
        <footer className={styles.footer}>
            <div className={styles.footer__grid}>
                <section className={styles.footer__section}>
                    <h3 className={styles.footer__heading}>{title}</h3>
                    <p className={styles.footer__text}>A generic management platform for student organizations.</p>
                </section>

                <section className={styles.footer__section}>
                    <h3 className={styles.footer__heading}>Explore</h3>
                    <ul className={styles.footer__list}>
                        <li className={styles.footer__item}>Features</li>
                        <li className={styles.footer__item}>Pricing</li>
                        <li className={styles.footer__item}>Documentation</li>
                    </ul>
                </section>

                <section className={styles.footer__section}>
                    <h3 className={styles.footer__heading}>Community</h3>
                    <ul className={styles.footer__list}>
                        <li className={styles.footer__item}>Support</li>
                        <li className={styles.footer__item}>Announcements</li>
                        <li className={styles.footer__item}>Contact</li>
                    </ul>
                </section>
            </div>

            <div className={styles.footer__bar}>
                <p className={styles.footer__text}>
                    <FontAwesomeIcon className={styles.footer__icon} icon={faGithub} />
                    {new Date().getFullYear()} {title}. All rights reserved.
                </p>
            </div>
        </footer>
    )
}

export default Footer
