import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGame } from '../../context/GameContext'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import '../games/Game.css'

const SUITS = ['♠️', '♥️', '♦️', '♣️']
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

function createDeck() {
  const deck = []
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value })
    }
  }
  return shuffleDeck(deck)
}

function shuffleDeck(deck) {
  const newDeck = [...deck]
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
  }
  return newDeck
}

function getHandRank(hand) {
  const values = hand.map(c => c.value)
  const suits = hand.map(c => c.suit)

  const valueCounts = {}
  values.forEach(v => { valueCounts[v] = (valueCounts[v] || 0) + 1 })

  const counts = Object.values(valueCounts).sort((a, b) => b - a)

  const isFlush = suits.every(s => s === suits[0])

  const valueOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
  const numericValues = values.map(v => valueOrder.indexOf(v)).sort((a, b) => a - b)

  let isStraight = false
  if (numericValues.length === 5) {
    const uniqueValues = [...new Set(numericValues)]
    if (uniqueValues.length === 5) {
      isStraight = numericValues[4] - numericValues[0] === 4 ||
        (numericValues[0] === 0 && numericValues[1] === 1 && numericValues[2] === 2 && numericValues[3] === 3 && numericValues[4] === 12)
    }
  }

  if (counts[0] === 5) return { rank: 9, name: 'Five of a Kind' }
  if (isFlush && isStraight) return { rank: 8, name: 'Royal Flush' }
  if (isFlush && isStraight) return { rank: 8, name: 'Straight Flush' }
  if (counts[0] === 4) return { rank: 7, name: 'Four of a Kind' }
  if (counts[0] === 3 && counts[1] === 2) return { rank: 6, name: 'Full House' }
  if (isFlush) return { rank: 5, name: 'Flush' }
  if (isStraight) return { rank: 4, name: 'Straight' }
  if (counts[0] === 3) return { rank: 3, name: 'Three of a Kind' }
  if (counts[0] === 2 && counts[1] === 2) return { rank: 2, name: 'Two Pair' }
  if (counts[0] === 2) {
    const pairValue = Object.keys(valueCounts).find(v => valueCounts[v] === 2)
    if (['J', 'Q', 'K', 'A'].includes(pairValue) || parseInt(pairValue) >= 10) {
      return { rank: 1, name: 'Jacks or Better' }
    }
  }

  return { rank: 0, name: 'Nothing' }
}

const PAYOUTS = {
  9: { name: 'Royal Flush', multiplier: 800 },
  8: { name: 'Straight Flush', multiplier: 50 },
  7: { name: 'Four of a Kind', multiplier: 25 },
  6: { name: 'Full House', multiplier: 9 },
  5: { name: 'Flush', multiplier: 6 },
  4: { name: 'Straight', multiplier: 4 },
  3: { name: 'Three of a Kind', multiplier: 3 },
  2: { name: 'Two Pair', multiplier: 2 },
  1: { name: 'Jacks or Better', multiplier: 1 }
}

