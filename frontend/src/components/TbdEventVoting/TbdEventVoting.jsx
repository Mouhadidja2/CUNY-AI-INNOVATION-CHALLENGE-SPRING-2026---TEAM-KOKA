import { useState, useMemo } from 'react'
import Button from '../Button/Button'
import styles from './tbdEventVoting.module.scss'

const MAX_VOTES = 2

function TbdEventVoting({ clubs, registeredEvents }) {
    // Find clubs the user has attended at least one event for
    const attendedClubNames = useMemo(() => {
        if (!registeredEvents) return new Set()
        return new Set(
            registeredEvents
                .filter((reg) => reg.attended)
                .map((reg) => reg.clubName)
        )
    }, [registeredEvents])

    // Collect all TBD events from clubs the user has attended
    const tbdSections = useMemo(() => {
        if (!clubs) return []
        return clubs
            .filter((club) => attendedClubNames.has(club.name) && club.tbdEvents?.length)
            .map((club) => ({ clubName: club.name, clubId: club.id, events: club.tbdEvents }))
    }, [clubs, attendedClubNames])

    const [userVotes, setUserVotes] = useState({})

    // Generate random mock vote counts once per mount (page load)
    const [mockVoteCounts] = useState(() => {
        const counts = {}
        if (!clubs) return counts
        clubs
            .filter((club) => club.tbdEvents?.length)
            .forEach((club) => {
                const totalVotes = Math.floor(Math.random() * 50) + 1
                const eventIds = club.tbdEvents.map((e) => e.id)
                const distribution = eventIds.map(() => 0)
                for (let i = 0; i < totalVotes; i++) {
                    distribution[Math.floor(Math.random() * eventIds.length)] += 1
                }
                eventIds.forEach((id, idx) => {
                    counts[id] = distribution[idx]
                })
            })
        return counts
    })

    if (!tbdSections.length) return null

    const handleVote = (clubId, eventId) => {
        setUserVotes((prev) => {
            const clubVotes = prev[clubId] || []
            if (clubVotes.includes(eventId)) {
                // Toggle off
                return { ...prev, [clubId]: clubVotes.filter((id) => id !== eventId) }
            }
            if (clubVotes.length >= MAX_VOTES) return prev
            return { ...prev, [clubId]: [...clubVotes, eventId] }
        })
    }

    return (
        <section className={styles.voting} aria-labelledby="tbd-voting-title">
            <div className={styles.voting__header}>
                <h3 className={styles.voting__title} id="tbd-voting-title">
                    Vote on Upcoming Events
                </h3>
                <p className={styles.voting__subtitle}>
                    You attended a club meeting — help decide which events happen next! Pick up to {MAX_VOTES}.
                </p>
            </div>

            {tbdSections.map((section) => {
                const clubVotes = userVotes[section.clubId] || []
                const allVotesUsed = clubVotes.length >= MAX_VOTES
                const sectionTotal = section.events.reduce((sum, e) => sum + (mockVoteCounts[e.id] || 0), 0)

                return (
                    <div key={section.clubId} className={styles.voting__section}>
                        <h4 className={styles.voting__clubName}>{section.clubName}</h4>
                        <div className={styles.voting__grid}>
                            {section.events.map((event) => {
                                const isSelected = clubVotes.includes(event.id)
                                const baseVotes = mockVoteCounts[event.id] || 0
                                const displayVotes = baseVotes + (isSelected ? 1 : 0)

                                return (
                                    <article
                                        key={event.id}
                                        className={`${styles.voting__card} ${isSelected ? styles['voting__card--selected'] : ''}`.trim()}
                                    >
                                        <p className={styles.voting__eventTitle}>{event.title}</p>
                                        <p className={styles.voting__eventDate}>Date: TBD</p>

                                        {allVotesUsed && (
                                            <div className={styles.voting__results}>
                                                <div className={styles.voting__bar}>
                                                    <div
                                                        className={styles.voting__barFill}
                                                        style={{ width: sectionTotal > 0 ? `${(displayVotes / sectionTotal) * 100}%` : '0%' }}
                                                    />
                                                </div>
                                                <span className={styles.voting__count}>
                                                    {displayVotes} vote{displayVotes !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        )}

                                        <Button
                                            variant={isSelected ? 'primary' : 'ghost'}
                                            onClick={() => handleVote(section.clubId, event.id)}
                                            disabled={!isSelected && allVotesUsed}
                                        >
                                            {isSelected ? 'Voted' : 'Vote'}
                                        </Button>
                                    </article>
                                )
                            })}
                        </div>
                        {!allVotesUsed && (
                            <p className={styles.voting__hint}>
                                {clubVotes.length === 0
                                    ? `Select ${MAX_VOTES} events to cast your votes`
                                    : `${MAX_VOTES - clubVotes.length} vote remaining — results appear once you use all your votes`}
                            </p>
                        )}
                    </div>
                )
            })}
        </section>
    )
}

export default TbdEventVoting
