import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getToken } from '../utils/auth'

function PatientForm({ onLogout }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const isEditMode = !!id

    const [formData, setFormData] = useState({
        name: '',
        data: '',
        email: '',
        phone: ''
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if (isEditMode) {
            fetchPatient()
        }
    }, [id])

    const fetchPatient = async () => {
        setLoading(true)
        setError('')

        try {
            const token = getToken()
            if (!token) {
                throw new Error('No authentication token found')
            }

            const response = await fetch(`http://127.0.0.1:8000/api/patients/${id}`, {
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
                throw new Error('Failed to fetch patient')
            }

            const data = await response.json()
            setFormData({
                name: data.name || '',
                job_title: data.jobTitle || '',
                license_number: data.licenseNumber || '',
                specialty: data.specialty || '',
                email: data.email || '',
                phone: data.phone || ''
            })
        } catch (err) {
            setError(err.message || 'An error occurred while fetching patient')
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
            if (formData.data) requestBody.data = JSON.parse(formData.data)
            if (formData.email) requestBody.email = formData.email
            if (formData.phone) requestBody.phone = formData.phone

            const url = isEditMode
                ? `http://127.0.0.1:8000/api/patients/${id}`
                : 'http://127.0.0.1:8000/api/patients'

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
                throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} patient`)
            }

            setSuccess(`Patient ${isEditMode ? 'updated' : 'created'} successfully!`)

            // Redirect to patients list after a short delay
            setTimeout(() => {
                navigate('/patients')
            }, 1500)
        } catch (err) {
            setError(err.message || `An error occurred while ${isEditMode ? 'updating' : 'creating'} patient`)
        } finally {
            setLoading(false)
        }
    }

    if (isEditMode && loading && !formData.name) {
        return (
            <div class="container-fluid">
                <div className="loading-message">Loading patient...</div>
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
                                <a class="nav-link" href="#" onClick={(e) => { e.preventDefault(); navigate('/patients') }}>
                                    {isEditMode ? 'Update Patient' : 'Create New Patient'}
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
                        <h2>{isEditMode ? 'Update Patient' : 'Create New Patient'}</h2>

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
                                <label for="name" class="form-label">Patient Name *</label>
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
                                <label for="data" class="form-label">Patient Data</label>
                                <textarea
                                    class="form-control"
                                    id="data"
                                    name="data"
                                    value={JSON.stringify(formData.data)}
                                    onChange={handleChange}
                                    placeholder="{ JSON please }"
                                />
                            </div>

                            <div class="mb-3">
                                <button
                                    type="submit"
                                    class="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : (isEditMode ? 'Update Patient' : 'Create Patient')}
                                </button>
                                <button
                                    type="button"
                                    class="btn btn-secondary ms-2"
                                    onClick={() => navigate('/patients')}
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

export default PatientForm

