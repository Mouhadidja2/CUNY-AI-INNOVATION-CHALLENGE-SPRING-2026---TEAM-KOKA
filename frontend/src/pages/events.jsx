import Button from '../components/Button/Button'
import Card from '../components/Card/Card'
import styles from './overview.module.scss'

function EventsOverview({ events, selectedCampus, onBackHome }) {
    if (!selectedCampus) {
        return (
            <main className={styles.overview}>
                <section className={styles.overview__header}>
                    <div>
                        <h2 className={styles.overview__title}>All Trending Events</h2>
                        <p className={styles.overview__description}>Select a campus first to view events.</p>
                    </div>
                    <Button variant="ghost" onClick={onBackHome}>
                        Back home
                    </Button>
                </section>
            </main>
        )
    }

    return (
        <main className={styles.overview}>
            <section className={styles.overview__header}>
                <div>
                    <h2 className={styles.overview__title}>All Trending Events</h2>
                    <p className={styles.overview__description}>Browse every highlighted event for {selectedCampus.name}.</p>
                </div>
                <Button variant="ghost" onClick={onBackHome}>
                    Back home
                </Button>
            </section>

            <section className={styles.overview__grid}>
                {events.map((event) => (
                    <Card
                        key={event.id}
                        title={event.title}
                        description={`${event.clubName} · ${event.time} · ${event.blurb}`}
                        logoSrc={event.banner}
                        href={`/club/${event.clubId}`}
                        target="_self"
                        ctaLabel="Open event club"
                    />
                ))}
            </section>
        </main>
    )
}

export default EventsOverview
