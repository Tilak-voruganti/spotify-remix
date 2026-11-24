import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import Sidebar from '../Sidebar'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class HomeRoute extends Component {
  state = {
    featuredPlaylists: [],
    categories: [],
    newReleases: [],
    featuredStatus: apiStatusConstants.initial,
    categoriesStatus: apiStatusConstants.initial,
    newReleasesStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getFeaturedPlaylists()
    this.getCategories()
    this.getNewReleases()
  }

  getAuthHeaders = () => {
    const jwtToken = Cookies.get('jwt_token')
    return {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
  }

  getFeaturedPlaylists = async () => {
    this.setState({featuredStatus: apiStatusConstants.inProgress})
    const url = 'https://apis2.ccbp.in/spotify-clone/featured-playlists'
    try {
      const response = await fetch(url, this.getAuthHeaders())
      if (response.ok) {
        const data = await response.json()
        const items = data.playlists?.items || []
        const formatted = items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          imageUrl: item.images?.[0]?.url || '',
        }))
        this.setState({
          featuredPlaylists: formatted,
          featuredStatus: apiStatusConstants.success,
        })
      } else {
        this.setState({featuredStatus: apiStatusConstants.failure})
      }
    } catch {
      this.setState({featuredStatus: apiStatusConstants.failure})
    }
  }

  getCategories = async () => {
    this.setState({categoriesStatus: apiStatusConstants.inProgress})
    const url = 'https://apis2.ccbp.in/spotify-clone/categories'
    try {
      const response = await fetch(url, this.getAuthHeaders())
      if (response.ok) {
        const data = await response.json()
        const items = data.categories?.items || []
        const formatted = items.map(item => ({
          id: item.id,
          name: item.name,
          imageUrl: item.icons?.[0]?.url || '',
        }))
        this.setState({
          categories: formatted,
          categoriesStatus: apiStatusConstants.success,
        })
      } else {
        this.setState({categoriesStatus: apiStatusConstants.failure})
      }
    } catch {
      this.setState({categoriesStatus: apiStatusConstants.failure})
    }
  }

  getNewReleases = async () => {
    this.setState({newReleasesStatus: apiStatusConstants.inProgress})
    const url = 'https://apis2.ccbp.in/spotify-clone/new-releases'
    try {
      const response = await fetch(url, this.getAuthHeaders())
      if (response.ok) {
        const data = await response.json()
        const items = data.albums?.items || []
        const formatted = items.map(item => ({
          id: item.id,
          name: item.name,
          imageUrl: item.images?.[0]?.url || '',
        }))
        this.setState({
          newReleases: formatted,
          newReleasesStatus: apiStatusConstants.success,
        })
      } else {
        this.setState({newReleasesStatus: apiStatusConstants.failure})
      }
    } catch {
      this.setState({newReleasesStatus: apiStatusConstants.failure})
    }
  }

  renderSectionLoader = () => (
    <div className="section-loader-box" data-testid="loader">
      <p className="loader-text">Loading...</p>
    </div>
  )

  renderSectionFailure = retryFn => (
    <div className="section-failure-box">
      <img
        src="https://assets.ccbp.in/frontend/react-js/spotify-remix-failure-view.png"
        alt="failure view"
        className="failure-view-img"
      />
      <p className="failure-message">Something went wrong. Please try again</p>
      <button type="button" onClick={retryFn} className="retry-button">
        Try again
      </button>
    </div>
  )

  renderFeaturedPlaylistsList = () => {
    const {featuredPlaylists} = this.state
    return (
      <ul className="cards-grid">
        {featuredPlaylists.map(playlist => (
          <li key={playlist.id} className="media-card">
            <Link to={`/playlist/${playlist.id}`} className="card-link">
              <img
                src={playlist.imageUrl}
                alt="featured playlist"
                className="card-image"
              />
              <p className="card-title">{playlist.name}</p>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  renderCategoriesList = () => {
    const {categories} = this.state
    return (
      <ul className="cards-grid">
        {categories.map(category => (
          <li key={category.id} className="media-card">
            <Link
              to={`/category/${category.id}/playlists`}
              className="card-link"
            >
              <img
                src={category.imageUrl}
                alt="category"
                className="card-image"
              />
              <p className="card-title">{category.name}</p>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  renderNewReleasesList = () => {
    const {newReleases} = this.state
    return (
      <ul className="cards-grid">
        {newReleases.map(album => (
          <li key={album.id} className="media-card">
            <Link to={`/album/${album.id}`} className="card-link">
              <img
                src={album.imageUrl}
                alt="new release album"
                className="card-image"
              />
              <p className="card-title">{album.name}</p>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  renderSectionContent = (status, successRenderer, retryFn) => {
    switch (status) {
      case apiStatusConstants.inProgress:
        return this.renderSectionLoader()
      case apiStatusConstants.success:
        return successRenderer()
      case apiStatusConstants.failure:
        return this.renderSectionFailure(retryFn)
      default:
        return null
    }
  }

  render() {
    const {featuredStatus, categoriesStatus, newReleasesStatus} = this.state

    return (
      <div className="home-layout">
        <Sidebar />
        <main className="home-main-content">
          <section className="home-section">
            <h1 className="section-heading">Editor&apos;s Pick</h1>
            {this.renderSectionContent(
              featuredStatus,
              this.renderFeaturedPlaylistsList,
              this.getFeaturedPlaylists,
            )}
          </section>

          <section className="home-section">
            <h2 className="section-heading">Genres &amp; Moods</h2>
            {this.renderSectionContent(
              categoriesStatus,
              this.renderCategoriesList,
              this.getCategories,
            )}
          </section>

          <section className="home-section">
            <h2 className="section-heading">New Releases</h2>
            {this.renderSectionContent(
              newReleasesStatus,
              this.renderNewReleasesList,
              this.getNewReleases,
            )}
          </section>
        </main>
      </div>
    )
  }
}

export default HomeRoute
