import { useState, useEffect } from 'react'
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

function getCardValue(card) {
  if (['J', 'Q', 'K'].includes(card.value)) return 10
  if (card.value === 'A') return 11
  return parseInt(card.value)
}

function calculateScore(hand) {
  let score = hand.reduce((sum, card) => sum + getCardValue(card), 0)
  let aces = hand.filter(card => card.value === 'A').length

  while (score > 21 && aces > 0) {
    score -= 10
    aces--
  }

  return score
}

function Blackjack() {
  const { user, updateBalance } = useAuth()
  const { addGame, checkAchievements } = useGame()
  const [deck, setDeck] = useState(createDeck())
  const [playerHand, setPlayerHand] = useState([])
  const [dealerHand, setDealerHand] = useState([])
  const [bet, setBet] = useState(10)
  const [gameState, setGameState] = useState('betting')
  const [message, setMessage] = useState('')
  const [playerWins, setPlayerWins] = useState(0)

  const minBet = 10
  const maxBet = 1000

  const deal = () => {
    if (!user || bet > user.balance) {
      setMessage('Insufficient balance!')
      return
    }

    const newDeck = createDeck()
    const pHand = [newDeck.pop(), newDeck.pop()]
    const dHand = [newDeck.pop(), newDeck.pop()]

    setDeck(newDeck)
    setPlayerHand(pHand)
    setDealerHand(dHand)
    setGameState('playing')
    setMessage('')

    const newBalance = user.balance - bet
    updateBalance(newBalance)

    const score = calculateScore(pHand)
    if (score === 21) {
      setGameState('finished')
      setMessage('Blackjack! You win!')
      const winAmount = Math.floor(bet * 2.5)
      updateBalance(user.balance - bet + winAmount)
      setPlayerWins(winAmount)

      addGame({
        type: 'blackjack',
        gameName: 'Blackjack',
        bet,
        win: winAmount - bet
      })

      checkAchievements({ type: 'blackjack', bet, win: winAmount - bet })
    }
  }

  const hit = () => {
    if (gameState !== 'playing') return

    const newDeck = [...deck]
    const card = newDeck.pop()
    const newHand = [...playerHand, card]

    setDeck(newDeck)
    setPlayerHand(newHand)

    const score = calculateScore(newHand)
    if (score > 21) {
      setGameState('finished')
      setMessage('Bust! Dealer wins.')

      addGame({
        type: 'blackjack',
        gameName: 'Blackjack',
        bet,
        win: 0
      })
    }
  }

  const stand = () => {
    if (gameState !== 'playing') return

    let dHand = [...dealerHand]
    let dScore = calculateScore(dHand)
    let newDeck = [...deck]

    while (dScore < 17) {
      dHand.push(newDeck.pop())
      dScore = calculateScore(dHand)
    }

    setDeck(newDeck)
    setDealerHand(dHand)

    const pScore = calculateScore(playerHand)

    if (dScore > 21) {
      setMessage('Dealer busts! You win!')
      const winAmount = bet * 2
      updateBalance(user.balance + winAmount)
      setPlayerWins(winAmount)

      addGame({
        type: 'blackjack',
        gameName: 'Blackjack',
        bet,
        win: winAmount - bet
      })

      checkAchievements({ type: 'blackjack', bet, win: winAmount - bet })
    } else if (pScore > dScore) {
      setMessage('You win!')
      const winAmount = bet * 2
      updateBalance(user.balance + winAmount)
      setPlayerWins(winAmount)

      addGame({
        type: 'blackjack',
        gameName: 'Blackjack',
        bet,
        win: winAmount - bet
      })

      checkAchievements({ type: 'blackjack', bet, win: winAmount - bet })
    } else if (pScore < dScore) {
      setMessage('Dealer wins.')
      setPlayerWins(0)

      addGame({
        type: 'blackjack',
        gameName: 'Blackjack',
        bet,
        win: 0
      })
    } else {
      setMessage('Push! It\'s a tie.')
      updateBalance(user.balance + bet)
      setPlayerWins(bet)

      addGame({
        type: 'blackjack',
        gameName: 'Blackjack',
        bet,
        win: 0
      })
    }

    setGameState('finished')
  }

  const newGame = () => {
    setDeck(createDeck())
    setPlayerHand([])
    setDealerHand([])
    setGameState('betting')
    setMessage('')
    setPlayerWins(0)
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
          <h1>Blackjack</h1>
          <p>Beat the dealer without going over 21</p>
        </div>

        <div className="blackjack-table">
          <div className="hand dealer">
            <h3>Dealer's Hand {gameState !== 'playing' && `(${calculateScore(dealerHand)})`}</h3>
            <div className="cards">
              {dealerHand.map((card, index) => (
                <div key={index} className={`card ${['♥️', '♦️'].includes(card.suit) ? 'red' : ''}`}>
                  <span className="value">{card.value}</span>
                  <span className="suit">{card.suit}</span>
                </div>
              ))}
              {dealerHand.length === 0 && <div className="card placeholder">?</div>}
            </div>
          </div>

          {message && (
            <div className={`game-message ${playerWins > 0 ? 'win' : 'lose'}`}>
              {message}
              {playerWins > 0 && <span className="win-amount">+{playerWins}</span>}
            </div>
          )}

          <div className="hand player">
            <h3>Your Hand ({calculateScore(playerHand)})</h3>
            <div className="cards">
              {playerHand.map((card, index) => (
                <div key={index} className={`card ${['♥️', '♦️'].includes(card.suit) ? 'red' : ''}`}>
                  <span className="value">{card.value}</span>
                  <span className="suit">{card.suit}</span>
                </div>
              ))}
              {playerHand.length === 0 && <div className="card placeholder">Click Deal to Start</div>}
            </div>
          </div>
        </div>

        <div className="game-controls">
          {gameState === 'betting' ? (
            <>
              <div className="bet-controls">
                <span className="label">Bet:</span>
                <button onClick={() => changeBet(-10)} disabled={bet <= minBet}>-</button>
                <span className="bet-amount">{bet}</span>
                <button onClick={() => changeBet(10)} disabled={bet >= maxBet}>+</button>
              </div>
              <button className="spin-btn" onClick={deal}>
                <span>DEAL</span>
              </button>
            </>
          ) : gameState === 'playing' ? (
            <>
              <button className="spin-btn" onClick={hit}>HIT</button>
              <button className="spin-btn stand" onClick={stand}>STAND</button>
            </>
          ) : (
            <button className="spin-btn" onClick={newGame}>
              <RefreshCw size={20} />
              <span>NEW GAME</span>
            </button>
          )}
        </div>

        <div className="payout-table">
          <h3>Rules</h3>
          <div className="payouts">
            <div className="payout-row">
              <span>Blackjack (A + 10)</span>
              <span className="payout-amount">3:2</span>
            </div>
            <div className="payout-row">
              <span>Regular Win</span>
              <span className="payout-amount">1:1</span>
            </div>
            <div className="payout-row">
              <span>Push</span>
              <span className="payout-amount">Money Back</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blackjack
