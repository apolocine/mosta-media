// @mostajs/media — Menu contribution
// Author: Dr Hamid MADANI drmdh@msn.com

import { Camera, Video, Image, MonitorUp } from 'lucide-react'
import type { ModuleMenuContribution } from '@mostajs/menu'

export const mediaMenuContribution: ModuleMenuContribution = {
  moduleKey: 'media',
  order: 55,
  groups: [
    {
      label: 'Media',
      icon: Camera,
      items: [
        {
          label: 'media.capture.title',
          href: '/dashboard/media/capture',
          icon: Camera,
        },
        {
          label: 'media.video.title',
          href: '/dashboard/media/video',
          icon: Video,
        },
        {
          label: 'media.gallery.title',
          href: '/dashboard/media/gallery',
          icon: Image,
        },
        {
          label: 'media.screen.title',
          href: '/dashboard/media/screen',
          icon: MonitorUp,
        },
      ],
    },
  ],
}
