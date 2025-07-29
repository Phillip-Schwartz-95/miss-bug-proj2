import express from 'express'
import { bugService } from './services/bugs.service.js'

const app = express()

// App Configuration
app.use(express.static('public'))

// Basic Routes
app.get('/', (req, res) => res.send('Hello there'))
app.get('/nono', (req, res) => res.redirect('/'))

// get
app.get('/api/bug', (req, res) => {
  Promise.resolve(bugService.query())
    .then(bugs => res.send(bugs))
    .catch(err => {
      console.error('Cannot get bugs:', err)
      res.status(400).send('Cannot get bugs')
    })
})

// save
app.get('/api/bug/save', (req, res) => {
  const { title, description, severity, _id } = req.query

  const bug = {
    _id,
    title,
    description,
    severity: +severity
  }

  Promise.resolve(bugService.save(bug))
    .then(savedBug => res.send(savedBug))
    .catch(err => {
      console.error('Cannot save bug:', err)
      res.status(400).send('Cannot save bug')
    })
})

// get by ID
app.get('/api/bug/:bugId', (req, res) => {
  Promise.resolve(bugService.getById(req.params.bugId))
    .then(bug => res.send(bug))
    .catch(err => {
      console.error('Cannot get bug:', err)
      res.status(400).send('Cannot get bug')
    })
})

// remove
app.get('/api/bug/:bugId/remove', (req, res) => {
  Promise.resolve(bugService.remove(req.params.bugId))
    .then(() => {
      console.log(`Bug ${req.params.bugId} removed`)
      res.send('Removed!')
    })
    .catch(err => {
      console.error('Cannot remove bug:', err)
      res.status(400).send('Cannot remove bug')
    })
})


const port = 3030
app.listen(port, () => {
  console.log(`Server listening at http://127.0.0.1:${port}/`)
})
