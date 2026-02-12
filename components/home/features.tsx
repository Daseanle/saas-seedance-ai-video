'use client'

import { ChartBarIcon, CpuChipIcon, GlobeAltIcon, LightBulbIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Multimodal Reference Control',
    description:
      'Upload up to 9 images, 3 videos, and 3 audio files per generation. Use @mentions to precisely control visual style, motion, camera work, and audio rhythm.',
    icon: ChartBarIcon,
  },
  {
    name: 'Perfect Character Consistency',
    description:
      'Maintain flawless identity across frames and shots. No more character drift—Seedance 2.0 ensures your subjects stay consistent throughout multi-scene videos.',
    icon: CpuChipIcon,
  },
  {
    name: 'Native Audio-Visual Sync',
    description:
      'Generate videos with integrated sound effects, music, and multi-language lip-sync dialogue. Audio matches on-screen actions automatically.',
    icon: GlobeAltIcon,
  },
  {
    name: 'Complex Motion Replication',
    description:
      'Upload reference videos to replicate intricate choreography, camera movements (dolly, tracking, crane), and editing rhythm with precision.',
    icon: LightBulbIcon,
  },
]

export default function Features() {
  return (
    <div id="features" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-primary">Powered by ByteDance AI</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl lg:text-balance">
            Reference-First Video Generation
          </p>
          <p className="mt-6 text-lg/8 text-muted-foreground">
            Seedance 2.0 delivers over 90% usable outputs on first try.
            <strong> No more endless iterations</strong>—just precise, cinematic results from your references.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base/7 font-semibold text-foreground">
                  <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-primary">
                    <feature.icon aria-hidden="true" className="size-6 text-primary-foreground" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base/7 text-muted-foreground">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
