import { useState, useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
    BMCC_BUILDINGS,
    ROOM_STATUS,
    getRoomsByBuildingAndFloor,
    getAvailableRooms,
    autoAssignRoom,
    buildingOptions,
} from '../../data/roomData.js'
import { Modal } from '../Modal/Modal.jsx'
import { Button } from '../Button/Button.jsx'
import styles from './RoomReservation.module.scss'

// Font Awesome icons as SVG components
const ChevronUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
    </svg>
)

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
    </svg>
)

const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M12 2L2 7v15h20V7L12 2zm0 2.5L18.5 8H5.5L12 4.5zM4 9h16v11H4V9z"/>
    </svg>
)

const FloorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M4 4h16v4H4V4zm0 6h16v4H4v-4zm0 6h16v4H4v-4z"/>
    </svg>
)

const RoomIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
    </svg>
)

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
)

const MagicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M7.5 5.6L5 7l1.4-2.5L5 2l2.5 1.4L10 2 8.6 4.5 10 7 7.5 5.6zm12.8 9.7l-1.3 2.3 2.3 1.3-2.3 1.3 1.3 2.3-2.3-1.3-1.3 2.3-1.3-2.3-2.3 1.3 1.3-2.3-2.3-1.3 2.3-1.3-1.3-2.3 2.3 1.3 1.3-2.3 1.3 2.3zm-9.3-4.3l1.4-2.5L10 7l2.5 1.4L15 7l-1.4 2.5L15 12l-2.5-1.4L10 12l1.4-2.5z"/>
    </svg>
)

