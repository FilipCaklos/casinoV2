import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGame } from '../../context/GameContext'
import { ArrowLeft, Play, RotateCcw, Star } from 'lucide-react'
import '../games/Game.css'

const SYMBOLS = ['💎', '7️⃣', '🍋', '🍇', '🔔', '⭐', 'WILD']
const PAYLINES = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [0, 6, 12, 8, 4],
  [10, 6, 12, 8, 0],
  [0, 1, 12, 9, 10],
  [10, 11, 12, 3, 4],
  [2, 7, 12, 7, 2],
  [5, 6, 7, 8, 9],
  [0, 3, 6, 9, 12]
]

function VideoSlots() {
  const { user, updateBalance } = useAuth()
  const { addGame, checkAchievements, incrementJackpot } = useGame()
  const [reels, setReels] = useState([[], [], [], [], []])
  const [spinning, setSpinning] = useState(false)
  const [bet, setBet] = useState(10)
  const [paylines, setPaylines] = useState(1)
  const [win, setWin] = useState(0)
  const [message, setMessage] = useState('')
  const [activePaylines, setActivePaylines] = useState([])
  const [freeSpins, setFreeSpins] = useState(0)
  const [bonusMode, setBonusMode] = useState(false)

  const minBet = 10
  const maxBet = 1000
  const maxPaylines = 10

  const spin = () => {
    if (spinning || !user) return

    const totalBet = bet * paylines

    if (totalBet > user.balance) {
      setMessage('Insufficient balance!')
      return
    }

    setSpinning(true)
    setWin(0)
    setMessage('')
    setActivePaylines([])

    const newBalance = user.balance - totalBet
    updateBalance(newBalance)
    incrementJackpot(totalBet * 0.1)

    const spinReels = async () => {
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 150))
        const newReels = [...reels]
        newReels[i] = Array(3).fill(null).map(() => SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 1))])
        setReels(newReels)
      }
    }

    spinReels().then(() => {
      const finalReels = Array(5).fill(null).map(() =>
        Array(3).fill(null).map(() => SYMBOLS[Math.floor(Math.random() * (SYMBOLS.length - 1))])
      )
      setReels(finalReels)

      let totalWin = 0
      const winningLines = []

      const scatterCount = finalReels.flat().filter(s => s === '⭐').length
      if (scatterCount >= 3) {
        const freeSpinAward = scatterCount === 3 ? 5 : scatterCount === 4 ? 10 : 20
        setFreeSpins(prev => prev + freeSpinAward)
        setMessage(`FREE SPINS! +${freeSpinAward} free spins!`)
      }

      for (let lineIndex = 0; lineIndex < paylines; lineIndex++) {
        const line = PAYLINES[lineIndex]
        const symbols = line.map(pos => finalReels[Math.floor(pos / 5)][pos % 5])

        for (let match = 5; match >= 3; match--) {
          const firstSymbol = symbols[0]
          if (firstSymbol === 'WILD') continue

          let matches = 1
          for (let i = 1; i < match; i++) {
            if (symbols[i] === firstSymbol || symbols[i] === 'WILD') {
              matches++
            } else {
              break
            }
          }

          if (matches >= 3) {
            const multipliers = { 5: 50, 4: 20, 3: 5 }
            const lineWin = bet * multipliers[match]
            totalWin += lineWin
            winningLines.push(lineIndex)
          }
        }

        const wildLine = symbols.filter(s => s === 'WILD').length
        if (wildLine >= 3) {
          const wildWin = bet * (wildLine === 5 ? 100 : wildLine === 4 ? 25 : 10)
          totalWin += wildWin
          winningLines.push(lineIndex)
        }
      }

      if (totalWin > 0) {
        const finalBalance = user.balance - totalBet + totalWin
        updateBalance(finalBalance)
        setWin(totalWin)
        setActivePaylines(winningLines)
        setMessage(`WINNER! +${totalWin} credits!`)

        addGame({
          type: 'slots',
          gameName: 'Video Slots',
          bet: totalBet,
          win: totalWin
        })

        checkAchievements({ type: 'slots', bet: totalBet, win: totalWin })
      } else {
        addGame({
          type: 'slots',
          gameName: 'Video Slots',
          bet: totalBet,
          win: 0
        })
      }

      setSpinning(false)
    })
  }

  const changeBet = (delta) => {
    const newBet = bet + delta
    if (newBet >= minBet && newBet <= maxBet) {
      setBet(newBet)
    }
  }

  return (
    <div className="game-page">
      <Link to="/slots" className="back-link">
        <ArrowLeft size={20} />
        <span>Back to Slots</span>
      </Link>

      <div className="game-container">
        <div className="game-header">
          <h1>Video Slots</h1>
          <p>5 Reels - 20 Paylines - Wilds & Scatters!</p>
        </div>

        <div className="video-slots-machine">
          <div className="reels-container video">
            {reels.map((reel, reelIndex) => (
              <div key={reelIndex} className={`reel video ${spinning ? 'spinning' : ''}`}>
                <span className="symbol">{reel[0]}</span>
                <span className="symbol">{reel[1]}</span>
                <span className="symbol">{reel[2]}</span>
              </div>
            ))}
          </div>

          {activePaylines.length > 0 && (
            <svg className="paylines-overlay">
              {activePaylines.map((lineIndex, i) => {
                const line = PAYLINES[lineIndex]
                return (
                  <line
                    key={i}
                    x1={`${15 + line[0] * 17}%`}
                    y1="50%"
                    x2={`${15 + line[4] * 17}%`}
                    y2="50%"
                    stroke="#ffd700"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                  />
                )
              })}
            </svg>
          )}

          {freeSpins > 0 && (
            <div className="free-spins-badge">
              <Star size={16} />
              {freeSpins} FREE SPINS
            </div>
          )}
        </div>

        {win > 0 && (
          <div className="win-display animate-winPulse">
            WIN {win.toLocaleString()}!
          </div>
        )}

        {message && win === 0 && (
          <div className="message-display">
            {message}
          </div>
        )}

        <div className="game-controls">
          <div className="bet-controls">
            <span className="label">Bet:</span>
            <button onClick={() => changeBet(-10)} disabled={spinning || bet <= minBet}>-</button>
            <span className="bet-amount">{bet}</span>
            <button onClick={() => changeBet(10)} disabled={spinning || bet >= maxBet}>+</button>
          </div>

          <div className="bet-controls">
            <span className="label">Lines:</span>
            <button onClick={() => setPaylines(Math.max(1, paylines - 1))} disabled={spinning || paylines <= 1}>-</button>
            <span className="bet-amount">{paylines}</span>
            <button onClick={() => setPaylines(Math.min(maxPaylines, paylines + 1))} disabled={spinning || paylines >= maxPaylines}>+</button>
          </div>

          <button className="spin-btn" onClick={spin} disabled={spinning}>
            {spinning ? <RotateCcw className="spin-icon" /> : <Play />}
            <span>{spinning ? 'Spinning...' : 'SPIN'}</span>
          </button>
        </div>

        <div className="payout-table">
          <h3>Special Features</h3>
          <div className="payouts">
            <div className="payout-row">
              <span>⭐ 3+ Scatter</span>
              <span className="payout-amount">5-20 Free Spins</span>
            </div>
            <div className="payout-row">
              <span>WILD 5x</span>
              <span className="payout-amount">100x</span>
            </div>
            <div className="payout-row">
              <span>WILD 3x</span>
              <span className="payout-amount">10x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoSlots
