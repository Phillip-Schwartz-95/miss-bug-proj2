import fs from 'fs'
import path from 'path'

const bugFilePath = path.resolve('data/bugs.json')

export const bugService = {
  query,
  getById,
  save,
  remove,
  getDefaultFilter,
  getTotalCount,
}

function query(filterBy = {}) {
  const bugs = JSON.parse(fs.readFileSync(bugFilePath, 'utf-8'))
  let filteredBugs = [...bugs]

  // Filter by text
  if (filterBy.txt) {
    const regex = new RegExp(filterBy.txt, 'i')
    filteredBugs = filteredBugs.filter(bug =>
      regex.test(bug.title) || regex.test(bug.description)
    )
  }

  // Filter by severity
  if (filterBy.minSeverity) {
    filteredBugs = filteredBugs.filter(bug => bug.severity >= +filterBy.minSeverity)
  }

  // Filter by labels
  if (filterBy.labels) {
    const labelArr = Array.isArray(filterBy.labels)
      ? filterBy.labels
      : filterBy.labels.split(',')

    filteredBugs = filteredBugs.filter(bug =>
      bug.labels?.some(label => labelArr.includes(label))
    )
  }

  // Sort by field and direction
  const sortBy = filterBy.sortBy || 'createdAt'
  const sortDir = +filterBy.sortDir || 1

  filteredBugs.sort((a, b) => {
    if (a[sortBy] < b[sortBy]) return -1 * sortDir
    if (a[sortBy] > b[sortBy]) return 1 * sortDir
    return 0
  })

  // Paging
  const pageSize = 5
  const pageIdx = +filterBy.pageIdx || 0
  const startIdx = pageIdx * pageSize
  filteredBugs = filteredBugs.slice(startIdx, startIdx + pageSize)

  return filteredBugs
}

function getDefaultFilter() {
  return { txt: '', minSeverity: 0, labels: [] }
}

function getById(bugId) {
  const bugs = query()
  return bugs.find(bug => bug._id === bugId)
}

//total bugs
function getTotalCount(filterBy = {}) {
  const bugs = query(filterBy) 
  return bugs.length
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