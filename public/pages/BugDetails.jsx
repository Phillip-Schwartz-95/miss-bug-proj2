// public/pages/BugDetails.jsx
// Bu
const { Link, useParams } = ReactRouterDOM
const { useState, useEffect } = React

import { bugService } from '../services/bug.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'

export function BugDetails() {
    const [bug, setBug] = useState(null)
    const [error, setError] = useState(null)
    const { bugId } = useParams()

    useEffect(() => {
        loadBug()
    }, [])

    async function loadBug() {
        try {
            const bug = await bugService.getById(bugId)
            setBug(bug)
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError("You have viewed too many bugs. Please wait a few seconds and try again.")
                showErrorMsg("You have viewed too many bugs. Please wait a few seconds and try again.")
            } else {
                setError("Cannot load bug")
                showErrorMsg("Cannot load bug")
            }
        }
    }

    if (error) return (
        <div className="bug-details-error">
            <p>{error}</p>
            <Link to="/bug">
                <button>Back to List</button>
            </Link>
        </div>
    )

    if (!bug) return <p className="loading">Loading....</p>

    return (
        <div className="bug-details main-content">
            <h2>Bug Details</h2>
            <div>
                <h3>{bug.title}</h3>
                <p className="severity">Severity: <span>{bug.severity}</span></p>
                <p>Description: {bug.description || 'No description provided'}</p>
                {bug.labels && bug.labels.length > 0 && (
                    <p>Labels: {bug.labels.join(', ')}</p>
                )}

            </div>
            <Link to="/bug">
                <button>Back to List</button>
            </Link>
        </div>
    )
}