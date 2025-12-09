import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import ProvidersList from './components/ProvidersList'
import ProviderForm from './components/ProviderForm'
import ProviderView from './components/ProviderView'
import PractitionerView from './components/PractitionerView'
import PractitionerForm from './components/PractitionerForm'
import PatientReferralView from './components/PatientReferralView'
import { getToken } from './utils/auth'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const token = getToken()
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('jwt_token')
    setIsAuthenticated(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/providers" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/providers"
          element={
            isAuthenticated ? (
              <ProvidersList onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/providers/new"
          element={
            isAuthenticated ? (
              <ProviderForm onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/providers/:id/edit"
          element={
            isAuthenticated ? (
              <ProviderForm onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/providers/:id"
          element={
            isAuthenticated ? (
              <ProviderView onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/practitioners/new"
          element={
            isAuthenticated ? (
              <PractitionerForm onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/practitioners/:id/edit"
          element={
            isAuthenticated ? (
              <PractitionerForm onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/practitioners/:id"
          element={
            isAuthenticated ? (
              <PractitionerView onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/patientreferrals/:id"
          element={
            isAuthenticated ? (
              <PatientReferralView onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to="/providers" replace />} />
      </Routes>
    </Router>
  )
}

export default App

