const { useState } = React
const { useNavigate } = ReactRouterDOM

import { authService } from '../services/auth.service.js'

export function LoginSignup({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '', fullname: '' })
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()  // <-- allows us to redirect

  function handleChange(ev) {
    const { name, value } = ev.target
    setCredentials(prev => ({ ...prev, [name]: value }))
  }

  function onSubmit(ev) {
    ev.preventDefault()
    setError(null)

    const action = isSignup ? authService.signup : authService.login
    action(credentials)
      .then(user => {
        console.log('Login/signup success:', user)
        sessionStorage.setItem('loggedinUser', JSON.stringify(user)) // stored
        onLogin(user) // updates App state
        navigate('/') // go to home so header re-renders
      })
      .catch(err => {
        console.log('Login/signup failed:', err)
        setError('Failed to login/signup')
      })
  }

  return (
    <section className="login-signup">
      <h2>{isSignup ? 'Sign Up' : 'Log In'}</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={onSubmit}>
        {isSignup && (
          <input
            type="text"
            name="fullname"
            placeholder="Full Name"
            value={credentials.fullname}
            onChange={handleChange}
            required
          />
        )}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={credentials.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          required
        />
        <button type="submit">{isSignup ? 'Sign Up' : 'Log In'}</button>
      </form>
      <button onClick={() => setIsSignup(prev => !prev)}>
        {isSignup ? 'Switch to Log In' : 'Switch to Sign Up'}
      </button>
    </section>
  )
}