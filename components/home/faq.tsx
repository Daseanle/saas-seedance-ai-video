const faqs = [
  {
    id: 1,
    question: "What makes Seedance 2.0 different from other AI video generators?",
    answer:
      "Seedance 2.0 uses a reference-first approach with @mention controls. You can upload up to 9 images, 3 videos, and 3 audio files to precisely control every aspect of generation—from visual style and camera motion to audio rhythm and character consistency.",
  },
  {
    id: 2,
    question: "How long are the generated videos?",
    answer:
      "Current outputs range from 4 to 15 seconds. This duration is optimized for social media content, product demos, and cinematic b-roll. We're continuously expanding capabilities for longer-form content.",
  },
  {
    id: 3,
    question: "Can I maintain character consistency across multiple shots?",
    answer:
      "Yes! Seedance 2.0 excels at maintaining perfect character identity across frames and shots. Upload a reference image of your character, and the system ensures zero drift throughout multi-scene videos.",
  },
  {
    id: 4,
    question: "Does it support audio generation?",
    answer:
      "Absolutely. Seedance 2.0 generates native audio including sound effects, music, and multi-language lip-sync dialogue. Audio automatically syncs with on-screen actions for seamless integration.",
  },
  {
    id: 5,
    question: "What's the success rate for first-try outputs?",
    answer:
      "Seedance 2.0 achieves over 90% usable outputs on the first generation. The reference-driven system dramatically reduces iteration cycles compared to traditional prompt-only generators.",
  },
  {
    id: 6,
    question: "Can I replicate specific camera movements?",
    answer:
      "Yes. Upload a reference video and Seedance 2.0 will replicate complex camera work including dolly shots, tracking movements, crane shots, and editing rhythm with precision.",
  },
]

export default function FAQ() {
  return (
    <div id="faq" className="bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <h2 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Frequently asked questions</h2>
        <dl className="mt-20 divide-y divide-foreground/10">
          {faqs.map((faq) => (
            <div key={faq.id} className="py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8">
              <dt className="text-base/7 font-semibold text-foreground lg:col-span-5">{faq.question}</dt>
              <dd className="mt-4 lg:col-span-7 lg:mt-0">
                <p className="text-base/7 text-muted-foreground">{faq.answer}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
} 