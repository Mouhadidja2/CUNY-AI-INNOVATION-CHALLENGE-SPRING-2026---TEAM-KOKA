import { useEffect, useMemo, useState } from 'react'
import ClubSelector from '../components/Dashboard/ClubSelector'
import MetricPill from '../components/Dashboard/MetricPill'
import DashboardPanel from '../components/Dashboard/DashboardPanel'
import Button from '../components/Button/Button'
import Modal from '../components/Modal/Modal'
import { demoMode } from '../App'
import styles from './dashboard.module.scss'

// Demo data for BMCC Programming Club
const demoRecentEvents = [
    { id: 'demo-1', title: 'Arduino Workshop', date: '2026-04-15', displayDate: 'April 15, 2026 · Wednesday', attended: 23 },
    { id: 'demo-2', title: 'Data Science Workshop', date: '2026-04-22', displayDate: 'April 22, 2026 · Wednesday', attended: 31 },
    { id: 'demo-3', title: 'Big Tech Day', date: '2026-04-29', displayDate: 'April 29, 2026 · Wednesday', attended: 42 },
    { id: 'demo-4', title: 'Resume Review Workshop', date: '2026-05-06', displayDate: 'May 6, 2026 · Wednesday', attended: 19 },
    { id: 'demo-5', title: 'Finals Relaxation', date: '2026-05-13', displayDate: 'May 13, 2026 · Wednesday', attended: 37 },
]

// TBD events with random votes for demo
const generateDemoVotes = () => Math.floor(Math.random() * 50) + 1
const demoTbdEvents = [
    { id: 'tbd-1', title: 'Game Design Workshop', votes: generateDemoVotes() },
    { id: 'tbd-2', title: 'Cloud Computing Workshop', votes: generateDemoVotes() },
    { id: 'tbd-3', title: 'Mini-hackathon event', votes: generateDemoVotes() },
]

// Demo food orders
const demoFoodOrders = [
    { id: 'food-1', items: 'Pizza (8), Soda (12), Cookies (24)', event: 'Arduino Workshop', date: 'Apr 15' },
    { id: 'food-2', items: 'Sandwiches (15), Chips (15), Water (20)', event: 'Data Science Workshop', date: 'Apr 22' },
    { id: 'food-3', items: 'Burritos (20), Guac & Chips (10), Soda (25)', event: 'Big Tech Day', date: 'Apr 29' },
]

// Demo budget proposals
const demoBudgetProposals = [
    { id: 'prop-2', title: 'Proposal #02 — 3/21/26', status: 'approved' },
    { id: 'prop-1', title: 'Proposal #01 — 2/23/26', status: 'denied' },
]

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function getMonthDaySuffix() {
    const now = new Date()
    const month = now.toLocaleString('en-US', { month: 'short' }).toLowerCase()
    const day = now.getDate()
    return `${month}${day}`
}

const dashboardActions = ['Budget proposals', 'Club events', 'Food orders', 'Ordering supplies', 'Reserve a room', 'Outside event forms']

function Dashboard({ user, data, clubs = [] }) {
    const clubNames = useMemo(() => Object.keys(data), [data])
    const fallbackClub = clubNames[0] || ''
    const isClubScopedRole = user?.role === 'club officer' || user?.role === 'club advisor'
    const forcedClub = isClubScopedRole ? user?.assignedClub || fallbackClub : null

    // All hooks must be before any early return
    const [selectedClub, setSelectedClub] = useState(forcedClub || fallbackClub)
    const [activeAction, setActiveAction] = useState('Food orders')
    const [foodOrderStatus, setFoodOrderStatus] = useState('')
    const [foodOrders, setFoodOrders] = useState([])
    const [showFoodOrderTypeModal, setShowFoodOrderTypeModal] = useState(false)
    const [selectedFoodOrderType, setSelectedFoodOrderType] = useState(null)
    const [showMbjForm, setShowMbjForm] = useState(false)
    const [showOutOfNetworkForm, setShowOutOfNetworkForm] = useState(false)
    const [showBudgetForm, setShowBudgetForm] = useState(false)
    const [budgetProposalStatus, setBudgetProposalStatus] = useState('')
    const [budgetProposals, setBudgetProposals] = useState([])

    // Sync selected club when forced club changes
    const targetClub = forcedClub || fallbackClub
    if (selectedClub !== targetClub) {
        setSelectedClub(targetClub)
    }

    useEffect(() => {
        const savedQueue = JSON.parse(window.localStorage.getItem('food-order-queue') || '[]')
        const filtered = savedQueue.filter((entry) => entry.clubName === selectedClub)
        setFoodOrders(filtered)
    }, [selectedClub])

    // Load budget proposals from localStorage
    useEffect(() => {
        const savedProposals = JSON.parse(window.localStorage.getItem('budget-proposal-queue') || '[]')
        const filtered = savedProposals.filter((entry) => entry.clubName === selectedClub)
        setBudgetProposals(filtered)
    }, [selectedClub])

    // Early return after all hooks
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

    const clubInfo = clubs.find(c => c.name === selectedClub) || {}
    const clubData = data[selectedClub] || {
        attendance: [],
        budgetProposals: [],
        recentEvents: [],
        recentFoodOrders: [],
    }
    // Get recent held events (events with dates in the past)
    const now = new Date()
    const recentHeldEvents = (clubInfo.publicEvents || []).filter(event => {
        if (event.fixedDate) {
            const eventDate = new Date(event.fixedDate)
            return eventDate < now
        }
        return false
    }).slice(0, 5) // Show last 5 events

    const selectedClubSlug = slugify(selectedClub || 'club')
    const folderPath = `src/data/by-clubs/${selectedClubSlug}/food-orders/`
    const budgetFolderPath = `src/data/by-clubs/${selectedClubSlug}/budget-proposals/`

    const handleFoodOrderTypeSelect = (type) => {
        setSelectedFoodOrderType(type)
        setShowFoodOrderTypeModal(false)
        if (type === 'mbj') {
            setShowMbjForm(true)
            setShowOutOfNetworkForm(false)
        } else {
            setShowMbjForm(false)
            setShowOutOfNetworkForm(true)
        }
    }

    const handleMbjOrderSubmit = (event) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const eventDate = (formData.get('eventDate') || '').toString().trim()
        const eventPlace = (formData.get('eventPlace') || '').toString().trim()
        const payload = {
            orderType: 'MBJ Order',
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

        // New naming: apr25_mbj-order_chess-club.json
        const dateSuffix = getMonthDaySuffix()
        const fileName = `${dateSuffix}_mbj-order_${selectedClubSlug}.json`
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

        setFoodOrderStatus(`MBJ Order created as ${fileName}. Save it to ${folderPath}`)
        setShowMbjForm(false)
        event.currentTarget.reset()
    }

    const handleOutOfNetworkSubmit = (event) => {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const eventDate = (formData.get('eventDate') || '').toString().trim()
        const eventPlace = (formData.get('eventPlace') || '').toString().trim()

        // Get file inputs for menu pictures
        const menuPicturesInput = event.currentTarget.querySelector('input[name="menuPictures"]')
        const menuPictures = menuPicturesInput?.files ? Array.from(menuPicturesInput.files).map(f => f.name) : []

        const payload = {
            orderType: 'Out-of-Network Order',
            eventDate,
            amountOfPeople: (formData.get('amountOfPeople') || '').toString().trim(),
            setupTime: (formData.get('setupTime') || '').toString().trim(),
            eventPlace,
            requesterName: (formData.get('requesterName') || '').toString().trim(),
            phoneNumber: (formData.get('phoneNumber') || '').toString().trim(),
            vendorName: (formData.get('vendorName') || '').toString().trim(),
            quote1: (formData.get('quote1') || '').toString().trim(),
            quote2: (formData.get('quote2') || '').toString().trim(),
            quote3: (formData.get('quote3') || '').toString().trim(),
            menuPictures,
            orderDetails: (formData.get('orderDetails') || '').toString().trim(),
            estimatedTotal: (formData.get('estimatedTotal') || '').toString().trim(),
            clubName: (formData.get('clubName') || '').toString().trim(),
            submittedAt: new Date().toISOString(),
            status: 'Pending Approval',
        }

        // New naming: apr25_out-of-network_chess-club.json
        const dateSuffix = getMonthDaySuffix()
        const fileName = `${dateSuffix}_out-of-network_${selectedClubSlug}.json`
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

        setFoodOrderStatus(`Out-of-Network Order submitted as ${fileName}. Subject to approval. Save it to ${folderPath}`)
        setShowOutOfNetworkForm(false)
        event.currentTarget.reset()
    }

    return (
        <main className={styles.dashboard}>
            {/* Club Banner Header */}
            {clubInfo.banner && (
                <div className={styles.dashboard__clubBanner}>
                    <img src={clubInfo.banner} alt={`${selectedClub} banner`} className={styles.dashboard__bannerImage} />
                </div>
            )}

            <div className={styles.dashboard__header}>
                <div>
                    <p className={styles.dashboard__eyebrow}>Dashboard</p>
                    <h2 className={styles.dashboard__clubName}>{selectedClub}</h2>
                    <p className={styles.dashboard__description}>
                        {user.role === 'sga officer'
                            ? 'SGA officers can review every club in the directory.'
                            : `Viewing as ${user.role}${clubInfo.category ? ` • ${clubInfo.category}` : ''}`}
                    </p>
                </div>

                <ClubSelector
                    clubs={clubNames}
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
                {demoMode ? (
                    <>
                        <div className={styles.dashboard__demoPanel}>
                            <h3 className={styles.dashboard__panelTitle}>Budget proposals</h3>
                            <ul className={styles.dashboard__demoList}>
                                {demoBudgetProposals.map((prop) => (
                                    <li key={prop.id} className={styles.dashboard__demoItem}>
                                        <span>{prop.title}</span>
                                        <span className={prop.status === 'approved' ? styles.dashboard__statusApproved : styles.dashboard__statusDenied}>
                                            {prop.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className={styles.dashboard__demoPanel}>
                            <h3 className={styles.dashboard__panelTitle}>Recent events</h3>
                            <ul className={styles.dashboard__demoList}>
                                {demoRecentEvents.map((event) => (
                                    <li key={event.id} className={styles.dashboard__demoItem}>
                                        <span>{event.title}</span>
                                        <span className={styles.dashboard__demoMeta}>{event.displayDate}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className={styles.dashboard__demoPanel}>
                            <h3 className={styles.dashboard__panelTitle}>Recent food orders</h3>
                            <ul className={styles.dashboard__demoList}>
                                {demoFoodOrders.map((order) => (
                                    <li key={order.id} className={styles.dashboard__demoItem}>
                                        <div>
                                            <span className={styles.dashboard__demoOrderEvent}>{order.event}</span>
                                            <span className={styles.dashboard__demoOrderItems}>{order.items}</span>
                                        </div>
                                        <span className={styles.dashboard__demoMeta}>{order.date}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                ) : (
                    <>
                        <DashboardPanel title="Budget proposals" items={clubData.budgetProposals} />
                        <DashboardPanel title="Recent events" items={clubData.recentEvents} />
                        <DashboardPanel title="Recent food orders" items={clubData.recentFoodOrders} />
                    </>
                )}
            </section>

            <section className={styles.dashboard__actionsSection}>
                <div className={styles.dashboard__actions}>
                    {dashboardActions.map((action) => (
                        <Button key={action} variant={activeAction === action ? 'primary' : 'ghost'} onClick={() => setActiveAction(action)}>
                            {action}
                        </Button>
                    ))}
                </div>

                {activeAction === 'Club events' ? (
                    <section className={styles.dashboard__panel}>
                        <h3 className={styles.dashboard__panelTitle}>Club Events Feed</h3>
                        <p className={styles.dashboard__description}>Recent and upcoming events for {selectedClub}</p>

                        <div className={styles.dashboard__eventsFeed}>
                            {recentHeldEvents.length > 0 ? (
                                <div className={styles.dashboard__eventSection}>
                                    <h4 className={styles.dashboard__eyebrow}>Recently Held Events</h4>
                                    <div className={styles.dashboard__eventCards}>
                                        {recentHeldEvents.map((event) => (
                                            <div key={event.id} className={styles.dashboard__eventCard}>
                                                <h5 className={styles.dashboard__eventTitle}>{event.title}</h5>
                                                <p className={styles.dashboard__eventTime}>{event.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {(clubInfo.publicEvents || []).length > 0 ? (
                                <div className={styles.dashboard__eventSection}>
                                    <h4 className={styles.dashboard__eyebrow}>All Events</h4>
                                    <ul className={styles.dashboard__eventList}>
                                        {(clubInfo.publicEvents || []).map((event) => (
                                            <li key={event.id} className={styles.dashboard__eventItem}>
                                                <span className={styles.dashboard__eventName}>{event.title}</span>
                                                <span className={styles.dashboard__eventTime}>{event.time}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className={styles.dashboard__emptyState}>No events have been posted yet.</p>
                            )}

                            {demoMode && (
                                <div className={styles.dashboard__eventSection}>
                                    <h4 className={styles.dashboard__eyebrow}>Upcoming Events (TBD) — Vote Now!</h4>
                                    <p className={styles.dashboard__description}>Students can vote on which events they&apos;d like to see next</p>
                                    <div className={styles.dashboard__tbdEvents}>
                                        {demoTbdEvents.map((event) => (
                                            <div key={event.id} className={styles.dashboard__tbdEventCard}>
                                                <span className={styles.dashboard__tbdEventTitle}>{event.title}</span>
                                                <div className={styles.dashboard__voteBar}>
                                                    <div
                                                        className={styles.dashboard__voteFill}
                                                        style={{ width: `${(event.votes / 50) * 100}%` }}
                                                    />
                                                </div>
                                                <span className={styles.dashboard__voteCount}>{event.votes} votes</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                ) : activeAction === 'Food orders' ? (
                    <section className={styles.dashboard__foodOrderPanel}>
                        <h3 className={styles.dashboard__title}>Food Orders</h3>
                        <p className={styles.dashboard__description}>Orders are stored for {selectedClub} and should live in {folderPath}</p>

                        <Button variant="primary" onClick={() => setShowFoodOrderTypeModal(true)}>
                            New Food Order
                        </Button>

                        {foodOrderStatus ? <p className={styles.dashboard__description}>{foodOrderStatus}</p> : null}

                        <div className={styles.dashboard__orderList}>
                            <h4 className={styles.dashboard__eyebrow}>Existing food orders</h4>
                            {foodOrders.length ? (
                                <ul className={styles.dashboard__orderItems}>
                                    {foodOrders.map((order) => (
                                        <li key={`${order.fileName}-${order.payload.submittedAt}`}>
                                            {order.fileName} — {order.payload.orderType || 'Legacy Order'}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.dashboard__description}>No food orders queued yet.</p>
                            )}
                        </div>
                    </section>
                ) : activeAction === 'Budget proposals' ? (
                    <section className={styles.dashboard__foodOrderPanel}>
                        <h3 className={styles.dashboard__title}>Budget Proposals</h3>
                        <p className={styles.dashboard__description}>Submit and manage budget proposals for {selectedClub}</p>

                        {(user?.role === 'club officer' || user?.role === 'club advisor') && (
                            <Button variant="primary" onClick={() => setShowBudgetForm(true)}>
                                New Budget Proposal
                            </Button>
                        )}

                        {budgetProposalStatus ? <p className={styles.dashboard__description}>{budgetProposalStatus}</p> : null}

                        <div className={styles.dashboard__orderList}>
                            <h4 className={styles.dashboard__eyebrow}>Existing budget proposals</h4>
                            {budgetProposals.length ? (
                                <ul className={styles.dashboard__orderItems}>
                                    {budgetProposals.map((proposal) => (
                                        <li key={`${proposal.fileName}-${proposal.payload.submittedAt}`}>
                                            {proposal.fileName} — Total: ${proposal.payload.totalAmount?.toFixed(2) || '0.00'}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.dashboard__description}>No budget proposals submitted yet.</p>
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

            {/* Food Order Type Selector Modal */}
            <Modal
                isOpen={showFoodOrderTypeModal}
                title="Select Food Order Type"
                onClose={() => setShowFoodOrderTypeModal(false)}
            >
                <div className={styles.dashboard__foodOrderTypeSelector}>
                    <p className={styles.dashboard__description}>Choose the type of food order you want to submit:</p>
                    <div className={styles.dashboard__foodOrderTypeButtons}>
                        <button
                            type="button"
                            className={styles.dashboard__foodOrderTypeOption}
                            onClick={() => handleFoodOrderTypeSelect('mbj')}
                        >
                            <h4 className={styles.dashboard__foodOrderTypeTitle}>MBJ Order</h4>
                            <p className={styles.dashboard__foodOrderTypeDescription}>Order from MBJ campus catering services</p>
                        </button>
                        <button
                            type="button"
                            className={styles.dashboard__foodOrderTypeOption}
                            onClick={() => handleFoodOrderTypeSelect('out-of-network')}
                        >
                            <h4 className={styles.dashboard__foodOrderTypeTitle}>Out-of-Network Order</h4>
                            <p className={styles.dashboard__foodOrderTypeDescription}>Order from external vendors (requires 3 quotes & menu pictures)</p>
                        </button>
                    </div>
                </div>
            </Modal>

            {/* MBJ Order Form Modal */}
            <Modal
                isOpen={showMbjForm}
                title="MBJ Food Order"
                onClose={() => setShowMbjForm(false)}
            >
                <form className={styles.dashboard__foodOrderForm} onSubmit={handleMbjOrderSubmit}>
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

                    <div className={styles.dashboard__formActions}>
                        <Button type="submit" variant="primary">Submit MBJ Order</Button>
                        <Button type="button" variant="ghost" onClick={() => setShowMbjForm(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>

            {/* Out-of-Network Order Form Modal */}
            <Modal
                isOpen={showOutOfNetworkForm}
                title="Out-of-Network Food Order"
                onClose={() => setShowOutOfNetworkForm(false)}
            >
                <div className={styles.dashboard__approvalNotice}>
                    <strong>Subject to Approval:</strong> This order requires three quotes and menu pictures for approval.
                </div>
                <form className={styles.dashboard__foodOrderForm} onSubmit={handleOutOfNetworkSubmit}>
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
                        <span>Vendor name</span>
                        <input className={styles.dashboard__input} name="vendorName" type="text" required />
                    </label>
                    <label className={styles.dashboard__field}>
                        <span>Quote 1</span>
                        <input className={styles.dashboard__input} name="quote1" type="text" placeholder="Description and price" required />
                    </label>
                    <label className={styles.dashboard__field}>
                        <span>Quote 2</span>
                        <input className={styles.dashboard__input} name="quote2" type="text" placeholder="Description and price" required />
                    </label>
                    <label className={styles.dashboard__field}>
                        <span>Quote 3</span>
                        <input className={styles.dashboard__input} name="quote3" type="text" placeholder="Description and price" required />
                    </label>
                    <label className={styles.dashboard__field}>
                        <span>Menu pictures (attach menu images)</span>
                        <input className={styles.dashboard__input} name="menuPictures" type="file" accept="image/*" multiple required />
                    </label>
                    <label className={styles.dashboard__field}>
                        <span>Order details</span>
                        <textarea className={styles.dashboard__textarea} name="orderDetails" rows="4" required />
                    </label>
                    <label className={styles.dashboard__field}>
                        <span>Estimated total</span>
                        <input className={styles.dashboard__input} name="estimatedTotal" type="text" required />
                    </label>
                    <label className={styles.dashboard__field}>
                        <span>Club name</span>
                        <input className={styles.dashboard__input} name="clubName" type="text" defaultValue={selectedClub} required />
                    </label>

                    <div className={styles.dashboard__formActions}>
                        <Button type="submit" variant="primary">Submit for Approval</Button>
                        <Button type="button" variant="ghost" onClick={() => setShowOutOfNetworkForm(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>
        </main>
    )
}

export default Dashboard
