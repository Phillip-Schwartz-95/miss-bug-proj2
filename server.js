import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'

import { bugService } from './services/bugs.service.js'
import { pdfService } from './services/pdf.service.js'
import { authService } from './services/auth.service.js'
import { userService } from './services/user.service.js'

const app = express()

// App Configuration
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json()) // for parsing application/json

// Basic Routes
app.get('/', (req, res) => res.send('Hello there'))
app.get('/nono', (req, res) => res.redirect('/'))

// AUTH ROUTEs

// SIGNUP
app.post('/api/auth/signup', (req, res) => {
  const newUser = req.body
  console.log('Signup data:', req.body)
  userService.add(newUser)
    .then(user => {
      const loginToken = authService.getLoginToken(user)
      res.cookie('loginToken', loginToken, { httpOnly: true })
      res.json(user)
    })
    .catch(err => {
      res.status(400).send({ err: err.toString() })
    })
})

// LOGIN
app.post('/api/auth/login', (req, res) => {
  const credentials = req.body
  authService.checkLogin(credentials)
    .then(user => {
      const loginToken = authService.getLoginToken(user)
      res.cookie('loginToken', loginToken, { httpOnly: true })
      const miniUser = { _id: user._id, fullname: user.fullname, isAdmin: user.isAdmin }
      res.json(miniUser)
    })
    .catch(err => {
      res.status(401).send({ err: err.toString() })
    })
})

// LOGOUT
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('loginToken')
  res.send({ msg: 'Logged out' })
})

// ======= BUG ROUTES =======

// GET /api/bug with filtering, sorting, paging
app.get('/api/bug', (req, res) => {
  const filterBy = req.query

  Promise.resolve(bugService.query(filterBy))
    .then(bugs => res.send(bugs))
    .catch(err => {
      console.error('Cannot get bugs:', err)
      res.status(400).send('Cannot get bugs')
    })
})

// GET /api/bug/count
app.get('/api/bug/count', (req, res) => {
  try {
    const filterBy = req.query
    const total = bugService.getTotalCount(filterBy)
    res.json({ total })
  } catch (err) {
    console.error('Error in /api/bug/count:', err)
    res.status(500).send('Server error')
  }
})

// GET /api/bug/pdf (to generate PDF)
app.get('/api/bug/pdf', (req, res) => {
  const filterBy = req.query

  pdfService.createPdf(filterBy)
    .then(filePath => {
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', 'attachment; filename=MissBugReport.pdf')
      res.sendFile(path.resolve(filePath))
    })
    .catch(err => {
      console.error('Failed to generate PDF:', err)
      res.status(500).send('Failed to generate PDF')
    })
})

// POST /api/bug - Create new bug (requires login)
app.post('/api/bug', (req, res) => {
  const user = authService.validateToken(req.cookies.loginToken)
  if (!user) return res.status(401).send('Not logged in')

  const bug = {
    ...req.body,
    createdAt: Date.now(),
    creator: { _id: user._id, fullname: user.fullname }
  }

  Promise.resolve(bugService.save(bug))
    .then(savedBug => res.send(savedBug))
    .catch(err => {
      console.error('Cannot save bug:', err)
      res.status(400).send('Cannot save bug')
    })
})

// PUT /api/bug/:bugId - Update existing bug (requires login + owner/admin)
app.put('/api/bug/:bugId', (req, res) => {
  const user = authService.validateToken(req.cookies.loginToken)
  if (!user) return res.status(401).send('Not logged in')

  bugService.getById(req.params.bugId)
    .then(bug => {
      if (!bug) return res.status(404).send('Bug not found')

      const isOwner = bug.creator?._id === user._id
      if (!isOwner && !user.isAdmin) return res.status(403).send('Not authorized')

      const updatedBug = { ...req.body, _id: req.params.bugId }
      return bugService.save(updatedBug)
    })
    .then(savedBug => res.send(savedBug))
    .catch(err => {
      console.error('Cannot update bug:', err)
      res.status(400).send('Cannot update bug')
    })
})

// DELETE /api/bug/:bugId - Remove bug (requires login + owner/admin)
app.delete('/api/bug/:bugId', (req, res) => {
  const user = authService.validateToken(req.cookies.loginToken)
  if (!user) return res.status(401).send('Not logged in')

  bugService.getById(req.params.bugId)
    .then(bug => {
      if (!bug) return res.status(404).send('Bug not found')

      const isOwner = bug.creator?._id === user._id
      if (!isOwner && !user.isAdmin) return res.status(403).send('Not authorized')

      return bugService.remove(req.params.bugId)
    })
    .then(() => res.send('Removed!'))
    .catch(err => {
      console.error('Cannot remove bug:', err)
      res.status(400).send('Cannot remove bug')
    })
})

// GET /api/bug/:bugId (with cookie-based view limit)
app.get('/api/bug/:bugId', (req, res) => {
  const bugId = req.params.bugId

  const reserved = ['save', 'pdf', 'count']
  if (reserved.includes(bugId)) {
    return res.status(400).send('Invalid bug ID')
  }

  let visitedBugs = []
  try {
    visitedBugs = req.cookies.visitedBugs ? JSON.parse(req.cookies.visitedBugs) : []
  } catch (err) {
    visitedBugs = []
  }

  visitedBugs = [...new Set([...visitedBugs, bugId])]

  if (visitedBugs.length > 3) {
    return res.status(401).send('Wait for a bit')
  }

  res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 7000 })

  Promise.resolve(bugService.getById(bugId))
    .then(bug => res.send(bug))
    .catch(err => {
      console.error('Cannot get bug:', err)
      res.status(400).send('Cannot get bug')
    })
})

// ======= USER ROUTES =======

// GET all users
app.get('/api/user', (req, res) => {
  userService.query()
    .then(users => res.json(users))
    .catch(err => res.status(500).send('Failed to get users'))
})

// GET user by ID
app.get('/api/user/:id', (req, res) => {
  userService.getById(req.params.id)
    .then(user => res.json(user))
    .catch(err => res.status(404).send(err))
})

// POST new user
app.post('/api/user', (req, res) => {
  userService.add(req.body)
    .then(newUser => res.json(newUser))
    .catch(err => res.status(400).send(err))
})

// Start the server
const port = 3030
app.listen(port, () => {
  console.log(`Server listening at http://127.0.0.1:${port}/`)
})
