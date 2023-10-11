import './index.css'
import 'react-loading-skeleton/dist/skeleton.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { SkeletonTheme } from 'react-loading-skeleton'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { Main } from './pages/Main'
import { Status } from './pages/Status'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SkeletonTheme baseColor="#0D0D0D" highlightColor="#525252">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/status" element={<Status />} />
        </Routes>
      </BrowserRouter>
    </SkeletonTheme>
  </React.StrictMode>,
)
