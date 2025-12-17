import { NavLink } from 'react-router-dom'

function NavBar({ onLogout }) {
  return (
    <nav className="navbar bg-primary navbar-expand-lg" data-bs-theme="dark">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/providers">
          Patient Referrals
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                to="/providers"
                end
              >
                Providers
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                to="/practitioners"
                end
              >
                Practitioners
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
                to="/patients"
                end
              >
                Patients
              </NavLink>
            </li>
          </ul>
          <button onClick={onLogout} className="btn btn-primary">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default NavBar

