const { useState, useEffect } = React
const { Link } = ReactRouterDOM

import { LoginSignup } from "./LoginSignup.jsx"
import { authService } from "../services/auth.service.js"  // Import your authService

export function Home() {
  // State to keep the logged-in user
  const [loggedInUser, setLoggedInUser] = useState(null)

  // check if user already logged in (from sessionStorage)
  useEffect(() => {
    const user = authService.getLoggedinUser()
    if (user) setLoggedInUser(user)
  }, [])

  function handleLogin(user) {
    console.log('User logged in:', user)
    setLoggedInUser(user)  // Save user to state so UI updates immediately
  }

  return (
    <section className="home-page">
      <h2>
        Welcome {loggedInUser ? loggedInUser.fullname : 'Home'}
      </h2>

      {!loggedInUser && <Link to="/login">Login or Signup</Link>}

      {!loggedInUser && <LoginSignup onLogin={handleLogin} />}

      <img src="assets/img/miss-bug.png" />
    </section>
  )
}