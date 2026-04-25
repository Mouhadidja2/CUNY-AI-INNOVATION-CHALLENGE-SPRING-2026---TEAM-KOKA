import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket, faScrewdriverWrench, faUsers, faXmark } from '@fortawesome/free-solid-svg-icons'
import Hero from '../components/Hero/Hero'
import Button from '../components/Button/Button'
import ClubsHub from '../components/ClubsHub/ClubsHub'
import styles from './home.module.scss'

const mediaPool = Object.values(
    import.meta.glob('../assets/media/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
        eager: true,
        import: 'default',
    })
)

function pickRandomMedia(mediaItems, desiredCount) {
    if (!mediaItems.length) {
        return []
    }

    const shuffled = [...mediaItems]

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1))
            ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
    }

    if (shuffled.length >= desiredCount) {
        return shuffled.slice(0, desiredCount)
    }

    const repeated = []
    while (repeated.length < desiredCount) {
        repeated.push(shuffled[repeated.length % shuffled.length])
    }

    return repeated
}

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

function Home({
    selectedCampus,
    selectedCampusId,
    searchQuery,
    onSearchQueryChange,
    onOpenSignup,
    onOpenLogin,
    onJoinClub,
    onViewAllClubs,
    onViewAllEvents,
    onLightboxStateChange,
}) {
    const [lightboxImage, setLightboxImage] = useState(null)

    useEffect(() => {
        onLightboxStateChange?.(Boolean(lightboxImage))
        return () => onLightboxStateChange?.(false)
    }, [lightboxImage, onLightboxStateChange])

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setLightboxImage(null)
            }
        }

        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [])

    const projectQuote = 'Find your people, build your impact, and make campus life feel like yours'

    const bentoHighlights = [
        {
            title: 'Club Discovery That Feels Fast',
            description: 'Jump from curious to connected with search, filters, and campus-specific club browsing in one place.',
            className: styles['home__bentoCard--wide'],
        },
        {
            title: 'Events Worth Showing Up For',
            description: 'See what is trending now and quickly open the right club profile to RSVP.',
            className: styles['home__bentoCard--tall'],
        },
        {
            title: 'Built for CUNY Campuses',
            description: 'Switch campuses, stay context-aware, and keep every action tied to the right student community.',
            className: '',
        },
        {
            title: 'From First Click to Leadership',
            description: 'Whether you are joining your first club or leading one, the flow is simple and student-friendly.',
            className: '',
        },
    ]
    const [bentoImages] = useState(() => pickRandomMedia(mediaPool, bentoHighlights.length))

    return (
        <main className={styles.home}>
            <Hero
                slogan="Campus clubs, public events, and officer tools in one place."
                primaryButtonLabel="Start a club"
                secondaryButtonLabel="Manage a club"
                tertiaryButtonLabel="Join a club"
                onPrimaryAction={onOpenSignup}
                onSecondaryAction={onOpenLogin}
                onTertiaryAction={onJoinClub}
            />

            <section className={styles.home__section} aria-labelledby="about-project-title">
                <div className={styles.home__sectionHeader}>
                    <div className={styles.home__sectionHeading}>
                        <h3 className={styles.home__sectionTitle} id="about-project-title">
                            About this project
                        </h3>
                        <p className={styles.home__sectionDescription}>
                            Club Builder helps CUNY students find communities faster, helps club teams stay organized, and helps campus engagement grow with less friction.
                        </p>
                    </div>
                </div>
            </section>

            <section className={styles.home__quoteSection} aria-label="Project quote">
                <h2 className={styles.home__quoteHeader}>{projectQuote}</h2>
            </section>

            <section className={styles.home__section} aria-labelledby="feature-cards-title">
                <div className={styles.home__sectionHeader}>
                    <div className={styles.home__sectionHeading}>
                        <h3 className={styles.home__sectionTitle} id="feature-cards-title">
                            What you can do here
                        </h3>
                        <p className={styles.home__sectionDescription}>Pick the path that matches your vibe this semester.</p>
                    </div>
                </div>

                <div className={styles.home__featureGrid}>
                    <article className={styles.home__featureCard}>
                        <FontAwesomeIcon className={styles.home__featureIcon} icon={faRocket} />
                        <h4 className={styles.home__featureTitle}>Start a club</h4>
                        <p className={styles.home__featureText}>
                            Launch your idea with a clean onboarding path, gather interest, and begin building a community around what matters to you.
                        </p>
                        <Button variant="primary" onClick={onOpenSignup}>
                            Start a club
                        </Button>
                    </article>

                    <article className={styles.home__featureCard}>
                        <FontAwesomeIcon className={styles.home__featureIcon} icon={faScrewdriverWrench} />
                        <h4 className={styles.home__featureTitle}>Manage a club</h4>
                        <p className={styles.home__featureText}>
                            Keep operations smooth with role-aware tools for events, updates, and day-to-day club workflows.
                        </p>
                        <Button variant="ghost" onClick={onOpenLogin}>
                            Manage a club
                        </Button>
                    </article>

                    <article className={styles.home__featureCard}>
                        <FontAwesomeIcon className={styles.home__featureIcon} icon={faUsers} />
                        <h4 className={styles.home__featureTitle}>Join a club</h4>
                        <p className={styles.home__featureText}>
                            Explore what is active on campus, discover events that match your interests, and jump into communities that feel like home.
                        </p>
                        <Button variant="ghost" onClick={onJoinClub}>
                            Join a club
                        </Button>
                    </article>
                </div>
            </section>

            <section className={styles.home__section} aria-labelledby="bento-gallery-title">
                <div className={styles.home__sectionHeader}>
                    <div className={styles.home__sectionHeading}>
                        <h3 className={styles.home__sectionTitle} id="bento-gallery-title">
                            Campus life at a glance
                        </h3>
                        <p className={styles.home__sectionDescription}>A quick visual-style snapshot of what this platform is built to support.</p>
                    </div>
                </div>

                <div className={styles.home__bentoGrid}>
                    {bentoHighlights.map((item, index) => (
                        <article key={item.title} className={`${styles.home__bentoCard} ${item.className}`.trim()}>
                            {bentoImages[index] ? (
                                <button
                                    type="button"
                                    className={styles.home__bentoImageButton}
                                    onClick={() => openLightbox(bentoImages[index], `${item.title} campus highlight`)}
                                    aria-label={`Open image for ${item.title}`}
                                >
                                    <img className={styles.home__bentoImage} src={bentoImages[index]} alt={`${item.title} campus highlight`} loading="lazy" />
                                </button>
                            ) : null}
                            <h4 className={styles.home__bentoTitle}>{item.title}</h4>
                            <p className={styles.home__bentoText}>{item.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            {lightboxImage ? (
                <div className={styles.home__lightbox} role="dialog" aria-modal="true" aria-label="Bento image preview" onClick={closeLightbox}>
                    <div className={styles.home__lightboxPanel} onClick={(event) => event.stopPropagation()}>
                        <button type="button" className={styles.home__lightboxClose} onClick={closeLightbox} aria-label="Close lightbox">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                        <img className={styles.home__lightboxImage} src={lightboxImage.src} alt={lightboxImage.alt} />
                    </div>
                </div>
            ) : null}

            {selectedCampusId ? (
                <ClubsHub
                    selectedCampus={selectedCampus}
                    clubs={clubs}
                    events={events}
                    searchQuery={searchQuery}
                    onSearchQueryChange={onSearchQueryChange}
                    onClubOpen={onViewAllClubs ? undefined : undefined}
                    onViewAllClubs={onViewAllClubs}
                    onViewAllEvents={onViewAllEvents}
                />
            ) : (
                <p className={styles.home__emptyState}>Choose your campus to unlock Explore the directory, Active clubs, and Trending events.</p>
            )}
        </main>
    )
}

export default Home
