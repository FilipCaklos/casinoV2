import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGame } from '../context/GameContext'
import { Coins, User, Trophy, LogOut, Menu, X, Home, Gamepad2 } from 'lucide-react'
import { useState } from 'react'
import './Layout.css'

function Layout() {
  const { user, logout } = useAuth()
  const { progressiveJackpot } = useGame()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatBalance = (balance) => {
    return balance?.toLocaleString() || '0'
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">$</span>
            <span className="logo-text">Lucky Palace</span>
          </Link>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
              <Home size={18} />
              <span>Lobby</span>
            </Link>
            <Link to="/slots" className="nav-link" onClick={() => setMenuOpen(false)}>
              <Gamepad2 size={18} />
              <span>Slots</span>
            </Link>
            <Link to="/tables" className="nav-link" onClick={() => setMenuOpen(false)}>
              <span className="nav-icon">21</span>
              <span>Tables</span>
            </Link>
            <Link to="/leaderboards" className="nav-link" onClick={() => setMenuOpen(false)}>
              <Trophy size={18} />
              <span>Leaderboards</span>
            </Link>
          </nav>

          <div className="header-right">
            {progressiveJackpot > 0 && (
              <div className="jackpot-display">
                <span className="jackpot-label">JACKPOT</span>
                <span className="jackpot-amount">{formatBalance(progressiveJackpot)}</span>
              </div>
            )}

            <div className="balance-display">
              <Coins size={18} className="balance-icon" />
              <span className="balance-amount">{formatBalance(user?.balance)}</span>
            </div>

            <Link to="/profile" className="profile-btn" onClick={() => setMenuOpen(false)}>
              <User size={20} />
            </Link>

            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>Lucky Palace Casino - Virtual Entertainment Only</p>
          <p className="footer-version">Version 1.0.0</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
