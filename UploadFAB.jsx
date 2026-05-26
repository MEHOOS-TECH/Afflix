import React, { useState, useRef } from 'react'
import { supabase, BUCKETS, uploadFile } from '../lib/supabase'
import './UploadFAB.css'

const GENRES = ['Action','Adventure','Comedy','Drama','Fantasy','Horror','Mecha','Mystery','Romance','Sci-Fi','Slice of Life','Sports','Supernatural','Thriller']
const STATUSES = ['Ongoing','Completed','Upcoming']

export default function UploadFAB() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('anime') // 'anime' | 'episode'
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Anime form
  const [animeForm, setAnimeForm] = useState({ title: '', description: '', genre: '', status: 'Ongoing', year: new Date().getFullYear() })
  const [posterFile, setPosterFile] = useState(null)

  // Episode form
  const [epForm, setEpForm] = useState({ anime_id: '', title: '', episode_number: '', description: '' })
  const [videoFile, setVideoFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [animeList, setAnimeList] = useState([])

  const posterRef = useRef()
  const videoRef2 = useRef()

  const openModal = async () => {
    setOpen(true)
    setError(''); setSuccess('')
    // fetch anime list for episode dropdown
    const { data } = await supabase.from('anime').select('id, title').order('title')
    if (data) setAnimeList(data)
  }

  const closeModal = () => {
    setOpen(false)
    setProgress(0)
    setSuccess(''); setError('')
  }

  // ── Submit anime ──────────────────────────
  const handleAnimeSubmit = async () => {
    if (!animeForm.title.trim()) return setError('Title is required')
    setLoading(true); setError(''); setProgress(10)

    try {
      let poster_path = null
      if (posterFile) {
        setProgress(30)
        poster_path = await uploadFile(BUCKETS.THUMBNAILS, posterFile, 'posters')
        setProgress(70)
      }

      const { error: dbErr } = await supabase.from('anime').insert({
        title: animeForm.title.trim(),
        description: animeForm.description.trim() || null,
        genre: animeForm.genre || null,
        status: animeForm.status,
        year: parseInt(animeForm.year) || null,
        poster_path,
      })

      if (dbErr) throw dbErr
      setProgress(100)
      setSuccess('Anime added successfully!')
      setAnimeForm({ title: '', description: '', genre: '', status: 'Ongoing', year: new Date().getFullYear() })
      setPosterFile(null)
    } catch (e) {
      setError(e.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  // ── Submit episode ────────────────────────
  const handleEpSubmit = async () => {
    if (!epForm.anime_id) return setError('Select an anime')
    if (!epForm.title.trim()) return setError('Episode title is required')
    if (!epForm.episode_number) return setError('Episode number is required')
    if (!videoFile && !videoUrl.trim()) return setError('Provide a video file or URL')

    setLoading(true); setError(''); setProgress(10)

    try {
      let video_path = null
      let final_video_url = videoUrl.trim() || null

      if (videoFile) {
        setProgress(30)
        video_path = await uploadFile(BUCKETS.VIDEOS, videoFile, `anime-${epForm.anime_id}`)
        setProgress(75)
        final_video_url = null // stored in bucket
      }

      const { error: dbErr } = await supabase.from('episodes').insert({
        anime_id: epForm.anime_id,
        title: epForm.title.trim(),
        episode_number: parseInt(epForm.episode_number),
        description: epForm.description.trim() || null,
        video_path,
        video_url: final_video_url,
      })

      if (dbErr) throw dbErr
      setProgress(100)
      setSuccess('Episode added!')
      setEpForm({ anime_id: epForm.anime_id, title: '', episode_number: '', description: '' })
      setVideoFile(null); setVideoUrl('')
    } catch (e) {
      setError(e.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button className="fab" onClick={openModal} aria-label="Upload anime or episode">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>

      {open && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal upload-modal">
            <div className="modal-header">
              <div className="modal-tabs">
                <button className={`modal-tab${tab==='anime'?' active':''}`} onClick={()=>setTab('anime')}>
                  Add Anime
                </button>
                <button className={`modal-tab${tab==='episode'?' active':''}`} onClick={()=>setTab('episode')}>
                  Add Episode
                </button>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {tab === 'anime' ? (
                <div>
                  <div className="form-group">
                    <label>Anime Title *</label>
                    <input className="form-control" placeholder="e.g. Attack on Titan"
                      value={animeForm.title}
                      onChange={e => setAnimeForm(f => ({...f, title: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-control" rows="3" placeholder="Brief synopsis..."
                      value={animeForm.description}
                      onChange={e => setAnimeForm(f => ({...f, description: e.target.value}))} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Genre</label>
                      <select className="form-control"
                        value={animeForm.genre}
                        onChange={e => setAnimeForm(f => ({...f, genre: e.target.value}))}>
                        <option value="">Select genre</option>
                        {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select className="form-control"
                        value={animeForm.status}
                        onChange={e => setAnimeForm(f => ({...f, status: e.target.value}))}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Year</label>
                      <input className="form-control" type="number"
                        value={animeForm.year}
                        onChange={e => setAnimeForm(f => ({...f, year: e.target.value}))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Poster Image</label>
                    <div className="file-drop" onClick={() => posterRef.current?.click()}>
                      <input ref={posterRef} type="file" accept="image/*" hidden
                        onChange={e => setPosterFile(e.target.files[0])} />
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                      </svg>
                      <p>{posterFile ? <><span>✓ {posterFile.name}</span></> : <><span>Click to upload</span> or drag poster image</>}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="form-group">
                    <label>Select Anime *</label>
                    <select className="form-control"
                      value={epForm.anime_id}
                      onChange={e => setEpForm(f => ({...f, anime_id: e.target.value}))}>
                      <option value="">-- Choose anime --</option>
                      {animeList.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                    </select>
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{flex:2}}>
                      <label>Episode Title *</label>
                      <input className="form-control" placeholder="e.g. The Beginning"
                        value={epForm.title}
                        onChange={e => setEpForm(f => ({...f, title: e.target.value}))} />
                    </div>
                    <div className="form-group" style={{flex:1}}>
                      <label>Ep. Number *</label>
                      <input className="form-control" type="number" placeholder="1"
                        value={epForm.episode_number}
                        onChange={e => setEpForm(f => ({...f, episode_number: e.target.value}))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-control" rows="2" placeholder="Episode summary..."
                      value={epForm.description}
                      onChange={e => setEpForm(f => ({...f, description: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label>Video File</label>
                    <div className="file-drop" onClick={() => videoRef2.current?.click()}>
                      <input ref={videoRef2} type="file" accept="video/*" hidden
                        onChange={e => { setVideoFile(e.target.files[0]); setVideoUrl('') }} />
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="m22 8-6 4 6 4V8z"/><rect x="2" y="5" width="14" height="14" rx="2"/>
                      </svg>
                      <p>{videoFile ? <><span>✓ {videoFile.name}</span></> : <><span>Click to upload</span> video file</>}</p>
                    </div>
                  </div>
                  {!videoFile && (
                    <div className="form-group">
                      <label>Or paste video URL</label>
                      <input className="form-control" type="url" placeholder="https://..."
                        value={videoUrl}
                        onChange={e => setVideoUrl(e.target.value)} />
                    </div>
                  )}
                </div>
              )}

              {progress > 0 && progress < 100 && (
                <div className="progress-bar" style={{marginBottom:12}}>
                  <div className="progress-fill" style={{width:`${progress}%`}} />
                </div>
              )}

              {error && <div className="upload-error">{error}</div>}
              {success && <div className="upload-success">{success}</div>}

              <button
                className="btn btn-primary submit-btn"
                onClick={tab === 'anime' ? handleAnimeSubmit : handleEpSubmit}
                disabled={loading}
              >
                {loading ? (
                  <><div className="spinner-sm" />Uploading...</>
                ) : (
                  <>{tab === 'anime' ? 'Add Anime' : 'Add Episode'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
