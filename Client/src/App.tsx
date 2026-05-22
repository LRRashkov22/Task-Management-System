import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { loginApi, logoutApi } from './api/authApi'
import AdminPage from './pages/AdminPage'
import EmployeePage from './pages/EmployeePage'
import ManagerPage from './pages/ManagerPage'
import { commonStyles, loginStyles } from './styles'
import { getRole, logout, saveAuth } from './utils/auth'

  type Message = {
    text: string
    type: 'error' | 'success'
  }

  function App() {
    const [path, setPath] = useState(window.location.pathname)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState<Message | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    function navigate(pathname: string) {
      window.history.pushState(null, '', pathname)
      setPath(pathname)
    }

    useEffect(() => {
      function handlePopState() {
        setPath(window.location.pathname)
      }

      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }, [])

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

        if (role === 'Admin') {
          navigate('/admin')
          return
        }

        if (role === 'Manager') {
          navigate('/manager')
          return
        }

        if (role === 'User' || role === 'Employee') {
          navigate('/home')
          return
        }

        setMessage({
          text: 'Login successful.',
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

    async function handleLogout() {
      try {
        await logoutApi()
      } catch {
        // ignore logout endpoint failures and clear local auth anyway
      }

      logout()
      navigate('/')
    }

    if (path === '/admin' && getRole() === 'Admin') {
      return <AdminPage onLogout={handleLogout} />
    }

    if (path === '/manager' && getRole() === 'Manager') {
      return <ManagerPage onLogout={handleLogout} />
    }

    if ((path === '/home' || path === '/employee') && ['User', 'Employee'].includes(getRole() ?? '')) {
      return <EmployeePage onLogout={handleLogout} />
    }

    return (
      <main className={loginStyles.page}>
        <section className={loginStyles.panel} aria-labelledby="login-title">
          <h1 className={loginStyles.title} id="login-title">
            Login
          </h1>

          <form className={loginStyles.form} onSubmit={handleLogin}>
            <label className={loginStyles.label} htmlFor="username">
              Username
            </label>
            <input
              className={loginStyles.input}
              id="username"
              name="username"
              type="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />

            <label className={loginStyles.label} htmlFor="password">
              Password
            </label>
            <input
              className={loginStyles.input}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {message ? (
              <p
                className={`${loginStyles.message} ${commonStyles.message(message.type)}`}
                role="status"
              >
                {message.text}
              </p>
            ) : null}

            <button className={loginStyles.submit} type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className={loginStyles.demo}>
            <p>Demo accounts:</p>
            <strong>Admin:</strong> admin / admin
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
