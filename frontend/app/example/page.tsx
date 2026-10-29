import { Header } from '@/components/landing/Header';
import { ExampleHero } from '@/components/example/ExampleHero';
import { ExampleStory } from '@/components/example/ExampleStory';
import { ExampleTimelineAwards } from '@/components/example/ExampleTimelineAwards';
import { ExampleGalleryCta } from '@/components/example/ExampleGalleryCta';

export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1614]">
      <Header />
      <div role="note" className="pt-16 bg-[#F3F0EB] border-b border-[#1A1614]/[0.08]">
        <p className="site-container py-3 text-center text-[#1A1614] text-sm leading-snug">
          <span className="font-semibold">Demonstration memorial</span> — the person, story and photographs are sample content for illustration.
        </p>
      </div>
      <ExampleHero />
      <ExampleStory />
      <ExampleTimelineAwards />
      <ExampleGalleryCta />
    </div>
  );
}
