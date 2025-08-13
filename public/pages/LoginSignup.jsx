import { userService } from '../services/user.service.js'
import { authService } from '../services/auth.service.js'
const { useState } = React

export function LoginSignup({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(ev) {
    const { name, value } = ev.target
    setCredentials(prev => ({ ...prev, [name]: value }))
    console.log('Changed:', name, value)
  }

  function onSubmit(ev) {
    ev.preventDefault()
    setError(null)
    console.log('Submitting credentials:', credentials)
    const action = isSignup ? authService.signup : authService.login
    action(credentials)  // <-- pass credentials object directly, NOT { credentials }
      .then(user => {
        console.log('Login/signup success:', user)
        onLogin(user)
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