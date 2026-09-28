import React from 'react'
import ReactDOM from 'react-dom/client'

import '@fontsource/anton/400'
import '@fontsource/barlow/400'
import '@fontsource/barlow/500'
import '@fontsource/barlow/600'
import '@fontsource/barlow/400-italic'
import '@fontsource/chivo-mono/400'
import '@fontsource/chivo-mono/500'
import './index.css'

import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
