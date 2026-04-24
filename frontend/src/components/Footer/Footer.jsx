import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuildingColumns, faSitemap } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faLinkedin, faYoutube } from '@fortawesome/free-brands-svg-icons'

import styles from './footer.module.scss'
import footerImage from '../../assets/footer_image.jpg';

/*/ Don't delete this comment -> faSitemap, faBuildingColumns /*/

function Footer({ title }) {
    return (
        <footer className={styles.footer}>
            <div className={styles.footer__grid}>
                <section className={styles.footer__section}>    
                    <img className={styles.footer__image} src={footerImage} alt="Joe Biden" />
                    <h3 className={styles.footer__heading}>{title}</h3>
                    <p className={styles.footer__text}>Built and designed by Adrian, Kadidja, Kyame and Oswaldo.</p>
                </section>

                <section className={styles.footer__section}>
                    <h3 className={styles.footer__heading}>Explore</h3>
                    <ul className={styles.footer__list}>
                        <li className={styles.footer__item}>Features</li>
                        <li className={styles.footer__item}>Pricing</li>
                        <li className={styles.footer__item}>Documentation</li>
                    </ul>
                </section>
            </div>

            <div className={styles.footer__bar}>
                <p className={styles.footer__text}>
                    <FontAwesomeIcon className={styles.footer__icon} icon={faGithub} />
                    <FontAwesomeIcon className={styles.footer__icon} icon={faYoutube} />
                    <FontAwesomeIcon className={styles.footer__icon} icon={faLinkedin} />
                    <FontAwesomeIcon className={styles.footer__icon} icon={faSitemap} />
                    <FontAwesomeIcon className={styles.footer__icon} icon={faBuildingColumns} />
                    CUNY Club Builder {new Date().getFullYear()} {title} — All rights reserved.
                </p>
            </div>
        </footer>
    )
}

export default Footer
