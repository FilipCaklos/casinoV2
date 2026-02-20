import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { GameProvider } from './context/GameContext'
import Layout from './components/Layout'
import Lobby from './pages/Lobby'
import Slots from './pages/Slots'
import Tables from './pages/Tables'
import Profile from './pages/Profile'
import Leaderboards from './pages/Leaderboards'
import Login from './pages/Login'
import Register from './pages/Register'
import ClassicSlots from './pages/games/ClassicSlots'
import VideoSlots from './pages/games/VideoSlots'
import ProgressiveSlots from './pages/games/ProgressiveSlots'
import Blackjack from './pages/games/Blackjack'
import Roulette from './pages/games/Roulette'
import Baccarat from './pages/games/Baccarat'
import VideoPoker from './pages/games/VideoPoker'
import './App.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Lobby />} />
              <Route path="/slots" element={<Slots />} />
              <Route path="/tables" element={<Tables />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboards" element={<Leaderboards />} />
              <Route path="/game/slots/classic" element={<ClassicSlots />} />
              <Route path="/game/slots/video" element={<VideoSlots />} />
              <Route path="/game/slots/progressive" element={<ProgressiveSlots />} />
              <Route path="/game/table/blackjack" element={<Blackjack />} />
              <Route path="/game/table/roulette" element={<Roulette />} />
              <Route path="/game/table/baccarat" element={<Baccarat />} />
              <Route path="/game/table/poker" element={<VideoPoker />} />
            </Route>
          </Routes>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
