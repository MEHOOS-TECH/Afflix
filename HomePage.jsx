import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AnimeCard from '../components/AnimeCard'
import './HomePage.css'

const GENRES = ['All','Action','Adventure','Comedy','Drama','Fantasy','Horror','Mecha','Mystery','Romance','Sci-Fi','Slice of Life','Sports','Supernatural']

export default function HomePage() {
  const [searchParams] = useSearchParams()
  const [anime, setAnime] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeGenre, setActiveGenre] = useState('All')

  const query = searchParams.get('q') || ''
  const genreParam = searchParams.get('genre') || ''

  useEffect(() => {
    if (genreParam) setActiveGenre(genreParam)
  }, [genreParam])

  useEffect(() => {
    fetchAnime()
  }, [query, activeGenre])

  const fetchAnime = async () => {
    setLoading(true)
    try {
      // Fetch anime with episode count using a join
      let req = supabase
        .from('anime')
        .select('*, episodes(count)')
        .order('created_at', { ascending: false })

      if (query) {
        req = req.ilike('title', `%${query}%`)
      }
      if (activeGenre && activeGenre !== 'All') {
        req = req.ilike('genre', `%${activeGenre}%`)
      }

      const { data, error } = await req
      if (error) throw error

      // Map episode count
      const mapped = (data || []).map(a => ({
        ...a,
        episode_count: a.episodes?.[0]?.count ?? 0
      }))
      setAnime(mapped)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content container">
          <div className="hero-eyebrow">🔥 Stream Anime Free</div>
          <h1 className="hero-title">
            WATCH.<br/>DOWNLOAD.<br/><span className="hero-accent">REPEAT.</span>
          </h1>
          <p className="hero-sub">Thousands of episodes. Zero limits. Upload your own collection.</p>
          <div className="hero-stats">
            <span><strong>{anime.length}</strong> titles</span>
            <span><strong>HD</strong> quality</span>
            <span><strong>Free</strong> forever</span>
          </div>
        </div>
        <div className="hero-fade" />
      </section>

      <div className="content-area container">
        {/* Genre tabs */}
        <div className="genre-strip">
          <div className="genre-tabs">
            {GENRES.map(g => (
              <button
                key={g}
                className={`genre-tab${activeGenre === g ? ' active' : ''}`}
                onClick={() => setActiveGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Section heading */}
        <div className="section-header">
          <h2 className="section-title">
            {query ? `Results for "${query}"` : activeGenre === 'All' ? 'All Anime' : activeGenre}
          </h2>
          <span className="section-count">{anime.length} titles</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : anime.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <h3>No anime found</h3>
            <p>Try a different search or genre, or add some using the + button!</p>
          </div>
        ) : (
          <div className="anime-grid">
            {anime.map(a => <AnimeCard key={a.id} anime={a} />)}
          </div>
        )}
      </div>
    </div>
  )
}
