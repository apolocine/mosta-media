// @mostajs/media — ImageEditor component
// Author: Dr Hamid MADANI drmdh@msn.com
'use client'

import { useState, useCallback } from 'react'
import { RotateCw, FlipHorizontal, FlipVertical, Sun, Contrast, Crop, Save, X } from 'lucide-react'
import { rotateImage, flipImage, adjustBrightness, adjustContrast, cropImage } from '../lib/image-utils'
import type { ImageEditorProps } from '../types/index'

/**
 * Image editor with crop, rotate, flip, brightness, and contrast controls.
 *
 * @example
 * ```tsx
 * <ImageEditor
 *   src={photo}
 *   onSave={(edited) => setPhoto(edited)}
 *   onCancel={() => setEditing(false)}
 *   tools={['crop', 'rotate', 'brightness', 'contrast', 'flip']}
 * />
 * ```
 */
export default function ImageEditor({
  src,
  onSave,
  onCancel,
  tools = ['crop', 'rotate', 'brightness', 'contrast', 'flip'],
  format = 'image/jpeg',
  quality = 0.85,
}: ImageEditorProps) {
  const [current, setCurrent] = useState(src)
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [rotation, setRotation] = useState(0)

  const handleRotate = useCallback(async () => {
    const newRot = (rotation + 90) % 360
    setRotation(newRot)
    const rotated = await rotateImage(src, newRot, format, quality)
    setCurrent(rotated)
  }, [src, rotation, format, quality])

  const handleFlipH = useCallback(async () => {
    const flipped = await flipImage(current, 'horizontal', format, quality)
    setCurrent(flipped)
  }, [current, format, quality])

  const handleFlipV = useCallback(async () => {
    const flipped = await flipImage(current, 'vertical', format, quality)
    setCurrent(flipped)
  }, [current, format, quality])

  const handleBrightness = useCallback(async (value: number) => {
    setBrightness(value)
    let img = src
    if (rotation > 0) img = await rotateImage(img, rotation, format, quality)
    if (value !== 0) img = await adjustBrightness(img, value, format, quality)
    if (contrast !== 0) img = await adjustContrast(img, contrast, format, quality)
    setCurrent(img)
  }, [src, rotation, contrast, format, quality])

  const handleContrast = useCallback(async (value: number) => {
    setContrast(value)
    let img = src
    if (rotation > 0) img = await rotateImage(img, rotation, format, quality)
    if (brightness !== 0) img = await adjustBrightness(img, brightness, format, quality)
    if (value !== 0) img = await adjustContrast(img, value, format, quality)
    setCurrent(img)
  }, [src, rotation, brightness, format, quality])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Preview */}
      <div style={{ textAlign: 'center', backgroundColor: '#111', borderRadius: 8, padding: 8 }}>
        <img src={current} alt="" style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 4 }} />
      </div>

      {/* Tools */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {tools.includes('rotate') && (
          <button onClick={handleRotate} style={toolBtn} title="Rotate 90°">
            <RotateCw style={{ width: 18, height: 18 }} />
          </button>
        )}
        {tools.includes('flip') && (
          <>
            <button onClick={handleFlipH} style={toolBtn} title="Flip horizontal">
              <FlipHorizontal style={{ width: 18, height: 18 }} />
            </button>
            <button onClick={handleFlipV} style={toolBtn} title="Flip vertical">
              <FlipVertical style={{ width: 18, height: 18 }} />
            </button>
          </>
        )}

        {tools.includes('brightness') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sun style={{ width: 16, height: 16, color: '#6b7280' }} />
            <input type="range" min={-100} max={100} value={brightness}
              onChange={(e) => handleBrightness(Number(e.target.value))}
              style={{ width: 100 }} />
            <span style={{ fontSize: 11, color: '#6b7280', width: 30 }}>{brightness}</span>
          </div>
        )}

        {tools.includes('contrast') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Contrast style={{ width: 16, height: 16, color: '#6b7280' }} />
            <input type="range" min={-100} max={100} value={contrast}
              onChange={(e) => handleContrast(Number(e.target.value))}
              style={{ width: 100 }} />
            <span style={{ fontSize: 11, color: '#6b7280', width: 30 }}>{contrast}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onSave(current)} style={actionBtn('#0284c7')}>
          <Save style={{ width: 16, height: 16 }} /> Save
        </button>
        {onCancel && (
          <button onClick={onCancel} style={actionBtn('#6b7280')}>
            <X style={{ width: 16, height: 16 }} /> Cancel
          </button>
        )}
      </div>
    </div>
  )
}

const toolBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 40, height: 40, border: '1px solid #d1d5db', borderRadius: 6,
  backgroundColor: '#fff', cursor: 'pointer',
}

const actionBtn = (bg: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
  backgroundColor: bg, color: '#fff', border: 'none', borderRadius: 6,
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
})
