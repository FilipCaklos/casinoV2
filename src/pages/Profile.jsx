import { useAuth } from '../context/AuthContext'
import { useGame } from '../context/GameContext'
import { useState } from 'react'
import { User, Calendar, Trophy, Star, Gift, Target } from 'lucide-react'
import './Profile.css'

function Profile() {
  const { user } = useAuth()
  const { achievements, gameHistory, getAchievements } = useGame()
  const [activeTab, setActiveTab] = useState('stats')

  const allAchievements = getAchievements()

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={48} />
        </div>
        <div className="profile-info">
          <h1>{user?.username}</h1>
          <p className="join-date">
            <Calendar size={16} />
            <span>Joined {formatDate(user?.createdAt)}</span>
          </p>
        </div>
        <div className="profile-balance">
          <span className="balance-label">Balance</span>
          <span className="balance-value">{user?.balance?.toLocaleString()}</span>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <Star size={18} />
          <span>Statistics</span>
        </button>
        <button
          className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <Trophy size={18} />
          <span>Achievements</span>
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Target size={18} />
          <span>History</span>
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'stats' && (
          <div className="stats-grid">
            <div className="stat-card">
              <Star className="stat-icon" />
              <div className="stat-details">
                <span className="stat-value">{user?.stats?.totalGames || 0}</span>
                <span className="stat-label">Games Played</span>
              </div>
            </div>
            <div className="stat-card">
              <Trophy className="stat-icon" />
              <div className="stat-details">
                <span className="stat-value">{user?.stats?.totalWins || 0}</span>
                <span className="stat-label">Wins</span>
              </div>
            </div>
            <div className="stat-card">
              <Gift className="stat-icon" />
              <div className="stat-details">
                <span className="stat-value">{(user?.stats?.biggestWin || 0).toLocaleString()}</span>
                <span className="stat-label">Biggest Win</span>
              </div>
            </div>
            <div className="stat-card">
              <Target className="stat-icon" />
              <div className="stat-details">
                <span className="stat-value">
                  {user?.stats?.totalGames > 0
                    ? Math.round((user?.stats?.totalWins / user?.stats?.totalGames) * 100)
                    : 0}%
                </span>
                <span className="stat-label">Win Rate</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="achievements-grid">
            {allAchievements.map((achievement) => {
              const unlocked = achievements.find(a => a.id === achievement.id)
              return (
                <div key={achievement.id} className={`achievement-card ${unlocked ? 'unlocked' : ''}`}>
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-info">
                    <h4>{achievement.name}</h4>
                    <p>{achievement.description}</p>
                    {unlocked && (
                      <span className="unlocked-date">
                        Unlocked {formatDate(unlocked.unlockedAt)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-list">
            {gameHistory.length === 0 ? (
              <div className="empty-history">
                <p>No games played yet. Start playing to see your history!</p>
              </div>
            ) : (
              gameHistory.map((game) => (
                <div key={game.id} className="history-item">
                  <div className="history-game">
                    <span className="game-icon">{game.type === 'slots' ? '🎰' : game.type === 'blackjack' ? '🃏' : '🎡'}</span>
                    <span className="game-name">{game.gameName}</span>
                  </div>
                  <div className="history-details">
                    <span className="bet">Bet: {game.bet.toLocaleString()}</span>
                    <span className={`win ${game.win > 0 ? 'positive' : 'negative'}`}>
                      {game.win > 0 ? '+' : ''}{game.win.toLocaleString()}
                    </span>
                  </div>
                  <div className="history-time">
                    {formatDate(game.timestamp)} {formatTime(game.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
