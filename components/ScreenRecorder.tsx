// @mostajs/media — ScreenRecorder widget (floating debug/feedback recorder)
// Author: Dr Hamid MADANI drmdh@msn.com
'use client'

import { useState } from 'react'
import { MonitorUp, Video, Square, Camera, Download, X, Minimize2 } from 'lucide-react'
import { useScreenCapture } from '../hooks/useScreenCapture'

export interface ScreenRecorderProps {
  /** Called when a screenshot is captured */
  onScreenshot?: (dataUrl: string) => void
  /** Called when a recording is finished */
  onRecording?: (blob: Blob, url: string) => void
  /** Upload endpoint for automatic upload */
  uploadEndpoint?: string
  /** Initial position */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** Enable webcam overlay (default: true) */
  webcamOverlay?: boolean
  /** Max recording duration in seconds (default: 300) */
  maxDuration?: number
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

/**
 * Floating screen recorder widget for user-triggered debug/feedback captures.
 * Users can take screenshots or record screen + webcam to explain behavior.
 *
 * Place this at the root of your app:
 * ```tsx
 * <ScreenRecorder
 *   onScreenshot={(img) => uploadScreenshot(img)}
 *   onRecording={(blob) => uploadRecording(blob)}
 *   webcamOverlay
 *   position="bottom-right"
 * />
 * ```
 *
 * Or with automatic upload:
 * ```tsx
 * <ScreenRecorder uploadEndpoint="/api/feedback/media" />
 * ```
 */
export default function ScreenRecorder({
  onScreenshot,
  onRecording,
  uploadEndpoint,
  position = 'bottom-right',
  webcamOverlay = true,
  maxDuration = 300,
}: ScreenRecorderProps) {
  const screen = useScreenCapture()
  const [expanded, setExpanded] = useState(false)
  const [lastCapture, setLastCapture] = useState<{ type: 'image' | 'video'; url: string } | null>(null)
  const [uploading, setUploading] = useState(false)

  const posStyle = {
    'bottom-right': { bottom: 16, right: 16 },
    'bottom-left': { bottom: 16, left: 16 },
    'top-right': { top: 16, right: 16 },
    'top-left': { top: 16, left: 16 },
  }[position]

  const handleStartShare = async () => {
    await screen.startScreenShare({ audio: true, webcamOverlay })
    setExpanded(true)
    setLastCapture(null)
  }

  const handleScreenshot = () => {
    const img = screen.captureFrame()
    if (!img) return
    setLastCapture({ type: 'image', url: img })
    onScreenshot?.(img)
    if (uploadEndpoint) uploadMedia(img, 'screenshot.png')
  }

  const handleStartRec = () => {
    screen.startRecording()
    setTimeout(async () => {
      if (screen.recording) {
        const r = await screen.stopRecording()
        if (r) finishRecording(r)
      }
    }, maxDuration * 1000)
  }

  const handleStopRec = async () => {
    const r = await screen.stopRecording()
    if (r) finishRecording(r)
  }

  const finishRecording = (r: { blob: Blob; url: string }) => {
    setLastCapture({ type: 'video', url: r.url })
    onRecording?.(r.blob, r.url)
    if (uploadEndpoint) uploadMedia(r.blob, 'recording.webm')
  }

  const uploadMedia = async (data: string | Blob, filename: string) => {
    if (!uploadEndpoint) return
    setUploading(true)
    try {
      const formData = new FormData()
      if (typeof data === 'string') {
        // Convert data URL to blob
        const res = await fetch(data)
        const blob = await res.blob()
        formData.append('file', blob, filename)
      } else {
        formData.append('file', data, filename)
      }
      await fetch(uploadEndpoint, { method: 'POST', body: formData })
    } catch {
      // upload failed silently
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    screen.stopScreenShare()
    setExpanded(false)
    setLastCapture(null)
  }

  // ── Collapsed: just a button ──
  if (!expanded && !screen.active) {
    return (
      <div style={{ position: 'fixed', ...posStyle, zIndex: 9990 }}>
        <button onClick={handleStartShare} style={fabStyle} title="Screen capture">
          <MonitorUp style={{ width: 20, height: 20 }} />
        </button>
      </div>
    )
  }

  // ── Expanded: controls ──
  return (
    <div style={{
      position: 'fixed', ...posStyle, zIndex: 9990,
      backgroundColor: '#1f2937', borderRadius: 12, padding: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)', color: '#fff',
      minWidth: 280,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {screen.recording ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
              REC {formatDuration(screen.duration)}
            </span>
          ) : 'Screen Capture'}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setExpanded(false)} style={miniBtn}><Minimize2 style={{ width: 14, height: 14 }} /></button>
          <button onClick={handleClose} style={miniBtn}><X style={{ width: 14, height: 14 }} /></button>
        </div>
      </div>

      {/* Preview */}
      {screen.active && (
        <div style={{ position: 'relative', marginBottom: 8, borderRadius: 6, overflow: 'hidden', backgroundColor: '#000' }}>
          <video ref={screen.videoRef} autoPlay playsInline muted
            style={{ width: '100%', height: 150, objectFit: 'contain' }} />
          {screen.webcamActive && (
            <video ref={screen.webcamRef} autoPlay playsInline muted
              style={{
                position: 'absolute', bottom: 6, right: 6, width: 80, borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.5)',
              }} />
          )}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {!screen.active ? (
          <button onClick={handleStartShare} style={ctrlBtn('#0284c7')}>
            <MonitorUp style={{ width: 14, height: 14 }} /> Share Screen
          </button>
        ) : (
          <>
            <button onClick={handleScreenshot} style={ctrlBtn('#059669')}>
              <Camera style={{ width: 14, height: 14 }} /> Screenshot
            </button>
            {!screen.recording ? (
              <button onClick={handleStartRec} style={ctrlBtn('#dc2626')}>
                <Video style={{ width: 14, height: 14 }} /> Record
              </button>
            ) : (
              <button onClick={handleStopRec} style={ctrlBtn('#374151')}>
                <Square style={{ width: 14, height: 14 }} /> Stop
              </button>
            )}
          </>
        )}
      </div>

      {/* Last capture */}
      {lastCapture && (
        <div style={{ marginTop: 8, borderTop: '1px solid #374151', paddingTop: 8 }}>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>
            {uploading ? 'Uploading...' : 'Captured'}
          </div>
          {lastCapture.type === 'image' ? (
            <img src={lastCapture.url} alt="" style={{ width: '100%', borderRadius: 4 }} />
          ) : (
            <video src={lastCapture.url} controls style={{ width: '100%', borderRadius: 4 }} />
          )}
          <a href={lastCapture.url} download={lastCapture.type === 'image' ? 'screenshot.png' : 'recording.webm'}
            style={{ ...ctrlBtn('#6b7280'), marginTop: 4, textDecoration: 'none', display: 'inline-flex' }}>
            <Download style={{ width: 14, height: 14 }} /> Download
          </a>
        </div>
      )}
    </div>
  )
}

const fabStyle: React.CSSProperties = {
  width: 48, height: 48, borderRadius: '50%', backgroundColor: '#1f2937', color: '#fff',
  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
}

const miniBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer',
  width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
}

const ctrlBtn = (bg: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
  backgroundColor: bg, color: '#fff', border: 'none', borderRadius: 4,
  fontSize: 12, fontWeight: 500, cursor: 'pointer',
})
