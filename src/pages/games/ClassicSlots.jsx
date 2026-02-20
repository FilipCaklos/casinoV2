import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGame } from '../../context/GameContext'
import { ArrowLeft, Play, RotateCcw } from 'lucide-react'
import './Game.css'

const SYMBOLS = ['7', 'BAR', '🍒', '🍋', '🔔']
const PAYOUTS = {
  '7': { 1: 0, 2: 10, 3: 100 },
  'BAR': { 1: 0, 2: 5, 3: 50 },
  '🍒': { 1: 0, 2: 2, 3: 20 },
  '🍋': { 1: 0, 2: 2, 3: 10 },
  '🔔': { 1: 0, 2: 2, 3: 10 }
}

function ClassicSlots() {
  const { user, updateBalance } = useAuth()
  const { addGame, checkAchievements, incrementJackpot } = useGame()
  const [reels, setReels] = useState([SYMBOLS[2], SYMBOLS[2], SYMBOLS[2]])
  const [spinning, setSpinning] = useState(false)
  const [bet, setBet] = useState(10)
  const [win, setWin] = useState(0)
  const [message, setMessage] = useState('')
  const [winLines, setWinLines] = useState([])

  const minBet = 10
  const maxBet = 1000

  const spin = () => {
    if (spinning || !user) return
    if (bet > user.balance) {
      setMessage('Insufficient balance!')
      return
    }

    setSpinning(true)
    setWin(0)
    setMessage('')
    setWinLines([])

    const newBalance = user.balance - bet
    updateBalance(newBalance)
    incrementJackpot(bet * 0.1)

    const spinReels = () => {
      return new Promise((resolve) => {
        let count = 0
        const interval = setInterval(() => {
          setReels([
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
          ])
          count++
          if (count > 10) {
            clearInterval(interval)
            resolve()
          }
        }, 100)
      })
    }

    spinReels().then(() => {
      const finalReels = [
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
      ]
      setReels(finalReels)

      let totalWin = 0
      const lines = []

      if (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]) {
        totalWin = bet * PAYOUTS[finalReels[0]][3]
        lines.push([0, 1, 2])
      } else if (finalReels[0] === finalReels[1]) {
        totalWin = bet * PAYOUTS[finalReels[0]][2]
        lines.push([0, 1])
      } else if (finalReels[1] === finalReels[2]) {
        totalWin = bet * PAYOUTS[finalReels[1]][2]
        lines.push([1, 2])
      }

      if (totalWin > 0) {
        const finalBalance = user.balance - bet + totalWin
        updateBalance(finalBalance)
        setWin(totalWin)
        setWinLines(lines)
        setMessage(`WINNER! +${totalWin} credits!`)

        addGame({
          type: 'slots',
          gameName: 'Classic Slots',
          bet,
          win: totalWin
        })

        checkAchievements({ type: 'slots', bet, win: totalWin })
      } else {
        addGame({
          type: 'slots',
          gameName: 'Classic Slots',
          bet,
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
          <h1>Classic Slots</h1>
          <p>Match 3 symbols to win!</p>
        </div>

        <div className="slot-machine">
          <div className="reels-container">
            {reels.map((symbol, index) => (
              <div
                key={index}
                className={`reel ${spinning ? 'spinning' : ''} ${winLines.includes(index) || winLines.flat().includes(index) ? 'winning' : ''}`}
              >
                <span className="symbol">{symbol}</span>
              </div>
            ))}
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
        </div>

        <div className="game-controls">
          <div className="bet-controls">
            <span className="label">Bet:</span>
            <button onClick={() => changeBet(-10)} disabled={spinning || bet <= minBet}>-</button>
            <span className="bet-amount">{bet}</span>
            <button onClick={() => changeBet(10)} disabled={spinning || bet >= maxBet}>+</button>
          </div>

          <button className="spin-btn" onClick={spin} disabled={spinning}>
            {spinning ? <RotateCcw className="spin-icon" /> : <Play />}
            <span>{spinning ? 'Spinning...' : 'SPIN'}</span>
          </button>
        </div>

        <div className="payout-table">
          <h3>Payouts</h3>
          <div className="payouts">
            <div className="payout-row">
              <span>3x 7</span>
              <span className="payout-amount">100x</span>
            </div>
            <div className="payout-row">
              <span>3x BAR</span>
              <span className="payout-amount">50x</span>
            </div>
            <div className="payout-row">
              <span>3x Cherry</span>
              <span className="payout-amount">20x</span>
            </div>
            <div className="payout-row">
              <span>2x Any Match</span>
              <span className="payout-amount">2x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClassicSlots
