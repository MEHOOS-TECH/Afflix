import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://uqpqcaicarwmpucdpcfc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_1d5e6_Ucz34__qfSYwEH-g_9j9NBWtj'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Storage bucket names (from your Supabase storage screenshot)
export const BUCKETS = {
  THUMBNAILS: 'anime_thumbnails',   // Anime poster/thumbnail images
  AVATARS: 'user-avatars',          // User profile avatars
  VIDEOS: 'video-episodes',         // Episode video files
}

// Helper: get public URL for a stored file
export function getPublicUrl(bucket, path) {
  if (!path) return null
  // If already a full URL (e.g. external video URL), return as-is
  if (path.startsWith('http')) return path
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl || null
}

// Helper: upload a file to a bucket, returns the stored path
export async function uploadFile(bucket, file, folder = '') {
  const ext = file.name.split('.').pop()
  const filename = `${folder ? folder + '/' : ''}${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  return data.path
}
