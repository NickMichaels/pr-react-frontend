import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getToken } from '../utils/auth'
import PatientReferralsSent from './PatientReferralsSent'
import PatientReferralsReceived from './PatientReferralsReceived'
import NavBar from './NavBar'

function PractitionerView({ onLogout }) {
    const { id } = useParams()
    const navigate = useNavigate()

    const [practitioner, setPractitioner] = useState(null)
    const [referralsSent, setReferralsSent] = useState([])
    const [referralsReceived, setReferralsReceived] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [loadingNames, setLoadingNames] = useState(false)

    useEffect(() => {
        fetchPractitionerData()
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
            const response = await fetch(`http://127.0.0.1:8000/api/practitioners/${practitionerId}`, {
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
            referral.sendingPractitioner ? fetchPractitionerName(referral.sendingPractitioner) : Promise.resolve(null),
            referral.receivingPractitioner ? fetchPractitionerName(referral.receivingPractitioner) : Promise.resolve(null),
        ])

        enriched.patientName = patientName
        enriched.sendingProviderName = sendingProviderName
        enriched.receivingProviderName = receivingProviderName
        enriched.sendingPractitionerName = sendingPractitionerName
        enriched.receivingPractitionerName = receivingPractitionerName

        return enriched
    }

    const fetchPractitionerData = async () => {
        setLoading(true)
        setError('')

        try {
            const token = getToken()
            if (!token) {
                throw new Error('No authentication token found')
            }

            // Fetch provider details
            const practitionerResponse = await fetch(`http://127.0.0.1:8000/api/practitioners/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!practitionerResponse.ok) {
                if (practitionerResponse.status === 401) {
                    throw new Error('Authentication failed. Please login again.')
                }
                throw new Error('Failed to fetch practitioner')
            }

            const practitionerData = await practitionerResponse.json()
            setPractitioner(practitionerData)

            // Fetch referrals sent
            const referralsSentResponse = await fetch(`http://127.0.0.1:8000/api/practitioners/${id}/referrals_sent`, {
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
            const referralsReceivedResponse = await fetch(`http://127.0.0.1:8000/api/practitioners/${id}/referrals_received`, {
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
            setError(err.message || 'An error occurred while fetching practitioner data')
        } finally {
            setLoading(false)
        }
    }

    if (loading && !practitioner) {
        return (
            <div class="container-fluid">
                <div className="loading-message">Loading practitioner...</div>
            </div>
        )
    }

    if (error && !practitioner) {
        return (
            <div class="container-fluid">
                <div className="error-message">
                    {error}
                    <button onClick={fetchPractitionerData} class="btn btn-primary">
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
                {/* Practitioner Details Section */}
                {practitioner && (
                    <div class="mb-4">
                        <h2>Practitioner Details</h2>
                        <div class="card">
                            <div class="card-body">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <strong>Name:</strong> {practitioner.name || 'N/A'}
                                    </div>
                                    <div class="col-md-6">
                                        <strong>Email:</strong> {practitioner.email || 'N/A'}
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <strong>Phone:</strong> {practitioner.phone || 'N/A'}
                                    </div>
                                    <div class="col-md-6">
                                        <strong>Job Titles</strong> {practitioner.jobTitle || 'N/A'}
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-4">
                                        <strong>Specialty:</strong> {practitioner.specialty || 'N/A'}
                                    </div>
                                    <div class="col-md-4">
                                        <strong>License Number:</strong> {practitioner.licenseNumber || 'N/A'}
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <button
                                        onClick={() => navigate(`/practitioners/${id}/edit`)}
                                        class="btn btn-primary me-2"
                                    >
                                        Edit Practitioner
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Referrals Section - Split 50/50 */}
                <div class="row mb-4">
                    <PatientReferralsSent referralsSent={referralsSent} />
                    <PatientReferralsReceived referralsReceived={referralsReceived} />
                </div>
            </div>
        </div>
    )
}

export default PractitionerView

