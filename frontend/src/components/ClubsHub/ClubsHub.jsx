import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import Card from '../Card/Card'
import Button from '../Button/Button'
import styles from '../../pages/home.module.scss'

function getCardsPerPage(width) {
    if (width >= 1280) {
        return 4
    }

    if (width >= 980) {
        return 3
    }

    if (width >= 640) {
        return 2
    }

    return 1
}

function ClubsHub({
    selectedCampus,
    clubs,
    events,
    searchQuery,
    onSearchQueryChange,
    onClubOpen,
    onViewAllClubs,
    onViewAllEvents,
}) {
    const normalizedSearch = searchQuery.trim().toLowerCase()
    const [activeCategory, setActiveCategory] = useState('All')
    const [cardsPerPage, setCardsPerPage] = useState(() => getCardsPerPage(window.innerWidth))
    const [clubPage, setClubPage] = useState(0)
    const [eventPage, setEventPage] = useState(0)

    useEffect(() => {
        const handleResize = () => {
            setCardsPerPage(getCardsPerPage(window.innerWidth))
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const filteredClubs = clubs.filter((club) => {
        const matchesSearch =
            !normalizedSearch ||
            club.name.toLowerCase().includes(normalizedSearch) ||
            club.category.toLowerCase().includes(normalizedSearch) ||
            club.shortDescription.toLowerCase().includes(normalizedSearch)
        const matchesCategory = activeCategory === 'All' || club.category === activeCategory

        return matchesSearch && matchesCategory
    })

    const filteredEvents = events.filter((event) => {
        if (activeCategory === 'All') {
            return true
        }

        const club = clubs.find((clubItem) => clubItem.id === event.clubId)
        return club?.category === activeCategory
    })

    const homeCategories = [...new Set(clubs.map((club) => club.category))]
    const totalClubPages = Math.max(1, Math.ceil(filteredClubs.length / cardsPerPage))
    const totalEventPages = Math.max(1, Math.ceil(filteredEvents.length / cardsPerPage))
    const activeClubPage = Math.min(clubPage, totalClubPages - 1)
    const activeEventPage = Math.min(eventPage, totalEventPages - 1)

    const visibleClubs = filteredClubs.slice(activeClubPage * cardsPerPage, activeClubPage * cardsPerPage + cardsPerPage)
    const visibleEvents = filteredEvents.slice(activeEventPage * cardsPerPage, activeEventPage * cardsPerPage + cardsPerPage)

    if (!selectedCampus) {
        return (
            <section className={styles.home__section} aria-labelledby="clubs-hub-title">
                <div className={styles.home__sectionHeader}>
                    <div className={styles.home__sectionHeading}>
                        <h3 className={styles.home__sectionTitle} id="clubs-hub-title">
                            Clubs
                        </h3>
                        <p className={styles.home__sectionDescription}>Choose a campus first to unlock Explore the directory, Active clubs, and Trending events.</p>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <>
            <section className={styles.home__section} aria-labelledby="home-toolbar-title">
                <div className={styles.home__sectionHeader}>
                    <div className={styles.home__sectionHeading}>
                        <h3 className={styles.home__sectionTitle} id="home-toolbar-title">
                            Explore the directory
                        </h3>
                        <p className={styles.home__sectionDescription}>
                            Search by club name, narrow by category, and open any public profile.
                        </p>
                    </div>
                    <Button variant="ghost" onClick={onViewAllClubs}>
                        View clubs
                    </Button>
                </div>

                <div className={styles.home__toolbar}>
                    <label className={styles.home__field}>
                        <span className={styles.home__label}>Search clubs</span>
                        <input
                            className={styles.home__input}
                            type="search"
                            value={searchQuery}
                            onChange={(event) => {
                                setClubPage(0)
                                setEventPage(0)
                                onSearchQueryChange(event.target.value)
                            }}
                            placeholder="Chess, debate, robotics..."
                        />
                    </label>

                    <label className={styles.home__selectField}>
                        <span className={styles.home__label}>Open a club profile</span>
                        <select
                            className={styles.home__select}
                            defaultValue=""
                            onChange={(event) => {
                                if (event.target.value) {
                                    onClubOpen(event.target.value)
                                    event.target.value = ''
                                }
                            }}
                        >
                            <option value="">Choose a club</option>
                            {clubs.map((club) => (
                                <option key={club.id} value={club.id}>
                                    {club.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className={styles.home__filters}>
                    <button
                        className={`${styles.home__filterButton} ${activeCategory === 'All' ? styles['home__filterButton--active'] : ''}`.trim()}
                        type="button"
                        onClick={() => {
                            setActiveCategory('All')
                            setClubPage(0)
                            setEventPage(0)
                        }}
                    >
                        All
                    </button>
                    {homeCategories.map((category) => (
                        <button
                            key={category}
                            className={`${styles.home__filterButton} ${activeCategory === category ? styles['home__filterButton--active'] : ''}`.trim()}
                            type="button"
                            onClick={() => {
                                setActiveCategory(category)
                                setClubPage(0)
                                setEventPage(0)
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </section>

            <section className={styles.home__section} aria-labelledby="featured-clubs-title">
                <div className={styles.home__sectionHeader}>
                    <div className={styles.home__sectionHeading}>
                        <h3 className={styles.home__sectionTitle} id="featured-clubs-title">
                            Active clubs
                        </h3>
                        <p className={styles.home__sectionDescription}>Public cards for guests and prospects.</p>
                    </div>

                    <div className={styles.home__sectionActions}>
                        <div className={styles.home__carouselControls}>
                            <Button
                                variant="ghost"
                                onClick={() => setClubPage((page) => Math.max(page - 1, 0))}
                                disabled={activeClubPage === 0}
                                ariaLabel="Previous clubs"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </Button>
                            <p className={styles.home__carouselMeta}>
                                {totalClubPages ? `${activeClubPage + 1} / ${totalClubPages}` : '0 / 0'}
                            </p>
                            <Button
                                variant="ghost"
                                onClick={() => setClubPage((page) => Math.min(page + 1, totalClubPages - 1))}
                                disabled={activeClubPage >= totalClubPages - 1}
                                ariaLabel="Next clubs"
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </Button>
                        </div>
                        <Button variant="ghost" onClick={onViewAllClubs}>
                            View all
                        </Button>
                    </div>
                </div>

                <div className={styles.home__cardGrid} style={{ '--cards-per-page': cardsPerPage }}>
                    {filteredClubs.length ? (
                        visibleClubs.map((club) => (
                            <Card
                                key={club.id}
                                title={club.name}
                                description={club.shortDescription}
                                logoSrc={club.banner}
                                href={`/club/${club.id}`}
                                onNavigate={() => onClubOpen(club.id)}
                                target="_self"
                                ctaLabel="View profile"
                            />
                        ))
                    ) : (
                        <p className={styles.home__emptyState}>No clubs match the current search and category filters.</p>
                    )}
                </div>
            </section>

            <section className={styles.home__section} aria-labelledby="trending-events-title">
                <div className={styles.home__sectionHeader}>
                    <div className={styles.home__sectionHeading}>
                        <h3 className={styles.home__sectionTitle} id="trending-events-title">
                            Trending events
                        </h3>
                        <p className={styles.home__sectionDescription}>Highlights from active clubs that visitors can browse right away.</p>
                    </div>

                    <div className={styles.home__sectionActions}>
                        <div className={styles.home__carouselControls}>
                            <Button
                                variant="ghost"
                                onClick={() => setEventPage((page) => Math.max(page - 1, 0))}
                                disabled={activeEventPage === 0}
                                ariaLabel="Previous events"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </Button>
                            <p className={styles.home__carouselMeta}>
                                {totalEventPages ? `${activeEventPage + 1} / ${totalEventPages}` : '0 / 0'}
                            </p>
                            <Button
                                variant="ghost"
                                onClick={() => setEventPage((page) => Math.min(page + 1, totalEventPages - 1))}
                                disabled={activeEventPage >= totalEventPages - 1}
                                ariaLabel="Next events"
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </Button>
                        </div>
                        <Button variant="ghost" onClick={onViewAllEvents}>
                            View all
                        </Button>
                    </div>
                </div>

                <div className={styles.home__cardGrid} style={{ '--cards-per-page': cardsPerPage }}>
                    {visibleEvents.map((event) => (
                        <Card
                            key={event.id}
                            title={event.title}
                            description={`${event.clubName} · ${event.time} · ${event.blurb}`}
                            logoSrc={event.banner}
                            href={`/club/${event.clubId}`}
                            onNavigate={() => onClubOpen(event.clubId)}
                            target="_self"
                            ctaLabel="Open event club"
                        />
                    ))}
                    {!filteredEvents.length ? <p className={styles.home__emptyState}>No events match the current category filter.</p> : null}
                </div>
            </section>
        </>
    )
}

export default ClubsHub