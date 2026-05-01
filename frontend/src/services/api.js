const API_BASE = 'http://localhost:8000/api'

async function request(path, options = {}) {
    const url = `${API_BASE}${path}`
    const headers = { 'Content-Type': 'application/json', ...options.headers }
    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`API ${options.method || 'GET'} ${path} failed (${response.status}): ${text}`)
    }

    if (response.status === 204) return null
    return response.json()
}

// ── Clubs ──────────────────────────────────────────────

export async function fetchClubs() {
    return request('/clubs/')
}

export async function fetchClub(id) {
    return request(`/clubs/${id}/`)
}

export async function createClub(data) {
    return request('/clubs/', { method: 'POST', body: JSON.stringify(data) })
}

// ── Food Orders ────────────────────────────────────────

export async function fetchFoodOrders() {
    return request('/food-orders/')
}

export async function fetchFoodOrdersByClub(clubId) {
    return request(`/food-orders/?club=${clubId}`)
}

export async function createFoodOrder(data) {
    return request('/food-orders/', { method: 'POST', body: JSON.stringify(data) })
}

// ── Budget Proposals ───────────────────────────────────

export async function fetchBudgetProposals() {
    return request('/budgets/')
}

export async function fetchBudgetProposalsByClub(clubId) {
    return request(`/budgets/?club=${clubId}`)
}

export async function createBudgetProposal(data) {
    return request('/budgets/', { method: 'POST', body: JSON.stringify(data) })
}

// ── Events ─────────────────────────────────────────────

export async function fetchEvents() {
    return request('/events/')
}

export async function fetchEventsByClub(clubId) {
    return request(`/events/?club=${clubId}`)
}

export async function createEvent(data) {
    return request('/events/', { method: 'POST', body: JSON.stringify(data) })
}

export function getAttendanceExportUrl(eventId) {
    return `${API_BASE}/events/${eventId}/export_attendance/`
}

// ── Attendance ─────────────────────────────────────────

export async function fetchAttendanceRecords(eventId) {
    return request(`/attendance/?event=${eventId}`)
}

export async function createAttendanceRecord(data) {
    return request('/attendance/', { method: 'POST', body: JSON.stringify(data) })
}
