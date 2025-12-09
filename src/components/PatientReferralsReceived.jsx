import { useNavigate } from 'react-router-dom'

function PatientReferralsReceived({ referralsReceived }) {
    const navigate = useNavigate()

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
        <div class="col-md-6">
            <h3>Patient Referrals Sent</h3>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Patient</th>
                            <th scope="col">Sending Provider</th>
                            <th scope="col">Date Sent</th>
                            <th scope="col">Status</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {referralsReceived.length === 0 ? (
                            <tr>
                                <td colSpan="6">No patient referrals found.</td>
                            </tr>
                        ) : (
                            referralsReceived.map((referral, index) => (
                                <tr key={referral.id}>
                                    <td>{referral.patientName || 'N/A'}</td>
                                    <td>{referral.sendingProviderName || 'N/A'}</td>
                                    <td>{formatDate(referral.dateSent) || 'N/A'}</td>
                                    <td>{referral.status || 'N/A'}</td>
                                    <td>
                                        <a href="#" onClick={(e) => {
                                            e.preventDefault()
                                            navigate(`/patientreferrals/${referral.id}`)
                                        }}>
                                            view
                                        </a>
                                        &nbsp;
                                        <a href="#" onClick={(e) => {
                                            e.preventDefault()
                                            navigate(`/patientreferrals/${referral.id}/edit`)
                                        }}>
                                            edit
                                        </a>
                                        &nbsp;
                                        <a href="#" onClick={(e) => { e.preventDefault(); }}>
                                            delete
                                        </a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PatientReferralsReceived