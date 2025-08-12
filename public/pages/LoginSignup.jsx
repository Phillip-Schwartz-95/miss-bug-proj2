import { userService } from '../services/user.service.js'
const { useState } = React

export function LoginSignup({ onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(ev) {
    const { name, value } = ev.target
    setCredentials(prev => ({ ...prev, [name]: value }))
  }

  function onSubmit(ev) {
    ev.preventDefault()
    setError(null)
    const action = isSignup ? userService.signup : userService.login
    action(credentials)
      .then(user => {
        onLogin(user)
      })
      .catch(err => setError('Failed to login/signup'))
  }

  return (
    <section className="login-signup">
      <h2>{isSignup ? 'Sign Up' : 'Log In'}</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={onSubmit}>
        <input
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
