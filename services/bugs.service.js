import fs from 'fs'
import path from 'path'

const bugFilePath = path.resolve('data/bugs.json')

export const bugService = {
  query,
  getById,
  save,
  remove,
  getDefaultFilter
}

function query(filterBy = {}) {
  const bugData = fs.readFileSync(bugFilePath, 'utf8')
  let bugs = JSON.parse(bugData)

  // Filter by text
  if (filterBy.txt) {
    const regex = new RegExp(filterBy.txt, 'i')
    bugs = bugs.filter(bug =>
      regex.test(bug.title) || regex.test(bug.description)
    )
  }

  // Filter by minimum severity
  if (filterBy.minSeverity) {
    const minSeverity = +filterBy.minSeverity
    bugs = bugs.filter(bug => bug.severity >= minSeverity)
  }

  return bugs
}

function getDefaultFilter() {
  return { txt: '', minSeverity: 0 }
}

function getById(bugId) {
  const bugs = query()
  return bugs.find(bug => bug._id === bugId)
}

function save(bugToSave) {
  const bugs = query()

  if (!bugToSave._id) {
    throw new Error('Missing bug ID')
  }

  const idx = bugs.findIndex(bug => bug._id === bugToSave._id)

  if (idx === -1) {
    bugToSave.createdAt = Date.now()
    bugs.push(bugToSave)
  } else {
    bugs[idx] = { ...bugs[idx], ...bugToSave }
  }

  fs.writeFileSync(bugFilePath, JSON.stringify(bugs, null, 2))
  return bugToSave
}

function remove(bugId) {
  const bugs = query()
  const filteredBugs = bugs.filter(bug => bug._id !== bugId)
  if (filteredBugs.length === bugs.length) throw new Error('Bug not found')
  fs.writeFileSync(bugFilePath, JSON.stringify(filteredBugs, null, 2))
}
