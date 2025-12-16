import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getToken } from '../utils/auth'

function AddPractitionerToProvider({ onLogout }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [practitioners, setPractitioners] = useState([])
  const [selectedPractitioner, setSelectedPractitioner] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPractitioners, setLoadingPractitioners] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchPractitioners()
  }, [])

  const fetchPractitioners = async () => {
    setLoadingPractitioners(true)
    setError('')

    try {
      const token = getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('http://127.0.0.1:8000/api/practicioners/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.')
        }
        throw new Error('Failed to fetch practitioners')
      }

      const data = await response.json()
      setPractitioners(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'An error occurred while fetching practitioners')
    } finally {
      setLoadingPractitioners(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!selectedPractitioner) {
      setError('Please select a practitioner')
      setLoading(false)
      return
    }

    try {
      const token = getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const payload = {
        practicioner_id: selectedPractitioner
      }

      const response = await fetch(`http://127.0.0.1:8000/api/providers/${id}/add_practicioner`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to add practitioner to provider')
      }

      setSuccess('Practitioner added successfully!')

      // Redirect to provider view after a short delay
      setTimeout(() => {
        navigate(`/providers/${id}`)
      }, 1500)
    } catch (err) {
      setError(err.message || 'An error occurred while adding practitioner')
    } finally {
      setLoading(false)
    }
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
        <div class="row">
          <div class="col-md-8 offset-md-2">
            <h2>Add Practitioner to Provider</h2>

            {error && (
              <div class="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div class="alert alert-success" role="alert">
                {success}
              </div>
            )}

            {loadingPractitioners ? (
              <div className="loading-message">Loading practitioners...</div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div class="mb-3">
                  <label for="practitioner" class="form-label">Select Practitioner *</label>
                  <select
                    class="form-select"
                    id="practitioner"
                    value={selectedPractitioner}
                    onChange={(e) => setSelectedPractitioner(e.target.value)}
                    required
                  >
                    <option value="">-- Select a practitioner --</option>
                    {practitioners.map((practitioner) => (
                      <option key={practitioner.id} value={practitioner.id}>
                        {practitioner.name || `Practitioner ${practitioner.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div class="mb-3">
                  <button
                    type="submit"
                    class="btn btn-primary"
                    disabled={loading || !selectedPractitioner}
                  >
                    {loading ? 'Adding...' : 'Add Practitioner'}
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary ms-2"
                    onClick={() => navigate(`/providers/${id}`)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddPractitionerToProvider

