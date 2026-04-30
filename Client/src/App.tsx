import { useState } from 'react'
import type { FormEvent } from 'react'
import { loginApi } from './api/authApi'
import { getRole, saveAuth } from './utils/auth'
import './App.css'

type Message = {
  text: string
  type: 'error' | 'success'
}

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<Message | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedUsername = username.trim()
    if (!trimmedUsername || !password) {
      setMessage({ text: 'Enter username and password.', type: 'error' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await loginApi({
        username: trimmedUsername,
        password,
      })

      if (!response.ok) {
        const errorText = await response.text()
        setMessage({
          text: errorText || 'Invalid username or password.',
          type: 'error',
        })
        return
      }

      saveAuth(await response.json())
      const role = getRole()

      setMessage({
        text:
          role === 'Admin'
            ? 'Admin login successful.'
            : 'Login successful.',
        type: 'success',
      })
    } catch {
      setMessage({
        text: 'Login service is not available.',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <h1 id="login-title">Login</h1>

        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="username">Email</label>
          <input
            id="username"
            name="username"
            type="email"
            autoComplete="email"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {message ? (
            <p className={`form-message ${message.type}`} role="status">
              {message.text}
            </p>
          ) : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-box">
          <p>Demo accounts:</p>
          <strong>Admin:</strong> admin@taskman.com / Admin123!
          <br />
          <strong>Manager:</strong> manager@taskman.com / Manager123!
          <br />
          <strong>User:</strong> user@taskman.com / User123!
        </div>
      </section>
    </main>
  )
}

export default App
