import { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import Modal from '../Modal/Modal'
import Button from '../Button/Button'
import styles from './eventScheduler.module.scss'

const VISIBILITY_OPTIONS = [
    { id: 'public', label: 'Public', description: 'All students can see this event' },
    { id: 'private', label: 'Private', description: 'Only club officers and advisors can see' },
]

function EventScheduler({
    isOpen,
    onClose,
    onEventCreated,
    selectedRoom,
    onReserveRoom,
    club,
    user,
}) {
    const [eventName, setEventName] = useState('')
    const [eventDate, setEventDate] = useState('')
    const [eventTime, setEventTime] = useState('')
    const [eventEndTime, setEventEndTime] = useState('')
    const [eventDescription, setEventDescription] = useState('')
    const [eventBanner, setEventBanner] = useState(null)
    const [visibility, setVisibility] = useState('public')
    const [bannerPreview, setBannerPreview] = useState(null)
    const [status, setStatus] = useState('')
    const fileInputRef = useRef(null)

    // Reset form when modal opens
    const handleClose = () => {
        setEventName('')
        setEventDate('')
        setEventTime('')
        setEventEndTime('')
        setEventDescription('')
        setEventBanner(null)
        setVisibility('public')
        setBannerPreview(null)
        setStatus('')
        onClose()
    }

    const handleBannerChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setEventBanner(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setBannerPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!selectedRoom) {
            setStatus('Please reserve a room first before creating an event.')
            return
        }

        if (!eventName || !eventDate || !eventTime || !eventEndTime) {
            setStatus('Please fill in all required fields.')
            return
        }

        const startDateTime = new Date(`${eventDate}T${eventTime}`)
        const endDateTime = new Date(`${eventDate}T${eventEndTime}`)

        if (endDateTime <= startDateTime) {
            setStatus('End time must be after start time.')
            return
        }

        // Format time string for display
        const formatTimeStr = (date) => {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            })
        }

        const formatDateStr = (date) => {
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            })
        }

        const eventData = {
            id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: eventName,
            description: eventDescription,
            visibility,
            roomId: selectedRoom.id,
            roomNumber: selectedRoom.roomNumber,
            buildingName: selectedRoom.buildingName,
            floor: selectedRoom.floor,
            fixedDate: startDateTime.toISOString(),
            fixedEndDate: endDateTime.toISOString(),
            time: `${formatDateStr(startDateTime)} · ${formatTimeStr(startDateTime)} – ${formatTimeStr(endDateTime)}`,
            banner: bannerPreview,
            createdBy: user?.name || 'Unknown',
            createdAt: new Date().toISOString(),
            clubId: club?.id,
            clubName: club?.name,
        }

        // Store in localStorage for persistence
        const existingEvents = JSON.parse(window.localStorage.getItem('club-events') || '[]')
        existingEvents.push(eventData)
        window.localStorage.setItem('club-events', JSON.stringify(existingEvents))

        onEventCreated(eventData)
        handleClose()
    }

    // If no room is selected, show a prompt to reserve one
    if (!selectedRoom && isOpen) {
        return (
            <Modal
                isOpen={isOpen}
                title="Reserve a Room First"
                onClose={handleClose}
            >
                <div className={styles.eventScheduler__noRoom}>
                    <p className={styles.eventScheduler__message}>
                        You need to reserve a room before creating an event.
                    </p>
                    <div className={styles.eventScheduler__actions}>
                        <Button variant="primary" onClick={onReserveRoom}>
                            Find and Reserve a Room
                        </Button>
                        <Button variant="ghost" onClick={handleClose}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            title="Schedule an Event"
            onClose={handleClose}
            panelClassName={styles.eventScheduler__panel}
        >
            <form className={styles.eventScheduler} onSubmit={handleSubmit}>
                {/* Room Info Display */}
                {selectedRoom && (
                    <div className={styles.eventScheduler__roomInfo}>
                        <h4 className={styles.eventScheduler__roomTitle}>Reserved Room</h4>
                        <p className={styles.eventScheduler__roomDetails}>
                            <strong>{selectedRoom.roomNumber}</strong> · {selectedRoom.buildingName} · Floor {selectedRoom.floor}
                        </p>
                        <Button variant="ghost" onClick={onReserveRoom} className={styles.eventScheduler__changeRoom}>
                            Change Room
                        </Button>
                    </div>
                )}

                {/* Event Name */}
                <label className={styles.eventScheduler__field}>
                    <span>Event Name *</span>
                    <input
                        className={styles.eventScheduler__input}
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="Enter event name"
                        required
                    />
                </label>

                {/* Date and Time */}
                <div className={styles.eventScheduler__row}>
                    <label className={styles.eventScheduler__field}>
                        <span>Date *</span>
                        <input
                            className={styles.eventScheduler__input}
                            type="date"
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                            required
                        />
                    </label>
                    <label className={styles.eventScheduler__field}>
                        <span>Start Time *</span>
                        <input
                            className={styles.eventScheduler__input}
                            type="time"
                            value={eventTime}
                            onChange={(e) => setEventTime(e.target.value)}
                            required
                        />
                    </label>
                    <label className={styles.eventScheduler__field}>
                        <span>End Time *</span>
                        <input
                            className={styles.eventScheduler__input}
                            type="time"
                            value={eventEndTime}
                            onChange={(e) => setEventEndTime(e.target.value)}
                            required
                        />
                    </label>
                </div>

                {/* Event Description */}
                <label className={styles.eventScheduler__field}>
                    <span>Event Description</span>
                    <textarea
                        className={styles.eventScheduler__textarea}
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        placeholder="Describe your event..."
                        rows={4}
                    />
                </label>

                {/* Event Banner */}
                <div className={styles.eventScheduler__field}>
                    <span>Event Banner Image</span>
                    <div className={styles.eventScheduler__bannerUpload}>
                        {bannerPreview ? (
                            <div className={styles.eventScheduler__bannerPreview}>
                                <img src={bannerPreview} alt="Event banner preview" />
                                <button
                                    type="button"
                                    className={styles.eventScheduler__removeBanner}
                                    onClick={() => {
                                        setEventBanner(null)
                                        setBannerPreview(null)
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className={styles.eventScheduler__uploadButton}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <span>+</span>
                                <span>Upload Banner</span>
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleBannerChange}
                            className={styles.eventScheduler__fileInput}
                        />
                    </div>
                </div>

                {/* Visibility Selection */}
                <div className={styles.eventScheduler__field}>
                    <span>Event Visibility *</span>
                    <div className={styles.eventScheduler__visibilityOptions}>
                        {VISIBILITY_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                className={`${styles.eventScheduler__visibilityOption} ${
                                    visibility === option.id ? styles['eventScheduler__visibilityOption--active'] : ''
                                }`}
                                onClick={() => setVisibility(option.id)}
                            >
                                <span className={styles.eventScheduler__visibilityLabel}>{option.label}</span>
                                <span className={styles.eventScheduler__visibilityDescription}>
                                    {option.description}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status Message */}
                {status && (
                    <p className={styles.eventScheduler__status}>{status}</p>
                )}

                {/* Submit Buttons */}
                <div className={styles.eventScheduler__actions}>
                    <Button type="submit" variant="primary">
                        Create Event
                    </Button>
                    <Button type="button" variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

EventScheduler.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onEventCreated: PropTypes.func.isRequired,
    selectedRoom: PropTypes.shape({
        id: PropTypes.string,
        roomNumber: PropTypes.string,
        buildingName: PropTypes.string,
        floor: PropTypes.number,
    }),
    onReserveRoom: PropTypes.func.isRequired,
    club: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
    }),
    user: PropTypes.shape({
        name: PropTypes.string,
        role: PropTypes.string,
    }),
}

export default EventScheduler
