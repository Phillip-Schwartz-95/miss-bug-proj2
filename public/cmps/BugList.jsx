const { Link } = ReactRouterDOM

import { authService } from '../services/auth.service.js'
import { BugPreview } from './BugPreview.jsx'

export function BugList({ bugs, onRemoveBug, onEditBug }) {

    const loggedinUser = authService.getLoggedInUser()

    if (!bugs) return <div>Loading...</div>
    return <ul className="bug-list">
        {bugs.map(bug => {
            const isOwner = loggedinUser && (loggedinUser.isAdmin || bug.creator?._id === loggedinUser._id)
            return (
                <li key={bug._id}>
                    <BugPreview bug={bug} />
                    {isOwner && (
                        <>
                            <button onClick={() => onEditBug(bug)}>Edit</button>
                            <button onClick={() => onRemoveBug(bug._id)}>Delete</button>
                        </>
                    )}
                </li>
            )
        })}
    </ul >
}
