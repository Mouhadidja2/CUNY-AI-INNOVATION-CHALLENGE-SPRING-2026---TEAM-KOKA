import ClubsHub from '../components/ClubsHub/ClubsHub'
import styles from './clubs.module.scss'

function ClubsPage({ selectedCampus, clubs, events, searchQuery, onSearchQueryChange, onClubOpen, onViewAllClubs, onViewAllEvents, onBackHome }) {
    const campusLabel = selectedCampus ? selectedCampus.name : 'Choose your college to unlock club discovery tools.'

    return (
        <main className={styles.clubsPage}>
            <section className={styles.clubsPage__intro} aria-labelledby="clubs-page-title">
                <p className={styles.clubsPage__breadcrumb}>
                    <button type="button" className={styles.clubsPage__breadcrumbLink} onClick={onBackHome}>
                        Home
                    </button>
                    <span className={styles.clubsPage__breadcrumbDivider} aria-hidden="true">
                        /
                    </span>
                    <span aria-current="page">Clubs</span>
                </p>

                <h1 className={styles.clubsPage__title} id="clubs-page-title">
                    Clubs
                </h1>
                <p className={styles.clubsPage__description}>
                    Explore the directory, browse active clubs, and discover trending events in one focused view.
                </p>
                <p className={styles.clubsPage__campusMeta}>{campusLabel}</p>
            </section>

            <ClubsHub
                selectedCampus={selectedCampus}
                clubs={clubs}
                events={events}
                searchQuery={searchQuery}
                onSearchQueryChange={onSearchQueryChange}
                onClubOpen={onClubOpen}
                onViewAllClubs={onViewAllClubs}
                onViewAllEvents={onViewAllEvents}
            />
        </main>
    )
}

export default ClubsPage
