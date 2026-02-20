import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const app = express()
const port = process.env.PORT || 3000
const { Pool } = pg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distPath = path.join(__dirname, 'dist')

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)

const pool = hasDatabaseUrl
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
  : null

app.use(express.json())

function formatUser(row) {
  if (!row) return null
  return {
    id: row.id,
    username: row.username,
    balance: row.balance,
    createdAt: row.created_at,
    avatar: row.avatar,
    achievements: row.achievements || [],
    stats: row.stats || {
      totalGames: 0,
      totalWins: 0,
      biggestWin: 0,
      biggestJackpot: 0,
      favoriteGame: null
    },
    lastDailyBonus: row.last_daily_bonus
  }
}

function requireDb(res) {
  if (!pool) {
    res.status(500).json({ error: 'Database is not configured. Set DATABASE_URL.' })
    return false
  }
  return true
}

async function initDatabase() {
  if (!pool) {
    console.warn('DATABASE_URL is not set. API endpoints will return 500 until configured.')
    return
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      balance INTEGER NOT NULL DEFAULT 10000,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      avatar TEXT NOT NULL DEFAULT 'player',
      achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
      stats JSONB NOT NULL DEFAULT '{"totalGames":0,"totalWins":0,"biggestWin":0,"biggestJackpot":0,"favoriteGame":null}'::jsonb,
      last_daily_bonus TIMESTAMPTZ
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS game_states (
      user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      game_history JSONB NOT NULL DEFAULT '[]'::jsonb,
      achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
      current_streak INTEGER NOT NULL DEFAULT 0,
      progressive_jackpot INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

app.post('/api/auth/register', async (req, res) => {
  if (!requireDb(res)) return

  const { username, password } = req.body || {}
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' })
    return
  }

  if (username.length < 3) {
    res.status(400).json({ error: 'Username must be at least 3 characters.' })
    return
  }

  if (password.length < 4) {
    res.status(400).json({ error: 'Password must be at least 4 characters.' })
    return
  }

  try {
    const existing = await pool.query('SELECT 1 FROM users WHERE username = $1', [username])
    if (existing.rowCount > 0) {
      res.status(409).json({ error: 'Username already exists' })
      return
    }

    const insertResult = await pool.query(
      `INSERT INTO users (username, password)
       VALUES ($1, $2)
       RETURNING *`,
      [username, password]
    )

    await pool.query(
      `INSERT INTO game_states (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [insertResult.rows[0].id]
    )

    res.status(201).json({ user: formatUser(insertResult.rows[0]) })
  } catch (error) {
    console.error('Register failed:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  if (!requireDb(res)) return

  const { username, password } = req.body || {}
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' })
    return
  }

  try {
    const result = await pool.query(
      `SELECT * FROM users
       WHERE username = $1 AND password = $2`,
      [username, password]
    )

    if (result.rowCount === 0) {
      res.status(401).json({ error: 'Invalid username or password' })
      return
    }

    await pool.query(
      `INSERT INTO game_states (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [result.rows[0].id]
    )

    res.json({ user: formatUser(result.rows[0]) })
  } catch (error) {
    console.error('Login failed:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

app.get('/api/users/:id', async (req, res) => {
  if (!requireDb(res)) return

  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id])
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json({ user: formatUser(result.rows[0]) })
  } catch (error) {
    console.error('Get user failed:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

app.patch('/api/users/:id', async (req, res) => {
  if (!requireDb(res)) return

  const updates = req.body || {}

  try {
    const currentResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id])
    if (currentResult.rowCount === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const current = currentResult.rows[0]
    const mergedStats = updates.stats ? { ...(current.stats || {}), ...updates.stats } : current.stats
    const mergedAchievements = updates.achievements ?? current.achievements

    const result = await pool.query(
      `UPDATE users
       SET balance = $1,
           avatar = $2,
           achievements = $3::jsonb,
           stats = $4::jsonb,
           last_daily_bonus = $5
       WHERE id = $6
       RETURNING *`,
      [
        updates.balance ?? current.balance,
        updates.avatar ?? current.avatar,
        JSON.stringify(mergedAchievements || []),
        JSON.stringify(mergedStats || {}),
        updates.lastDailyBonus ?? current.last_daily_bonus,
        req.params.id
      ]
    )

    res.json({ user: formatUser(result.rows[0]) })
  } catch (error) {
    console.error('Update user failed:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

app.get('/api/game-state/:userId', async (req, res) => {
  if (!requireDb(res)) return

  try {
    const result = await pool.query(
      `SELECT game_history, achievements, current_streak, progressive_jackpot
       FROM game_states
       WHERE user_id = $1`,
      [req.params.userId]
    )

    if (result.rowCount === 0) {
      await pool.query('INSERT INTO game_states (user_id) VALUES ($1)', [req.params.userId])
      res.json({
        state: {
          gameHistory: [],
          achievements: [],
          currentStreak: 0,
          progressiveJackpot: 0
        }
      })
      return
    }

    const row = result.rows[0]
    res.json({
      state: {
        gameHistory: row.game_history || [],
        achievements: row.achievements || [],
        currentStreak: row.current_streak || 0,
        progressiveJackpot: row.progressive_jackpot || 0
      }
    })
  } catch (error) {
    console.error('Get game state failed:', error)
    res.status(500).json({ error: 'Failed to fetch game state' })
  }
})

app.put('/api/game-state/:userId', async (req, res) => {
  if (!requireDb(res)) return

  const state = req.body || {}

  try {
    await pool.query(
      `INSERT INTO game_states (user_id, game_history, achievements, current_streak, progressive_jackpot, updated_at)
       VALUES ($1, $2::jsonb, $3::jsonb, $4, $5, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET
         game_history = EXCLUDED.game_history,
         achievements = EXCLUDED.achievements,
         current_streak = EXCLUDED.current_streak,
         progressive_jackpot = EXCLUDED.progressive_jackpot,
         updated_at = NOW()`,
      [
        req.params.userId,
        JSON.stringify(state.gameHistory || []),
        JSON.stringify(state.achievements || []),
        state.currentStreak || 0,
        state.progressiveJackpot || 0
      ]
    )

    res.status(204).send()
  } catch (error) {
    console.error('Save game state failed:', error)
    res.status(500).json({ error: 'Failed to save game state' })
  }
})

app.get('/api/leaderboards', async (_req, res) => {
  if (!requireDb(res)) return

  try {
    const highestWinResult = await pool.query(`
      SELECT username, COALESCE((stats->>'biggestWin')::INTEGER, 0) AS score
      FROM users
      ORDER BY score DESC
      LIMIT 10
    `)

    const mostGamesResult = await pool.query(`
      SELECT username, COALESCE((stats->>'totalGames')::INTEGER, 0) AS score
      FROM users
      ORDER BY score DESC
      LIMIT 10
    `)

    const biggestJackpotResult = await pool.query(`
      SELECT username, COALESCE((stats->>'biggestJackpot')::INTEGER, 0) AS score
      FROM users
      ORDER BY score DESC
      LIMIT 10
    `)

    res.json({
      leaderboard: {
        highestWin: highestWinResult.rows,
        mostGames: mostGamesResult.rows,
        biggestJackpot: biggestJackpotResult.rows
      }
    })
  } catch (error) {
    console.error('Leaderboards fetch failed:', error)
    res.status(500).json({ error: 'Failed to fetch leaderboards' })
  }
})

app.use(express.static(distPath))

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error)
    process.exit(1)
  })