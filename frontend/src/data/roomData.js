// Room data structure for BMCC campus buildings
// Buildings: Chambers, Fiterman, Murray

export const BMCC_BUILDINGS = {
    chambers: {
        id: 'chambers',
        name: 'Chambers',
        displayName: 'Chambers Building',
        floors: [1, 2, 3, 4, 5, 6, 7], // 7 floors
        roomsPerFloor: 10,
    },
    fiterman: {
        id: 'fiterman',
        name: 'Fiterman',
        displayName: 'Fiterman Hall',
        floors: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Floors 1-12 (13,14 usually reserved)
        reservedFloors: [13, 14],
        roomsPerFloor: 10,
    },
    murray: {
        id: 'murray',
        name: 'Murray',
        displayName: 'Murray Building',
        floors: [1, 2, 3, 10, 11, 12], // Only these floors available
        roomsPerFloor: 10,
    },
}

// Room status types
export const ROOM_STATUS = {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    RESERVED: 'reserved',
}

// Generate room number format: F-902, F-405, F-710
// First digit = floor, last two digits = room number on that floor
function generateRoomNumber(floor, roomIndex) {
    // roomIndex 0-9 maps to rooms on that floor
    // Format: F-{floor}{roomIndex+1}0 - for middle rooms
    // Or simpler: floor * 100 + (roomIndex + 1)
    const roomNum = floor * 100 + (roomIndex + 1)
    return `F-${roomNum}`
}

// Generate all rooms for a building
function generateBuildingRooms(buildingConfig) {
    const rooms = []

    buildingConfig.floors.forEach((floor) => {
        for (let i = 0; i < buildingConfig.roomsPerFloor; i++) {
            const roomNumber = generateRoomNumber(floor, i)
            rooms.push({
                id: `${buildingConfig.id}-${roomNumber}`,
                building: buildingConfig.id,
                buildingName: buildingConfig.displayName,
                floor,
                roomNumber,
                status: ROOM_STATUS.AVAILABLE,
                occupiedBy: null,
                occupiedByType: null, // 'club-meeting', 'event', 'reserved'
                occupiedUntil: null,
                eventId: null,
            })
        }
    })

    // Add reserved floors for Fiterman (these exist but are usually not available)
    if (buildingConfig.reservedFloors) {
        buildingConfig.reservedFloors.forEach((floor) => {
            for (let i = 0; i < buildingConfig.roomsPerFloor; i++) {
                const roomNumber = generateRoomNumber(floor, i)
                rooms.push({
                    id: `${buildingConfig.id}-${roomNumber}`,
                    building: buildingConfig.id,
                    buildingName: buildingConfig.displayName,
                    floor,
                    roomNumber,
                    status: ROOM_STATUS.RESERVED,
                    occupiedBy: 'Administrative Use',
                    occupiedByType: 'reserved',
                    occupiedUntil: null,
                    eventId: null,
                    isReservedFloor: true,
                })
            }
        })
    }

    return rooms
}

// Generate all BMCC rooms
export function generateAllRooms() {
    const allRooms = []
    Object.values(BMCC_BUILDINGS).forEach((building) => {
        allRooms.push(...generateBuildingRooms(building))
    })
    return allRooms
}

// Initial room data
export const bmccRooms = generateAllRooms()

// Get rooms by building
export function getRoomsByBuilding(buildingId) {
    return bmccRooms.filter((room) => room.building === buildingId)
}

// Get rooms by building and floor
export function getRoomsByBuildingAndFloor(buildingId, floor) {
    return bmccRooms.filter((room) => room.building === buildingId && room.floor === floor)
}

// Get available rooms (not occupied or reserved)
export function getAvailableRooms(buildingId, floor) {
    return bmccRooms.filter(
        (room) =>
            room.building === buildingId &&
            room.floor === floor &&
            room.status === ROOM_STATUS.AVAILABLE
    )
}

