import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../utils/auth'
//import './ProvidersList.css'

function ProvidersList({ onLogout }) {
  const navigate = useNavigate()
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    setLoading(true)
    setError('')

    try {
      const token = getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('http://127.0.0.1:8000/api/providers', {
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
        throw new Error('Failed to fetch providers')
      }

      const data = await response.json()
      setProviders(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'An error occurred while fetching providers')
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
                <a class="nav-link active" aria-current="page" href="#">All Healthcare Providers</a>
              </li>
            </ul>
            <button onClick={onLogout} class="btn btn-primary">
              Logout
            </button>
          </div>
        </div>
      </nav>


      <div class="container-fluid mt-4">
        <div class="mb-3">
          <button
            onClick={() => navigate('/providers/new')}
            class="btn btn-primary"
          >
            Create New Provider
          </button>
        </div>

        {loading && (
          <div className="loading-message">Loading providers...</div>
        )}

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchProviders} class="btn btn-primary">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && providers.length === 0 && (
          <div className="empty-message">No providers found.</div>
        )}

        {!loading && !error && providers.length > 0 && (

          <div class="container-fluid">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Provider Name</th>
                  <th scope="col">actions</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id}>
                    <td scope="row">{provider.name}</td>
                    <td>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          navigate(`/providers/${provider.id}`)
                        }}
                      >
                        view
                      </a>
                      &nbsp;
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          navigate(`/providers/${provider.id}/edit`)
                        }}
                      >
                        edit
                      </a>
                      &nbsp;
                      <a href="#">delete</a>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProvidersList

