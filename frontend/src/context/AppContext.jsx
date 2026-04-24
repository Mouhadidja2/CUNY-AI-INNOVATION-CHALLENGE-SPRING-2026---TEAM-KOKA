import { createContext, useMemo, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
	const [appTitle, setAppTitle] = useState('Club Builder')

	const value = useMemo(
		() => ({
			appTitle,
			setAppTitle,
		}),
		[appTitle],
	)

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
