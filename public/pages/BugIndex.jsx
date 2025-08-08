// public/pages/BugIndex.jsx
const { useState, useEffect } = React

import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'

export function BugIndex() {
    const pageSize = 5
    const [bugs, setBugs] = useState([])
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortDir, setSortDir] = useState(1)
    const [pageIdx, setPageIdx] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalBugs, setTotalBugs] = useState(0)

    bugService.getTotalBugs(filterBy).then(res => {
        console.log('Total bugs from backend:', res.total)
    })

    useEffect(loadBugs, [filterBy, sortBy, sortDir, pageIdx])

    function loadBugs() {
        const query = {
            ...filterBy,
            sortBy,
            sortDir,
            pageIdx
        }

        bugService.query(query)
            .then(setBugs)
            .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))

        bugService.getTotalBugs(query)
            .then(({ total }) => {
                setTotalBugs(total)
                setTotalPages(Math.ceil(total / pageSize))

            })
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                const bugsToUpdate = bugs.filter(bug => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => showErrorMsg(`Cannot remove bug`, err))
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?', 'Bug ' + Date.now()),
            description: prompt('Bug description?', 'Describe the bug here...'),
            severity: +prompt('Bug severity?', 3)
        }

        bugService.save(bug)
            .then(savedBug => {
                console.log('Saved bug returned from backend:', savedBug)
                if (!savedBug._id) {
                    console.error('Saved bug does NOT have an _id! This will cause React key warning')
                }
                setBugs(prev => [...(prev || []), savedBug])
                showSuccessMsg('Bug added')
            })
            .catch(err => showErrorMsg(`Cannot add bug`, err))
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?', bug.severity)
        if (!severity || severity === bug.severity) return

        const bugToSave = { ...bug, severity }

        bugService.save(bugToSave)
            .then(savedBug => {
                const bugsToUpdate = bugs.map(currBug =>
                    currBug._id === savedBug._id ? savedBug : currBug)

                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch(err => showErrorMsg('Cannot update bug', err))
    }

    function onSetFilterBy(newFilter) {
        setFilterBy(prev => ({ ...prev, ...newFilter }))
    }

    function onDownloadPdf() {
        const query = {
            ...filterBy,
            sortBy,
            sortDir,
            pageIdx
        }

        const queryStr = new URLSearchParams(query).toString()
        window.open(`/api/bug/pdf?${queryStr}`, '_blank')
    }

    return <section className="bug-index main-content">
        <header>
            <h2>Bug List</h2>
            <p>
                Showing page {pageIdx + 1} of {totalPages} ({totalBugs} bugs total)
            </p>
            <button onClick={onAddBug}>Add Bug</button>
            <button onClick={onDownloadPdf}>Download Bug Report (PDF)</button>
        </header>

        <BugFilter
            filterBy={filterBy}
            onSetFilterBy={onSetFilterBy} />

        <section className="bug-controls">
            <label>
                Sort by:
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="createdAt">Created At</option>
                    <option value="title">Title</option>
                    <option value="severity">Severity</option>
                </select>
            </label>
            <label>
                Direction:
                <select value={sortDir} onChange={e => setSortDir(+e.target.value)}>
                    <option value="1">Ascending</option>
                    <option value="-1">Descending</option>
                </select>
            </label>
            <button onClick={() => setPageIdx(prev => Math.max(prev - 1, 0))}>Prev</button>
            <button onClick={() => setPageIdx(prev => prev + 1)}>Next</button>
        </section>

        <BugList
            bugs={bugs}
            onRemoveBug={onRemoveBug}
            onEditBug={onEditBug} />
    </section>
}