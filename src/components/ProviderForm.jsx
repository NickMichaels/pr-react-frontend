import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getToken } from '../utils/auth'
import NavBar from './NavBar'

function ProviderForm({ onLogout }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [formData, setFormData] = useState({
    name: '',
    address_line1: '',
    city: '',
    state: '',
    zip: '',
    email: '',
    phone: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isEditMode) {
      fetchProvider()
    }
  }, [id])

  const fetchProvider = async () => {
    setLoading(true)
    setError('')

    try {
      const token = getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`http://127.0.0.1:8000/api/providers/${id}`, {
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
        throw new Error('Failed to fetch provider')
      }

      const data = await response.json()
      setFormData({
        name: data.name || '',
        address_line1: data.address_line1 || '',
        city: data.city || '',
        state: data.state || '',
        zip: parseInt(data.zip) || '',
        email: data.email || '',
        phone: data.phone || ''
      })
    } catch (err) {
      setError(err.message || 'An error occurred while fetching provider')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const token = getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Prepare request body - only include fields that have values
      const requestBody = {}
      if (formData.name) requestBody.name = formData.name
      if (formData.address_line1) requestBody.address_line1 = formData.address_line1
      if (formData.city) requestBody.city = formData.city
      if (formData.state) requestBody.state = formData.state
      if (formData.zip) requestBody.zip = parseInt(formData.zip)
      if (formData.email) requestBody.email = formData.email
      if (formData.phone) requestBody.phone = formData.phone

      const url = isEditMode
        ? `http://127.0.0.1:8000/api/providers/${id}`
        : 'http://127.0.0.1:8000/api/providers'

      const method = isEditMode ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} provider`)
      }

      setSuccess(`Provider ${isEditMode ? 'updated' : 'created'} successfully!`)

      // Redirect to providers list after a short delay
      setTimeout(() => {
        navigate('/providers')
      }, 1500)
    } catch (err) {
      setError(err.message || `An error occurred while ${isEditMode ? 'updating' : 'creating'} provider`)
    } finally {
      setLoading(false)
    }
  }

  if (isEditMode && loading && !formData.name) {
    return (
      <div class="container-fluid">
        <div className="loading-message">Loading provider...</div>
      </div>
    )
  }

  return (
    <div class="container-fluid">
      <NavBar onLogout={onLogout} />

      <div class="container-fluid mt-4">
        <div class="row">
          <div class="col-md-8 offset-md-2">
            <h2>{isEditMode ? 'Update Provider' : 'Create New Provider'}</h2>

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

            <form onSubmit={handleSubmit}>
              <div class="mb-3">
                <label for="name" class="form-label">Provider Name *</label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div class="mb-3">
                <label for="address_line1" class="form-label">Address Line 1</label>
                <input
                  type="text"
                  class="form-control"
                  id="address_line1"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                />
              </div>

              <div class="mb-3">
                <label for="city" class="form-label">City</label>
                <input
                  type="text"
                  class="form-control"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div class="mb-3">
                <label for="state" class="form-label">State</label>
                <input
                  type="text"
                  class="form-control"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  maxLength="2"
                  placeholder="e.g., CO"
                />
              </div>

              <div class="mb-3">
                <label for="zip" class="form-label">ZIP Code</label>
                <input
                  type="text"
                  class="form-control"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                />
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div class="mb-3">
                <label for="phone" class="form-label">Phone</label>
                <input
                  type="tel"
                  class="form-control"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., 123-415-9876"
                />
              </div>

              <div class="mb-3">
                <button
                  type="submit"
                  class="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (isEditMode ? 'Update Provider' : 'Create Provider')}
                </button>
                <button
                  type="button"
                  class="btn btn-secondary ms-2"
                  onClick={() => navigate('/providers')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProviderForm


