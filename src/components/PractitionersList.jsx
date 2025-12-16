import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../utils/auth'

function PractitionersList({ onLogout }) {
    const navigate = useNavigate()
    const [practitioners, setPractitioners] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteError, setDeleteError] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        fetchPractitioners()
    }, [])

    const fetchPractitioners = async () => {
        setLoading(true)
        setError('')

        try {
            const token = getToken()
            if (!token) {
                throw new Error('No authentication token found')
            }

            const response = await fetch('http://127.0.0.1:8000/api/practitioners', {
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

    const handleDeletePractitioner = async (practitionerId) => {
        if (!practitionerId) return

        const confirmed = window.confirm('Are you sure you want to delete this practitioner? This action cannot be undone.')
        if (!confirmed) {
            return
        }

        try {
            setDeleteError('')
            const token = getToken()
            if (!token) {
                throw new Error('No authentication token found')
            }

            const response = await fetch(`http://127.0.0.1:8000/api/practitioners/${practitionerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Failed to delete practitioner')
            }

            // Remove from list
            setPractitioners(prev => prev.filter(practitioner => practitioner.id !== practitionerId))
        } catch (err) {
            setDeleteError(err.message || 'Failed to delete practitioner')
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
                                <a class="nav-link active" aria-current="page" href="#">All Healthcare Practitioners</a>
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
                        onClick={() => navigate('/practitioners/new')}
                        class="btn btn-primary"
                    >
                        Create New Practitioner
                    </button>
                </div>

                {loading && (
                    <div className="loading-message">Loading practitioners...</div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                        <button onClick={fetchPractitioners} class="btn btn-primary">
                            Retry
                        </button>
                    </div>
                )}


                {deleteError && (
                    <div class="alert alert-danger" role="alert">
                        {deleteError}
                    </div>
                )}

                {!loading && !error && practitioners.length === 0 && (
                    <div className="empty-message">No practitioners found.</div>
                )}

                {!loading && !error && practitioners.length > 0 && (

                    <div class="container-fluid">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">Practitioner Name</th>
                                    <th scope="col">actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {practitioners.map((practitioner) => (
                                    <tr key={practitioner.id}>
                                        <td scope="row">{practitioner.name}</td>
                                        <td>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    navigate(`/practitioners/${practitioner.id}`)
                                                }}
                                            >
                                                view
                                            </a>
                                            &nbsp;
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    navigate(`/practitioners/${practitioner.id}/edit`)
                                                }}
                                            >
                                                edit
                                            </a>
                                            &nbsp;
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handleDeletePractitioner(practitioner.id)
                                                }}
                                            >delete</a>
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

export default PractitionersList

