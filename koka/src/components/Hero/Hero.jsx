import styles from './hero.module.scss'

function Hero({ title, imageSrc }) {
    return (
        <section className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroCopy}>
                <h2 id="hero-title">Welcome to {title}</h2>
                <p>Build your experience one component at a time.</p>
            </div>
            <img className={styles.heroImage} src={imageSrc} alt="Abstract hero artwork" />
        </section>
    )
}

export default Hero
