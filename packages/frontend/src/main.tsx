import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import { App } from './App'
import { getConfig } from './config'

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const config = getConfig(import.meta.env.VITE_DEPLOYMENT_ENV ?? 'staging')

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App config={config} />
  </React.StrictMode>,
)
