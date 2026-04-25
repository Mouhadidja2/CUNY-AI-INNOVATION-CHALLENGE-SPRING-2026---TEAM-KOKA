import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faClock } from '@fortawesome/free-solid-svg-icons'
import Button from '../Button/Button'
import styles from './registeredEvents.module.scss'

/**
 * Check if the current time is within a ±24-hour window of the event date.
 */
function isWithinAttendanceWindow(eventDateStr) {
    const eventDate = new Date(eventDateStr)
    const now = new Date()
    const windowMs = 24 * 60 * 60 * 1000 // 24 hours
    const diff = Math.abs(now.getTime() - eventDate.getTime())
    return diff <= windowMs
}

function formatEventDate(dateStr) {
    try {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })
    } catch {
        return dateStr
    }
}

function RegisteredEvents({ registrations, onMarkAttended, onAddFeedback }) {
    const [expandedId, setExpandedId] = useState(null)
    const [feedbackDrafts, setFeedbackDrafts] = useState({})
    const [savedFeedbackIds, setSavedFeedbackIds] = useState(new Set())

    if (!registrations || !registrations.length) {
        return null
    }

    const toggleExpand = (regId) => {
        setExpandedId((current) => (current === regId ? null : regId))
    }

    const handleFeedbackChange = (regId, text) => {
        setFeedbackDrafts((drafts) => ({ ...drafts, [regId]: text }))
    }

    const handleFeedbackSave = (reg) => {
        const text = feedbackDrafts[reg.id] ?? reg.feedback ?? ''
        onAddFeedback(reg.id, text)
        setSavedFeedbackIds((ids) => new Set([...ids, reg.id]))
        setTimeout(() => {
            setSavedFeedbackIds((ids) => {
                const next = new Set(ids)
                next.delete(reg.id)
                return next
            })
        }, 2000)
    }

    return (
        <section className={styles.registeredEvents} aria-labelledby="registered-events-title">
            <div className={styles.registeredEvents__header}>
                <h3 className={styles.registeredEvents__title} id="registered-events-title">
                    Registered Events
                </h3>
                <span className={styles.registeredEvents__count}>
                    {registrations.length} {registrations.length === 1 ? 'event' : 'events'}
                </span>
            </div>

            <div className={styles.registeredEvents__grid}>
                {registrations.map((reg) => {
                    const isExpanded = expandedId === reg.id
                    const canAttend = isWithinAttendanceWindow(reg.eventDate)
                    const feedbackText = feedbackDrafts[reg.id] ?? reg.feedback ?? ''

                    return (
                        <div
                            key={reg.id}
                            className={`${styles.registeredEvents__card} ${isExpanded ? styles['registeredEvents__card--expanded'] : ''}`.trim()}
                        >
                            <div
                                className={styles.registeredEvents__cardHeader}
                                onClick={() => toggleExpand(reg.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === 'Enter') toggleExpand(reg.id) }}
                            >
                                <div>
                                    <p className={styles.registeredEvents__eventTitle}>{reg.eventTitle}</p>
                                    <p className={styles.registeredEvents__clubName}>{reg.clubName}</p>
                                </div>
                                {reg.attended ? (
                                    <span className={`${styles.registeredEvents__badge} ${styles['registeredEvents__badge--attended']}`}>
                                        <FontAwesomeIcon icon={faCheck} /> Attended
                                    </span>
                                ) : (
                                    <span className={`${styles.registeredEvents__badge} ${styles['registeredEvents__badge--pending']}`}>
                                        <FontAwesomeIcon icon={faClock} /> Upcoming
                                    </span>
                                )}
                            </div>

                            <p className={styles.registeredEvents__eventMeta}>
                                {formatEventDate(reg.eventDate)} · {reg.meetingTime}
                            </p>

                            {isExpanded ? (
                                <div className={styles.registeredEvents__detail}>
                                    <div className={styles.registeredEvents__feedbackSection}>
                                        <label className={styles.registeredEvents__label} htmlFor={`feedback-${reg.id}`}>
                                            Event feedback
                                        </label>
                                        <textarea
                                            id={`feedback-${reg.id}`}
                                            className={styles.registeredEvents__textarea}
                                            value={feedbackText}
                                            onChange={(e) => handleFeedbackChange(reg.id, e.target.value)}
                                            placeholder="How was this event? Share your thoughts..."
                                            rows={3}
                                        />
                                        <div className={styles.registeredEvents__actions}>
                                            <Button variant="ghost" onClick={() => handleFeedbackSave(reg)}>
                                                Save Feedback
                                            </Button>
                                            {savedFeedbackIds.has(reg.id) ? (
                                                <span className={styles.registeredEvents__feedbackSaved}>
                                                    <FontAwesomeIcon icon={faCheck} /> Saved
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className={styles.registeredEvents__attendanceSection}>
                                        <label className={styles.registeredEvents__label}>Attendance</label>
                                        {reg.attended ? (
                                            <p className={styles.registeredEvents__attendanceHint}>
                                                <FontAwesomeIcon icon={faCheck} /> You marked yourself as attended.
                                            </p>
                                        ) : canAttend ? (
                                            <div className={styles.registeredEvents__actions}>
                                                <Button variant="primary" onClick={() => onMarkAttended(reg.id)}>
                                                    Mark as Attended
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className={styles.registeredEvents__attendanceHint}>
                                                Attendance check-in opens within 24 hours of the event on {formatEventDate(reg.eventDate)}.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

export default RegisteredEvents
