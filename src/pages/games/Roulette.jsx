import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGame } from '../../context/GameContext'
import { ArrowLeft } from 'lucide-react'
import '../games/Game.css'

const NUMBERS = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26]
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const BLACK_NUMBERS = NUMBERS.filter(n => n !== 0 && !RED_NUMBERS.includes(n))

const BET_TYPES = [
  { id: 'red', name: 'Red', payout: 2, type: 'color' },
  { id: 'black', name: 'Black', payout: 2, type: 'color' },
  { id: 'even', name: 'Even', payout: 2, type: 'parity' },
  { id: 'odd', name: 'Odd', payout: 2, type: 'parity' },
  { id: '1-18', name: '1-18', payout: 2, type: 'range' },
  { id: '19-36', name: '19-36', payout: 2, type: 'range' },
  { id: '1st12', name: '1st 12', payout: 3, type: 'dozen' },
  { id: '2nd12', name: '2nd 12', payout: 3, type: 'dozen' },
  { id: '3rd12', name: '3rd 12', payout: 3, type: 'dozen' }
]

function Roulette() {
  const { user, updateBalance } = useAuth()
  const { addGame, checkAchievements } = useGame()
  const [bet, setBet] = useState(10)
  const [bets, setBets] = useState({})
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [message, setMessage] = useState('')
  const [win, setWin] = useState(0)

  const minBet = 10
  const maxBet = 1000
  const totalBet = Object.values(bets).reduce((sum, b) => sum + b, 0)

  const placeBet = (betType) => {
    if (spinning || !user) return

    if (totalBet + bet > user.balance) {
      setMessage('Insufficient balance!')
      return
    }

    setBets(prev => ({
      ...prev,
      [betType.id]: (prev[betType.id] || 0) + bet
    }))
    setMessage('')
  }

  const clearBets = () => {
    setBets({})
    setMessage('')
  }

  const spin = () => {
    if (spinning || !user || totalBet === 0) {
      if (totalBet === 0) setMessage('Place at least one bet!')
      return
    }

    setSpinning(true)
    setMessage('')

    const totalWagered = totalBet

    const debitedBalance = user.balance - totalWagered
    updateBalance(debitedBalance)

    let totalWin = 0

    setTimeout(() => {
      const winningNumber = NUMBERS[Math.floor(Math.random() * NUMBERS.length)]
      const isRed = RED_NUMBERS.includes(winningNumber)
      const isBlack = BLACK_NUMBERS.includes(winningNumber)
      const isEven = winningNumber % 2 === 0 && winningNumber !== 0
      const isOdd = winningNumber % 2 === 1
      const in1to18 = winningNumber >= 1 && winningNumber <= 18
      const in19to36 = winningNumber >= 19 && winningNumber <= 36
      const in1st12 = winningNumber >= 1 && winningNumber <= 12
      const in2nd12 = winningNumber >= 13 && winningNumber <= 24
      const in3rd12 = winningNumber >= 25 && winningNumber <= 36

      const winningBets = []

      Object.entries(bets).forEach(([betTypeId, betAmount]) => {
        let won = false

        if (betTypeId === 'red' && isRed) won = true
        else if (betTypeId === 'black' && isBlack) won = true
        else if (betTypeId === 'even' && isEven) won = true
        else if (betTypeId === 'odd' && isOdd) won = true
        else if (betTypeId === '1-18' && in1to18) won = true
        else if (betTypeId === '19-36' && in19to36) won = true
        else if (betTypeId === '1st12' && in1st12) won = true
        else if (betTypeId === '2nd12' && in2nd12) won = true
        else if (betTypeId === '3rd12' && in3rd12) won = true
        else if (!isNaN(parseInt(betTypeId))) {
          if (parseInt(betTypeId) === winningNumber) won = true
        }

        if (won) {
          const betType = BET_TYPES.find(b => b.id === betTypeId) || { payout: 36 }
          totalWin += betAmount * betType.payout
          winningBets.push({ type: betTypeId, amount: betAmount * betType.payout })
        }
      })

      setResult({ number: winningNumber, isRed, isGreen: winningNumber === 0, winningBets })

      if (totalWin > 0) {
        const finalBalance = debitedBalance + totalWin
        updateBalance(finalBalance)
        setWin(totalWin - totalWagered)
        setMessage(`WIN! +${totalWin - totalWagered} credits!`)

        addGame({
          type: 'roulette',
          gameName: 'Roulette',
          bet: totalWagered,
          win: totalWin - totalWagered
        })

        checkAchievements({ type: 'roulette', bet: totalWagered, win: totalWin - totalWagered })
      } else {
        setWin(-totalWagered)
        setMessage('Better luck next time!')

        addGame({
          type: 'roulette',
          gameName: 'Roulette',
          bet: totalWagered,
          win: 0
        })
      }

      setSpinning(false)
    }, 2000)
  }

  const changeBet = (delta) => {
    const newBet = bet + delta
    if (newBet >= minBet && newBet <= maxBet) {
      setBet(newBet)
    }
  }

  const isNumberSelected = (num) => {
    return result?.winningBets?.some(b => b.type === num.toString())
  }

  return (
    <div className="game-page">
      <Link to="/tables" className="back-link">
        <ArrowLeft size={20} />
        <span>Back to Tables</span>
      </Link>

      <div className="game-container">
        <div className="game-header">
          <h1>European Roulette</h1>
          <p>Single zero - Better odds!</p>
        </div>

        <div className="roulette-wheel">
          <div className={`roulette-number zero ${result?.number === 0 ? 'selected' : ''}`}>
            0
          </div>
          <div className="roulette-numbers">
            {NUMBERS.slice(1).map(num => (
              <div
                key={num}
                className={`roulette-number ${RED_NUMBERS.includes(num) ? 'red' : 'black'} ${result?.number === num ? 'selected' : ''} ${isNumberSelected(num) ? 'winner' : ''}`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {result && (
          <div className="result-display">
            <span className={`result-number ${result.isRed ? 'red' : result.isGreen ? 'green' : 'black'}`}>
              {result.number}
            </span>
            {win > 0 && <span className="win-amount">+{win}</span>}
          </div>
        )}

        {message && (
          <div className={`message-display ${win > 0 ? 'success' : ''}`}>
            {message}
          </div>
        )}

        <div className="game-controls">
          <div className="bet-controls">
            <span className="label">Chip:</span>
            <button onClick={() => changeBet(-10)}>-</button>
            <span className="bet-amount">{bet}</span>
            <button onClick={() => changeBet(10)}>+</button>
          </div>

          <button className="spin-btn" onClick={spin} disabled={spinning}>
            <span>{spinning ? 'Spinning...' : 'SPIN'}</span>
          </button>

          <button className="clear-btn" onClick={clearBets} disabled={spinning || totalBet === 0}>
            Clear Bets
          </button>
        </div>

        <div className="roulette-bets">
          <div className="bet-section">
            <h3>Outside Bets</h3>
            <div className="bet-grid">
              {BET_TYPES.map(betType => (
                <button
                  key={betType.id}
                  className={`bet-btn ${bets[betType.id] ? 'active' : ''}`}
                  onClick={() => placeBet(betType)}
                  disabled={spinning}
                >
                  <span className="bet-name">{betType.name}</span>
                  <span className="bet-payout">{betType.payout}:1</span>
                  {bets[betType.id] > 0 && <span className="bet-amount">{bets[betType.id]}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="total-bet">
            <span>Total Bet: {totalBet.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Roulette
