import { createContext, useContext, useReducer, useEffect } from 'react'
import { apiRequest } from '../utils/api'

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
    const bootstrap = async () => {
      const storedUser = localStorage.getItem('casino_user')
      if (!storedUser) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      try {
        const parsed = JSON.parse(storedUser)
        const data = await apiRequest(`/api/users/${parsed.id}`)
        localStorage.setItem('casino_user', JSON.stringify(data.user))
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.user })
      } catch {
        localStorage.removeItem('casino_user')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    bootstrap()
  }, [])

  const login = async (username, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })

      localStorage.setItem('casino_user', JSON.stringify(data.user))
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user })
      return { success: true }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const register = async (username, password) => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })

      localStorage.setItem('casino_user', JSON.stringify(data.user))
      dispatch({ type: 'LOGIN_SUCCESS', payload: data.user })
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('casino_user')
    dispatch({ type: 'LOGOUT' })
  }

  const updateBalance = async (newBalance) => {
    if (!state.user) return

    const updatedUser = { ...state.user, balance: newBalance }
    localStorage.setItem('casino_user', JSON.stringify(updatedUser))
    dispatch({ type: 'UPDATE_BALANCE', payload: newBalance })

    try {
      const data = await apiRequest(`/api/users/${state.user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBalance })
      })
      localStorage.setItem('casino_user', JSON.stringify(data.user))
      dispatch({ type: 'UPDATE_USER', payload: data.user })
    } catch (error) {
      console.error('Failed to persist balance update:', error)
    }
  }

  const updateUser = async (updates) => {
    if (!state.user) return

    const updatedUser = { ...state.user, ...updates }
    localStorage.setItem('casino_user', JSON.stringify(updatedUser))
    dispatch({ type: 'UPDATE_USER', payload: updates })

    try {
      const data = await apiRequest(`/api/users/${state.user.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      })
      localStorage.setItem('casino_user', JSON.stringify(data.user))
      dispatch({ type: 'UPDATE_USER', payload: data.user })
      return data.user
    } catch (error) {
      console.error('Failed to persist user update:', error)
      return null
    }
  }

  const claimDailyBonus = async () => {
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
    await updateBalance(newBalance)
    await updateUser({ lastDailyBonus: now.toISOString() })

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
