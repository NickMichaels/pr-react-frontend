import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getToken } from '../utils/auth'

function ProviderView({ onLogout }) {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [provider, setProvider] = useState(null)
  const [practitioners, setPractitioners] = useState([])
  const [referralsSent, setReferralsSent] = useState([])
  const [referralsReceived, setReferralsReceived] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProviderData()
  }, [id])

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
        setReferralsSent(Array.isArray(referralsSentData) ? referralsSentData : [])
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
        setReferralsReceived(Array.isArray(referralsReceivedData) ? referralsReceivedData : [])
      }

    } catch (err) {
      setError(err.message || 'An error occurred while fetching provider data')
    } finally {
      setLoading(false)
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
                    onClick={(e) => { e.preventDefault(); }}
                    class="btn btn-primary me-2"
                  >
                    Add a Practitioner
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); }}
                    class="btn btn-primary me-2"
                  >
                    Send a Patient Referral
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); }}
                    class="btn btn-primary"
                  >
                    Schedule a Patient
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
                        <a href="#" onClick={(e) => { e.preventDefault(); }}>
                          view
                        </a>
                        &nbsp;
                        <a href="#" onClick={(e) => { e.preventDefault(); }}>
                          edit
                        </a>
                        &nbsp;
                        <a href="#" onClick={(e) => { e.preventDefault(); }}>
                          delete
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
          <div class="col-md-6">
            <h3>Patient Referrals Sent</h3>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">Referral Details</th>
                  </tr>
                </thead>
                <tbody>
                  {referralsSent.length === 0 ? (
                    <tr>
                      <td>No referrals sent.</td>
                    </tr>
                  ) : (
                    referralsSent.map((referral, index) => (
                      <tr key={referral.id || index}>
                        <td>
                          {referral.patient_name && <div><strong>Patient:</strong> {referral.patient_name}</div>}
                          {referral.referred_to && <div><strong>Referred To:</strong> {referral.referred_to}</div>}
                          {referral.referred_from && <div><strong>Referred From:</strong> {referral.referred_from}</div>}
                          {referral.date && <div><strong>Date:</strong> {new Date(referral.date).toLocaleDateString()}</div>}
                          {referral.status && <div><strong>Status:</strong> {referral.status}</div>}
                          {referral.reason && <div><strong>Reason:</strong> {referral.reason}</div>}
                          {!referral.patient_name && !referral.referred_to && !referral.date && (
                            <div>{JSON.stringify(referral)}</div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div class="col-md-6">
            <h3>Patient Referrals Received</h3>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">Referral Details</th>
                  </tr>
                </thead>
                <tbody>
                  {referralsReceived.length === 0 ? (
                    <tr>
                      <td>No referrals received.</td>
                    </tr>
                  ) : (
                    referralsReceived.map((referral, index) => (
                      <tr key={referral.id || index}>
                        <td>
                          {referral.patient_name && <div><strong>Patient:</strong> {referral.patient_name}</div>}
                          {referral.referred_to && <div><strong>Referred To:</strong> {referral.referred_to}</div>}
                          {referral.referred_from && <div><strong>Referred From:</strong> {referral.referred_from}</div>}
                          {referral.date && <div><strong>Date:</strong> {new Date(referral.date).toLocaleDateString()}</div>}
                          {referral.status && <div><strong>Status:</strong> {referral.status}</div>}
                          {referral.reason && <div><strong>Reason:</strong> {referral.reason}</div>}
                          {!referral.patient_name && !referral.referred_to && !referral.date && (
                            <div>{JSON.stringify(referral)}</div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProviderView

