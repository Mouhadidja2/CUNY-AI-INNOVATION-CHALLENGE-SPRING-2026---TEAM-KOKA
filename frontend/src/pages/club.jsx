import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencil } from '@fortawesome/free-solid-svg-icons'
import Button from '../components/Button/Button'
import Modal from '../components/Modal/Modal'
import RsvpModal from '../components/RsvpModal/RsvpModal'
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

function Club({ club, currentUser, onBackHome, onOpenAuth, onRsvp, registeredEvents, onClubUpdate, setToastMessage }) {
    const [activeTab, setActiveTab] = useState('about')
    const [eventPage, setEventPage] = useState(0)
    const [rsvpEvent, setRsvpEvent] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [bannerPreview, setBannerPreview] = useState(null)
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        meetingTime: '',
        location: '',
        email: '',
        advisor: '',
        zoomLink: '',
    })

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

    const isEventRegistered = (eventId) => {
        return (registeredEvents || []).some((reg) => reg.eventId === eventId && reg.clubId === club.id)
    }

    const handleRsvpClick = (event) => {
        if (!canRSVP) {
            onOpenAuth()
            return
        }

        if (isEventRegistered(event.id)) {
            return
        }

        // Check if event is in the past
        const eventDate = event.fixedDate ? new Date(event.fixedDate) : null
        const now = new Date()
        if (eventDate && eventDate < now) {
            if (setToastMessage) {
                setToastMessage('Cannot RSVP for events that have already passed.')
            }
            return
        }

        setRsvpEvent(event)
    }

    const handleRsvpComplete = (rsvpData) => {
        if (onRsvp) {
            onRsvp(rsvpData)
        }
    }

    const handleHeroRsvpClick = () => {
        if (!canRSVP) {
            onOpenAuth()
            return
        }

        // RSVP for the first public event if available
        const firstEvent = club.publicEvents[0]
        if (firstEvent && !isEventRegistered(firstEvent.id)) {
            // Check if event is in the past
            const eventDate = firstEvent.fixedDate ? new Date(firstEvent.fixedDate) : null
            const now = new Date()
            if (eventDate && eventDate < now) {
                if (setToastMessage) {
                    setToastMessage('Cannot RSVP for events that have already passed.')
                }
                return
            }
            setRsvpEvent(firstEvent)
        }
    }

    // Check if user can edit this club (officer or advisor of this club)
    const canEditClub = currentUser && (
        (currentUser.role === 'club officer' && currentUser.assignedClub === club.name) ||
        (currentUser.role === 'club advisor' && currentUser.assignedClub === club.name) ||
        currentUser.role === 'sga officer'
    )

    const handleEditClick = () => {
        setEditForm({
            name: club.name || '',
            description: club.description || '',
            meetingTime: club.meetingTime || '',
            location: club.location || '',
            email: club.email || '',
            advisor: club.advisor || '',
            zoomLink: club.zoomLink || '',
        })
        setBannerPreview(club.banner || null)
        setShowEditModal(true)
    }

    const handleBannerChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setBannerPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleEditSubmit = (event) => {
        event.preventDefault()
        const updatedClub = {
            ...club,
            ...editForm,
            banner: bannerPreview || club.banner,
        }
        if (onClubUpdate) {
            onClubUpdate(updatedClub)
        }
        setShowEditModal(false)
    }

    return (
        <main className={styles.club}>
            <section className={styles.club__hero}>
                <div className={styles.club__bannerContainer}>
                    <img className={styles.club__banner} src={club.banner} alt={`${club.name} banner`} />
                    {canEditClub && (
                        <button
                            type="button"
                            className={styles.club__editButton}
                            onClick={handleEditClick}
                            aria-label="Edit club information"
                        >
                            <FontAwesomeIcon icon={faPencil} />
                            <span>Edit</span>
                        </button>
                    )}
                </div>
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
                        <Button onClick={handleHeroRsvpClick} variant="primary">
                            {canRSVP ? 'RSVP to a public event' : 'Sign in to RSVP'}
                        </Button>
                    </div>
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
                        visibleEvents.map((event) => {
                            const registered = isEventRegistered(event.id)
                            return (
                                <article key={event.id} className={styles.club__eventCard}>
                                    <p className={styles.club__eventName}>{event.title}</p>
                                    <p className={styles.club__eventMeta}>{event.time}</p>
                                    {registered ? (
                                        <Button variant="ghost" disabled>
                                            Registered ✓
                                        </Button>
                                    ) : (
                                        <Button
                                            disabled={!canRSVP}
                                            variant={canRSVP ? 'primary' : 'ghost'}
                                            onClick={() => handleRsvpClick(event)}
                                        >
                                            {canRSVP ? 'RSVP now' : 'Sign in to RSVP'}
                                        </Button>
                                    )}
                                </article>
                            )
                        })
                    ) : (
                        <p className={styles.club__empty}>No public events have been posted yet.</p>
                    )}
                </div>
            </section>

            {rsvpEvent ? (
                <RsvpModal
                    event={rsvpEvent}
                    club={club}
                    onClose={() => setRsvpEvent(null)}
                    onRsvpComplete={handleRsvpComplete}
                />
            ) : null}

            {/* Club Edit Modal */}
            <Modal
                isOpen={showEditModal}
                title={`Edit ${club.name}`}
                onClose={() => setShowEditModal(false)}
            >
                <form className={styles.club__editForm} onSubmit={handleEditSubmit}>
                    <div className={styles.club__bannerUpload}>
                        <label className={styles.club__field}>
                            <span>Club Banner</span>
                            {bannerPreview && (
                                <img
                                    src={bannerPreview}
                                    alt="Banner preview"
                                    className={styles.club__bannerPreview}
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleBannerChange}
                                className={styles.club__fileInput}
                            />
                        </label>
                    </div>

                    <label className={styles.club__field}>
                        <span>Club Name</span>
                        <input
                            className={styles.club__input}
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            required
                        />
                    </label>

                    <label className={styles.club__field}>
                        <span>Description</span>
                        <textarea
                            className={styles.club__textarea}
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows="3"
                            required
                        />
                    </label>

                    <label className={styles.club__field}>
                        <span>Meeting Time</span>
                        <input
                            className={styles.club__input}
                            type="text"
                            value={editForm.meetingTime}
                            onChange={(e) => setEditForm({ ...editForm, meetingTime: e.target.value })}
                            required
                        />
                    </label>

                    <label className={styles.club__field}>
                        <span>Location / Room</span>
                        <input
                            className={styles.club__input}
                            type="text"
                            value={editForm.location}
                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                            required
                        />
                    </label>

                    <label className={styles.club__field}>
                        <span>Club Email</span>
                        <input
                            className={styles.club__input}
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                    </label>

                    <label className={styles.club__field}>
                        <span>Club Advisor</span>
                        <input
                            className={styles.club__input}
                            type="text"
                            value={editForm.advisor}
                            onChange={(e) => setEditForm({ ...editForm, advisor: e.target.value })}
                        />
                    </label>

                    <label className={styles.club__field}>
                        <span>Zoom Link</span>
                        <input
                            className={styles.club__input}
                            type="url"
                            value={editForm.zoomLink}
                            onChange={(e) => setEditForm({ ...editForm, zoomLink: e.target.value })}
                            placeholder="https://..."
                        />
                    </label>

                    <div className={styles.club__formActions}>
                        <Button type="submit" variant="primary">Save Changes</Button>
                        <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>
        </main>
    )
}

export default Club
