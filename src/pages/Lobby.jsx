import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGame } from '../context/GameContext'
import { Gamepad2, Users, Trophy, Gift, Star, ArrowRight } from 'lucide-react'
import './Lobby.css'

function Lobby() {
  const { user, claimDailyBonus } = useAuth()
  const { achievements } = useGame()

  const canClaimBonus = () => {
    if (!user?.lastDailyBonus) return true
    const lastBonus = new Date(user.lastDailyBonus)
    const now = new Date()
    const hoursSince = (now - lastBonus) / (1000 * 60 * 60)
    return hoursSince >= 24
  }

  const handleClaimBonus = () => {
    const claimed = claimDailyBonus()
    if (claimed) {
      alert('+1,000 credits added to your balance!')
    }
  }

  return (
    <div className="lobby">
      <section className="welcome-section">
        <h1>Welcome to <span className="gold">Lucky Palace</span></h1>
        <p>Your fortune awaits! Play our selection of exciting casino games.</p>

        {canClaimBonus() && (
          <button className="bonus-btn" onClick={handleClaimBonus}>
            <Gift size={20} />
            <span>Claim Daily Bonus (+1,000 credits)</span>
          </button>
        )}
      </section>

      <section className="game-sections">
        <div className="section-header">
          <Gamepad2 size={24} />
          <h2>Slot Machines</h2>
        </div>
        <div className="games-grid">
          <Link to="/game/slots/classic" className="game-card slots">
            <div className="game-icon">🎰</div>
            <h3>Classic Slots</h3>
            <p>Traditional 3-reel action</p>
            <span className="play-link">
              Play Now <ArrowRight size={16} />
            </span>
          </Link>

          <Link to="/game/slots/video" className="game-card slots">
            <div className="game-icon">💎</div>
            <h3>Video Slots</h3>
            <p>5 reels, 20 paylines</p>
            <span className="play-link">
              Play Now <ArrowRight size={16} />
            </span>
          </Link>

          <Link to="/game/slots/progressive" className="game-card slots jackpot">
            <div className="game-icon">🏆</div>
            <h3>Progressive Slots</h3>
            <p>Win the growing jackpot</p>
            <span className="play-link">
              Play Now <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </section>

      <section className="game-sections">
        <div className="section-header">
          <Users size={24} />
          <h2>Table Games</h2>
        </div>
        <div className="games-grid">
          <Link to="/game/table/blackjack" className="game-card table">
            <div className="game-icon">🃏</div>
            <h3>Blackjack</h3>
            <p>Beat the dealer to 21</p>
            <span className="play-link">
              Play Now <ArrowRight size={16} />
            </span>
          </Link>

          <Link to="/game/table/roulette" className="game-card table">
            <div className="game-icon">🎡</div>
            <h3>Roulette</h3>
            <p>European single-zero</p>
            <span className="play-link">
              Play Now <ArrowRight size={16} />
            </span>
          </Link>

          <Link to="/game/table/baccarat" className="game-card table">
            <div className="game-icon">🪙</div>
            <h3>Baccarat</h3>
            <p>Player vs Banker</p>
            <span className="play-link">
              Play Now <ArrowRight size={16} />
            </span>
          </Link>

          <Link to="/game/table/poker" className="game-card table">
            <div className="game-icon">♠️</div>
            <h3>Video Poker</h3>
            <p>Jacks or Better</p>
            <span className="play-link">
              Play Now <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-card">
          <Trophy size={32} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{user?.stats?.totalGames || 0}</span>
            <span className="stat-label">Games Played</span>
          </div>
        </div>
        <div className="stat-card">
          <Star size={32} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{user?.stats?.totalWins || 0}</span>
            <span className="stat-label">Wins</span>
          </div>
        </div>
        <div className="stat-card">
          <Gift size={32} className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{achievements.length}</span>
            <span className="stat-label">Achievements</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Lobby
