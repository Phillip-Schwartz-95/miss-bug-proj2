import express from 'express'
import { bugService } from './services/bugs.service.js'
import cookieParser from 'cookie-parser'
import { pdfService } from './services/pdf.service.js'
import path from 'path'

const app = express()

// App Configuration
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json()) // for parsing application/json

// Basic Routes
app.get('/', (req, res) => res.send('Hello there'))
app.get('/nono', (req, res) => res.redirect('/'))

// GET /api/bug with filtering, sorting, paging
app.get('/api/bug', (req, res) => {
  console.log('Incoming query:', req.query)
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
    console.log('Received filterBy:', filterBy)

    const total = bugService.getTotalCount(filterBy)
    console.log('Calculated total bugs:', total)

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

// POST /api/bug - Create new bug
app.post('/api/bug', (req, res) => {
  const bug = req.body
  Promise.resolve(bugService.save(bug))
    .then(savedBug => res.send(savedBug))
    .catch(err => res.status(400).send('Cannot save bug'))
})

// PUT /api/bug/:bugId - Update existing bug
app.put('/api/bug/:bugId', (req, res) => {
  const bug = { ...req.body, _id: req.params.bugId }
  Promise.resolve(bugService.save(bug))
    .then(savedBug => res.send(savedBug))
    .catch(err => res.status(400).send('Cannot update bug'))
})

// DELETE /api/bug/:bugId - Remove bug
app.delete('/api/bug/:bugId', (req, res) => {
  Promise.resolve(bugService.remove(req.params.bugId))
    .then(() => res.send('Removed!'))
    .catch(err => res.status(400).send('Cannot remove bug'))
})

// GET /api/bug/:bugId (with cookie-based view limit)
app.get('/api/bug/:bugId', (req, res) => {
  const bugId = req.params.bugId

  // Reserved word check
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
  console.log('User visited the following bugs:', visitedBugs)

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

const port = 3030
app.listen(port, () => {
  console.log(`Server listening at http://127.0.0.1:${port}/`)
})