function VideoPoker() {
  const { user, updateBalance } = useAuth()
  const { addGame, checkAchievements } = useGame()
  const [deck, setDeck] = useState(createDeck())
  const [hand, setHand] = useState([])
  const [held, setHeld] = useState([false, false, false, false, false])
  const [bet, setBet] = useState(10)
  const [gameState, setGameState] = useState('deal')
  const [message, setMessage] = useState('')
  const [win, setWin] = useState(0)

  const minBet = 10
  const maxBet = 100

  const deal = () => {
    if (!user || bet > user.balance) {
      setMessage('Insufficient balance!')
      return
    }

    if (gameState === 'deal') {
      const newDeck = createDeck()
      const initialHand = [
        newDeck.pop(),
        newDeck.pop(),
        newDeck.pop(),
        newDeck.pop(),
        newDeck.pop()
      ]

      setDeck(newDeck)
      setHand(initialHand)
      setHeld([false, false, false, false, false])

      const newBalance = user.balance - bet
      updateBalance(newBalance)

      const result = getHandRank(initialHand)
      if (result.rank > 0) {
        const winAmount = bet * (PAYOUTS[result.rank]?.multiplier || 0)
        setGameState('draw')
        setMessage(`Hold cards to keep, then Draw!`)
      } else {
        setGameState('draw')
        setMessage('Hold cards to keep, then Draw!')
      }
    } else if (gameState === 'draw') {
      let newDeck = [...deck]
      const newHand = [...hand]

      for (let i = 0; i < 5; i++) {
        if (!held[i]) {
          newHand[i] = newDeck.pop()
        }
      }

      setDeck(newDeck)
      setHand(newHand)

      const result = getHandRank(newHand)

      if (result.rank >= 1) {
        const winAmount = bet * (PAYOUTS[result.rank]?.multiplier || 0)
        const finalBalance = user.balance + winAmount
        updateBalance(finalBalance)
        setWin(winAmount - bet)
        setMessage(`${result.name}! You win ${winAmount} credits!`)

        addGame({
          type: 'poker',
          gameName: 'Video Poker',
          bet,
          win: winAmount - bet
        })

        checkAchievements({ type: 'poker', bet, win: winAmount - bet })
      } else {
        setWin(-bet)
        setMessage('No win this time. Try again!')

        addGame({
          type: 'poker',
          gameName: 'Video Poker',
          bet,
          win: 0
        })
      }

      setGameState('result')
    } else {
      const newDeck = createDeck()
      const initialHand = [
        newDeck.pop(),
        newDeck.pop(),
        newDeck.pop(),
        newDeck.pop(),
        newDeck.pop()
      ]

      setDeck(newDeck)
      setHand(initialHand)
      setHeld([false, false, false, false, false])

      const newBalance = user.balance - bet
      updateBalance(newBalance)

      setGameState('draw')
      setMessage('Hold cards to keep, then Draw!')
      setWin(0)
    }
  }

  const toggleHold = (index) => {
    if (gameState !== 'draw') return
    setHeld(prev => {
      const newHeld = [...prev]
      newHeld[index] = !newHeld[index]
      return newHeld
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
      <Link to="/tables" className="back-link">
        <ArrowLeft size={20} />
        <span>Back to Tables</span>
      </Link>

      <div className="game-container">
        <div className="game-header">
          <h1>Video Poker</h1>
          <p>Jacks or Better - Make your best hand!</p>
        </div>

        <div className="poker-hand">
          {hand.map((card, index) => (
            <div
              key={index}
              className={`poker-card ${held[index] ? 'held' : ''} ${['♥️', '♦️'].includes(card.suit) ? 'red' : ''}`}
              onClick={() => toggleHold(index)}
            >
              {card.value}
              <span className="card-suit">{card.suit}</span>
              {held[index] && <div className="hold-badge">HELD</div>}
            </div>
          ))}
        </div>

        {message && (
          <div className={`message-display ${win > 0 ? 'success' : win < 0 && gameState === 'result' ? 'error' : ''}`}>
            {message}
            {win > 0 && gameState === 'result' && <span className="win-amount">+{win}</span>}
          </div>
        )}

        <div className="game-controls">
          <div className="bet-controls">
            <span className="label">Bet:</span>
            <button onClick={() => changeBet(-10)} disabled={gameState === 'draw' || bet <= minBet}>-</button>
            <span className="bet-amount">{bet}</span>
            <button onClick={() => changeBet(10)} disabled={gameState === 'draw' || bet >= maxBet}>+</button>
          </div>

          <button className="spin-btn" onClick={deal}>
            {gameState === 'deal' && 'DEAL'}
            {gameState === 'draw' && 'DRAW'}
            {gameState === 'result' && 'DEAL'}
          </button>
        </div>

        <div className="payout-table">
          <h3>Paytable</h3>
          <div className="payouts">
            {Object.entries(PAYOUTS).reverse().map(([rank, info]) => (
              <div key={rank} className="payout-row">
                <span>{info.name}</span>
                <span className="payout-amount">{info.multiplier}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPoker
