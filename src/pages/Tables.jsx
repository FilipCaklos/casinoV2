import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import './Tables.css'

function Tables() {
  const games = [
    {
      id: 'blackjack',
      name: 'Blackjack',
      icon: '🃏',
      description: 'Beat the dealer without going over 21',
      rtp: '99.5%',
      minBet: 10,
      maxBet: 1000
    },
    {
      id: 'roulette',
      name: 'Roulette',
      icon: '🎡',
      description: 'European single-zero roulette',
      rtp: '97.3%',
      minBet: 10,
      maxBet: 1000
    },
    {
      id: 'baccarat',
      name: 'Baccarat',
      icon: '🪙',
      description: 'Bet on Player, Banker, or Tie',
      rtp: '98.9%',
      minBet: 10,
      maxBet: 1000
    },
    {
      id: 'poker',
      name: 'Video Poker',
      icon: '♠️',
      description: 'Jacks or Better - make the best hand',
      rtp: '99.5%',
      minBet: 10,
      maxBet: 1000
    }
  ]

  return (
    <div className="tables-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={20} />
        <span>Back to Lobby</span>
      </Link>

      <h1>Table Games</h1>
      <p className="page-description">
        Test your skills at our classic table games
      </p>

      <div className="tables-grid">
        {games.map((game) => (
          <Link to={`/game/table/${game.id}`} key={game.id} className="table-card">
            <div className="table-icon">{game.icon}</div>
            <div className="table-info">
              <h3>{game.name}</h3>
              <p>{game.description}</p>
              <div className="table-stats">
                <span>RTP: {game.rtp}</span>
                <span>Bet: {game.minBet}-{game.maxBet}</span>
              </div>
            </div>
            <div className="table-cta">
              <span>Play</span>
              <ArrowRight size={20} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Tables
