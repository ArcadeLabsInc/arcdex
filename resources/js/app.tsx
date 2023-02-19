// import './bootstrap'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
// import { ConnectExample } from './ConnectExample'
import Main from './Main'

const app = document.getElementById('root') as HTMLElement
createRoot(app).render(<Main />)
