import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import styles from './card.module.scss'

function Card({ title, description, logoSrc, href }) {
    return (
        <article className={styles.featureCard}>
            <img className={styles.featureLogo} src={logoSrc} alt="" aria-hidden="true" />
            <h3 className={styles.featureTitle}>{title}</h3>
            <p className={styles.featureText}>{description}</p>
            <a className={styles.featureLink} href={href} target="_blank" rel="noreferrer">
                Learn more
                <FontAwesomeIcon className={styles.linkIcon} icon={faArrowUpRightFromSquare} />
            </a>
        </article>
    )
}

export default Card
