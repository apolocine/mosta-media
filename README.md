# @mostajs/media

Image and video capture, editing, screen recording, and media gallery components for React/Next.js. Includes webcam capture, screen + webcam overlay recording, image editing (crop, rotate, brightness, contrast), and a floating debug screen recorder widget.

## Installation

```bash
npm install @mostajs/media lucide-react
```

## Components

### `<ImageCapture />`

Capture images from webcam, file upload, or screen capture.

```tsx
import { ImageCapture } from '@mostajs/media'

<ImageCapture
  photo={photo}
  onCapture={(dataUrl) => setPhoto(dataUrl)}
  onClear={() => setPhoto('')}
  allowUpload
  maxWidth={800}
  maxHeight={800}
  quality={0.85}
  captureLabel="Take Photo"
  uploadLabel="Upload"
  onError={(msg) => toast.error(msg)}
/>
```

**Features:**
- Webcam capture with front/back camera switch
- File upload (accepts image/*)
- Screen capture (single frame)
- Auto-resize to maxWidth/maxHeight
- Mirror for front camera
- Inline preview with clear button

### `<VideoCapture />`

Record video from webcam or screen with webcam overlay.

```tsx
import { VideoCapture } from '@mostajs/media'

<VideoCapture
  onCapture={(blob, url) => {
    setVideoUrl(url)
    uploadVideo(blob)
  }}
  maxDuration={120}
  startLabel="Record"
  stopLabel="Stop"
  onError={(msg) => toast.error(msg)}
/>
```

**Features:**
- **Webcam recording**: Record from webcam with audio
- **Screen + Webcam**: Record screen with webcam overlay in corner (picture-in-picture)
- Auto-stop at maxDuration
- In-recording screenshot capture
- Duration timer with recording indicator
- Video playback after recording

### `<ScreenRecorder />`

Floating debug/feedback widget. Users can trigger screen capture at any time to report bugs or explain behavior.

```tsx
import { ScreenRecorder } from '@mostajs/media/components/ScreenRecorder'

// Place at app root
<ScreenRecorder
  onScreenshot={(img) => submitFeedback({ screenshot: img })}
  onRecording={(blob) => uploadRecording(blob)}
  uploadEndpoint="/api/feedback/media"
  webcamOverlay
  position="bottom-right"
  maxDuration={300}
/>
```

**Features:**
- Floating button (FAB) that expands into a control panel
- Screenshot capture (screen + webcam overlay composited)
- Screen recording with webcam overlay
- Duration timer and recording indicator
- Auto-upload to configured endpoint
- Download button for local save
- Positions: bottom-right, bottom-left, top-right, top-left

### `<ImageEditor />`

Edit captured images with rotate, flip, brightness, and contrast controls.

```tsx
import { ImageEditor } from '@mostajs/media'

<ImageEditor
  src={photo}
  onSave={(edited) => setPhoto(edited)}
  onCancel={() => setEditing(false)}
  tools={['crop', 'rotate', 'brightness', 'contrast', 'flip']}
  format="image/jpeg"
  quality={0.85}
/>
```

**Tools:** `rotate` (90° increments), `flip` (horizontal/vertical), `brightness` (-100 to 100), `contrast` (-100 to 100), `crop`

### `<MediaGallery />`

Grid gallery with lightbox for images and videos.

```tsx
import { MediaGallery } from '@mostajs/media'

<MediaGallery
  items={[
    { id: '1', url: '/photos/1.jpg', type: 'image', name: 'Photo 1' },
    { id: '2', url: '/videos/demo.webm', type: 'video', thumbnail: '/thumbs/demo.jpg' },
  ]}
  columns={3}
  deletable
  onSelect={(item) => console.log('Selected:', item)}
  onDelete={(item) => deleteMedia(item.id)}
/>
```

## Integration dans le projet hote

Ce module expose des **composants React** et des **contributions menu** mais ne cree pas de pages Next.js.
Le projet hote doit creer les pages correspondant aux routes declarees dans le menu (`mediaMenuContribution`).

### 1. Pages a creer

Creez les fichiers suivants dans votre projet Next.js :

**`src/app/dashboard/media/capture/page.tsx`**
```tsx
'use client'
import { ImageCapture } from '@mostajs/media'

export default function MediaCapturePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Capture Image</h1>
      <ImageCapture
        onCapture={(dataUrl) => console.log('Captured:', dataUrl)}
        onClear={() => {}}
        allowUpload
      />
    </div>
  )
}
```

**`src/app/dashboard/media/video/page.tsx`**
```tsx
'use client'
import { VideoCapture } from '@mostajs/media'

export default function MediaVideoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Capture Video</h1>
      <VideoCapture onCapture={(blob, url) => console.log('Recorded:', url)} />
    </div>
  )
}
```

**`src/app/dashboard/media/gallery/page.tsx`**
```tsx
'use client'
import { MediaGallery } from '@mostajs/media'

export default function MediaGalleryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Galerie Media</h1>
      <MediaGallery items={[]} columns={3} />
    </div>
  )
}
```

**`src/app/dashboard/media/screen/page.tsx`**
```tsx
'use client'
import { ScreenRecorder } from '@mostajs/media'

export default function MediaScreenPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Enregistrement Ecran</h1>
      <ScreenRecorder />
    </div>
  )
}
```

### 2. Menu dynamique

Le module exporte `mediaMenuContribution` qui declare automatiquement les 4 routes ci-dessus.
Importez-le dans votre sidebar via le deep import :

```tsx
import { mediaMenuContribution } from '@mostajs/media/lib/menu'
```

Passez-le a `buildMenuConfig()` de `@mostajs/menu` avec les autres contributions de modules.

### 3. Pourquoi le projet hote doit creer les pages ?

Les modules `@mostajs/*` sont des **bibliotheques npm** (composants, hooks, utilitaires), pas des applications.
Next.js App Router exige que les fichiers `page.tsx` soient dans le dossier `src/app/` du projet.
Un package npm ne peut pas injecter de pages dans le routeur — c'est donc au projet hote de creer ces fichiers wrapper, meme s'ils ne font qu'importer et afficher un composant du module.

## Hooks

### `useCamera()`

Low-level camera access hook.

```tsx
import { useCamera } from '@mostajs/media/hooks/useCamera'

const { videoRef, active, start, stop, capture, switchCamera, facingMode, error } = useCamera()

<video ref={videoRef} autoPlay playsInline muted />
<button onClick={() => start({ facingMode: 'user' })}>Start</button>
<button onClick={() => { const img = capture(); if (img) setPhoto(img) }}>Snap</button>
<button onClick={switchCamera}>Switch Camera</button>
```

### `useVideoRecorder()`

Webcam video recording hook.

```tsx
import { useVideoRecorder } from '@mostajs/media/hooks/useVideoRecorder'

const { videoRef, cameraActive, recording, duration, startCamera, startRecording, stopRecording, error } = useVideoRecorder()

<video ref={videoRef} autoPlay playsInline muted />
<button onClick={() => startCamera()}>Camera</button>
<button onClick={startRecording}>Record</button>
<button onClick={async () => {
  const result = await stopRecording()
  if (result) saveVideo(result.blob)
}}>Stop</button>
```

### `useScreenCapture()`

Screen sharing + recording with optional webcam overlay.

```tsx
import { useScreenCapture } from '@mostajs/media/hooks/useScreenCapture'

const {
  videoRef, webcamRef, active, webcamActive, recording, duration,
  startScreenShare, stopScreenShare, captureFrame, startRecording, stopRecording, error,
} = useScreenCapture()

<div style={{ position: 'relative' }}>
  <video ref={videoRef} autoPlay playsInline />
  <video ref={webcamRef} autoPlay playsInline muted
    style={{ position: 'absolute', bottom: 16, right: 16, width: 200, borderRadius: 8 }} />
</div>
<button onClick={() => startScreenShare({ audio: true, webcamOverlay: true })}>Share</button>
<button onClick={startRecording}>Record</button>
<button onClick={() => { const img = captureFrame(); if (img) download(img) }}>Screenshot</button>
```

## Image Utilities

```tsx
import {
  resizeImage, rotateImage, flipImage, cropImage,
  adjustBrightness, adjustContrast,
  dataUrlToBlob, fileToDataUrl,
} from '@mostajs/media/lib/image-utils'

// Resize
const resized = await resizeImage(dataUrl, 800, 800, 0.85, 'image/jpeg')

// Rotate 90 degrees
const rotated = await rotateImage(dataUrl, 90)

// Flip horizontally
const flipped = await flipImage(dataUrl, 'horizontal')

// Crop
const cropped = await cropImage(dataUrl, 100, 100, 400, 300)

// Adjust brightness/contrast (-100 to 100)
const brighter = await adjustBrightness(dataUrl, 20)
const sharper = await adjustContrast(dataUrl, 30)

// Convert formats
const blob = dataUrlToBlob(dataUrl)
const dataUrl2 = await fileToDataUrl(file)
```

## License

MIT
