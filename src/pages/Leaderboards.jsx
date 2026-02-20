import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { Trophy, Medal, Crown } from 'lucide-react'
import './Leaderboards.css'

function Leaderboards() {
  const { leaderboard } = useGame()
  const [activeTab, setActiveTab] = useState('highestWin')

  const tabs = [
    { id: 'highestWin', label: 'Highest Win', icon: Trophy },
    { id: 'mostGames', label: 'Most Games', icon: Medal },
    { id: 'biggestJackpot', label: 'Biggest Jackpot', icon: Crown }
  ]

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return '🥇'
      case 1: return '🥈'
      case 2: return '🥉'
      default: return `#${index + 1}`
    }
  }

  return (
    <div className="leaderboards-page">
      <h1>Leaderboards</h1>
      <p className="page-description">See how you stack up against other players</p>

      <div className="leaderboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="leaderboard-content">
        {leaderboard[activeTab]?.length === 0 ? (
          <div className="empty-leaderboard">
            <Trophy size={48} />
            <p>No data yet. Start playing to appear on the leaderboards!</p>
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboard[activeTab]?.map((entry, index) => (
              <div key={index} className={`leaderboard-item rank-${index}`}>
                <div className="rank">{getRankIcon(index)}</div>
                <div className="player-info">
                  <span className="username">{entry.username}</span>
                </div>
                <div className="score">
                  {entry.score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboards
