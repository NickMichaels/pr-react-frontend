import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getToken } from '../utils/auth'
import PatientReferralsSent from './PatientReferralsSent'
import PatientReferralsReceived from './PatientReferralsReceived'

function ProviderView({ onLogout }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [provider, setProvider] = useState(null)
  const [practitioners, setPractitioners] = useState([])
  const [referralsSent, setReferralsSent] = useState([])
  const [referralsReceived, setReferralsReceived] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [loadingNames, setLoadingNames] = useState(false)

  useEffect(() => {
    fetchProviderData()
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
  const enrichReferral = async (referral) => {
    const enriched = { ...referral }

    // Fetch all names in parallel
    const [patientName, sendingProviderName, receivingProviderName, sendingPractitionerName, receivingPractitionerName] = await Promise.all([
      referral.patient ? fetchPatientName(referral.patient) : Promise.resolve(null),
      referral.sendingProvider ? fetchProviderName(referral.sendingProvider) : Promise.resolve(null),
      referral.receivingProvider ? fetchProviderName(referral.receivingProvider) : Promise.resolve(null),
      referral.sendingPracticioner ? fetchPractitionerName(referral.sendingPracticioner) : Promise.resolve(null),
      referral.receivingPracticioner ? fetchPractitionerName(referral.receivingPracticioner) : Promise.resolve(null),
    ])

    enriched.patientName = patientName
    enriched.sendingProviderName = sendingProviderName
    enriched.receivingProviderName = receivingProviderName
    enriched.sendingPractitionerName = sendingPractitionerName
    enriched.receivingPractitionerName = receivingPractitionerName

    return enriched
  }

  const fetchProviderData = async () => {
    setLoading(true)
    setError('')

    try {
      const token = getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Fetch provider details
      const providerResponse = await fetch(`http://127.0.0.1:8000/api/providers/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!providerResponse.ok) {
        if (providerResponse.status === 401) {
          throw new Error('Authentication failed. Please login again.')
        }
        throw new Error('Failed to fetch provider')
      }

      const providerData = await providerResponse.json()
      setProvider(providerData)

      // Fetch practitioners
      const practitionersResponse = await fetch(`http://127.0.0.1:8000/api/providers/${id}/practicioners`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (practitionersResponse.ok) {
        const practitionersData = await practitionersResponse.json()
        setPractitioners(Array.isArray(practitionersData) ? practitionersData : [])
      }

      // Fetch referrals sent
      const referralsSentResponse = await fetch(`http://127.0.0.1:8000/api/providers/${id}/referrals_sent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (referralsSentResponse.ok) {
        const referralsSentData = await referralsSentResponse.json()
        const referralsArray = Array.isArray(referralsSentData) ? referralsSentData : []
        setReferralsSent(referralsArray)

        // Enrich referrals with names
        if (referralsArray.length > 0) {
          setLoadingNames(true)
          const enrichedReferrals = await Promise.all(
            referralsArray.map(referral => enrichReferral(referral))
          )
          setReferralsSent(enrichedReferrals)
          setLoadingNames(false)
        }
      }

      // Fetch referrals received
      const referralsReceivedResponse = await fetch(`http://127.0.0.1:8000/api/providers/${id}/referrals_received`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (referralsReceivedResponse.ok) {
        const referralsReceivedData = await referralsReceivedResponse.json()
        const referralsArray = Array.isArray(referralsReceivedData) ? referralsReceivedData : []
        setReferralsReceived(referralsArray)

        // Enrich referrals with names
        if (referralsArray.length > 0) {
          setLoadingNames(true)
          const enrichedReferrals = await Promise.all(
            referralsArray.map(referral => enrichReferral(referral))
          )
          setReferralsReceived(enrichedReferrals)
          setLoadingNames(false)
        }
      }

    } catch (err) {
      setError(err.message || 'An error occurred while fetching provider data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReferral = async (referralId) => {
    if (!referralId) return

    const confirmed = window.confirm('Are you sure you want to delete this patient referral? This action cannot be undone.')
    if (!confirmed) {
      return
    }

    try {
      setDeleteError('')
      const token = getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`http://127.0.0.1:8000/api/patientreferrals/${referralId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to delete patient referral')
      }

      // Optimistically remove from both sent and received lists
      setReferralsSent(prev => prev.filter(referral => referral.id !== referralId))
      setReferralsReceived(prev => prev.filter(referral => referral.id !== referralId))
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete patient referral')
    }
  }

  const handleRemovePractitioner = async (providerId, practitionerId) => {
    if (!providerId) return
    if (!practitionerId) return

    const confirmed = window.confirm('Are you sure you want to remove this practitioner from this provider? This action cannot be undone.')
    if (!confirmed) {
      return
    }

    try {
      setDeleteError('')
      const token = getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }


      const payload = {
        "practicioner_id": practitionerId
      }

      const response = await fetch(`http://127.0.0.1:8000/api/providers/${providerId}/remove_practicioner`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to remove practitioner from provider')
      }

      // Remove from list
      setPractitioners(prev => prev.filter(practitioner => practitioner.id !== practitionerId))
    } catch (err) {
      setDeleteError(err.message || 'Failed to remove practitioner from provider')
    }
  }

  if (loading && !provider) {
    return (
      <div class="container-fluid">
        <div className="loading-message">Loading provider...</div>
      </div>
    )
  }

  if (error && !provider) {
    return (
      <div class="container-fluid">
        <div className="error-message">
          {error}
          <button onClick={fetchProviderData} class="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    )
  }

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
                  Provider Details
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

        {deleteError && (
          <div class="alert alert-danger" role="alert">
            {deleteError}
          </div>
        )}

        {/* Provider Details Section */}
        {provider && (
          <div class="mb-4">
            <h2>Provider Details</h2>
            <div class="card">
              <div class="card-body">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <strong>Name:</strong> {provider.name || 'N/A'}
                  </div>
                  <div class="col-md-6">
                    <strong>Email:</strong> {provider.email || 'N/A'}
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <strong>Phone:</strong> {provider.phone || 'N/A'}
                  </div>
                  <div class="col-md-6">
                    <strong>Address:</strong> {provider.address_line1 || 'N/A'}
                  </div>
                </div>
                <div class="row mb-3">
                  <div class="col-md-4">
                    <strong>City:</strong> {provider.city || 'N/A'}
                  </div>
                  <div class="col-md-4">
                    <strong>State:</strong> {provider.state || 'N/A'}
                  </div>
                  <div class="col-md-4">
                    <strong>ZIP:</strong> {provider.zip || 'N/A'}
                  </div>
                </div>
                <div class="mt-3">
                  <button
                    onClick={() => navigate(`/providers/${id}/edit`)}
                    class="btn btn-primary me-2"
                  >
                    Edit Provider
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(`/providers/${id}/practitioners/add`)
                    }}
                    class="btn btn-primary me-2"
                  >
                    Add a Practitioner
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(`/providers/${id}/referrals/new`)
                    }}
                    class="btn btn-primary me-2"
                  >
                    Send a Patient Referral
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Practitioners Table Section */}
        <div class="mb-4">
          <h3>Associated Practitioners</h3>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {practitioners.length === 0 ? (
                  <tr>
                    <td colSpan="2">No practitioners found.</td>
                  </tr>
                ) : (
                  practitioners.map((practitioner) => (
                    <tr key={practitioner.id}>
                      <td>{practitioner.name || 'N/A'}</td>
                      <td>
                        <a href="#" onClick={(e) => {
                          e.preventDefault()
                          navigate(`/practitioners/${practitioner.id}`)
                        }}>
                          view
                        </a>
                        &nbsp;
                        <a href="#" onClick={(e) => {
                          e.preventDefault()
                          navigate(`/practitioners/${practitioner.id}/edit`)
                        }}>
                          edit
                        </a>
                        &nbsp;
                        <a href="#" onClick={(e) => {
                          e.preventDefault();
                          handleRemovePractitioner(id, practitioner.id)
                        }}>
                          remove
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Referrals Section - Split 50/50 */}
        <div class="row mb-4">
          <PatientReferralsSent
            referralsSent={referralsSent}
            onDeleteReferral={handleDeleteReferral}
          />
          <PatientReferralsReceived
            referralsReceived={referralsReceived}
            onDeleteReferral={handleDeleteReferral}
          />
        </div>
      </div>
    </div>
  )
}

export default ProviderView

