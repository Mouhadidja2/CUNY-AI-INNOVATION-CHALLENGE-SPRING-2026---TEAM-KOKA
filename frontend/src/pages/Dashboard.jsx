import { useEffect, useMemo, useState } from 'react'
import ClubSelector from '../components/Dashboard/ClubSelector'
import MetricPill from '../components/Dashboard/MetricPill'
import DashboardPanel from '../components/Dashboard/DashboardPanel'
import Button from '../components/Button/Button'
import Modal from '../components/Modal/Modal'
import styles from './dashboard.module.scss'
import RoomReservation from '../components/RoomReservation/RoomReservation.jsx'
import EventScheduler from '../components/EventScheduler/EventScheduler.jsx'
import {
    fetchFoodOrdersByClub,
    createFoodOrder,
    fetchBudgetProposalsByClub,
    createBudgetProposal,
    fetchEventsByClub,
} from '../services/api'

const dashboardActions = ['Budget proposals', 'Club events', 'Food orders', 'Ordering supplies', 'Reserve a room', 'Outside event forms']

function Dashboard({ user, clubs = [], backendClubs = [] }) {
    const clubNames = useMemo(() => clubs.map((c) => c.name), [clubs])
    const fallbackClub = clubNames[0] || ''
    const isClubScopedRole = user?.role === 'club officer' || user?.role === 'club advisor'
    const forcedClub = isClubScopedRole ? user?.assignedClub || fallbackClub : null

    // All hooks must be before any early return
    const [selectedClub, setSelectedClub] = useState(forcedClub || fallbackClub)
    const [activeAction, setActiveAction] = useState('Food orders')
    const [foodOrderStatus, setFoodOrderStatus] = useState('')
    const [foodOrders, setFoodOrders] = useState([])
    const [showFoodOrderTypeModal, setShowFoodOrderTypeModal] = useState(false)
    const [showMbjForm, setShowMbjForm] = useState(false)
    const [showOutOfNetworkForm, setShowOutOfNetworkForm] = useState(false)
    const [showBudgetForm, setShowBudgetForm] = useState(false)
    const [budgetProposalStatus, setBudgetProposalStatus] = useState('')
    const [budgetProposals, setBudgetProposals] = useState([])
    const [selectedProposal, setSelectedProposal] = useState(null)
    const [reviewComment, setReviewComment] = useState('')
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [showDissolveConfirm, setShowDissolveConfirm] = useState(false)
    const [dissolvedClubs, setDissolvedClubs] = useState(new Set())

    // Room reservation state
    const [showRoomReservation, setShowRoomReservation] = useState(false)
    const [selectedRoom, setSelectedRoom] = useState(null)

    // Event scheduler state
    const [showEventScheduler, setShowEventScheduler] = useState(false)
    const [clubEvents, setClubEvents] = useState([])

    // Resolve the backend club ID for the currently selected club name
    const backendClubId = useMemo(() => {
        const match = backendClubs.find(
            (bc) => bc.name.toLowerCase() === (selectedClub || '').toLowerCase()
        )
        return match ? match.id : null
    }, [backendClubs, selectedClub])

    // Sync selected club when forced club changes
    const targetClub = forcedClub || fallbackClub
    if (selectedClub !== targetClub) {
        setSelectedClub(targetClub)
    }

    // Fetch food orders from the API when selected club changes
    useEffect(() => {
        if (!backendClubId) return
        let cancelled = false
        fetchFoodOrdersByClub(backendClubId)
            .then((data) => { if (!cancelled) setFoodOrders(data) })
            .catch(() => { if (!cancelled) setFoodOrders([]) })
        return () => { cancelled = true }
    }, [backendClubId])

    // Fetch budget proposals from the API
    useEffect(() => {
        if (!backendClubId) return
        let cancelled = false
        fetchBudgetProposalsByClub(backendClubId)
            .then((data) => { if (!cancelled) setBudgetProposals(data) })
            .catch(() => { if (!cancelled) setBudgetProposals([]) })
        return () => { cancelled = true }
    }, [backendClubId])

    // Fetch events from the API
    useEffect(() => {
        if (!backendClubId) return
        let cancelled = false
        fetchEventsByClub(backendClubId)
            .then((data) => { if (!cancelled) setClubEvents(data) })
            .catch(() => { if (!cancelled) setClubEvents([]) })
        return () => { cancelled = true }
    }, [backendClubId])

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

    // Build summary metrics from API data
    const attendanceMetrics = [
        { label: 'Food Orders', value: String(foodOrders.length) },
        { label: 'Budget Proposals', value: String(budgetProposals.length) },
        { label: 'Club Events', value: String(clubEvents.length) },
    ]
    // Get recent held events (events with dates in the past)
    const now = new Date()
    const recentHeldEvents = (clubInfo.publicEvents || []).filter(event => {
        if (event.fixedDate) {
            const eventDate = new Date(event.fixedDate)
            return eventDate < now
        }
        return false
    }).slice(0, 5) // Show last 5 events

    const handleFoodOrderTypeSelect = (type) => {
        setShowFoodOrderTypeModal(false)
        if (type === 'mbj') {
            setShowMbjForm(true)
            setShowOutOfNetworkForm(false)
        } else {
            setShowMbjForm(false)
            setShowOutOfNetworkForm(true)
        }
    }

    const handleMbjOrderSubmit = async (event) => {
        event.preventDefault()
        if (!backendClubId) { setFoodOrderStatus('No matching backend club found. Please ensure the club exists in the database.'); return }

        const formData = new FormData(event.currentTarget)
        const apiPayload = {
            club: backendClubId,
            order_type: 'MBJ',
            status: 'PENDING',
            contact_name: (formData.get('requesterName') || '').toString().trim(),
            contact_phone: (formData.get('phoneNumber') || '').toString().trim(),
            event_date: (formData.get('eventDate') || '').toString().trim() || null,
            setup_time: (formData.get('setupTime') || '').toString().trim() || null,
            location: (formData.get('eventPlace') || '').toString().trim(),
            headcount: parseInt(formData.get('amountOfPeople') || '0', 10),
            food_items: (formData.get('orderDetails') || '').toString().trim(),
            total_cost: (formData.get('total') || '').toString().trim(),
        }

        try {
            await createFoodOrder(apiPayload)
            const updated = await fetchFoodOrdersByClub(backendClubId)
            setFoodOrders(updated)
            setFoodOrderStatus('MBJ Order submitted successfully!')
        } catch (err) {
            setFoodOrderStatus(`Error submitting order: ${err.message}`)
        }
        setShowMbjForm(false)
        event.currentTarget.reset()
    }

    const handleOutOfNetworkSubmit = async (event) => {
        event.preventDefault()
        if (!backendClubId) { setFoodOrderStatus('No matching backend club found.'); return }

        const formData = new FormData(event.currentTarget)
        const apiPayload = {
            club: backendClubId,
            order_type: 'OON',
            status: 'PENDING',
            contact_name: (formData.get('requesterName') || '').toString().trim(),
            contact_phone: (formData.get('phoneNumber') || '').toString().trim(),
            event_date: (formData.get('eventDate') || '').toString().trim() || null,
            setup_time: (formData.get('setupTime') || '').toString().trim() || null,
            location: (formData.get('eventPlace') || '').toString().trim(),
            headcount: parseInt(formData.get('amountOfPeople') || '0', 10),
            food_items: (formData.get('orderDetails') || '').toString().trim(),
            total_cost: (formData.get('estimatedTotal') || '').toString().trim(),
        }

        try {
            await createFoodOrder(apiPayload)
            const updated = await fetchFoodOrdersByClub(backendClubId)
            setFoodOrders(updated)
            setFoodOrderStatus('Out-of-Network Order submitted for approval!')
        } catch (err) {
            setFoodOrderStatus(`Error submitting order: ${err.message}`)
        }
        setShowOutOfNetworkForm(false)
        event.currentTarget.reset()
    }

    const canDissolve = user?.role === 'club advisor' || user?.role === 'sga officer'
    const isClubDissolved = dissolvedClubs.has(selectedClub)

    const handleDissolveClub = () => {
        setDissolvedClubs((prev) => new Set([...prev, selectedClub]))
        setShowDissolveConfirm(false)
        setFoodOrderStatus(`Club "${selectedClub}" has been dissolved.`)
    }

    const handleBudgetReview = async (newStatus) => {
        if (!selectedProposal) return
        try {
            const res = await fetch(`http://localhost:8000/api/budgets/${selectedProposal.id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, reviewer_comment: reviewComment }),
            })
            if (!res.ok) throw new Error('Failed to update proposal')
            const updated = await fetchBudgetProposalsByClub(backendClubId)
            setBudgetProposals(updated)
            setBudgetProposalStatus(`Proposal ${newStatus.toLowerCase()} successfully.`)
        } catch (err) {
            setBudgetProposalStatus(`Error: ${err.message}`)
        }
        setShowReviewModal(false)
        setSelectedProposal(null)
    }

    const handleBudgetProposalSubmit = async (event) => {
        event.preventDefault()
        if (!backendClubId) { setBudgetProposalStatus('No matching backend club found.'); return }

        const formData = new FormData(event.currentTarget)

        // Collect activities (up to 10)
        const activities = []
        for (let i = 1; i <= 10; i++) {
            const eventName = formData.get(`eventName${i}`)
            if (!eventName) continue

            const activityBudgetRows = []
            let rowIndex = 1
            while (formData.get(`activity${i}Category${rowIndex}`)) {
                const category = formData.get(`activity${i}Category${rowIndex}`)
                const amount = formData.get(`activity${i}Amount${rowIndex}`)
                if (category && amount) {
                    activityBudgetRows.push({ category, amount: parseFloat(amount) || 0 })
                }
                rowIndex++
            }

            activities.push({
                eventName: eventName.toString().trim(),
                locationType: formData.get(`locationType${i}`)?.toString() || '',
                targetVenue: formData.get(`targetVenue${i}`)?.toString().trim() || '',
                numberOfStudents: parseInt(formData.get(`numberOfStudents${i}`) || '0', 10),
                targetDates: formData.get(`targetDates${i}`)?.toString().trim() || '',
                eventDescription: formData.get(`eventDescription${i}`)?.toString().trim() || '',
                itemizedBudget: activityBudgetRows,
                activityTotal: activityBudgetRows.reduce((sum, row) => sum + row.amount, 0),
            })
        }

        // Collect non-activity items
        const nonActivityItems = []
        let naIndex = 1
        while (formData.get(`nonActivityCategory${naIndex}`)) {
            const category = formData.get(`nonActivityCategory${naIndex}`)
            const justification = formData.get(`nonActivityJustification${naIndex}`)
            const amount = formData.get(`nonActivityAmount${naIndex}`)
            if (category && amount) {
                nonActivityItems.push({
                    category: category.toString().trim(),
                    justification: justification?.toString().trim() || '',
                    amount: parseFloat(amount) || 0,
                })
            }
            naIndex++
        }

        const totalAmount = activities.reduce((sum, a) => sum + a.activityTotal, 0) +
            nonActivityItems.reduce((sum, item) => sum + item.amount, 0)

        const apiPayload = {
            club: backendClubId,
            semester: formData.get('clubName')?.toString().trim() || selectedClub,
            status: 'PENDING',
            previous_name: formData.get('previousClubName')?.toString().trim() || '',
            member_count: parseInt(formData.get('numberOfMembers') || '0', 10),
            community_enhancement: formData.get('clubHistory')?.toString().trim() || '',
            activities,
            non_activity_items: nonActivityItems,
            total_requested: totalAmount,
        }

        try {
            await createBudgetProposal(apiPayload)
            const updated = await fetchBudgetProposalsByClub(backendClubId)
            setBudgetProposals(updated)
            setBudgetProposalStatus('Budget proposal submitted successfully!')
        } catch (err) {
            setBudgetProposalStatus(`Error submitting proposal: ${err.message}`)
        }
        setShowBudgetForm(false)
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

            <section className={styles.dashboard__metrics} aria-label="Club summary metrics">
                {attendanceMetrics.map((metric) => (
                    <MetricPill key={metric.label} label={metric.label} value={metric.value} />
                ))}
            </section>

            <section className={styles.dashboard__grid}>
                <DashboardPanel
                    title="Budget proposals"
                    items={budgetProposals.length
                        ? budgetProposals.map((p) => `${p.semester || 'Budget'} — $${Number(p.total_requested || 0).toFixed(2)} — ${p.status}`)
                        : ['No budget proposals yet.']}
                />
                <DashboardPanel
                    title="Recent events"
                    items={clubEvents.length
                        ? clubEvents.map((e) => `${e.name} — ${e.date} — ${e.location}`)
                        : ['No events yet.']}
                />
                <DashboardPanel
                    title="Recent food orders"
                    items={foodOrders.length
                        ? foodOrders.map((o) => `${o.order_type === 'MBJ' ? 'MBJ' : 'Out-of-Network'} — ${o.event_date || 'No date'} — ${o.status || 'PENDING'}`)
                        : ['No food orders yet.']}
                />
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
                        <div className={styles.dashboard__panelHeader}>
                            <div>
                                <h3 className={styles.dashboard__panelTitle}>Club Events Feed</h3>
                                <p className={styles.dashboard__description}>Recent and upcoming events for {selectedClub}</p>
                            </div>
                            <Button variant="primary" onClick={() => setShowEventScheduler(true)}>
                                Create Event
                            </Button>
                        </div>

                        <div className={styles.dashboard__eventsFeed}>
                            {/* Scheduled Events from API */}
                            {clubEvents.length > 0 ? (
                                <div className={styles.dashboard__eventSection}>
                                    <h4 className={styles.dashboard__eyebrow}>Scheduled Events</h4>
                                    <div className={styles.dashboard__eventCards}>
                                        {clubEvents.map((event) => (
                                            <div key={event.id} className={styles.dashboard__createdEventCard}>
                                                <h5 className={styles.dashboard__eventTitle}>{event.name || event.title}</h5>
                                                <div className={styles.dashboard__createdEventMeta}>
                                                    <span className={styles.dashboard__createdEventRoom}>
                                                        {event.location || 'No location'}
                                                    </span>
                                                </div>
                                                <p className={styles.dashboard__eventTime}>{event.date}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

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

                            {/* TBD voting section removed — now driven by backend data */}
                        </div>
                    </section>
                ) : activeAction === 'Food orders' ? (
                    <section className={styles.dashboard__foodOrderPanel}>
                        <h3 className={styles.dashboard__title}>Food Orders</h3>
                        <p className={styles.dashboard__description}>Manage food orders for {selectedClub}</p>

                        <Button variant="primary" onClick={() => setShowFoodOrderTypeModal(true)}>
                            New Food Order
                        </Button>

                        {foodOrderStatus ? <p className={styles.dashboard__description}>{foodOrderStatus}</p> : null}

                        <div className={styles.dashboard__orderList}>
                            <h4 className={styles.dashboard__eyebrow}>Existing food orders</h4>
                            {foodOrders.length ? (
                                <ul className={styles.dashboard__orderItems}>
                                    {foodOrders.map((order) => (
                                        <li key={order.id}>
                                            {order.order_type === 'MBJ' ? 'MBJ' : 'Out-of-Network'} — {order.event_date || 'No date'} — {order.status} — ${order.total_cost || '0.00'}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.dashboard__description}>No food orders yet.</p>
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
                                        <li key={proposal.id} className={styles.dashboard__proposalRow}>
                                            <span>{proposal.semester || 'Budget Proposal'} — ${Number(proposal.total_requested || 0).toFixed(2)} — {proposal.status}</span>
                                            {(user?.role === 'club advisor' || user?.role === 'sga officer') && proposal.status === 'PENDING' && (
                                                <Button variant="ghost" onClick={() => { setSelectedProposal(proposal); setReviewComment(''); setShowReviewModal(true) }}>
                                                    Review
                                                </Button>
                                            )}
                                            {proposal.reviewer_comment && (
                                                <span className={styles.dashboard__reviewComment}>Comment: {proposal.reviewer_comment}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.dashboard__description}>No budget proposals submitted yet.</p>
                            )}
                        </div>
                    </section>
                ) : activeAction === 'Reserve a room' ? (
                    <section className={styles.dashboard__foodOrderPanel}>
                        <h3 className={styles.dashboard__title}>Reserve a Room</h3>
                        <p className={styles.dashboard__description}>Book a room for your club meetings and events</p>

                        {selectedRoom ? (
                            <div className={styles.dashboard__selectedRoom}>
                                <p><strong>Selected Room:</strong> {selectedRoom.roomNumber}</p>
                                <p><strong>Building:</strong> {selectedRoom.buildingName}</p>
                                <p><strong>Floor:</strong> {selectedRoom.floor}</p>
                                <div className={styles.dashboard__roomActions}>
                                    <Button variant="primary" onClick={() => setShowEventScheduler(true)}>
                                        Schedule Event
                                    </Button>
                                    <Button variant="ghost" onClick={() => setSelectedRoom(null)}>
                                        Change Room
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button variant="primary" onClick={() => setShowRoomReservation(true)}>
                                Find and Reserve a Room
                            </Button>
                        )}
                    </section>
                ) : (
                    <section className={styles.dashboard__foodOrderPanel}>
                        <h3 className={styles.dashboard__title}>{activeAction}</h3>
                        <p className={styles.dashboard__description}>This section is prepared and will be implemented next.</p>
                    </section>
                )}
            </section>

            {/* Club Dissolution — only visible to advisors and SGA officers */}
            {canDissolve && !isClubDissolved && (
                <div className={styles.dashboard__dissolveSection}>
                    <p className={styles.dashboard__dissolveWarning}>Danger Zone</p>
                    <p className={styles.dashboard__description}>
                        Dissolving a club is permanent. All associated data will be archived and the club will no longer appear in the directory.
                    </p>
                    <Button variant="ghost" onClick={() => setShowDissolveConfirm(true)}>
                        Dissolve this club
                    </Button>
                </div>
            )}
            {isClubDissolved && (
                <div className={styles.dashboard__dissolveSection}>
                    <p className={styles.dashboard__dissolveWarning}>This club has been dissolved.</p>
                </div>
            )}

            {/* Club Dissolution Confirmation Modal */}
            <Modal
                isOpen={showDissolveConfirm}
                title="Confirm Club Dissolution"
                onClose={() => setShowDissolveConfirm(false)}
            >
                <div className={styles.dashboard__reviewPanel}>
                    <p className={styles.dashboard__dissolveWarning}>
                        Are you sure you want to dissolve &ldquo;{selectedClub}&rdquo;?
                    </p>
                    <p className={styles.dashboard__description}>
                        This action cannot be undone. The club will be removed from the active directory and all current operations will be archived.
                    </p>
                    <div className={styles.dashboard__reviewActions}>
                        <Button variant="primary" onClick={handleDissolveClub}>
                            Yes, Dissolve Club
                        </Button>
                        <Button variant="ghost" onClick={() => setShowDissolveConfirm(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

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

            {/* Room Reservation Component */}
            <RoomReservation
                isOpen={showRoomReservation}
                onClose={() => setShowRoomReservation(false)}
                onRoomSelected={(room) => setSelectedRoom(room)}
                onScheduleEvent={(room) => {
                    setSelectedRoom(room)
                    setShowRoomReservation(false)
                    setShowEventScheduler(true)
                }}
                setToastMessage={(msg) => setFoodOrderStatus(msg)}
            />

            {/* Event Scheduler Component */}
            <EventScheduler
                isOpen={showEventScheduler}
                onClose={() => setShowEventScheduler(false)}
                selectedRoom={selectedRoom}
                onReserveRoom={() => {
                    setShowEventScheduler(false)
                    setShowRoomReservation(true)
                }}
                onEventCreated={(eventData) => {
                    setFoodOrderStatus(`Event "${eventData.title || eventData.name}" created successfully!`)
                    // Re-fetch events from API to stay in sync
                    if (backendClubId) {
                        fetchEventsByClub(backendClubId)
                            .then((data) => setClubEvents(data))
                            .catch(() => { })
                    }
                }}
                club={{ ...clubInfo, backendId: backendClubId }}
                user={user}
            />

            {/* Budget Review Modal */}
            <Modal
                isOpen={showReviewModal}
                title="Review Budget Proposal"
                onClose={() => { setShowReviewModal(false); setSelectedProposal(null) }}
            >
                {selectedProposal && (
                    <div className={styles.dashboard__reviewPanel}>
                        <p className={styles.dashboard__description}>
                            <strong>{selectedProposal.semester || 'Budget Proposal'}</strong> — ${Number(selectedProposal.total_requested || 0).toFixed(2)}
                        </p>
                        {selectedProposal.community_enhancement && (
                            <p className={styles.dashboard__description}><strong>Club history:</strong> {selectedProposal.community_enhancement}</p>
                        )}
                        <label className={styles.dashboard__field}>
                            <span>Reviewer comment / suggestion</span>
                            <textarea
                                className={styles.dashboard__textarea}
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                rows={3}
                                placeholder="Add feedback or suggestions for the club..."
                            />
                        </label>
                        <div className={styles.dashboard__reviewActions}>
                            <Button variant="primary" onClick={() => handleBudgetReview('APPROVED')}>Approve</Button>
                            <Button variant="ghost" onClick={() => handleBudgetReview('RETURNED')}>Return for Edits</Button>
                            <Button variant="ghost" onClick={() => handleBudgetReview('DENIED')}>Deny</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Budget Proposal Form Modal */}
            <Modal
                isOpen={showBudgetForm}
                title="Club Budget Request Form"
                onClose={() => setShowBudgetForm(false)}
                panelClassName={styles['modal__panel--wide']}
            >
                <div className={styles.dashboard__budgetNote}>
                    <p><strong>Note:</strong> Budget request cannot exceed $4,000. New clubs cannot exceed $1,000.</p>
                </div>
                <form className={styles.dashboard__budgetForm} onSubmit={handleBudgetProposalSubmit}>
                    {/* Club Information */}
                    <div className={styles.dashboard__budgetSection}>
                        <h4 className={styles.dashboard__budgetSectionTitle}>Club Information</h4>
                        <label className={styles.dashboard__field}>
                            <span>Date completed</span>
                            <input className={styles.dashboard__input} name="dateCompleted" type="date" defaultValue={new Date().toISOString().split('T')[0]} readOnly />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Club Name</span>
                            <input className={styles.dashboard__input} name="clubName" type="text" defaultValue={selectedClub} required />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Did your club ever have a different name? If so, what was the name?</span>
                            <input className={styles.dashboard__input} name="previousClubName" type="text" placeholder="Leave blank if unchanged" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>How many members are typically in your club?</span>
                            <input className={styles.dashboard__input} name="numberOfMembers" type="number" min="1" required />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Club History: In what ways did your club enhance the college community through your planned events and activities from the previous semester, if any?</span>
                            <textarea className={styles.dashboard__textarea} name="clubHistory" rows="4" required />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Club Room</span>
                            <input className={styles.dashboard__input} name="clubRoom" type="text" defaultValue={clubInfo.location || 'TBD'} readOnly />
                        </label>
                    </div>

                    {/* Activity 1 */}
                    <div className={styles.dashboard__budgetSection}>
                        <h4 className={styles.dashboard__budgetSectionTitle}>Activity 1</h4>
                        <label className={styles.dashboard__field}>
                            <span>Name of event</span>
                            <input className={styles.dashboard__input} name="eventName1" type="text" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Location type</span>
                            <select className={styles.dashboard__input} name="locationType1">
                                <option value="">Select...</option>
                                <option value="on-campus">On Campus</option>
                                <option value="virtual">Virtual</option>
                            </select>
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Target venue</span>
                            <input className={styles.dashboard__input} name="targetVenue1" type="text" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Destination if off campus</span>
                            <input className={styles.dashboard__input} name="destinationOffCampus1" type="text" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Number of students attending</span>
                            <input className={styles.dashboard__input} name="numberOfStudents1" type="number" min="1" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Target date(s)</span>
                            <input className={styles.dashboard__input} name="targetDates1" type="text" placeholder="e.g., March 15, 2026" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Event description (include purpose and benefit to community)</span>
                            <textarea className={styles.dashboard__textarea} name="eventDescription1" rows="3" />
                        </label>
                        <div className={styles.dashboard__budgetRow}>
                            <label className={styles.dashboard__field}>
                                <span>Category</span>
                                <input className={styles.dashboard__input} name="activity1Category1" type="text" placeholder="e.g., Food" />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Amount ($)</span>
                                <input className={styles.dashboard__input} name="activity1Amount1" type="number" min="0" step="0.01" placeholder="0.00" />
                            </label>
                        </div>
                        <div className={styles.dashboard__budgetRow}>
                            <label className={styles.dashboard__field}>
                                <span>Category</span>
                                <input className={styles.dashboard__input} name="activity1Category2" type="text" placeholder="e.g., Decorations" />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Amount ($)</span>
                                <input className={styles.dashboard__input} name="activity1Amount2" type="number" min="0" step="0.01" placeholder="0.00" />
                            </label>
                        </div>
                    </div>

                    {/* Activity 2 */}
                    <div className={styles.dashboard__budgetSection}>
                        <h4 className={styles.dashboard__budgetSectionTitle}>Activity 2</h4>
                        <label className={styles.dashboard__field}>
                            <span>Name of event</span>
                            <input className={styles.dashboard__input} name="eventName2" type="text" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Location type</span>
                            <select className={styles.dashboard__input} name="locationType2">
                                <option value="">Select...</option>
                                <option value="on-campus">On Campus</option>
                                <option value="virtual">Virtual</option>
                            </select>
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Target venue</span>
                            <input className={styles.dashboard__input} name="targetVenue2" type="text" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Destination if off campus</span>
                            <input className={styles.dashboard__input} name="destinationOffCampus2" type="text" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Number of students attending</span>
                            <input className={styles.dashboard__input} name="numberOfStudents2" type="number" min="1" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Target date(s)</span>
                            <input className={styles.dashboard__input} name="targetDates2" type="text" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Event description</span>
                            <textarea className={styles.dashboard__textarea} name="eventDescription2" rows="3" />
                        </label>
                        <div className={styles.dashboard__budgetRow}>
                            <label className={styles.dashboard__field}>
                                <span>Category</span>
                                <input className={styles.dashboard__input} name="activity2Category1" type="text" />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Amount ($)</span>
                                <input className={styles.dashboard__input} name="activity2Amount1" type="number" min="0" step="0.01" />
                            </label>
                        </div>
                    </div>

                    {/* Activity 3 */}
                    <div className={styles.dashboard__budgetSection}>
                        <h4 className={styles.dashboard__budgetSectionTitle}>Activity 3</h4>
                        <label className={styles.dashboard__field}>
                            <span>Name of event</span>
                            <input className={styles.dashboard__input} name="eventName3" type="text" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Location type</span>
                            <select className={styles.dashboard__input} name="locationType3">
                                <option value="">Select...</option>
                                <option value="on-campus">On Campus</option>
                                <option value="virtual">Virtual</option>
                            </select>
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Target venue</span>
                            <input className={styles.dashboard__input} name="targetVenue3" type="text" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Destination if off campus</span>
                            <input className={styles.dashboard__input} name="destinationOffCampus3" type="text" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Number of students attending</span>
                            <input className={styles.dashboard__input} name="numberOfStudents3" type="number" min="1" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Target date(s)</span>
                            <input className={styles.dashboard__input} name="targetDates3" type="text" />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Event description</span>
                            <textarea className={styles.dashboard__textarea} name="eventDescription3" rows="3" />
                        </label>
                        <div className={styles.dashboard__budgetRow}>
                            <label className={styles.dashboard__field}>
                                <span>Category</span>
                                <input className={styles.dashboard__input} name="activity3Category1" type="text" />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Amount ($)</span>
                                <input className={styles.dashboard__input} name="activity3Amount1" type="number" min="0" step="0.01" />
                            </label>
                        </div>
                    </div>

                    {/* Non-Activity Items */}
                    <div className={styles.dashboard__budgetSection}>
                        <h4 className={styles.dashboard__budgetSectionTitle}>Non-Activity Items (promotional items, banners, supplies, etc.)</h4>
                        <div className={styles.dashboard__budgetRow}>
                            <label className={styles.dashboard__field}>
                                <span>Category</span>
                                <input className={styles.dashboard__input} name="nonActivityCategory1" type="text" placeholder="e.g., Banner" />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Justification</span>
                                <input className={styles.dashboard__input} name="nonActivityJustification1" type="text" placeholder="Why needed?" />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Amount ($)</span>
                                <input className={styles.dashboard__input} name="nonActivityAmount1" type="number" min="0" step="0.01" placeholder="0.00" />
                            </label>
                        </div>
                        <div className={styles.dashboard__budgetRow}>
                            <label className={styles.dashboard__field}>
                                <span>Category</span>
                                <input className={styles.dashboard__input} name="nonActivityCategory2" type="text" placeholder="e.g., Supplies" />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Justification</span>
                                <input className={styles.dashboard__input} name="nonActivityJustification2" type="text" />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Amount ($)</span>
                                <input className={styles.dashboard__input} name="nonActivityAmount2" type="number" min="0" step="0.01" placeholder="0.00" />
                            </label>
                        </div>
                        <div className={styles.dashboard__budgetRow}>
                            <label className={styles.dashboard__field}>
                                <span>Category</span>
                                <input className={styles.dashboard__input} name="nonActivityCategory3" type="text" />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Justification</span>
                                <input className={styles.dashboard__input} name="nonActivityJustification3" type="text" />
                            </label>
                            <label className={styles.dashboard__field}>
                                <span>Amount ($)</span>
                                <input className={styles.dashboard__input} name="nonActivityAmount3" type="number" min="0" step="0.01" placeholder="0.00" />
                            </label>
                        </div>
                    </div>

                    {/* Officer Information */}
                    <div className={styles.dashboard__budgetSection}>
                        <h4 className={styles.dashboard__budgetSectionTitle}>Officer Information</h4>
                        <label className={styles.dashboard__field}>
                            <span>Name of club officer submitting form</span>
                            <input className={styles.dashboard__input} name="submittedBy" type="text" defaultValue={user?.name || ''} readOnly />
                        </label>
                        <label className={styles.dashboard__field}>
                            <span>Position of officer</span>
                            <select className={styles.dashboard__input} name="officerPosition" required>
                                <option value="">Select position...</option>
                                <option value="president">President</option>
                                <option value="vice-president">Vice President</option>
                                <option value="treasurer">Treasurer</option>
                                <option value="secretary">Secretary</option>
                                <option value="club-officer">Club Officer</option>
                                <option value="club-advisor">Club Advisor</option>
                            </select>
                        </label>
                    </div>

                    <div className={styles.dashboard__formActions}>
                        <Button type="submit" variant="primary">Submit Budget Proposal</Button>
                        <Button type="button" variant="ghost" onClick={() => setShowBudgetForm(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>
        </main>
    )
}

export default Dashboard
