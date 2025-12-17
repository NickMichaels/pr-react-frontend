import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../utils/auth'
import NavBar from './NavBar'

function PatientsList({ onLogout }) {
    const navigate = useNavigate()
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteError, setDeleteError] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        fetchPatients()
    }, [])

    const fetchPatients = async () => {
        setLoading(true)
        setError('')

        try {
            const token = getToken()
            if (!token) {
                throw new Error('No authentication token found')
            }

            const response = await fetch('http://127.0.0.1:8000/api/patients', {
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
                throw new Error('Failed to fetch patients')
            }

            const data = await response.json()
            setPatients(Array.isArray(data) ? data : [])
        } catch (err) {
            setError(err.message || 'An error occurred while fetching patients')
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

    const handleDeletePatient = async (patientId) => {
        if (!patientId) return

        const confirmed = window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')
        if (!confirmed) {
            return
        }

        try {
            setDeleteError('')
            const token = getToken()
            if (!token) {
                throw new Error('No authentication token found')
            }

            const response = await fetch(`http://127.0.0.1:8000/api/patients/${patientId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Failed to delete patient')
            }

            // Remove from list
            setPatients(prev => prev.filter(patient => patient.id !== patientId))
        } catch (err) {
            setDeleteError(err.message || 'Failed to delete patient')
        }
    }

    return (
        <div class="container-fluid">
            <NavBar onLogout={onLogout} />

            <div class="container-fluid mt-4">
                <div class="mb-3">
                    <button
                        onClick={() => navigate('/patients/new')}
                        class="btn btn-primary"
                    >
                        Create New Patient
                    </button>
                </div>

                {loading && (
                    <div className="loading-message">Loading patients...</div>
                )}

                {error && (
                    <div className="error-message">
                        {error}
                        <button onClick={fetchPatients} class="btn btn-primary">
                            Retry
                        </button>
                    </div>
                )}


                {deleteError && (
                    <div class="alert alert-danger" role="alert">
                        {deleteError}
                    </div>
                )}

                {!loading && !error && patients.length === 0 && (
                    <div className="empty-message">No patients found.</div>
                )}

                {!loading && !error && patients.length > 0 && (

                    <div class="container-fluid">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">Patient Name</th>
                                    <th scope="col">actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td scope="row">{patient.name}</td>
                                        <td>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    navigate(`/patients/${patient.id}`)
                                                }}
                                            >
                                                view
                                            </a>
                                            &nbsp;
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    navigate(`/patients/${patient.id}/edit`)
                                                }}
                                            >
                                                edit
                                            </a>
                                            &nbsp;
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handleDeletePatient(patient.id)
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

export default PatientsList

