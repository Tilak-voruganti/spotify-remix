import {Component} from 'react'
import {Redirect} from 'react-router-dom'
import Cookies from 'js-cookie'
import './index.css'

class LoginRoute extends Component {
  state = {
    username: '',
    password: '',
    showSubmitError: false,
    errorMsg: '',
  }

  onChangeUsername = event => {
    this.setState({username: event.target.value})
  }

  onChangePassword = event => {
    this.setState({password: event.target.value})
  }

  onSubmitSuccess = jwtToken => {
    const {history} = this.props
    Cookies.set('jwt_token', jwtToken, {expires: 30})
    history.replace('/')
  }

  onSubmitFailure = errorMsg => {
    this.setState({showSubmitError: true, errorMsg})
  }

  submitForm = async event => {
    event.preventDefault()
    const {username, password} = this.state
    const userDetails = {username, password}
    const loginApiUrl = 'https://apis.ccbp.in/login'
    const options = {
      method: 'POST',
      body: JSON.stringify(userDetails),
    }

    const response = await fetch(loginApiUrl, options)
    const data = await response.json()

    if (response.ok) {
      this.onSubmitSuccess(data.jwt_token)
    } else {
      this.onSubmitFailure(data.error_msg)
    }
  }

  render() {
    const jwtToken = Cookies.get('jwt_token')
    if (jwtToken !== undefined) {
      return <Redirect to="/" />
    }

    const {username, password, showSubmitError, errorMsg} = this.state

    return (
      <div className="login-page-container">
        <form className="login-form-card" onSubmit={this.submitForm}>
          <div className="login-logo-wrapper">
            <img
              src="https://assets.ccbp.in/frontend/react-js/spotify-remix-login-logo.png"
              alt="login website logo"
              className="login-website-logo"
            />
            <h1 className="login-heading">Spotify Remix</h1>
          </div>

          <div className="input-group">
            <label htmlFor="username" className="input-label">
              USERNAME
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={this.onChangeUsername}
              placeholder="Enter username"
              className="login-input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password" className="input-label">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={this.onChangePassword}
              placeholder="Enter password"
              className="login-input"
            />
          </div>

          <button type="submit" className="login-button">
            Login
          </button>

          {showSubmitError && <p className="login-error-msg">*{errorMsg}</p>}
        </form>
      </div>
    )
  }
}

export default LoginRoute
