import { useState } from 'react'
import Button from '../components/Button/Button'
import styles from './club.module.scss'

function Club({ club, currentUser, onBackHome, onOpenAuth }) {
    const [activeTab, setActiveTab] = useState('about')
    const [rsvpMessage, setRsvpMessage] = useState('')

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
                    <button
                        className={`${styles.club__tab} ${activeTab === 'events' ? styles['club__tab--active'] : ''}`.trim()}
                        type="button"
                        onClick={() => setActiveTab('events')}
                    >
                        Public Events
                    </button>
                </div>

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
                            {club.officers.map((officer) => (
                                <li key={officer}>{officer}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {activeTab === 'members' ? (
                    <div>
                        <h3 className={styles.club__panelTitle}>Active members</h3>
                        <div className={styles.club__list}>
                            {club.members.map((member) => (
                                <div key={member} className={styles.club__memberCard}>
                                    <p className={styles.club__memberName}>{member}</p>
                                    <p className={styles.club__memberRole}>Active member</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                {activeTab === 'events' ? (
                    <div>
                        <h3 className={styles.club__panelTitle}>Public events</h3>
                        <div className={styles.club__eventList}>
                            {club.publicEvents.map((event) => (
                                <div key={event.id} className={styles.club__eventCard}>
                                    <p className={styles.club__eventName}>{event.title}</p>
                                    <p className={styles.club__eventMeta}>{event.time}</p>
                                    <Button
                                        disabled={!canRSVP}
                                        variant={canRSVP ? 'primary' : 'ghost'}
                                        onClick={() => setRsvpMessage(`RSVP saved for ${event.title}.`)}
                                    >
                                        {canRSVP ? 'RSVP now' : 'Sign in to RSVP'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </section>
        </main>
    )
}

export default Club
