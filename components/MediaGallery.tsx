// @mostajs/media — MediaGallery component
// Author: Dr Hamid MADANI drmdh@msn.com
'use client'

import { useState } from 'react'
import { Play, Trash2, X, Download } from 'lucide-react'
import type { MediaGalleryProps, MediaItem } from '../types/index'

/**
 * Media gallery grid with image/video preview and optional delete.
 */
export default function MediaGallery({
  items,
  onSelect,
  onDelete,
  columns = 3,
  deletable = false,
}: MediaGalleryProps) {
  const [lightbox, setLightbox] = useState<MediaItem | null>(null)

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 8,
      }}>
        {items.map((item) => (
          <div key={item.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', backgroundColor: '#f3f4f6', aspectRatio: '1' }}
            onClick={() => { setLightbox(item); onSelect?.(item) }}>
            {item.type === 'video' ? (
              <>
                <img src={item.thumbnail || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }}>
                  <Play style={{ width: 32, height: 32, color: '#fff' }} />
                </div>
              </>
            ) : (
              <img src={item.thumbnail || item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            {deletable && (
              <button onClick={(e) => { e.stopPropagation(); onDelete?.(item) }}
                style={{
                  position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)',
                  border: 'none', borderRadius: '50%', width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                <Trash2 style={{ width: 14, height: 14, color: '#fff' }} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setLightbox(null)}>
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
            <a href={lightbox.url} download={lightbox.name || 'download'} onClick={(e) => e.stopPropagation()}
              style={{ ...iconBtn, textDecoration: 'none' }}>
              <Download style={{ width: 20, height: 20, color: '#fff' }} />
            </a>
            <button onClick={() => setLightbox(null)} style={iconBtn}>
              <X style={{ width: 20, height: 20, color: '#fff' }} />
            </button>
          </div>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '90vh' }}>
            {lightbox.type === 'video' ? (
              <video src={lightbox.url} controls autoPlay style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 8 }} />
            ) : (
              <img src={lightbox.url} alt="" style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 8 }} />
            )}
          </div>
        </div>
      )}
    </>
  )
}

const iconBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
  width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
}
