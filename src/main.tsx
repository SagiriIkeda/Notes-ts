import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import '../css/Notes.css'
// import '../css/Preloader.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

document.body.classList.add("loaded");
