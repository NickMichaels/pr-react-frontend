import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import ProvidersList from './components/ProvidersList'
import ProviderForm from './components/ProviderForm'
import ProviderView from './components/ProviderView'
import PractitionersList from './components/PractitionersList'
import PractitionerView from './components/PractitionerView'
import PractitionerForm from './components/PractitionerForm'
import PatientsList from './components/PatientsList'
import PatientView from './components/PatientView'
import PatientForm from './components/PatientForm'
import PatientReferralView from './components/PatientReferralView'
import PatientReferralForm from './components/PatientReferralForm'
import AddPractitionerToProvider from './components/AddPractitionerToProvider'
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
          path="/providers/:id/practitioners/add"
          element={
            isAuthenticated ? (
              <AddPractitionerToProvider onLogout={handleLogout} />
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
          path="/practitioners"
          element={
            isAuthenticated ? (
              <PractitionersList onLogout={handleLogout} />
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
          path="/patients"
          element={
            isAuthenticated ? (
              <PatientsList onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/patients/new"
          element={
            isAuthenticated ? (
              <PatientForm onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/patients/:id/edit"
          element={
            isAuthenticated ? (
              <PatientForm onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/patients/:id"
          element={
            isAuthenticated ? (
              <PatientView onLogout={handleLogout} />
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
        <Route
          path="/patientreferrals/:id/edit"
          element={
            isAuthenticated ? (
              <PatientReferralForm onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/providers/:providerId/referrals/new"
          element={
            isAuthenticated ? (
              <PatientReferralForm onLogout={handleLogout} />
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

