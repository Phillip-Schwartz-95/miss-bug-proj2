const { NavLink } = ReactRouterDOM
import { authService } from '../services/auth.service.js'

export function AppHeader({ loggedinUser }) {
    console.log('AppHeader loggedinUser prop:', loggedinUser)
    return (
        <header className="app-header main-content single-row">
            <h1>Miss Bug</h1>
            <nav>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/bug">Bugs</NavLink>
                <NavLink to="/about">About</NavLink>
                <NavLink to="/user/profile">Profile</NavLink>
            </nav>
        </header>
    )
}