import { useState } from 'react'
import Card from '../components/Card/Card'
import Hero from '../components/Hero/Hero'
import Button from '../components/Button/Button'
import { homeCategories, trendingEvents } from '../data/siteData'
import styles from './home.module.scss'

function Home({ clubs, searchQuery, onSearchQueryChange, onOpenSignup, onOpenLogin, onClubOpen }) {
    const normalizedSearch = searchQuery.trim().toLowerCase()
    const [activeCategory, setActiveCategory] = useState('All')

    const filteredClubs = clubs.filter((club) => {
        const matchesSearch =
            !normalizedSearch ||
            club.name.toLowerCase().includes(normalizedSearch) ||
            club.category.toLowerCase().includes(normalizedSearch) ||
            club.shortDescription.toLowerCase().includes(normalizedSearch)
        const matchesCategory = activeCategory === 'All' || club.category === activeCategory

        return matchesSearch && matchesCategory
    })

    const filteredEvents = trendingEvents.filter((event) => {
        if (activeCategory === 'All') {
            return true
        }

        const club = clubs.find((clubItem) => clubItem.id === event.clubId)
        return club?.category === activeCategory
    })

    return (
        <main className={styles.home}>
            <Hero
                slogan="Campus clubs, public events, and officer tools in one place."
                primaryButtonLabel="Start a club"
                secondaryButtonLabel="Manage a club"
                onPrimaryAction={onOpenSignup}
                onSecondaryAction={onOpenLogin}
            />

            <section className={styles.home__section} aria-labelledby="home-toolbar-title">
                <div className={styles.home__sectionHeader}>
                    <div>
                        <h3 className={styles.home__sectionTitle} id="home-toolbar-title">
                            Explore the directory
                        </h3>
                        <p className={styles.home__sectionDescription}>
                            Search by club name, narrow by category, and open any public profile.
                        </p>
                    </div>
                    <Button variant="ghost" onClick={onOpenSignup}>
                        Join the portal
                    </Button>
                </div>

                <div className={styles.home__toolbar}>
                    <label className={styles.home__field}>
                        <span className={styles.home__label}>Search clubs</span>
                        <input
                            className={styles.home__input}
                            type="search"
                            value={searchQuery}
                            onChange={(event) => onSearchQueryChange(event.target.value)}
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
                        onClick={() => setActiveCategory('All')}
                    >
                        All
                    </button>
                    {homeCategories.map((category) => (
                        <button
                            key={category}
                            className={`${styles.home__filterButton} ${activeCategory === category ? styles['home__filterButton--active'] : ''}`.trim()}
                            type="button"
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </section>

            <section className={styles.home__section} aria-labelledby="featured-clubs-title">
                <div className={styles.home__sectionHeader}>
                    <div>
                        <h3 className={styles.home__sectionTitle} id="featured-clubs-title">
                            Active clubs
                        </h3>
                        <p className={styles.home__sectionDescription}>Public cards for guests and prospects.</p>
                    </div>
                </div>

                <div className={styles.home__cardGrid}>
                    {filteredClubs.length ? (
                        filteredClubs.map((club) => (
                            <Card
                                key={club.id}
                                title={club.name}
                                description={club.shortDescription}
                                logoSrc={club.banner}
                                href={`/club/${club.id}`}
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
                    <div>
                        <h3 className={styles.home__sectionTitle} id="trending-events-title">
                            Trending events
                        </h3>
                        <p className={styles.home__sectionDescription}>Highlights from active clubs that visitors can browse right away.</p>
                    </div>
                </div>

                <div className={styles.home__cardGrid}>
                    {filteredEvents.map((event) => (
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
                </div>
            </section>
        </main>
    )
}

export default Home
