import { createContext, useContext, useReducer, useEffect } from 'react'
import { useAuth } from './AuthContext'

const GameContext = createContext(null)

const ACHIEVEMENTS = [
  { id: 'first_spin', name: 'First Spin', description: 'Play your first slot spin', icon: '🎰' },
  { id: 'first_deal', name: 'First Deal', description: 'Play your first hand of blackjack', icon: '🃏' },
  { id: 'lucky_streak', name: 'Lucky Streak', description: 'Win 5 bets in a row', icon: '🍀' },
  { id: 'big_winner', name: 'Big Winner', description: 'Win 10,000+ credits in a single bet', icon: '💰' },
  { id: 'high_roller', name: 'High Roller', description: 'Place a bet of 1,000+ credits', icon: '🎲' },
  { id: 'vip_member', name: 'VIP Member', description: 'Play 100 games', icon: '⭐' },
  { id: 'fortune_builder', name: 'Fortune Builder', description: 'Accumulate 50,000 credits', icon: '🏦' },
  { id: 'slot_master', name: 'Slot Master', description: 'Win on all 3 slot machines', icon: '👑' }
]

const initialState = {
  gameHistory: [],
  achievements: [],
  currentStreak: 0,
  progressiveJackpot: 0,
  leaderboard: {
    highestWin: [],
    mostGames: [],
    biggestJackpot: []
  }
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'ADD_GAME':
      return {
        ...state,
        gameHistory: [action.payload, ...state.gameHistory].slice(0, 50)
      }
    case 'UNLOCK_ACHIEVEMENT':
      if (state.achievements.find(a => a.id === action.payload.id)) {
        return state
      }
      return {
        ...state,
        achievements: [...state.achievements, { ...action.payload, unlockedAt: new Date().toISOString() }]
      }
    case 'UPDATE_STREAK':
      return {
        ...state,
        currentStreak: action.payload
      }
    case 'INCREMENT_JACKPOT':
      return {
        ...state,
        progressiveJackpot: state.progressiveJackpot + action.payload
      }
    case 'RESET_JACKPOT':
      return {
        ...state,
        progressiveJackpot: 0
      }
    case 'SET_LEADERBOARD':
      return {
        ...state,
        leaderboard: action.payload
      }
    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload
      }
    default:
      return state
  }
}

export function GameProvider({ children }) {
  const { user, updateUser } = useAuth()
  const [state, dispatch] = useReducer(gameReducer, initialState)

  useEffect(() => {
    if (user) {
      const savedState = localStorage.getItem(`casino_game_${user.id}`)
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState)
          dispatch({ type: 'LOAD_STATE', payload: parsed })
        } catch (e) {
          console.error('Failed to load game state:', e)
        }
      }
    }
  }, [user])

  useEffect(() => {
    if (user) {
      localStorage.setItem(`casino_game_${user.id}`, JSON.stringify({
        gameHistory: state.gameHistory,
        achievements: state.achievements,
        currentStreak: state.currentStreak,
        progressiveJackpot: state.progressiveJackpot
      }))
    }
  }, [user, state])

  useEffect(() => {
    updateLeaderboards()
  }, [state.gameHistory])

  const addGame = (game) => {
    const gameEntry = {
      id: Date.now(),
      ...game,
      timestamp: new Date().toISOString()
    }
    dispatch({ type: 'ADD_GAME', payload: gameEntry })

    if (user) {
      const newStats = {
        totalGames: (user.stats?.totalGames || 0) + 1,
        totalWins: game.win > 0 ? (user.stats?.totalWins || 0) + 1 : user.stats?.totalWins || 0,
        biggestWin: Math.max(user.stats?.biggestWin || 0, game.win),
        favoriteGame: game.type
      }
      updateUser({ stats: newStats })
    }

    return gameEntry
  }

  const checkAchievements = (gameResult) => {
    const newAchievements = []

    if (gameResult.type === 'slots' && !state.achievements.find(a => a.id === 'first_spin')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'first_spin')
      if (achievement) {
        newAchievements.push(achievement)
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement })
      }
    }

    if (gameResult.type === 'blackjack' && !state.achievements.find(a => a.id === 'first_deal')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'first_deal')
      if (achievement) {
        newAchievements.push(achievement)
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement })
      }
    }

    if (gameResult.win >= 10000 && !state.achievements.find(a => a.id === 'big_winner')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'big_winner')
      if (achievement) {
        newAchievements.push(achievement)
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement })
      }
    }

    if (gameResult.bet >= 1000 && !state.achievements.find(a => a.id === 'high_roller')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'high_roller')
      if (achievement) {
        newAchievements.push(achievement)
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement })
      }
    }

    if (gameResult.win > 0) {
      const newStreak = state.currentStreak + 1
      dispatch({ type: 'UPDATE_STREAK', payload: newStreak })

      if (newStreak >= 5 && !state.achievements.find(a => a.id === 'lucky_streak')) {
        const achievement = ACHIEVEMENTS.find(a => a.id === 'lucky_streak')
        if (achievement) {
          newAchievements.push(achievement)
          dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement })
        }
      }
    } else {
      dispatch({ type: 'UPDATE_STREAK', payload: 0 })
    }

    if (user && user.stats?.totalGames >= 100 && !state.achievements.find(a => a.id === 'vip_member')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'vip_member')
      if (achievement) {
        newAchievements.push(achievement)
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement })
      }
    }

    if (user && user.balance >= 50000 && !state.achievements.find(a => a.id === 'fortune_builder')) {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'fortune_builder')
      if (achievement) {
        newAchievements.push(achievement)
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement })
      }
    }

    return newAchievements
  }

  const incrementJackpot = (amount = 10) => {
    dispatch({ type: 'INCREMENT_JACKPOT', payload: amount })
  }

  const resetJackpot = () => {
    dispatch({ type: 'RESET_JACKPOT' })
  }

  const updateLeaderboards = () => {
    const users = JSON.parse(localStorage.getItem('casino_users') || '[]')

    const highestWin = [...users]
      .sort((a, b) => (b.stats?.biggestWin || 0) - (a.stats?.biggestWin || 0))
      .slice(0, 10)
      .map(u => ({ username: u.username, score: u.stats?.biggestWin || 0 }))

    const mostGames = [...users]
      .sort((a, b) => (b.stats?.totalGames || 0) - (a.stats?.totalGames || 0))
      .slice(0, 10)
      .map(u => ({ username: u.username, score: u.stats?.totalGames || 0 }))

    const biggestJackpot = [...users]
      .sort((a, b) => (b.stats?.biggestJackpot || 0) - (a.stats?.biggestJackpot || 0))
      .slice(0, 10)
      .map(u => ({ username: u.username, score: u.stats?.biggestJackpot || 0 }))

    dispatch({
      type: 'SET_LEADERBOARD',
      payload: { highestWin, mostGames, biggestJackpot }
    })
  }

  const getAchievements = () => ACHIEVEMENTS

  return (
    <GameContext.Provider value={{
      ...state,
      addGame,
      checkAchievements,
      incrementJackpot,
      resetJackpot,
      getAchievements,
      updateLeaderboards
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
