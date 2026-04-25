import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import styles from './card.module.scss'

function Card({ title, description, logoSrc, href, ctaLabel = 'Learn more', target = '_self', rel, onNavigate }) {
    return (
        <article className={styles.card}>
            <img className={styles.card__logo} src={logoSrc} alt="" aria-hidden="true" />
            <h3 className={styles.card__title}>{title}</h3>
            <p className={styles.card__description}>{description}</p>
            <a
                className={styles.card__link}
                href={href}
                target={target}
                rel={rel}
                onClick={(event) => {
                    if (onNavigate && target === '_self') {
                        event.preventDefault()
                        onNavigate()
                    }
                }}
            >
                {ctaLabel}
                <FontAwesomeIcon className={styles.card__linkIcon} icon={faArrowUpRightFromSquare} />
            </a>
        </article>
    )
}

export default Card
