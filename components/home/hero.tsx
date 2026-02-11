'use client'

export default function Hero() {
  return (
    <div className="bg-background">
      <div className="relative">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 pt-14 lg:w-full lg:max-w-2xl">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 transform fill-background lg:block"
            >
              <polygon points="0,0 90,0 50,100 0,100" />
            </svg>

            <div className="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-56 lg:pr-0">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
                <div className="hidden sm:mb-10 sm:flex">
                  <div className="relative rounded-full px-3 py-1 text-sm/6 text-muted-foreground ring-1 ring-border hover:ring-ring">
                    The Next Generation of Search Optimization{' '}
                    <a href="#" className="font-semibold whitespace-nowrap text-primary">
                      <span aria-hidden="true" className="absolute inset-0" />
                      Learn about GEO <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
                <h1 className="text-5xl font-semibold tracking-tight text-pretty text-foreground sm:text-7xl">
                  SEO Velocity
                </h1>
                <p className="mt-8 text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
                  Don't just track rankings—track <strong>velocity</strong>.
                  Optimize for Google and AI Search Engines (ChatGPT, Perplexity) simultaneously.
                  The only tool built for the Generative Engine Optimization (GEO) era.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <a
                    href="/dashboard"
                    className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Start Optimizing
                  </a>
                  <a href="#features" className="text-sm/6 font-semibold text-foreground">
                    See how it works <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-muted lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            alt="SEO Analytics Dashboard"
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
            className="aspect-3/2 object-cover lg:aspect-auto lg:size-full"
          />
        </div>
      </div>
    </div>
  )
}
