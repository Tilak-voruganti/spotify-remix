import {Link} from 'react-router-dom'
import './index.css'

const NotFound = () => (
  <div className="not-found-container">
    <img
      src="https://assets.ccbp.in/frontend/react-js/spotify-remix-not-found.png"
      alt="page not found"
      className="not-found-image"
    />
    <h1 className="not-found-heading">Page Not Found</h1>
    <p className="not-found-description">
      We are sorry, the page you requested could not be found.
    </p>
    <Link to="/" className="not-found-link-wrapper">
      <button type="button" className="not-found-home-button">
        Home Page
      </button>
    </Link>
  </div>
)

export default NotFound
