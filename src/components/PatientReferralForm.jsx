import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getToken } from '../utils/auth'

function PatientReferralForm({ onLogout }) {
  const { providerId, id } = useParams()
  const navigate = useNavigate()
  const isEditMode = !!id

  const [formData, setFormData] = useState({
    patient: '',
    sendingProvider: providerId || '',
    receivingProvider: '',
    sendingPracticioner: '',
    receivingPracticioner: '',
    reason: '',
    notes: '',
    priority: ''
  })

  const [patients, setPatients] = useState([])
  const [providers, setProviders] = useState([])
  const [sendingPractitioners, setSendingPractitioners] = useState([])
  const [receivingPractitioners, setReceivingPractitioners] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const sendingProviderId = useMemo(() => formData.sendingProvider, [formData.sendingProvider])

  useEffect(() => {
    loadInitialData()
  }, [providerId])

  useEffect(() => {
    if (isEditMode) {
      fetchReferral()
    }
  }, [id])

  useEffect(() => {
    if (sendingProviderId) {
      fetchPractitionersForProvider(sendingProviderId, setSendingPractitioners)
    } else {
      setSendingPractitioners([])
    }
  }, [sendingProviderId])

  useEffect(() => {
    if (formData.receivingProvider) {
      fetchPractitionersForProvider(formData.receivingProvider, setReceivingPractitioners)
    } else {
      setReceivingPractitioners([])
    }
  }, [formData.receivingProvider])

  const loadInitialData = async () => {
    setLoading(true)
    setError('')
    try {
      const token = getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const [patientsRes, providersRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/patients', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('http://127.0.0.1:8000/api/providers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ])

      if (!patientsRes.ok) throw new Error('Failed to load patients')
      if (!providersRes.ok) throw new Error('Failed to load providers')

      const patientsData = await patientsRes.json()
      const providersData = await providersRes.json()

      setPatients(Array.isArray(patientsData) ? patientsData : [])
      const providerList = Array.isArray(providersData) ? providersData : []
      setProviders(
        providerList.filter(p => String(p.id) !== String(providerId || formData.sendingProvider))
      )
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchReferral = async () => {
    setLoading(true)
    setError('')
    try {
      const token = getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`http://127.0.0.1:8000/api/patientreferrals/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to load referral')
      }

      const data = await response.json()
      setFormData({
        patient: data.patient ? String(data.patient) : '',
        sendingProvider: data.sendingProvider ? String(data.sendingProvider) : '',
        receivingProvider: data.receivingProvider ? String(data.receivingProvider) : '',
        sendingPracticioner: data.sendingPracticioner ? String(data.sendingPracticioner) : '',
        receivingPracticioner: data.receivingPracticioner ? String(data.receivingPracticioner) : '',
      })

      if (data.sendingProvider) {
        fetchPractitionersForProvider(String(data.sendingProvider), setSendingPractitioners)
      }
      if (data.receivingProvider) {
        fetchPractitionersForProvider(String(data.receivingProvider), setReceivingPractitioners)
      }
    } catch (err) {
      setError(err.message || 'Failed to load referral')
    } finally {
      setLoading(false)
    }
  }

  const fetchPractitionersForProvider = async (provider, setter) => {
    try {
      const token = getToken()
      const response = await fetch(`http://127.0.0.1:8000/api/providers/${provider}/practicioners`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setter(Array.isArray(data) ? data : [])
      } else {
        setter([])
      }
    } catch {
      setter([])
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

      const payload = {}
      if (formData.patient) payload.patient_id = parseInt(formData.patient)
      if (formData.sendingProvider) payload.sending_provider_id = parseInt(formData.sendingProvider)
      if (formData.receivingProvider) payload.receiving_provider_id = parseInt(formData.receivingProvider)
      if (formData.sendingPracticioner) payload.sending_practicioner_id = parseInt(formData.sendingPracticioner)
      if (formData.receivingPracticioner) payload.receiving_practicione_id = parseInt(formData.receivingPracticioner)

      //http://127.0.0.1:8000/api/providers/1/send_referral
      const url = isEditMode
        ? `http://127.0.0.1:8000/api/patientreferrals/${id}`
        : 'http://127.0.0.1:8000/api/providers/' + payload.sending_provider_id + '/send_referral'

      const method = isEditMode ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to save referral')
      }

      setSuccess(`Referral ${isEditMode ? 'updated' : 'created'} successfully!`)
      const redirectProviderId = formData.sendingProvider || providerId
      setTimeout(() => {
        if (redirectProviderId) {
          navigate(`/providers/${redirectProviderId}`)
        } else {
          navigate('/providers')
        }
      }, 1200)
    } catch (err) {
      setError(err.message || 'Failed to save referral')
    } finally {
      setLoading(false)
    }
  }

  const receivingProviderOptions = useMemo(
    () => providers.filter(p => String(p.id) !== String(sendingProviderId)),
    [providers, sendingProviderId]
  )

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
                  {isEditMode ? 'Update Patient Referral' : 'Create Patient Referral'}
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
            <h2>{isEditMode ? 'Update Patient Referral' : 'Create Patient Referral'}</h2>

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
                <label for="patient" class="form-label">Patient *</label>
                <select
                  id="patient"
                  name="patient"
                  class="form-select"
                  value={formData.patient}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name || `Patient ${patient.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Sending Provider</label>
                <input
                  type="text"
                  class="form-control"
                  value={sendingProviderId || ''}
                  disabled
                  placeholder="Sending provider id"
                />
              </div>

              <div class="mb-3">
                <label for="receivingProvider" class="form-label">Receiving Provider *</label>
                <select
                  id="receivingProvider"
                  name="receivingProvider"
                  class="form-select"
                  value={formData.receivingProvider}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a receiving provider</option>
                  {receivingProviderOptions.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name || `Provider ${provider.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div class="mb-3">
                <label for="sendingPracticioner" class="form-label">Sending Practitioner (optional)</label>
                <select
                  id="sendingPracticioner"
                  name="sendingPracticioner"
                  class="form-select"
                  value={formData.sendingPracticioner}
                  onChange={handleChange}
                >
                  <option value="">Select a practitioner</option>
                  {sendingPractitioners.map(practitioner => (
                    <option key={practitioner.id} value={practitioner.id}>
                      {practitioner.name || `Practitioner ${practitioner.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div class="mb-3">
                <label for="receivingPracticioner" class="form-label">Receiving Practitioner (optional)</label>
                <select
                  id="receivingPracticioner"
                  name="receivingPracticioner"
                  class="form-select"
                  value={formData.receivingPracticioner}
                  onChange={handleChange}
                >
                  <option value="">Select a practitioner</option>
                  {receivingPractitioners.map(practitioner => (
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
                  disabled={loading}
                >
                  {loading ? 'Saving...' : isEditMode ? 'Update Referral' : 'Create Referral'}
                </button>
                <button
                  type="button"
                  class="btn btn-secondary ms-2"
                  onClick={() => {
                    if (sendingProviderId) {
                      navigate(`/providers/${sendingProviderId}`)
                    } else {
                      navigate('/providers')
                    }
                  }}
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

export default PatientReferralForm


