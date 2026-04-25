import { useState } from 'react'
import Button from '../components/Button/Button'
import styles from './club.module.scss'

function getEventCardsPerPage(width) {
    if (width >= 980) {
        return 3
    }

    if (width >= 640) {
        return 2
    }

    return 1
}

function Club({ club, currentUser, onBackHome, onOpenAuth }) {
    const [activeTab, setActiveTab] = useState('about')
    const [rsvpMessage, setRsvpMessage] = useState('')
    const [eventPage, setEventPage] = useState(0)

    if (!club) {
        return (
            <main className={styles.club}>
                <section className={styles.club__panel}>
                    <h2 className={styles.club__panelTitle}>Club not found</h2>
                    <p className={styles.club__empty}>That public profile does not exist. Pick another club from the home page.</p>
                    <Button onClick={onBackHome}>Return home</Button>
                </section>
            </main>
        )
    }

    const canRSVP = currentUser?.role === 'student'
    const eventCardsPerPage = getEventCardsPerPage(window.innerWidth)
    const totalEventPages = Math.max(1, Math.ceil(club.publicEvents.length / eventCardsPerPage))
    const activeEventPage = Math.min(eventPage, totalEventPages - 1)
    const visibleEvents = club.publicEvents.slice(activeEventPage * eventCardsPerPage, activeEventPage * eventCardsPerPage + eventCardsPerPage)

    return (
        <main className={styles.club}>
            <section className={styles.club__hero}>
                <img className={styles.club__banner} src={club.banner} alt={`${club.name} banner`} />
                <article className={styles.club__intro}>
                    <p className={styles.club__eyebrow}>{club.category}</p>
                    <h2 className={styles.club__title}>{club.name}</h2>
                    <p className={styles.club__description}>{club.description}</p>
                    <p className={styles.club__meta}>
                        Meets {club.meetingTime} at {club.location}
                    </p>
                    <ul className={styles.club__list}>
                        {club.email ? (
                            <li>
                                Contact: <a href={`mailto:${club.email}`}>{club.email}</a>
                            </li>
                        ) : null}
                        {club.advisor ? <li>Club advisor: {club.advisor}</li> : null}
                        {club.zoomLink ? (
                            <li>
                                Zoom: <a href={club.zoomLink}>{club.zoomLink}</a>
                            </li>
                        ) : null}
                    </ul>
                    <div className={styles.club__actions}>
                        <Button onClick={onBackHome} variant="ghost">
                            Back to home
                        </Button>
                        <Button onClick={canRSVP ? () => setRsvpMessage(`RSVP saved for ${club.name}.`) : onOpenAuth} variant="primary">
                            {canRSVP ? 'RSVP to a public event' : 'Sign in to RSVP'}
                        </Button>
                    </div>
                    {rsvpMessage ? <p className={styles.club__status}>{rsvpMessage}</p> : null}
                </article>
            </section>

            <section className={styles.club__panel}>
                <div className={styles.club__tabs}>
                    <button
                        className={`${styles.club__tab} ${activeTab === 'about' ? styles['club__tab--active'] : ''}`.trim()}
                        type="button"
                        onClick={() => setActiveTab('about')}
                    >
                        About
                    </button>
                    <button
                        className={`${styles.club__tab} ${activeTab === 'members' ? styles['club__tab--active'] : ''}`.trim()}
                        type="button"
                        onClick={() => setActiveTab('members')}
                    >
                        Active Members
                    </button>
                </div>

                <div className={styles.club__tabContent}>
                    {activeTab === 'about' ? (
                        <div>
                            <h3 className={styles.club__panelTitle}>About this club</h3>
                            <p className={styles.club__description}>{club.description}</p>
                            <p className={styles.club__meta}>Room: {club.location}</p>
                            <p className={styles.club__meta}>Meeting info: {club.meetingTime}</p>
                            {club.zoomLink ? <p className={styles.club__meta}>Zoom link / meeting: {club.zoomLink}</p> : null}
                            {club.email ? <p className={styles.club__meta}>Club email: {club.email}</p> : null}
                            {club.advisor ? <p className={styles.club__meta}>Club advisor: {club.advisor}</p> : null}
                            <ul className={styles.club__list}>
                                {club.officers.length ? club.officers.map((officer) => <li key={officer}>{officer}</li>) : <li>Officer roster will be posted soon.</li>}
                            </ul>

                            <div className={styles.club__highlights}>
                                <article className={styles.club__highlightCard}>
                                    <h4 className={styles.club__highlightTitle}>Who should join</h4>
                                    <p className={styles.club__highlightText}>Students interested in this community and campus activities are welcome to attend.</p>
                                </article>
                                <article className={styles.club__highlightCard}>
                                    <h4 className={styles.club__highlightTitle}>What to expect</h4>
                                    <p className={styles.club__highlightText}>Meetups, collaborative projects, and student-led opportunities throughout the semester.</p>
                                </article>
                                <article className={styles.club__highlightCard}>
                                    <h4 className={styles.club__highlightTitle}>Getting involved</h4>
                                    <p className={styles.club__highlightText}>Start by joining a public event, then connect with officers for recurring member updates.</p>
                                </article>
                            </div>
                        </div>
                    ) : null}

                    {activeTab === 'members' ? (
                        <div>
                            <h3 className={styles.club__panelTitle}>Active members</h3>
                            <div className={styles.club__list}>
                                {club.members.length ? (
                                    club.members.map((member) => (
                                        <div key={member} className={styles.club__memberCard}>
                                            <p className={styles.club__memberName}>{member}</p>
                                            <p className={styles.club__memberRole}>Active member</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.club__empty}>Member highlights are being prepared by the club officers.</p>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </section>

            <section className={styles.club__panel}>
                <div className={styles.club__sectionHeader}>
                    <h3 className={styles.club__panelTitle}>Public events</h3>
                    <div className={styles.club__carouselControls}>
                        <Button variant="ghost" onClick={() => setEventPage((page) => Math.max(page - 1, 0))} disabled={activeEventPage === 0} ariaLabel="Previous events">
                            Previous
                        </Button>
                        <p className={styles.club__carouselMeta}>{`${activeEventPage + 1} / ${totalEventPages}`}</p>
                        <Button
                            variant="ghost"
                            onClick={() => setEventPage((page) => Math.min(page + 1, totalEventPages - 1))}
                            disabled={activeEventPage >= totalEventPages - 1}
                            ariaLabel="Next events"
                        >
                            Next
                        </Button>
                    </div>
                </div>

                <div className={styles.club__eventCarousel}>
                    {club.publicEvents.length ? (
                        visibleEvents.map((event) => (
                            <article key={event.id} className={styles.club__eventCard}>
                                <p className={styles.club__eventName}>{event.title}</p>
                                <p className={styles.club__eventMeta}>{event.time}</p>
                                <Button
                                    disabled={!canRSVP}
                                    variant={canRSVP ? 'primary' : 'ghost'}
                                    onClick={() => setRsvpMessage(`RSVP saved for ${event.title}.`)}
                                >
                                    {canRSVP ? 'RSVP now' : 'Sign in to RSVP'}
                                </Button>
                            </article>
                        ))
                    ) : (
                        <p className={styles.club__empty}>No public events have been posted yet.</p>
                    )}
                </div>
            </section>
        </main>
    )
}

export default Club
