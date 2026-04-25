import { useEffect, useMemo, useState } from 'react'
import ClubSelector from '../components/Dashboard/ClubSelector'
import MetricPill from '../components/Dashboard/MetricPill'
import DashboardPanel from '../components/Dashboard/DashboardPanel'
import Button from '../components/Button/Button'
import styles from './dashboard.module.scss'

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

const dashboardActions = ['Budget proposals', 'Club events', 'Food orders', 'Ordering supplies', 'Reserve a room', 'Outside event forms']

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
    const [activeAction, setActiveAction] = useState('Food orders')
    const [foodOrderStatus, setFoodOrderStatus] = useState('')
    const [foodOrders, setFoodOrders] = useState([])

    useEffect(() => {
        setSelectedClub(forcedClub || fallbackClub)
    }, [forcedClub, fallbackClub])

    useEffect(() => {
        const savedQueue = JSON.parse(window.localStorage.getItem('food-order-queue') || '[]')
        const filtered = savedQueue.filter((entry) => entry.clubName === selectedClub)
        setFoodOrders(filtered)
    }, [selectedClub])

    const clubData = data[selectedClub] || {
        attendance: [],
        budgetProposals: [],
        recentEvents: [],
        recentFoodOrders: [],
    }

    const selectedClubSlug = slugify(selectedClub || 'club')
    const folderPath = `frontend/src/data/by-clubs/${selectedClubSlug}/food-orders/`

    const handleFoodOrderSubmit = (event) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const eventDate = (formData.get('eventDate') || '').toString().trim()
        const eventPlace = (formData.get('eventPlace') || '').toString().trim()
        const payload = {
            eventDate,
            amountOfPeople: (formData.get('amountOfPeople') || '').toString().trim(),
            setupTime: (formData.get('setupTime') || '').toString().trim(),
            eventPlace,
            requesterName: (formData.get('requesterName') || '').toString().trim(),
            phoneNumber: (formData.get('phoneNumber') || '').toString().trim(),
            orderDetails: (formData.get('orderDetails') || '').toString().trim(),
            total: (formData.get('total') || '').toString().trim(),
            clubName: (formData.get('clubName') || '').toString().trim(),
            submittedAt: new Date().toISOString(),
        }

        const fileName = `${slugify(eventDate)}__${slugify(eventPlace)}__food-order.json`
        const jsonString = JSON.stringify(payload, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const blobUrl = URL.createObjectURL(blob)
        const downloadLink = document.createElement('a')
        downloadLink.href = blobUrl
        downloadLink.download = fileName
        downloadLink.click()
        URL.revokeObjectURL(blobUrl)

        const queuedItem = { fileName, folderPath, clubName: selectedClub, payload }
        const existingQueue = JSON.parse(window.localStorage.getItem('food-order-queue') || '[]')
        const nextQueue = [...existingQueue, queuedItem]
        window.localStorage.setItem('food-order-queue', JSON.stringify(nextQueue))
        setFoodOrders(nextQueue.filter((entry) => entry.clubName === selectedClub))

        setFoodOrderStatus(`Food order JSON created as ${fileName}. Save it to ${folderPath}`)
        event.currentTarget.reset()
    }

    return (
        <main className={styles.dashboard}>
            <div className={styles.dashboard__header}>
                <div>
                    <p className={styles.dashboard__eyebrow}>Dashboard</p>
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

            <section className={styles.dashboard__actionsSection}>
                <div className={styles.dashboard__actions}>
                    {dashboardActions.map((action) => (
                        <Button key={action} variant={activeAction === action ? 'primary' : 'ghost'} onClick={() => setActiveAction(action)}>
                            {action}
                        </Button>
                    ))}
                </div>

                {activeAction === 'Food orders' ? (
                    <section className={styles.dashboard__foodOrderPanel}>
                        <h3 className={styles.dashboard__title}>Food order form</h3>
                        <p className={styles.dashboard__description}>Orders are stored for {selectedClub} and should live in {folderPath}</p>

                        <form className={styles.dashboard__foodOrderForm} onSubmit={handleFoodOrderSubmit}>
                            <label className={styles.dashboard__field}>
                                <span>Event date</span>
                                <input className={styles.dashboard__input} name="eventDate" type="date" required />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Amount of people</span>
                                <input className={styles.dashboard__input} name="amountOfPeople" type="number" min="1" required />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Set up time</span>
                                <input className={styles.dashboard__input} name="setupTime" type="time" required />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Event place / room number</span>
                                <input className={styles.dashboard__input} name="eventPlace" type="text" required />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Your name</span>
                                <input className={styles.dashboard__input} name="requesterName" type="text" required />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Phone number</span>
                                <input className={styles.dashboard__input} name="phoneNumber" type="tel" required />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Place your order below</span>
                                <textarea className={styles.dashboard__textarea} name="orderDetails" rows="4" required />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Total</span>
                                <input className={styles.dashboard__input} name="total" type="text" required />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Club name</span>
                                <input className={styles.dashboard__input} name="clubName" type="text" defaultValue={selectedClub} required />
                            </label>

                            <Button type="submit" variant="primary">
                                Submit food order
                            </Button>
                        </form>

                        {foodOrderStatus ? <p className={styles.dashboard__description}>{foodOrderStatus}</p> : null}

                        <div className={styles.dashboard__orderList}>
                            <h4 className={styles.dashboard__eyebrow}>Existing food orders</h4>
                            {foodOrders.length ? (
                                <ul className={styles.dashboard__orderItems}>
                                    {foodOrders.map((order) => (
                                        <li key={`${order.fileName}-${order.payload.submittedAt}`}>{order.fileName}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.dashboard__description}>No food orders queued yet.</p>
                            )}
                        </div>
                    </section>
                ) : (
                    <section className={styles.dashboard__foodOrderPanel}>
                        <h3 className={styles.dashboard__title}>{activeAction}</h3>
                        <p className={styles.dashboard__description}>This section is prepared and will be implemented next.</p>
                    </section>
                )}
            </section>
        </main>
    )
}

export default Dashboard
