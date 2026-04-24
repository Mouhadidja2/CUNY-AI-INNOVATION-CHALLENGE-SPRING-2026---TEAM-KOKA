import { createContext, useMemo, useState } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
	const [user, setUser] = useState({
		name: 'Guest',
		isAuthenticated: false,
	})

	const value = useMemo(
		() => ({
			user,
			setUser,
		}),
		[user],
	)

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
