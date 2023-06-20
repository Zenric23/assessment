import React from 'react'
import ReactDOM from 'react-dom/client'
import "./index.css"
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import UserProvider from './context/userContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <App />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
