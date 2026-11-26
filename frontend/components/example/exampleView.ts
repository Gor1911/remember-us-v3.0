import { EXAMPLE } from '@/components/example/data';
import { COVER_MILITARY, type MemorialView } from '@/components/memorial/profile/types';

/** The public example memorial, in the same presentation model as a real memorial. */
export const EXAMPLE_VIEW: MemorialView = {
  type: 'military',
  name: EXAMPLE.name,
  years: EXAMPLE.years,
  descriptor: EXAMPLE.branch,
  cover: COVER_MILITARY,
  // Square crop of public/images/Veteran1.jpg — the same man as the living portrait video.
  portrait: { src: '/images/example-avatar-af.jpg', unoptimized: false, position: 'object-center' },
  living: {
    src: '/images/veteran-portrait.webm',
    altSrc: '/images/veteran-portrait.mp4',
    poster: '/images/veteran-portrait-poster.jpg',
    unoptimized: false,
  },
  story: EXAMPLE.paragraphs,
  timeline: EXAMPLE.timeline.map((e) => ({ key: e.year + e.label, year: e.year, title: e.label, description: e.desc })),
  photos: EXAMPLE.gallery,
  facts: [
    { label: 'Born', value: 'March 4, 1924 · Springfield, Illinois' },
    { label: 'Passed away', value: 'November 11, 2023 · Phoenix, Arizona' },
    { label: 'Age', value: '99 years' },
    { label: 'Service', value: '1943 – 1973' },
    { label: 'Branch', value: 'U.S. Army Air Forces · U.S. Air Force' },
    { label: 'Rank', value: 'Chief Master Sergeant' },
  ],
  awards: EXAMPLE.awards.map((a) => ({ key: a.name, name: a.name, description: a.desc, year: null })),
  qr: { src: '/images/qr-example.svg', unoptimized: true },
};
