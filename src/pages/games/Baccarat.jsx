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

function getCardValue(card) {
  if (['J', 'Q', 'K', '10'].includes(card.value)) return 0
  if (card.value === 'A') return 1
  return parseInt(card.value)
}

function calculateBaccaratScore(hand) {
  const total = hand.reduce((sum, card) => sum + getCardValue(card), 0)
  return total % 10
}

function Baccarat() {
  const { user, updateBalance } = useAuth()
  const { addGame, checkAchievements } = useGame()
  const [deck, setDeck] = useState(createDeck())
  const [playerHand, setPlayerHand] = useState([])
  const [bankerHand, setBankerHand] = useState([])
  const [bet, setBet] = useState(10)
  const [selectedBet, setSelectedBet] = useState(null)
  const [gameState, setGameState] = useState('betting')
  const [message, setMessage] = useState('')
  const [win, setWin] = useState(0)

  const minBet = 10
  const maxBet = 1000

  const deal = () => {
    if (!user || bet > user.balance) {
      setMessage('Insufficient balance!')
      return
    }

    if (!selectedBet) {
      setMessage('Place your bet first!')
      return
    }

    const newDeck = createDeck()
    const pHand = [newDeck.pop(), newDeck.pop()]
    const bHand = [newDeck.pop(), newDeck.pop()]

    setDeck(newDeck)
    setPlayerHand(pHand)
    setBankerHand(bHand)
    setGameState('playing')

    const newBalance = user.balance - bet
    updateBalance(newBalance)

    const pScore = calculateBaccaratScore(pHand)
    const bScore = calculateBaccaratScore(bHand)

    if (pScore >= 8 || bScore >= 8) {
      finishGame(pHand, bHand, pScore, bScore)
    } else {
      let drawPlayer = false
      let drawBanker = false

      if (pScore <= 5) {
        drawPlayer = true
        pHand.push(newDeck.pop())
      }

      const newPScore = calculateBaccaratScore(pHand)

      if (drawPlayer) {
        if (newPScore <= 2) {
          drawBanker = true
        } else if (newPScore === 3) {
          drawBanker = bScore !== 8
        } else if (newPScore === 4) {
          drawBanker = bScore >= 2 && bScore <= 7
        } else if (newPScore === 5) {
          drawBanker = bScore >= 4 && bScore <= 7
        } else if (newPScore === 6) {
          drawBanker = bScore >= 6 && bScore <= 7
        }
      } else if (bScore <= 5) {
        drawBanker = true
      }

      if (drawBanker) {
        bHand.push(newDeck.pop())
      }

      setDeck(newDeck)
      setPlayerHand([...pHand])
      setBankerHand([...bHand])

      finishGame(pHand, bHand, calculateBaccaratScore(pHand), calculateBaccaratScore(bHand))
    }
  }

  const finishGame = (pHand, bHand, pScore, bScore) => {
    let result, winAmount

    if (pScore > bScore) {
      result = 'player'
      winAmount = selectedBet === 'player' ? bet * 2 : 0
    } else if (bScore > pScore) {
      result = 'banker'
      winAmount = selectedBet === 'banker' ? Math.floor(bet * 1.95) : 0
    } else {
      result = 'tie'
      winAmount = selectedBet === 'tie' ? bet * 9 : (selectedBet === 'player' || selectedBet === 'banker' ? bet : 0)
    }

    if (winAmount > 0) {
      updateBalance(user.balance + winAmount)
      setWin(winAmount - bet)
      setMessage(result === 'tie' ? 'Tie! Nobody wins.' : `${result.toUpperCase()} wins!`)

      addGame({
        type: 'baccarat',
        gameName: 'Baccarat',
        bet,
        win: winAmount - bet
      })

      checkAchievements({ type: 'baccarat', bet, win: winAmount - bet })
    } else {
      setWin(-bet)
      setMessage(result === 'tie' ? 'Tie! Nobody wins.' : `${result.toUpperCase()} wins.`)
      setWin(-bet)

      addGame({
        type: 'baccarat',
        gameName: 'Baccarat',
        bet,
        win: 0
      })
    }

    setGameState('finished')
  }

  const newGame = () => {
    setDeck(createDeck())
    setPlayerHand([])
    setBankerHand([])
    setGameState('betting')
    setMessage('')
    setWin(0)
    setSelectedBet(null)
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
          <h1>Baccarat</h1>
          <p>Bet on Player, Banker, or Tie</p>
        </div>

        <div className="baccarat-table">
          <div className="hand banker">
            <h3>Banker ({bankerHand.length > 0 ? calculateBaccaratScore(bankerHand) : '-'})</h3>
            <div className="cards">
              {bankerHand.map((card, index) => (
                <div key={index} className={`card ${['♥️', '♦️'].includes(card.suit) ? 'red' : ''}`}>
                  <span className="value">{card.value}</span>
                  <span className="suit">{card.suit}</span>
                </div>
              ))}
              {bankerHand.length === 0 && <div className="card placeholder">?</div>}
            </div>
          </div>

          {message && (
            <div className={`game-message ${win > 0 ? 'win' : win < 0 ? 'lose' : ''}`}>
              {message}
              {win > 0 && <span className="win-amount">+{win}</span>}
              {win < 0 && <span className="win-amount">{win}</span>}
            </div>
          )}

          <div className="hand player">
            <h3>Player ({playerHand.length > 0 ? calculateBaccaratScore(playerHand) : '-'})</h3>
            <div className="cards">
              {playerHand.map((card, index) => (
                <div key={index} className={`card ${['♥️', '♦️'].includes(card.suit) ? 'red' : ''}`}>
                  <span className="value">{card.value}</span>
                  <span className="suit">{card.suit}</span>
                </div>
              ))}
              {playerHand.length === 0 && <div className="card placeholder">?</div>}
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

              <div className="bet-selection">
                <button
                  className={`bet-option ${selectedBet === 'player' ? 'active' : ''}`}
                  onClick={() => setSelectedBet('player')}
                >
                  Player (1:1)
                </button>
                <button
                  className={`bet-option ${selectedBet === 'banker' ? 'active' : ''}`}
                  onClick={() => setSelectedBet('banker')}
                >
                  Banker (0.95:1)
                </button>
                <button
                  className={`bet-option ${selectedBet === 'tie' ? 'active' : ''}`}
                  onClick={() => setSelectedBet('tie')}
                >
                  Tie (9:1)
                </button>
              </div>

              <button className="spin-btn" onClick={deal} disabled={!selectedBet}>
                DEAL
              </button>
            </>
          ) : (
            <button className="spin-btn" onClick={newGame}>
              <RefreshCw size={20} />
              NEW GAME
            </button>
          )}
        </div>

        <div className="payout-table">
          <h3>Payouts</h3>
          <div className="payouts">
            <div className="payout-row">
              <span>Player Win</span>
              <span className="payout-amount">1:1</span>
            </div>
            <div className="payout-row">
              <span>Banker Win</span>
              <span className="payout-amount">0.95:1</span>
            </div>
            <div className="payout-row">
              <span>Tie</span>
              <span className="payout-amount">9:1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Baccarat