export function RoomReservation({
    isOpen,
    onClose,
    onRoomSelected,
    onScheduleEvent,
    clubDirectory = [],
    setToastMessage,
}) {
    const [selectedBuilding, setSelectedBuilding] = useState('')
    const [selectedFloor, setSelectedFloor] = useState(1)
    const [selectedRoom, setSelectedRoom] = useState(null)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [isAutoAssigning, setIsAutoAssigning] = useState(false)

    // Get current building config
    const currentBuilding = useMemo(() => {
        return selectedBuilding ? BMCC_BUILDINGS[selectedBuilding] : null
    }, [selectedBuilding])

    // Get available floors for selected building
    const availableFloors = useMemo(() => {
        return currentBuilding ? currentBuilding.floors : []
    }, [currentBuilding])

    // Get rooms for current building and floor
    const currentRooms = useMemo(() => {
        if (!selectedBuilding) return []
        return getRoomsByBuildingAndFloor(selectedBuilding, selectedFloor)
    }, [selectedBuilding, selectedFloor])

    // Reset floor when building changes
    useEffect(() => {
        if (currentBuilding && currentBuilding.floors.length > 0) {
            setSelectedFloor(currentBuilding.floors[0])
        }
        setSelectedRoom(null)
    }, [selectedBuilding, currentBuilding])

    const handleBuildingChange = (e) => {
        setSelectedBuilding(e.target.value)
    }

    const handleFloorUp = () => {
        const currentIndex = availableFloors.indexOf(selectedFloor)
        if (currentIndex < availableFloors.length - 1) {
            setSelectedFloor(availableFloors[currentIndex + 1])
            setSelectedRoom(null)
        }
    }

    const handleFloorDown = () => {
        const currentIndex = availableFloors.indexOf(selectedFloor)
        if (currentIndex > 0) {
            setSelectedFloor(availableFloors[currentIndex - 1])
            setSelectedRoom(null)
        }
    }

    const handleRoomSelect = (room) => {
        if (room.status === ROOM_STATUS.AVAILABLE) {
            setSelectedRoom(room)
        }
    }

    const handleAutoAssign = () => {
        setIsAutoAssigning(true)
        const result = autoAssignRoom(selectedBuilding, selectedFloor)

        if (result.success) {
            setSelectedRoom(result.room)
            if (setToastMessage) {
                setToastMessage(`Auto-assigned ${result.room.roomNumber} on Floor ${result.room.floor}`)
            }
        } else {
            if (setToastMessage) {
                setToastMessage(result.message || 'No available rooms found')
            }
        }
        setIsAutoAssigning(false)
    }

    const handleConfirmRoom = () => {
        if (selectedRoom) {
            setShowConfirmation(true)
        }
    }

    const handleScheduleEvent = () => {
        if (selectedRoom && onScheduleEvent) {
            onScheduleEvent(selectedRoom)
        }
        setShowConfirmation(false)
        onClose()
    }

    const handleCloseConfirmation = () => {
        if (selectedRoom && onRoomSelected) {
            onRoomSelected(selectedRoom)
        }
        if (setToastMessage) {
            setToastMessage(`Room ${selectedRoom.roomNumber} selected successfully!`)
        }
        setShowConfirmation(false)
        onClose()
    }

    const getStatusClass = (status) => {
        switch (status) {
            case ROOM_STATUS.AVAILABLE:
                return styles.roomCard__available
            case ROOM_STATUS.OCCUPIED:
                return styles.roomCard__occupied
            case ROOM_STATUS.RESERVED:
                return styles.roomCard__reserved
            default:
                return ''
        }
    }

    const getStatusLabel = (room) => {
        switch (room.status) {
            case ROOM_STATUS.AVAILABLE:
                return 'Available'
            case ROOM_STATUS.OCCUPIED:
                return room.occupiedByType === 'club-meeting'
                    ? `Weekly Meeting: ${room.occupiedBy}`
                    : `Event: ${room.occupiedBy}`
            case ROOM_STATUS.RESERVED:
                return room.isReservedFloor ? 'Reserved Floor' : 'Reserved'
            default:
                return 'Unknown'
        }
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                title="Reserve a Room"
                onClose={onClose}
                panelClassName={styles.modal__panel}
            >
                <div className={styles.roomReservation}>
                    {/* Building Selection */}
                    <div className={styles.roomReservation__section}>
                        <label className={styles.roomReservation__label}>
                            <BuildingIcon />
                            <span>Select Building</span>
                        </label>
                        <select
                            className={styles.roomReservation__select}
                            value={selectedBuilding}
                            onChange={handleBuildingChange}
                        >
                            <option value="">Choose a building...</option>
                            {buildingOptions.map((building) => (
                                <option key={building.id} value={building.id}>
                                    {building.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Floor Selection */}
                    {selectedBuilding && (
                        <div className={styles.roomReservation__section}>
                            <label className={styles.roomReservation__label}>
                                <FloorIcon />
                                <span>Select Floor</span>
                            </label>
                            <div className={styles.floorSelector}>
                                <button
                                    type="button"
                                    className={styles.floorSelector__button}
                                    onClick={handleFloorUp}
                                    disabled={availableFloors.indexOf(selectedFloor) >= availableFloors.length - 1}
                                    aria-label="Go up one floor"
                                >
                                    <ChevronUpIcon />
                                </button>
                                <div className={styles.floorSelector__display}>
                                    <span className={styles.floorSelector__label}>Floor</span>
                                    <span className={styles.floorSelector__value}>{selectedFloor}</span>
                                </div>
                                <button
                                    type="button"
                                    className={styles.floorSelector__button}
                                    onClick={handleFloorDown}
                                    disabled={availableFloors.indexOf(selectedFloor) <= 0}
                                    aria-label="Go down one floor"
                                >
                                    <ChevronDownIcon />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Auto Assign Button */}
                    {selectedBuilding && (
                        <div className={styles.roomReservation__section}>
                            <Button
                                variant="ghost"
                                onClick={handleAutoAssign}
                                disabled={isAutoAssigning}
                                className={styles.autoAssignButton}
                            >
                                <MagicIcon />
                                <span>Auto-Assign Available Room</span>
                            </Button>
                        </div>
                    )}

                    {/* Room Grid */}
                    {selectedBuilding && currentRooms.length > 0 && (
                        <div className={styles.roomReservation__section}>
                            <label className={styles.roomReservation__label}>
                                <RoomIcon />
                                <span>Available Rooms</span>
                                {selectedRoom && (
                                    <span className={styles.roomReservation__selected}>
                                        Selected: {selectedRoom.roomNumber}
                                    </span>
                                )}
                            </label>
                            <div className={styles.roomsGrid}>
                                {currentRooms.map((room) => (
                                    <button
                                        key={room.id}
                                        type="button"
                                        className={`${styles.roomCard} ${getStatusClass(room.status)} ${
                                            selectedRoom?.id === room.id ? styles.roomCard__selected : ''
                                        }`}
                                        onClick={() => handleRoomSelect(room)}
                                        disabled={room.status !== ROOM_STATUS.AVAILABLE}
                                    >
                                        <span className={styles.roomCard__number}>{room.roomNumber}</span>
                                        <span className={styles.roomCard__status}>{getStatusLabel(room)}</span>
                                        {selectedRoom?.id === room.id && (
                                            <span className={styles.roomCard__checkmark}>
                                                <CheckIcon />
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    {selectedBuilding && (
                        <div className={styles.roomReservation__legend}>
                            <div className={styles.legendItem}>
                                <span className={`${styles.legendItem__dot} ${styles.legendItem__available}`}></span>
                                <span>Available</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={`${styles.legendItem__dot} ${styles.legendItem__occupied}`}></span>
                                <span>Occupied</span>
                            </div>
                            <div className={styles.legendItem}>
                                <span className={`${styles.legendItem__dot} ${styles.legendItem__reserved}`}></span>
                                <span>Reserved</span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className={styles.roomReservation__actions}>
                        <Button
                            variant="primary"
                            onClick={handleConfirmRoom}
                            disabled={!selectedRoom}
                        >
                            Confirm Room Selection
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmation}
                title="Room Reserved!"
                onClose={handleCloseConfirmation}
                panelClassName={styles.modal__panel}
            >
                <div className={styles.confirmationModal}>
                    {selectedRoom && (
                        <>
                            <div className={styles.confirmationModal__icon}>
                                <CheckIcon />
                            </div>
                            <h3 className={styles.confirmationModal__title}>
                                {selectedRoom.roomNumber} Reserved
                            </h3>
                            <p className={styles.confirmationModal__details}>
                                <strong>Building:</strong> {selectedRoom.buildingName}<br />
                                <strong>Floor:</strong> {selectedRoom.floor}<br />
                                <strong>Room:</strong> {selectedRoom.roomNumber}
                            </p>
                            <p className={styles.confirmationModal__message}>
                                Your room has been selected. Would you like to schedule an event now?
                            </p>
                            <div className={styles.confirmationModal__actions}>
                                <Button variant="primary" onClick={handleScheduleEvent}>
                                    Schedule Event
                                </Button>
                                <Button variant="ghost" onClick={handleCloseConfirmation}>
                                    I&apos;ll Schedule Later
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </>
    )
}

RoomReservation.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onRoomSelected: PropTypes.func,
    onScheduleEvent: PropTypes.func,
    clubDirectory: PropTypes.array,
    setToastMessage: PropTypes.func,
}

export default RoomReservation
