import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getToken } from '../utils/auth'

function PatientReferralView({ onLogout }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [referral, setReferral] = useState(null)
  const [enrichedReferral, setEnrichedReferral] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadingNames, setLoadingNames] = useState(false)

  useEffect(() => {
    fetchReferralData()
  }, [id])

  // Helper function to fetch provider name
  const fetchProviderName = async (providerId) => {
    if (!providerId) return null
    try {
      const token = getToken()
      const response = await fetch(`http://127.0.0.1:8000/api/providers/${providerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        return data.name || null
      }
    } catch (err) {
      console.error(`Error fetching provider ${providerId}:`, err)
    }
    return null
  }

  // Helper function to fetch practitioner name
  const fetchPractitionerName = async (practitionerId) => {
    if (!practitionerId) return null
    try {
      const token = getToken()
      const response = await fetch(`http://127.0.0.1:8000/api/practicioners/${practitionerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        return data.name || null
      }
    } catch (err) {
      console.error(`Error fetching practitioner ${practitionerId}:`, err)
    }
    return null
  }

  // Helper function to fetch patient name
  const fetchPatientName = async (patientId) => {
    if (!patientId) return null
    try {
      const token = getToken()
      const response = await fetch(`http://127.0.0.1:8000/api/patients/${patientId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        return data.name || null
      }
    } catch (err) {
      console.error(`Error fetching patient ${patientId}:`, err)
    }
    return null
  }

  // Enrich referral with names
  const enrichReferral = async (referralData) => {
    if (!referralData) return null

    setLoadingNames(true)
    const enriched = { ...referralData }

    // Fetch all names in parallel
    const [patientName, sendingProviderName, receivingProviderName, sendingPractitionerName, receivingPractitionerName] = await Promise.all([
      referralData.patient ? fetchPatientName(referralData.patient) : Promise.resolve(null),
      referralData.sendingProvider ? fetchProviderName(referralData.sendingProvider) : Promise.resolve(null),
      referralData.receivingProvider ? fetchProviderName(referralData.receivingProvider) : Promise.resolve(null),
      referralData.sendingPracticioner ? fetchPractitionerName(referralData.sendingPracticioner) : Promise.resolve(null),
      referralData.receivingPracticioner ? fetchPractitionerName(referralData.receivingPracticioner) : Promise.resolve(null),
    ])

    enriched.patientName = patientName
    enriched.sendingProviderName = sendingProviderName
    enriched.receivingProviderName = receivingProviderName
    enriched.sendingPractitionerName = sendingPractitionerName
    enriched.receivingPractitionerName = receivingPractitionerName

    setLoadingNames(false)
    return enriched
  }

  const fetchReferralData = async () => {
    setLoading(true)
    setError('')

    try {
      const token = getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Fetch referral details
      const referralResponse = await fetch(`http://127.0.0.1:8000/api/patientreferrals/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!referralResponse.ok) {
        if (referralResponse.status === 401) {
          throw new Error('Authentication failed. Please login again.')
        }
        throw new Error('Failed to fetch patient referral')
      }

      const referralData = await referralResponse.json()
      setReferral(referralData)

      // Enrich referral with names
      const enriched = await enrichReferral(referralData)
      setEnrichedReferral(enriched)

    } catch (err) {
      setError(err.message || 'An error occurred while fetching patient referral data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading && !referral) {
    return (
      <div class="container-fluid">
        <div className="loading-message">Loading patient referral...</div>
      </div>
    )
  }

  if (error && !referral) {
    return (
      <div class="container-fluid">
        <div className="error-message">
          {error}
          <button onClick={fetchReferralData} class="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const displayData = enrichedReferral || referral

  return (
    <div class="container-fluid">
      <nav class="navbar bg-primary navbar-expand-lg" data-bs-theme="dark">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">Patient Referrals</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/providers') }}>
                  All Healthcare Providers
                </a>
              </li>
            </ul>
            <button onClick={onLogout} class="btn btn-primary">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div class="container-fluid mt-4">
        {error && (
          <div class="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Patient Referral Details Section */}
        {displayData && (
          <div class="mb-4">
            <h2>Patient Referral Details</h2>
            <div class="card">
              <div class="card-body">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <strong>Patient:</strong> {displayData.patientName || (displayData.patient ? `ID: ${displayData.patient} ${loadingNames ? '(loading...)' : ''}` : 'N/A')}
                  </div>
                  <div class="col-md-6">
                    <strong>Status:</strong> {displayData.status || 'N/A'}
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <strong>Sending Provider:</strong> {displayData.sendingProviderName || (displayData.sendingProvider ? `ID: ${displayData.sendingProvider} ${loadingNames ? '(loading...)' : ''}` : 'N/A')}
                  </div>
                  <div class="col-md-6">
                    <strong>Receiving Provider:</strong> {displayData.receivingProviderName || (displayData.receivingProvider ? `ID: ${displayData.receivingProvider} ${loadingNames ? '(loading...)' : ''}` : 'N/A')}
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <strong>Sending Practitioner:</strong> {displayData.sendingPractitionerName || (displayData.sendingPracticioner ? `ID: ${displayData.sendingPracticioner} ${loadingNames ? '(loading...)' : ''}` : 'N/A')}
                  </div>
                  <div class="col-md-6">
                    <strong>Receiving Practitioner:</strong> {displayData.receivingPractitionerName || (displayData.receivingPracticioner ? `ID: ${displayData.receivingPracticioner} ${loadingNames ? '(loading...)' : ''}` : 'N/A')}
                  </div>
                </div>
                {displayData.dateSent && (
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <strong>Date Sent:</strong> {formatDate(displayData.dateSent)}
                    </div>
                  </div>
                )}
                {displayData.reason && (
                  <div class="row mb-3">
                    <div class="col-md-12">
                      <strong>Reason:</strong> {displayData.reason}
                    </div>
                  </div>
                )}
                {displayData.notes && (
                  <div class="row mb-3">
                    <div class="col-md-12">
                      <strong>Notes:</strong> {displayData.notes}
                    </div>
                  </div>
                )}
                {displayData.priority && (
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <strong>Priority:</strong> {displayData.priority}
                    </div>
                  </div>
                )}
                {displayData.dateReceived && (
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <strong>Date Received:</strong> {formatDate(displayData.dateReceived)}
                    </div>
                  </div>
                )}
                {displayData.id && (
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <strong>Referral ID:</strong> {displayData.id}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientReferralView
