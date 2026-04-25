import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from './context/AppContext.jsx';
import { UserProvider } from './context/UserContext.jsx';

import './styles/reset.css'
import './styles/fonts.scss'
import './styles/global.module.scss'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(

    <StrictMode>
        <AppProvider>
            <UserProvider>
                <App />
            </UserProvider>
        </AppProvider>
  </StrictMode>
)
