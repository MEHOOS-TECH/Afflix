import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/?q=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-inner container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">▶</span>
          ANIME<span className="logo-x">X</span>
        </Link>

        <form className="nav-search" onSubmit={handleSearch}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search anime..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>

        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/?genre=Action" className="nav-link">Action</Link>
          <Link to="/?genre=Romance" className="nav-link">Romance</Link>
          <Link to="/?genre=Fantasy" className="nav-link">Fantasy</Link>
        </div>
      </div>
    </nav>
  )
}
