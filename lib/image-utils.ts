// @mostajs/media — Image utility functions
// Author: Dr Hamid MADANI drmdh@msn.com

/**
 * Resize an image to fit within maxWidth x maxHeight while preserving aspect ratio.
 */
export function resizeImage(
  dataUrl: string,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.85,
  format = 'image/jpeg',
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL(format, quality))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

/**
 * Rotate an image by the given degrees (90, 180, 270).
 */
export function rotateImage(dataUrl: string, degrees: number, format = 'image/jpeg', quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const radians = (degrees * Math.PI) / 180
      const isVertical = degrees === 90 || degrees === 270
      canvas.width = isVertical ? img.height : img.width
      canvas.height = isVertical ? img.width : img.height
      const ctx = canvas.getContext('2d')!
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(radians)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
      resolve(canvas.toDataURL(format, quality))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

/**
 * Flip an image horizontally or vertically.
 */
export function flipImage(dataUrl: string, direction: 'horizontal' | 'vertical', format = 'image/jpeg', quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      if (direction === 'horizontal') {
        ctx.translate(img.width, 0)
        ctx.scale(-1, 1)
      } else {
        ctx.translate(0, img.height)
        ctx.scale(1, -1)
      }
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL(format, quality))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

/**
 * Crop an image to the specified rectangle.
 */
export function cropImage(
  dataUrl: string,
  x: number, y: number, width: number, height: number,
  format = 'image/jpeg', quality = 0.85,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height)
      resolve(canvas.toDataURL(format, quality))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

/**
 * Adjust brightness of an image (-100 to 100).
 */
export function adjustBrightness(dataUrl: string, amount: number, format = 'image/jpeg', quality = 0.85): Promise<string> {
  return applyFilter(dataUrl, `brightness(${1 + amount / 100})`, format, quality)
}

/**
 * Adjust contrast of an image (-100 to 100).
 */
export function adjustContrast(dataUrl: string, amount: number, format = 'image/jpeg', quality = 0.85): Promise<string> {
  return applyFilter(dataUrl, `contrast(${1 + amount / 100})`, format, quality)
}

function applyFilter(dataUrl: string, filter: string, format: string, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.filter = filter
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL(format, quality))
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = dataUrl
  })
}

/**
 * Convert a data URL to a Blob.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

/**
 * Convert a File/Blob to a data URL.
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
