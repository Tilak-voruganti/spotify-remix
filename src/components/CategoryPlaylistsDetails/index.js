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

class CategoryPlaylistsDetails extends Component {
  state = {
    categoryName: '',
    categoryImage: '',
    playlists: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getCategoryPlaylists()
  }

  onClickBack = () => {
    const {history} = this.props
    history.goBack()
  }

  getCategoryPlaylists = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const {match} = this.props
    const {id} = match.params
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis2.ccbp.in/spotify-clone/category-playlists/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }

    try {
      const response = await fetch(url, options)
      if (response.ok) {
        const data = await response.json()
        const items = data.playlists?.items || []
        const formattedPlaylists = items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          imageUrl: item.images?.[0]?.url || '',
          totalTracks: item.tracks?.total ?? 0,
        }))

        const headingFromId = id.replace(/-/g, ' ').toUpperCase()
        this.setState({
          categoryName: data.name || headingFromId,
          categoryImage: formattedPlaylists[0]?.imageUrl || '',
          playlists: formattedPlaylists,
          apiStatus: apiStatusConstants.success,
        })
      } else {
        this.setState({apiStatus: apiStatusConstants.failure})
      }
    } catch {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderLoader = () => (
    <div className="cat-status-box" data-testid="loader">
      <p className="cat-status-text">Loading...</p>
    </div>
  )

  renderFailure = () => (
    <div className="cat-status-box">
      <img
        src="https://assets.ccbp.in/frontend/react-js/spotify-remix-failure-view.png"
        alt="failure view"
        className="cat-failure-img"
      />
      <p className="cat-status-text">Something went wrong. Please try again</p>
      <button
        type="button"
        onClick={this.getCategoryPlaylists}
        className="cat-retry-btn"
      >
        Try again
      </button>
    </div>
  )

  renderCategorySuccess = () => {
    const {categoryName, categoryImage, playlists} = this.state

    return (
      <div>
        <button
          type="button"
          onClick={this.onClickBack}
          className="cat-back-button"
        >
          Back
        </button>

        <div className="cat-header">
          {categoryImage && (
            <img src={categoryImage} alt="category" className="cat-cover-img" />
          )}
          <div>
            <p className="cat-tag">CATEGORY</p>
            <h1 className="cat-title">{categoryName}</h1>
          </div>
        </div>

        <ul className="cat-playlists-grid">
          {playlists.map(playlist => (
            <li key={playlist.id} className="cat-playlist-card">
              <Link to={`/playlist/${playlist.id}`} className="cat-card-link">
                <img
                  src={playlist.imageUrl}
                  alt="featured playlist"
                  className="cat-card-img"
                />
                <p className="cat-playlist-name">{playlist.name}</p>
                <p className="cat-tracks-count">
                  {playlist.totalTracks} Tracks
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  renderContent = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return this.renderLoader()
      case apiStatusConstants.success:
        return this.renderCategorySuccess()
      case apiStatusConstants.failure:
        return this.renderFailure()
      default:
        return null
    }
  }

  render() {
    return (
      <div className="cat-page-layout">
        <Sidebar />
        <main className="cat-main-content">{this.renderContent()}</main>
      </div>
    )
  }
}

export default CategoryPlaylistsDetails
