import { Header } from '@/components/landing/Header';
import { ExampleHero } from '@/components/example/ExampleHero';
import { ExampleStory } from '@/components/example/ExampleStory';
import { ExampleTimelineAwards } from '@/components/example/ExampleTimelineAwards';
import { ExampleGalleryCta } from '@/components/example/ExampleGalleryCta';

export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1614]">
      <Header />
      <ExampleHero />
      <ExampleStory />
      <ExampleTimelineAwards />
      <ExampleGalleryCta />
    </div>
  );
}
