const { Link } = ReactRouterDOM

import { LoginSignup } from "./LoginSignup.jsx"

export function Home() {
    return <section className="home-page">
        <h2>Welcome Home</h2>
        <Link to="/login">Login or Signup</Link>
        <LoginSignup />
        <img src="assets/img/miss-bug.png" />
    </section>
}