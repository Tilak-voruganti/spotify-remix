import {Switch, Route, Redirect} from 'react-router-dom'
import LoginRoute from './components/LoginRoute'
import ProtectedRoute from './components/ProtectedRoute'
import HomeRoute from './components/HomeRoute'
import PlaylistDetails from './components/PlaylistDetails'
import CategoryPlaylistsDetails from './components/CategoryPlaylistsDetails'
import AlbumDetails from './components/AlbumDetails'
import NotFound from './components/NotFound'
import './App.css'

const App = () => (
  <Switch>
    <Route exact path="/login" component={LoginRoute} />
    <ProtectedRoute exact path="/" component={HomeRoute} />
    <ProtectedRoute exact path="/playlist/:id" component={PlaylistDetails} />
    <ProtectedRoute
      exact
      path="/category/:id/playlists"
      component={CategoryPlaylistsDetails}
    />
    <ProtectedRoute exact path="/album/:id" component={AlbumDetails} />
    <Route path="/not-found" component={NotFound} />
    <Redirect to="/not-found" />
  </Switch>
)

export default App
