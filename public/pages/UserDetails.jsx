const { useParams } = ReactRouterDOM
const { useState, useEffect } = React

import { authService } from '../services/auth.service.js'
import { userService } from '../services/user.service.js'
import { bugService } from '../services/bug.service.js' // make sure you have this

export function UserDetails() {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [bugs, setBugs] = useState([])

 useEffect(() => {
  const loggedinUser = authService.getLoggedinUser()
  if (!loggedinUser) return

  const targetUserId = userId === 'profile' ? loggedinUser._id : userId

  userService.getById(targetUserId)
    .then(setUser)
    .catch(err => console.log('Error loading user', err))

  bugService.query()
    .then(bugs => {
      // filter only bugs created by this user
      const userBugs = bugs.filter(bug => bug.creator && bug.creator._id === targetUserId)
      setBugs(userBugs)
    })
    .catch(err => console.log('Error loading bugs', err))
}, [userId])

  if (!authService.getLoggedinUser()) return <p>Please sign in</p>
  if (!user) return <p>Loading user...</p>

  return (
    <section className="user-details">
      <h2>User Details</h2>
      <h3>{user.fullname}</h3>
      <p>Username: {user.username}</p>
      <p>User ID: {user._id}</p>

      <h4>Bugs by {user.fullname} ({bugs.length} total):</h4>
      {bugs.length === 0 ? (
        <p>No bugs found.</p>
      ) : (
        <ul>
          {bugs.map(bug => (
            <li key={bug._id}>
              {bug.title} – Severity {bug.severity}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
