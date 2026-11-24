import {Link, withRouter} from 'react-router-dom'
import Cookies from 'js-cookie'
import './index.css'

const Sidebar = props => {
  const {history} = props

  const onClickLogout = () => {
    Cookies.remove('jwt_token')
    history.replace('/login')
  }

  return (
    <nav className="sidebar-container">
      <div className="sidebar-top-section">
        <Link to="/" className="sidebar-brand-link">
          <img
            src="https://assets.ccbp.in/frontend/react-js/spotify-remix-login-logo.png"
            alt="website logo"
            className="sidebar-logo-img"
          />
          <span className="sidebar-brand-text">Spotify Remix</span>
        </Link>
      </div>

      <button
        type="button"
        onClick={onClickLogout}
        className="sidebar-logout-button"
      >
        Logout
      </button>
    </nav>
  )
}

export default withRouter(Sidebar)
