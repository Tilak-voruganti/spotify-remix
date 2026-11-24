import {Component} from 'react'
import Cookies from 'js-cookie'
import Sidebar from '../Sidebar'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

const formatDuration = durationMs => {
  if (!durationMs) return '0:00'
  const totalSeconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
}

class AlbumDetails extends Component {
  state = {
    albumInfo: null,
    tracks: [],
    activeTrack: null,
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getAlbumDetails()
  }

  onClickBack = () => {
    const {history} = this.props
    history.goBack()
  }

  getAlbumDetails = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const {match} = this.props
    const {id} = match.params
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis2.ccbp.in/spotify-clone/album-details/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }

    try {
      const response = await fetch(url, options)
      if (response.ok) {
        const data = await response.json()
        const rawTracks = data.tracks?.items || []
        const albumImage = data.images?.[0]?.url || ''
        const albumArtist = (data.artists || []).map(a => a.name).join(', ')

        const formattedTracks = rawTracks.map((track, idx) => {
          const trackArtists =
            (track.artists || []).map(a => a.name).join(', ') || albumArtist
          return {
            id: track.id || `${idx}`,
            name: track.name,
            artist: trackArtists,
            duration: formatDuration(track.duration_ms),
            previewUrl: track.preview_url || '',
          }
        })

        this.setState({
          albumInfo: {
            id: data.id,
            name: data.name,
            artist: albumArtist,
            imageUrl: albumImage,
          },
          tracks: formattedTracks,
          activeTrack: formattedTracks[0] || null,
          apiStatus: apiStatusConstants.success,
        })
      } else {
        this.setState({apiStatus: apiStatusConstants.failure})
      }
    } catch {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  onSelectTrack = track => {
    this.setState({activeTrack: track})
  }

  renderLoader = () => (
    <div className="album-status-box" data-testid="loader">
      <p className="album-status-text">Loading...</p>
    </div>
  )

  renderFailure = () => (
    <div className="album-status-box">
      <img
        src="https://assets.ccbp.in/frontend/react-js/spotify-remix-failure-view.png"
        alt="failure view"
        className="album-failure-img"
      />
      <p className="album-status-text">
        Something went wrong. Please try again
      </p>
      <button
        type="button"
        onClick={this.getAlbumDetails}
        className="album-retry-btn"
      >
        Try again
      </button>
    </div>
  )

  renderAlbumSuccess = () => {
    const {albumInfo, tracks, activeTrack} = this.state

    return (
      <div className="album-body-wrapper">
        <button
          type="button"
          onClick={this.onClickBack}
          className="album-back-btn"
        >
          Back
        </button>

        {albumInfo && (
          <div className="album-hero-header">
            <img
              src={albumInfo.imageUrl}
              alt="new release album"
              className="album-cover-img"
            />
            <div className="album-hero-meta">
              <p className="album-tag">ALBUM</p>
              <h1 className="album-title">{albumInfo.name}</h1>
              {albumInfo.artist && (
                <p className="album-artist">{albumInfo.artist}</p>
              )}
            </div>
          </div>
        )}

        <div className="album-tracks-header">
          <span>Track</span>
          <span>Time</span>
          <span>Artist</span>
        </div>

        <ul className="album-tracks-list">
          {tracks.map(track => {
            const isSelected = activeTrack && activeTrack.id === track.id
            return (
              <li
                key={track.id}
                onClick={() => this.onSelectTrack(track)}
                className={`album-track-row ${
                  isSelected ? 'album-track-row-active' : ''
                }`}
              >
                <span className="album-track-name">{track.name}</span>
                <span className="album-track-duration">{track.duration}</span>
                <span className="album-track-artist">{track.artist}</span>
              </li>
            )
          })}
        </ul>

        <div className="album-audio-bar">
          <audio
            controls
            autoPlay
            src={activeTrack?.previewUrl || ''}
            className="album-audio-element"
          >
            <track kind="captions" src="data:," label="Captions" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    )
  }

  renderContent = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return this.renderLoader()
      case apiStatusConstants.success:
        return this.renderAlbumSuccess()
      case apiStatusConstants.failure:
        return this.renderFailure()
      default:
        return null
    }
  }

  render() {
    return (
      <div className="album-page-layout">
        <Sidebar />
        <main className="album-main-content">{this.renderContent()}</main>
      </div>
    )
  }
}

export default AlbumDetails
