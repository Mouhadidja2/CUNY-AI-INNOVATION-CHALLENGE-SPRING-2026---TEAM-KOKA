import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faCheck, faCalendarDays, faEnvelope, faCalendar } from '@fortawesome/free-solid-svg-icons'
import Button from '../Button/Button'
import {
    generateIcsFile,
    downloadIcsFile,
    buildGoogleCalendarUrl,
    buildOutlookCalendarUrl,
    getNextEventDate,
} from '../../services/calendarUtils'
import styles from './rsvpModal.module.scss'

const CALENDAR_OPTIONS = [
    { id: 'google', label: 'Google Calendar', iconClass: styles['rsvpModal__calendarIcon--google'], icon: faCalendarDays },
    { id: 'outlook', label: 'Outlook Calendar', iconClass: styles['rsvpModal__calendarIcon--outlook'], icon: faEnvelope },
    { id: 'ical', label: 'Apple / iCal Download', iconClass: styles['rsvpModal__calendarIcon--ical'], icon: faCalendar },
]

function RsvpModal({ event, club, onClose, onRsvpComplete }) {
    const [step, setStep] = useState(1)
    const [selectedCalendar, setSelectedCalendar] = useState(null)
    const [isRecurring, setIsRecurring] = useState(false)

    const handleCalendarSelect = (calendarId) => {
        setSelectedCalendar(calendarId)
        setStep(2)
    }

    const handleRecurrenceSelect = (recurring) => {
        setIsRecurring(recurring)

        // Generate and download the iCal file
        const icsContent = generateIcsFile(event, club, recurring)
        const safeName = club.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const filename = recurring
            ? `${safeName}-recurring-meetings.ics`
            : `${safeName}-${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`
        downloadIcsFile(icsContent, filename)

        // If Google or Outlook, also open a new tab
        if (selectedCalendar === 'google') {
            const url = buildGoogleCalendarUrl(event, club, recurring)
            window.open(url, '_blank', 'noopener,noreferrer')
        } else if (selectedCalendar === 'outlook') {
            const url = buildOutlookCalendarUrl(event, club, recurring)
            window.open(url, '_blank', 'noopener,noreferrer')
        }

        // Register the RSVP
        const eventDate = event.fixedDate ? new Date(event.fixedDate).toISOString() : getNextEventDate(club.meetingTime)
        onRsvpComplete({
            eventId: event.id,
            eventTitle: event.title,
            clubId: club.id,
            clubName: club.name,
            eventDate,
            meetingTime: event.time || club.meetingTime,
            calendarApp: selectedCalendar,
            isRecurring: recurring,
        })

        setStep(3)
    }

    const stepDotClass = (dotStep) => {
        const base = styles.rsvpModal__stepDot
        if (dotStep === step) return `${base} ${styles['rsvpModal__stepDot--active']}`
        if (dotStep < step) return `${base} ${styles['rsvpModal__stepDot--done']}`
        return base
    }

    return (
        <div className={styles.rsvpModal} onClick={onClose}>
            <div className={styles.rsvpModal__panel} onClick={(e) => e.stopPropagation()}>
                <div className={styles.rsvpModal__header}>
                    <div>
                        <h3 className={styles.rsvpModal__title}>
                            {step === 1 ? 'Choose your calendar' : step === 2 ? 'Event frequency' : 'You\'re registered!'}
                        </h3>
                        <p className={styles.rsvpModal__subtitle}>
                            {event.title} — {club.name}
                        </p>
                    </div>
                    <button type="button" className={styles.rsvpModal__close} onClick={onClose} aria-label="Close">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <div className={styles.rsvpModal__steps}>
                    <span className={stepDotClass(1)} />
                    <span className={stepDotClass(2)} />
                    <span className={stepDotClass(3)} />
                </div>

                {step === 1 ? (
                    <div className={styles.rsvpModal__calendarGrid}>
                        {CALENDAR_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                className={styles.rsvpModal__calendarOption}
                                onClick={() => handleCalendarSelect(option.id)}
                            >
                                <span className={`${styles.rsvpModal__calendarIcon} ${option.iconClass}`}>
                                    <FontAwesomeIcon icon={option.icon} />
                                </span>
                                <span className={styles.rsvpModal__calendarLabel}>{option.label}</span>
                            </button>
                        ))}
                    </div>
                ) : null}

                {step === 2 ? (
                    <div className={styles.rsvpModal__recurrenceGrid}>
                        <button
                            type="button"
                            className={styles.rsvpModal__recurrenceOption}
                            onClick={() => handleRecurrenceSelect(false)}
                        >
                            <p className={styles.rsvpModal__recurrenceTitle}>This event only</p>
                            <p className={styles.rsvpModal__recurrenceDescription}>
                                RSVP for the next occurrence of this meeting.
                            </p>
                        </button>
                        <button
                            type="button"
                            className={styles.rsvpModal__recurrenceOption}
                            onClick={() => handleRecurrenceSelect(true)}
                        >
                            <p className={styles.rsvpModal__recurrenceTitle}>All recurring meetings</p>
                            <p className={styles.rsvpModal__recurrenceDescription}>
                                Add every weekly meeting from {club.name} to your calendar.
                            </p>
                        </button>
                    </div>
                ) : null}

                {step === 3 ? (
                    <div className={styles.rsvpModal__confirmation}>
                        <div className={styles.rsvpModal__confirmIcon}>
                            <FontAwesomeIcon icon={faCheck} />
                        </div>
                        <p className={styles.rsvpModal__confirmTitle}>RSVP confirmed</p>
                        <p className={styles.rsvpModal__confirmText}>
                            Your {isRecurring ? 'recurring' : ''} calendar event has been downloaded.
                            {selectedCalendar === 'google' || selectedCalendar === 'outlook'
                                ? ` A new tab was opened with ${selectedCalendar === 'google' ? 'Google' : 'Outlook'} Calendar.`
                                : ' Import the .ics file into your calendar app.'}
                        </p>
                        <div className={styles.rsvpModal__confirmActions}>
                            <Button variant="primary" onClick={onClose}>Done</Button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default RsvpModal
