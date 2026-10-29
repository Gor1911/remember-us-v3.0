import type { GalleryPhoto } from '@/components/memorial/GalleryLightbox';

export const EXAMPLE = {
  name: 'Chief Master Sergeant William R. Davis',
  branch: 'U.S. Air Force · WWII Veteran',
  years: '1924 – 2023',
  paragraphs: [
    'William Robert Davis was born on March 4, 1924, in Springfield, Illinois, the second of five children. Raised during the Great Depression, he learned the values of discipline, perseverance, and service from an early age. At nineteen, he enlisted in the United States Army Air Forces, driven by a deep sense of duty following the attack on Pearl Harbor.',
    'During World War II, William served in the Pacific Theater, flying support missions over the Philippine Islands and Japan. He was awarded the Purple Heart after sustaining injuries during a bombing raid in 1944. His quiet courage under fire earned him the respect of fellow servicemen and commanding officers alike.',
    'After the war, William transitioned to the newly formed United States Air Force, where he continued to serve with distinction through the Korean and Vietnam conflicts. He rose to the rank of Chief Master Sergeant — the highest enlisted rank — a testament to his exceptional leadership and technical expertise in aircraft maintenance and operations.',
    'In 1973, after thirty years of distinguished service, William retired to Phoenix, Arizona, where he devoted himself to his family, his church, and his community. He was a founding member of the local Veterans of Foreign Wars post and spent decades mentoring young servicemen returning from deployment. William passed away peacefully on November 11, 2023 — Veterans Day — surrounded by his family. He was 99 years old.',
  ],
  timeline: [
    { year: '1924', label: 'Born',         desc: 'Springfield, Illinois' },
    { year: '1943', label: 'Enlisted',     desc: 'U.S. Army Air Forces' },
    { year: '1945', label: 'WWII Service', desc: 'Pacific Theater' },
    { year: '1962', label: 'Vietnam',      desc: 'Southeast Asia deployment' },
    { year: '1973', label: 'Retired',      desc: 'Chief Master Sergeant' },
    { year: '2023', label: 'Passed Away',  desc: 'Aged 99' },
  ],
  awards: [
    { name: 'Purple Heart',          desc: 'For wounds received in action' },
    { name: 'Air Medal',             desc: 'For meritorious aerial achievement' },
    { name: 'Vietnam Service Medal', desc: 'For service in Southeast Asia' },
    { name: 'WWII Victory Medal',    desc: 'For service during World War II' },
  ],
  gallery: [
    { id: '1', src: '/images/Veteran1.jpg', alt: 'William R. Davis', caption: 'In uniform', featured: true },
    { id: '2', src: '/images/veteran2.jpg', alt: 'Service portrait', caption: 'Service portrait' },
    { id: '3', src: '/images/veteran3.jpg', alt: 'Medal ceremony',   caption: 'Medal ceremony' },
    { id: '4', src: '/images/veteran4.jpg', alt: 'Family portrait',  caption: 'Family portrait' },
  ] as GalleryPhoto[],
};
