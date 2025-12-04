import { useState, useEffect } from 'react'
import { getToken } from '../utils/auth'
import './ProvidersList.css'

function ProvidersList({ onLogout }) {
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
    <div className="providers-container">
      <header className="providers-header">
        <h1>Healthcare Providers</h1>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </header>

      <div className="providers-content">
        {loading && (
          <div className="loading-message">Loading providers...</div>
        )}

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchProviders} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && providers.length === 0 && (
          <div className="empty-message">No providers found.</div>
        )}

        {!loading && !error && providers.length > 0 && (
          <div className="providers-grid">
            {providers.map((provider) => (
              <div key={provider.id} className="provider-card">
                <h2 className="provider-name">{provider.name}</h2>
                {provider.specialty && (
                  <div className="provider-specialty">{provider.specialty}</div>
                )}
                <div className="provider-details">
                  <div className="detail-row">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">
                      {provider.addressLine1}
                      {provider.addressLine2 && `, ${provider.addressLine2}`}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">City, State ZIP:</span>
                    <span className="detail-value">
                      {provider.city}, {provider.state} {provider.zip}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">
                      <a href={`mailto:${provider.email}`}>{provider.email}</a>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">
                      <a href={`tel:${provider.phone}`}>{provider.phone}</a>
                    </span>
                  </div>
                  {provider.createdAt && (
                    <div className="detail-row">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">
                        {formatDate(provider.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProvidersList

