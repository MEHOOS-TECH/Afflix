import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase, getPublicUrl, BUCKETS } from '../lib/supabase'
import VideoPlayer from '../components/VideoPlayer'
import './AnimePage.css'

export default function AnimePage() {
  const { id } = useParams()
  const [anime, setAnime] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [selectedEp, setSelectedEp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [{ data: animeData }, { data: epData }] = await Promise.all([
        supabase.from('anime').select('*').eq('id', id).single(),
        supabase.from('episodes').select('*').eq('anime_id', id).order('episode_number', { ascending: true }),
      ])
      setAnime(animeData)
      setEpisodes(epData || [])
      if (epData && epData.length > 0) setSelectedEp(epData[0])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadEp = (ep) => {
    const url = ep.video_url?.startsWith('http')
      ? ep.video_url
      : getPublicUrl(BUCKETS.VIDEOS, ep.video_path)
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `${anime?.title || 'anime'} - EP${ep.episode_number}.mp4`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (loading) return (
    <div className="loading-center" style={{ minHeight: '100vh', paddingTop: 'var(--nav-h)' }}>
      <div className="spinner" />
    </div>
  )

  if (!anime) return (
    <div className="not-found">
      <h2>Anime not found</h2>
      <Link to="/" className="btn btn-primary">← Back Home</Link>
    </div>
  )

  const posterUrl = imgError ? null : getPublicUrl(BUCKETS.THUMBNAILS, anime.poster_path)

  return (
    <div className="anime-page" style={{ paddingTop: 'var(--nav-h)' }}>
      {/* Header banner */}
      <div className="anime-banner">
        {posterUrl && <div className="banner-blur" style={{ backgroundImage: `url(${posterUrl})` }} />}
        <div className="banner-overlay" />
        <div className="banner-content container">
          <div className="anime-meta-card">
            <div className="anime-poster-wrap">
              {posterUrl ? (
                <img src={posterUrl} alt={anime.title} onError={() => setImgError(true)} />
              ) : (
                <div className="poster-placeholder-lg">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="m10 8 6 4-6 4V8Z"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="anime-info">
              <Link to="/" className="back-link">← All Anime</Link>
              <h1 className="anime-title-lg">{anime.title}</h1>
              <div className="anime-tags">
                {anime.genre?.split(',').map(g => (
                  <span key={g} className="tag tag-genre">{g.trim()}</span>
                ))}
                {anime.status && <span className={`tag status-tag status-${anime.status?.toLowerCase()}`}>{anime.status}</span>}
                {anime.year && <span className="tag tag-year">{anime.year}</span>}
              </div>
              {anime.description && (
                <p className="anime-desc">{anime.description}</p>
              )}
              <div className="anime-stat-row">
                <span className="tag tag-ep">{episodes.length} Episodes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="anime-main container">
        <div className="player-col">
          {selectedEp && (
            <div className="now-playing">
              <span className="tag tag-ep">EP {selectedEp.episode_number}</span>
              <h2 className="ep-playing-title">{selectedEp.title}</h2>
            </div>
          )}
          <VideoPlayer episode={selectedEp} />
          {selectedEp?.description && (
            <p className="ep-desc">{selectedEp.description}</p>
          )}
        </div>

        <div className="ep-col">
          <div className="ep-list-header">
            <h3 className="ep-list-title">Episodes</h3>
            <span className="section-count">{episodes.length}</span>
          </div>

          {episodes.length === 0 ? (
            <div className="no-eps">
              <p>No episodes yet. Add some using the + button!</p>
            </div>
          ) : (
            <div className="ep-list">
              {episodes.map(ep => (
                <div
                  key={ep.id}
                  className={`ep-item${selectedEp?.id === ep.id ? ' active' : ''}`}
                  onClick={() => setSelectedEp(ep)}
                >
                  <div className="ep-num">
                    {selectedEp?.id === ep.id ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    ) : (
                      ep.episode_number
                    )}
                  </div>
                  <div className="ep-details">
                    <div className="ep-title">{ep.title}</div>
                    {ep.description && <div className="ep-summary">{ep.description}</div>}
                  </div>
                  <button
                    className="ep-download"
                    onClick={e => { e.stopPropagation(); handleDownloadEp(ep) }}
                    title="Download episode"
                    aria-label="Download"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
