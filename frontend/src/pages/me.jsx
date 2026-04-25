import Button from '../components/Button/Button'
import styles from './me.module.scss'

function Me({ currentUser, registeredEvents, onOpenAuth, onBackHome }) {
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

    return (
        <main className={styles.me}>
            <section className={styles.me__card}>
                <p className={styles.me__eyebrow}>Personal area</p>
                <h2 className={styles.me__title}>{currentUser.name}</h2>
                <p className={styles.me__meta}>Role: {currentUser.role}</p>
                {currentUser.assignedClub ? <p className={styles.me__meta}>Assigned club: {currentUser.assignedClub}</p> : null}
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
                <Button variant="ghost" onClick={onBackHome}>
                    Back to home
                </Button>
            </section>
        </main>
    )
}

export default Me
