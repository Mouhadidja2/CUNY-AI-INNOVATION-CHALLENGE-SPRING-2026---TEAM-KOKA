import { useEffect, useMemo, useState } from 'react'
import ClubSelector from '../components/Dashboard/ClubSelector'
import MetricPill from '../components/Dashboard/MetricPill'
import DashboardPanel from '../components/Dashboard/DashboardPanel'
import Button from '../components/Button/Button'
import styles from './dashboard.module.scss'

function Dashboard({ user, data }) {
    const clubs = useMemo(() => Object.keys(data), [data])
    const fallbackClub = clubs[0] || ''
    const isClubScopedRole = user?.role === 'club officer' || user?.role === 'club advisor'
    const forcedClub = isClubScopedRole ? user?.assignedClub || fallbackClub : null

    if (!user || !['club officer', 'club advisor', 'sga officer'].includes(user.role)) {
        return (
            <main className={styles.dashboard}>
                <section className={styles.dashboard__emptyState}>
                    <p className={styles.dashboard__eyebrow}>Access restricted</p>
                    <h2 className={styles.dashboard__title}>This management center is not available to your role.</h2>
                    <p className={styles.dashboard__description}>Sign in as a club officer, club advisor, or SGA officer to view operations data.</p>
                    <Button variant="primary">Sign in</Button>
                </section>
            </main>
        )
    }

    const [selectedClub, setSelectedClub] = useState(forcedClub || fallbackClub)

    useEffect(() => {
        setSelectedClub(forcedClub || fallbackClub)
    }, [forcedClub, fallbackClub])

    const clubData = data[selectedClub] || {
        attendance: [],
        budgetProposals: [],
        recentEvents: [],
        recentFoodOrders: [],
    }

    return (
        <main className={styles.dashboard}>
            <div className={styles.dashboard__header}>
                <div>
                    <p className={styles.dashboard__eyebrow}>Role-restricted dashboard</p>
                    <h2 className={styles.dashboard__title}>Club operations overview</h2>
                    <p className={styles.dashboard__description}>
                        {user.role === 'sga officer'
                            ? 'SGA officers can review every club in the directory.'
                            : `Viewing ${forcedClub || selectedClub} as a ${user.role}.`}
                    </p>
                </div>

                <ClubSelector
                    clubs={clubs}
                    selectedClub={selectedClub}
                    onChange={setSelectedClub}
                    disabled={Boolean(forcedClub)}
                />
            </div>

            <section className={styles.dashboard__metrics} aria-label="Student attendance data">
                {clubData.attendance.map((metric) => (
                    <MetricPill key={metric.label} label={metric.label} value={metric.value} />
                ))}
            </section>

            <section className={styles.dashboard__grid}>
                <DashboardPanel title="Budget proposals" items={clubData.budgetProposals} />
                <DashboardPanel title="Recent events" items={clubData.recentEvents} />
                <DashboardPanel title="Recent food orders" items={clubData.recentFoodOrders} />
            </section>
        </main>
    )
}

export default Dashboard
