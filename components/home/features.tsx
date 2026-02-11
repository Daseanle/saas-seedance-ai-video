'use client'

import { ChartBarIcon, CpuChipIcon, GlobeAltIcon, LightBulbIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Keyword Velocity Tracking',
    description:
      'Stop looking at static rankings. We calculate the velocity of your keyword movements to predict future trends before they happen.',
    icon: ChartBarIcon,
  },
  {
    name: 'Generative Engine Optimization (GEO)',
    description:
      'Analyze how your brand appears in AI search engines like ChatGPT, Perplexity, and Gemini. Get insights to improve your visibility in the LLM era.',
    icon: CpuChipIcon,
  },
  {
    name: 'Cross-Platform Intelligence',
    description:
      'Unified dashboard for traditional Google Search Console data alongside modern AI search visibility metrics.',
    icon: GlobeAltIcon,
  },
  {
    name: 'AI-Powered Recommendations',
    description:
      'Receive actionable, AI-generated suggestions on how to improve your content structure and schema for better machine readability.',
    icon: LightBulbIcon,
  },
]

export default function Features() {
  return (
    <div id="features" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-primary">Next-Gen SEO Platform</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl lg:text-balance">
            Dominate Search in the Age of AI
          </p>
          <p className="mt-6 text-lg/8 text-muted-foreground">
            Traditional SEO tools are blind to 50% of modern search traffic.
            <strong>SEO Velocity</strong> bridges the gap between Google rankings and AI visibility.
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
