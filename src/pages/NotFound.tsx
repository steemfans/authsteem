import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/">Back to Home</Link>
    </div>
  )
}
