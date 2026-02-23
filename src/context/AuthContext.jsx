import { createContext, useContext, useReducer } from 'react'

const STORAGE_KEY = 'casino_guest_user'

const AuthContext = createContext(null)

function createGuestUser() {
  return {
    id: 'guest',
    username: 'Guest',
    balance: 10000,
    createdAt: new Date().toISOString(),
    lastDailyBonus: null,
    stats: { totalGames: 0, totalWins: 0, biggestWin: 0 }
  }
}

function loadGuestUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : createGuestUser()
  } catch {
    return createGuestUser()
  }
}

function saveGuestUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

const initialState = {
  user: loadGuestUser(),
  loading: false,
  error: null
}

function authReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_BALANCE':
      return {
        ...state,
        user: { ...state.user, balance: action.payload }
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const updateBalance = (newBalance) => {
    const updatedUser = { ...state.user, balance: newBalance }
    saveGuestUser(updatedUser)
    dispatch({ type: 'UPDATE_BALANCE', payload: newBalance })
  }

  const updateUser = (updates) => {
    const updatedUser = { ...state.user, ...updates }
    saveGuestUser(updatedUser)
    dispatch({ type: 'UPDATE_USER', payload: updates })
    return updatedUser
  }

  const claimDailyBonus = () => {
    const now = new Date()
    const lastBonus = state.user.lastDailyBonus ? new Date(state.user.lastDailyBonus) : null

    if (lastBonus) {
      const hoursSinceLastBonus = (now - lastBonus) / (1000 * 60 * 60)
      if (hoursSinceLastBonus < 24) {
        return false
      }
    }

    const newBalance = state.user.balance + 1000
    updateBalance(newBalance)
    updateUser({ lastDailyBonus: now.toISOString() })

    return true
  }

  return (
    <AuthContext.Provider value={{
      ...state,
      updateBalance,
      updateUser,
      claimDailyBonus
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
