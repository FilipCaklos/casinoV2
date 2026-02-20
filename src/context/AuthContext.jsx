import { createContext, useContext, useReducer, useEffect } from 'react'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  loading: true,
  error: null
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, loading: false, error: null }
    case 'LOGIN_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'LOGOUT':
      return { ...state, user: null, loading: false }
    case 'UPDATE_BALANCE':
      if (!state.user) return state
      return {
        ...state,
        user: { ...state.user, balance: action.payload }
      }
    case 'UPDATE_USER':
      if (!state.user) return state
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

  useEffect(() => {
    const storedUser = localStorage.getItem('casino_user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        dispatch({ type: 'LOGIN_SUCCESS', payload: user })
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = async (username, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    await new Promise(resolve => setTimeout(resolve, 500))

    const users = JSON.parse(localStorage.getItem('casino_users') || '[]')
    const user = users.find(u => u.username === username && u.password === password)

    if (user) {
      const { password: _, ...userWithoutPassword } = user
      localStorage.setItem('casino_user', JSON.stringify(userWithoutPassword))
      dispatch({ type: 'LOGIN_SUCCESS', payload: userWithoutPassword })
      return { success: true }
    } else {
      dispatch({ type: 'LOGIN_ERROR', payload: 'Invalid username or password' })
      return { success: false, error: 'Invalid username or password' }
    }
  }

  const register = async (username, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    await new Promise(resolve => setTimeout(resolve, 500))

    const users = JSON.parse(localStorage.getItem('casino_users') || '[]')

    if (users.find(u => u.username === username)) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: false, error: 'Username already exists' }
    }

    const newUser = {
      id: Date.now(),
      username,
      password,
      balance: 10000,
      createdAt: new Date().toISOString(),
      avatar: 'player',
      achievements: [],
      stats: {
        totalGames: 0,
        totalWins: 0,
        biggestWin: 0,
        favoriteGame: null
      },
      lastDailyBonus: null
    }

    users.push(newUser)
    localStorage.setItem('casino_users', JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    localStorage.setItem('casino_user', JSON.stringify(userWithoutPassword))
    dispatch({ type: 'LOGIN_SUCCESS', payload: userWithoutPassword })

    return { success: true }
  }

  const logout = () => {
    localStorage.removeItem('casino_user')
    dispatch({ type: 'LOGOUT' })
  }

  const updateBalance = (newBalance) => {
    if (!state.user) return

    const updatedUser = { ...state.user, balance: newBalance }
    localStorage.setItem('casino_user', JSON.stringify(updatedUser))

    const users = JSON.parse(localStorage.getItem('casino_users') || '[]')
    const userIndex = users.findIndex(u => u.id === state.user.id)
    if (userIndex !== -1) {
      users[userIndex].balance = newBalance
      localStorage.setItem('casino_users', JSON.stringify(users))
    }

    dispatch({ type: 'UPDATE_BALANCE', payload: newBalance })
  }

  const updateUser = (updates) => {
    if (!state.user) return

    const updatedUser = { ...state.user, ...updates }
    localStorage.setItem('casino_user', JSON.stringify(updatedUser))

    const users = JSON.parse(localStorage.getItem('casino_users') || '[]')
    const userIndex = users.findIndex(u => u.id === state.user.id)
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates }
      localStorage.setItem('casino_users', JSON.stringify(users))
    }

    dispatch({ type: 'UPDATE_USER', payload: updates })
  }

  const claimDailyBonus = () => {
    if (!state.user) return false

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
      login,
      register,
      logout,
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
