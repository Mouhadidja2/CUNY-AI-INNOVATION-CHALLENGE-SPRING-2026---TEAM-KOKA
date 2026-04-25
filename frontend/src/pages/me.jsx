import Button from '../components/Button/Button'
import styles from './me.module.scss'

function Me({ currentUser, registeredEvents, attendanceLog, onOpenAuth, onBackHome, onSignOut }) {
    if (!currentUser) {
        return (
            <main className={styles.me}>
                <section className={styles.me__card}>
                    <p className={styles.me__eyebrow}>Personal area</p>
                    <h2 className={styles.me__title}>Your profile is waiting</h2>
                    <p className={styles.me__description}>Sign in to view your recent events, role, and club access.</p>
                    <Button onClick={onOpenAuth}>Sign in or create account</Button>
                </section>
            </main>
        )
    }

    const hasRegistrations = registeredEvents && registeredEvents.length > 0
    const attendanceRecords = attendanceLog?.records || []
    const visitedClubs = [...new Set(attendanceRecords.map((record) => record.clubName).filter(Boolean))]
    const attendedMeetingsCount = attendanceRecords.length
    const registeredCount = (registeredEvents || []).length
    const markedAttendedCount = (registeredEvents || []).filter((reg) => reg.attended).length

    return (
        <main className={styles.me}>
            <section className={styles.me__card}>
                <p className={styles.me__eyebrow}>Personal area</p>
                <h2 className={styles.me__title}>{currentUser.name}</h2>
                <p className={styles.me__meta}>Role: {currentUser.role}</p>
                {currentUser.assignedClub ? <p className={styles.me__meta}>Assigned club: {currentUser.assignedClub}</p> : null}
                {currentUser.email ? <p className={styles.me__meta}>Email: {currentUser.email}</p> : null}
            </section>

            <section className={styles.me__summary}>
                <h3 className={styles.me__title}>Your stats</h3>
                <div className={styles.me__summaryGrid}>
                    <div className={styles.me__summaryItem}>
                        <p className={styles.me__summaryLabel}>Clubs visited</p>
                        <p className={styles.me__summaryValue}>{visitedClubs.length}</p>
                    </div>
                    <div className={styles.me__summaryItem}>
                        <p className={styles.me__summaryLabel}>Meetings attended</p>
                        <p className={styles.me__summaryValue}>{attendedMeetingsCount}</p>
                    </div>
                    <div className={styles.me__summaryItem}>
                        <p className={styles.me__summaryLabel}>Events registered</p>
                        <p className={styles.me__summaryValue}>{registeredCount}</p>
                    </div>
                    <div className={styles.me__summaryItem}>
                        <p className={styles.me__summaryLabel}>Marked attended</p>
                        <p className={styles.me__summaryValue}>{markedAttendedCount}</p>
                    </div>
                </div>
            </section>

            <section className={styles.me__events}>
                <h3 className={styles.me__title}>Clubs you visited</h3>
                {visitedClubs.length ? (
                    <ul className={styles.me__eventList}>
                        {visitedClubs.map((clubName) => (
                            <li key={clubName} className={styles.me__eventItem}>
                                {clubName}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.me__emptyState}>No visits yet. Mark attendance at a club event to start tracking.</p>
                )}
            </section>

            <section className={styles.me__events}>
                <h3 className={styles.me__title}>Meetings you attended</h3>
                {attendanceRecords.length ? (
                    <ul className={styles.me__eventList}>
                        {attendanceRecords
                            .slice(-10)
                            .reverse()
                            .map((record, index) => {
                                const label = `${record.eventRegistered} · ${record.clubName}`
                                const dateLabel = record.eventDate ? new Date(record.eventDate).toLocaleString() : ''
                                return (
                                    <li key={`${record.eventDate || 'date'}-${index}`} className={styles.me__eventItem}>
                                        {dateLabel ? `${label} (${dateLabel})` : label}
                                    </li>
                                )
                            })}
                    </ul>
                ) : (
                    <p className={styles.me__emptyState}>No attendance records yet.</p>
                )}
            </section>

            {hasRegistrations ? (
                <section className={styles.me__summary}>
                    <h3 className={styles.me__title}>Recent registered events</h3>
                    <div className={styles.me__summaryGrid}>
                        {registeredEvents.map((reg) => (
                            <div key={reg.id} className={styles.me__summaryItem}>
                                <p className={styles.me__summaryLabel}>{reg.clubName}</p>
                                <p className={styles.me__summaryValue}>{reg.eventTitle}</p>
                            </div>
                        ))}
                    </div>
                </section>
            ) : null}

            <section className={styles.me__events}>
                <h3 className={styles.me__title}>What you can do</h3>
                <ul className={styles.me__eventList}>
                    <li className={styles.me__eventItem}>Register for club events as a student.</li>
                    <li className={styles.me__eventItem}>Track attendance records after check-in.</li>
                    <li className={styles.me__eventItem}>Use your role-based dashboard if you manage a club or oversee approvals.</li>
                </ul>
                <Button variant="primary" onClick={onSignOut}>
                    Sign out
                </Button>
                <Button variant="ghost" onClick={onBackHome}>Back to home</Button>
            </section>
        </main>
    )
}

export default Me
