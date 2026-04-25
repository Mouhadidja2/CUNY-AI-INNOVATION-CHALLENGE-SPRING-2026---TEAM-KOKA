import Button from '../Button/Button'
import styles from './hero.module.scss'

function Hero({
    slogan,
    primaryButtonLabel,
    secondaryButtonLabel,
    tertiaryButtonLabel,
    onPrimaryAction,
    onSecondaryAction,
    onTertiaryAction,
}) {
    return (
        <section className={styles.hero} aria-labelledby="hero-slogan">
            <div className={styles.hero__copy}>
                <h2 className={styles.hero__slogan} id="hero-slogan">
                    {slogan}
                </h2>

                <div className={styles.hero__actions}>
                    <Button variant="primary" onClick={onPrimaryAction}>
                        {primaryButtonLabel}
                    </Button>
                    <Button variant="ghost" onClick={onSecondaryAction}>
                        {secondaryButtonLabel}
                    </Button>
                    {tertiaryButtonLabel ? (
                        <Button variant="ghost" onClick={onTertiaryAction}>
                            {tertiaryButtonLabel}
                        </Button>
                    ) : null}
                </div>
            </div>
        </section>
    )
}

export default Hero
