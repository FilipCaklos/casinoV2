import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import './Slots.css'

function Slots() {
  const slots = [
    {
      id: 'classic',
      name: 'Classic Slots',
      icon: '🎰',
      description: 'Traditional 3-reel slot machine with classic symbols',
      rtp: '95%',
      volatility: 'Low'
    },
    {
      id: 'video',
      name: 'Video Slots',
      icon: '💎',
      description: '5-reel video slot with wilds, scatters and bonus rounds',
      rtp: '96%',
      volatility: 'Medium'
    },
    {
      id: 'progressive',
      name: 'Progressive Slots',
      icon: '🏆',
      description: 'Win the ever-growing jackpot!',
      rtp: '94%',
      volatility: 'High'
    }
  ]

  return (
    <div className="slots-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={20} />
        <span>Back to Lobby</span>
      </Link>

      <h1>Slot Machines</h1>
      <p className="page-description">
        Try your luck on our selection of exciting slot machines
      </p>

      <div className="slots-grid">
        {slots.map((slot) => (
          <Link to={`/game/slots/${slot.id}`} key={slot.id} className="slot-card">
            <div className="slot-icon">{slot.icon}</div>
            <div className="slot-info">
              <h3>{slot.name}</h3>
              <p>{slot.description}</p>
              <div className="slot-stats">
                <span>RTP: {slot.rtp}</span>
                <span>Volatility: {slot.volatility}</span>
              </div>
            </div>
            <div className="slot-cta">
              <span>Play</span>
              <ArrowRight size={20} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Slots
