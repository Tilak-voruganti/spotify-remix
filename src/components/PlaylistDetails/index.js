import {Component} from 'react'
import Cookies from 'js-cookie'
import moment from 'moment'
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

class PlaylistDetails extends Component {
  state = {
    playlistInfo: null,
    tracks: [],
    activeTrack: null,
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getPlaylistDetails()
  }

  onClickBack = () => {
    const {history} = this.props
    history.goBack()
  }

  getPlaylistDetails = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const {match} = this.props
    const {id} = match.params
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis2.ccbp.in/spotify-clone/playlists-details/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }

    try {
      const response = await fetch(url, options)
      if (response.ok) {
        const data = await response.json()
        const rawItems = data.tracks?.items || []
        const formattedTracks = rawItems
          .filter(item => item.track)
          .map((item, idx) => {
            const {track, added_at: addedAt} = item
            const artists = (track.artists || []).map(a => a.name).join(', ')
            const formattedAdded = addedAt ? moment(addedAt).fromNow() : ''
            return {
              id: track.id || `${idx}`,
              name: track.name,
              albumName: track.album?.name || '',
              artist: artists,
              added: formattedAdded,
              duration: formatDuration(track.duration_ms),
              previewUrl: track.preview_url || '',
            }
          })

        this.setState({
          playlistInfo: {
            id: data.id,
            name: data.name,
            description: data.description,
            imageUrl: data.images?.[0]?.url || '',
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
    <div className="detail-status-box" data-testid="loader">
      <p className="detail-status-text">Loading...</p>
    </div>
  )

  renderFailure = () => (
    <div className="detail-status-box">
      <img
        src="https://assets.ccbp.in/frontend/react-js/spotify-remix-failure-view.png"
        alt="failure view"
        className="detail-failure-img"
      />
      <p className="detail-status-text">
        Something went wrong. Please try again
      </p>
      <button
        type="button"
        onClick={this.getPlaylistDetails}
        className="detail-retry-btn"
      >
        Try again
      </button>
    </div>
  )

  renderPlaylistSuccess = () => {
    const {playlistInfo, tracks, activeTrack} = this.state

    return (
      <div className="detail-body-wrapper">
        <button
          type="button"
          onClick={this.onClickBack}
          className="detail-back-btn"
        >
          Back
        </button>

        {playlistInfo && (
          <div className="detail-hero-header">
            <img
              src={playlistInfo.imageUrl}
              alt="featured playlist"
              className="detail-cover-img"
            />
            <div className="detail-hero-meta">
              <p className="detail-tag">PLAYLIST</p>
              <h1 className="detail-title">{playlistInfo.name}</h1>
              <p className="detail-description">{playlistInfo.description}</p>
            </div>
          </div>
        )}

        <div className="tracks-table-header">
          <span>Track</span>
          <span>Album</span>
          <span>Time</span>
          <span>Artist</span>
          <span>Added</span>
        </div>

        <ul className="tracks-list">
          {tracks.map(track => {
            const isSelected = activeTrack && activeTrack.id === track.id
            return (
              <li
                key={track.id}
                onClick={() => this.onSelectTrack(track)}
                className={`track-row ${isSelected ? 'track-row-active' : ''}`}
              >
                <span className="track-name">{track.name}</span>
                <span className="track-album">{track.albumName}</span>
                <span className="track-duration">{track.duration}</span>
                <span className="track-artist">{track.artist}</span>
                <span className="track-added">{track.added}</span>
              </li>
            )
          })}
        </ul>

        <div className="audio-bar-container">
          <audio
            controls
            autoPlay
            src={activeTrack?.previewUrl || ''}
            className="audio-element"
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
        return this.renderPlaylistSuccess()
      case apiStatusConstants.failure:
        return this.renderFailure()
      default:
        return null
    }
  }

  render() {
    return (
      <div className="detail-page-layout">
        <Sidebar />
        <main className="detail-main-content">{this.renderContent()}</main>
      </div>
    )
  }
}

export default PlaylistDetails