// Check if a room is available for a specific time slot
export function isRoomAvailable(roomId, startTime, endTime, excludeEventId = null) {
    const room = bmccRooms.find((r) => r.id === roomId)
    if (!room) return false

    if (room.status === ROOM_STATUS.AVAILABLE) return true
    if (room.status === ROOM_STATUS.RESERVED) return false

    // If occupied, check if the time conflicts
    if (room.status === ROOM_STATUS.OCCUPIED && room.occupiedUntil) {
        const occupiedEnd = new Date(room.occupiedUntil)
        const requestedStart = new Date(startTime)
        // If the current occupancy ends before the requested time, it's available
        return occupiedEnd <= requestedStart
    }

    return false
}

// Update room status based on club directory data
export function updateRoomStatusFromClubs(clubDirectory) {
    const now = new Date()

    clubDirectory.forEach((club) => {
        if (club.location && club.location !== 'TBD') {
            // Try to find the room by room number
            const roomNumber = club.location.trim()
            const room = bmccRooms.find((r) => r.roomNumber === roomNumber)

            if (room && room.status === ROOM_STATUS.AVAILABLE) {
                // Check if there's a weekly meeting
                if (club.publicEvents && club.publicEvents.length > 0) {
                    const weeklyMeeting = club.publicEvents.find(
                        (e) => e.title && e.title.toLowerCase().includes('weekly')
                    )

                    if (weeklyMeeting) {
                        room.status = ROOM_STATUS.OCCUPIED
                        room.occupiedBy = club.name
                        room.occupiedByType = 'club-meeting'
                        // Weekly meetings typically occupy the room for the semester
                        room.occupiedUntil = new Date(now.getFullYear(), 11, 31).toISOString() // End of year
                    }
                }
            }
        }
    })

    return bmccRooms
}

// Update room status from events
export function updateRoomStatusFromEvents(events) {
    const now = new Date()

    events.forEach((event) => {
        if (event.roomId && event.fixedDate) {
            const room = bmccRooms.find((r) => r.id === event.roomId)
            if (room) {
                const eventStart = new Date(event.fixedDate)
                const eventEnd = event.fixedEndDate
                    ? new Date(event.fixedEndDate)
                    : new Date(eventStart.getTime() + 2 * 60 * 60 * 1000) // Default 2 hours

                // If event is currently ongoing
                if (eventStart <= now && eventEnd > now) {
                    room.status = ROOM_STATUS.OCCUPIED
                    room.occupiedBy = event.title
                    room.occupiedByType = 'event'
                    room.occupiedUntil = eventEnd.toISOString()
                    room.eventId = event.id
                }
            }
        }
    })

    return bmccRooms
}

// Reserve a room for an event
export function reserveRoom(roomId, eventData) {
    const room = bmccRooms.find((r) => r.id === roomId)
    if (!room || room.status === ROOM_STATUS.RESERVED) {
        return { success: false, message: 'Room is not available for reservation' }
    }

    room.status = ROOM_STATUS.OCCUPIED
    room.occupiedBy = eventData.title || eventData.clubName
    room.occupiedByType = eventData.type || 'event'
    room.occupiedUntil = eventData.endTime || eventData.fixedEndDate
    room.eventId = eventData.id || null

    return { success: true, room }
}

// Release a room
export function releaseRoom(roomId) {
    const room = bmccRooms.find((r) => r.id === roomId)
    if (!room) return false

    if (room.isReservedFloor) {
        room.status = ROOM_STATUS.RESERVED
        room.occupiedBy = 'Administrative Use'
        room.occupiedByType = 'reserved'
    } else {
        room.status = ROOM_STATUS.AVAILABLE
        room.occupiedBy = null
        room.occupiedByType = null
    }
    room.occupiedUntil = null
    room.eventId = null

    return true
}

// Auto-assign an available room
export function autoAssignRoom(buildingId, floor = null) {
    let availableRooms

    if (floor !== null) {
        availableRooms = getAvailableRooms(buildingId, floor)
    } else {
        availableRooms = bmccRooms.filter(
            (r) => r.building === buildingId && r.status === ROOM_STATUS.AVAILABLE
        )
    }

    if (availableRooms.length === 0) {
        return { success: false, message: 'No available rooms in selected building/floor' }
    }

    // Return the first available room
    return { success: true, room: availableRooms[0] }
}

// Export building list for UI
export const buildingOptions = Object.values(BMCC_BUILDINGS).map((b) => ({
    id: b.id,
    name: b.displayName,
    floors: b.floors,
}))
