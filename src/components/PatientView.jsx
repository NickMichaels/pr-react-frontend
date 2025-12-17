import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getToken } from '../utils/auth'
import NavBar from './NavBar'

function PatientView({ onLogout }) {
    const { id } = useParams()
    const navigate = useNavigate()

    const [patient, setPatient] = useState(null)
    const [referralsSent, setReferralsSent] = useState([])
    const [referralsReceived, setReferralsReceived] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchPatientData()
    }, [id])

    const fetchPatientData = async () => {
        setLoading(true)
        setError('')

        try {
            const token = getToken()
            if (!token) {
                throw new Error('No authentication token found')
            }

            // Fetch provider details
            const patientResponse = await fetch(`http://127.0.0.1:8000/api/patients/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!patientResponse.ok) {
                if (patientResponse.status === 401) {
                    throw new Error('Authentication failed. Please login again.')
                }
                throw new Error('Failed to fetch patient')
            }

            const patientData = await patientResponse.json()
            setPatient(patientData)

        } catch (err) {
            setError(err.message || 'An error occurred while fetching patient data')
        } finally {
            setLoading(false)
        }
    }

    if (loading && !patient) {
        return (
            <div class="container-fluid">
                <div className="loading-message">Loading patient...</div>
            </div>
        )
    }

    if (error && !patient) {
        return (
            <div class="container-fluid">
                <div className="error-message">
                    {error}
                    <button onClick={fetchPatientData} class="btn btn-primary">
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div class="container-fluid">
            <NavBar onLogout={onLogout} />

            <div class="container-fluid mt-4">
                {error && (
                    <div class="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
                {/* Patient Details Section */}
                {patient && (
                    <div class="mb-4">
                        <h2>Patient Details</h2>
                        <div class="card">
                            <div class="card-body">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <strong>Name:</strong> {patient.name || 'N/A'}
                                    </div>
                                    <div class="col-md-6">
                                        <strong>Email:</strong> {patient.email || 'N/A'}
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <strong>Phone:</strong> {patient.phone || 'N/A'}
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <strong>Data</strong> {JSON.stringify(patient.data) || 'N/A'}
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <button
                                        onClick={() => navigate(`/patients/${id}/edit`)}
                                        class="btn btn-primary me-2"
                                    >
                                        Edit Patient
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PatientView

