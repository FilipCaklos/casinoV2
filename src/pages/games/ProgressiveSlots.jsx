import { useState, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGame } from '../../context/GameContext'
import { ArrowLeft, Play, RotateCcw } from 'lucide-react'
import '../games/Game.css'

const SYMBOLS = ['🏆', '7️⃣', '💎', '🍀', '⭐']

function ProgressiveSlots() {
  const { user, updateBalance } = useAuth()
  const { addGame, checkAchievements, incrementJackpot, progressiveJackpot, resetJackpot } = useGame()
  const [reels, setReels] = useState([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]])
  const [spinning, setSpinning] = useState(false)
  const [bet, setBet] = useState(100)
  const [win, setWin] = useState(0)
  const [message, setMessage] = useState('')
  const [jackpotWon, setJackpotWon] = useState(false)

  const minBet = 100
  const maxBet = 1000

  useEffect(() => {
    const interval = setInterval(() => {
      incrementJackpot(5)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const spin = () => {
    if (spinning || !user) return

    const totalBet = bet

    if (totalBet > user.balance) {
      setMessage('Insufficient balance!')
      return
    }

    setSpinning(true)
    setWin(0)
    setMessage('')
    setJackpotWon(false)

    const newBalance = user.balance - totalBet
    updateBalance(newBalance)
    incrementJackpot(totalBet * 0.2)

    const spinReels = () => {
      return new Promise((resolve) => {
        let count = 0
        const interval = setInterval(() => {
          setReels([
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
          ])
          count++
          if (count > 15) {
            clearInterval(interval)
            resolve()
          }
        }, 80)
      })
    }

    spinReels().then(() => {
      const finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ]
      setReels(finalReels)

      let totalWin = 0

      if (finalReels.every(s => s === '🏆')) {
        totalWin = progressiveJackpot + (bet * 100)
        setJackpotWon(true)
        resetJackpot()
        setMessage(`JACKPOT! +${totalWin.toLocaleString()} credits!`)
      } else if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
        totalWin = bet * 10
      } else if (finalReels.every(s => s === '7️⃣')) {
        totalWin = bet * 50
      }

      if (totalWin > 0) {
        const finalBalance = user.balance - totalBet + totalWin
        updateBalance(finalBalance)
        setWin(totalWin)

        addGame({
          type: 'slots',
          gameName: 'Progressive Slots',
          bet: totalBet,
          win: totalWin
        })

        checkAchievements({ type: 'slots', bet: totalBet, win: totalWin })
      } else {
        addGame({
          type: 'slots',
          gameName: 'Progressive Slots',
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
          <h1>Progressive Slots</h1>
          <p>Hit the jackpot to win it all!</p>
        </div>

        <div className="jackpot-display-large">
          <span className="jackpot-label">PROGRESSIVE JACKPOT</span>
          <span className="jackpot-amount-large">{progressiveJackpot.toLocaleString()}</span>
        </div>

        <div className="slot-machine">
          <div className="reels-container">
            {reels.map((symbol, index) => (
              <div key={index} className={`reel ${spinning ? 'spinning' : ''} ${symbol === '🏆' ? 'winning' : ''}`}>
                <span className="symbol">{symbol}</span>
              </div>
            ))}
          </div>

          {jackpotWon && (
            <div className="win-display animate-winPulse">
              JACKPOT! {win.toLocaleString()}!
            </div>
          )}

          {win > 0 && !jackpotWon && (
            <div className="win-display animate-winPulse">
              WIN {win.toLocaleString()}!
            </div>
          )}

          {message && win === 0 && !jackpotWon && (
            <div className="message-display">
              {message}
            </div>
          )}
        </div>

        <div className="game-controls">
          <div className="bet-controls">
            <span className="label">Bet:</span>
            <button onClick={() => changeBet(-100)} disabled={spinning || bet <= minBet}>-</button>
            <span className="bet-amount">{bet}</span>
            <button onClick={() => changeBet(100)} disabled={spinning || bet >= maxBet}>+</button>
          </div>

          <button className="spin-btn" onClick={spin} disabled={spinning}>
            {spinning ? <RotateCcw className="spin-icon" /> : <Play />}
            <span>{spinning ? 'Spinning...' : 'SPIN'}</span>
          </button>
        </div>

        <div className="payout-table">
          <h3>How to Win</h3>
          <div className="payouts">
            <div className="payout-row jackpot">
              <span>5x 🏆 (Jackpot)</span>
              <span className="payout-amount">100x + Jackpot</span>
            </div>
            <div className="payout-row">
              <span>3x 7️⃣</span>
              <span className="payout-amount">50x</span>
            </div>
            <div className="payout-row">
              <span>3x Match</span>
              <span className="payout-amount">10x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressiveSlots
