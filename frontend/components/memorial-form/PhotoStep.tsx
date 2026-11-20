'use client';

import { useRef, useState } from 'react';
import { CameraIcon, CloseIcon, PlusIcon } from '@/components/dashboard/Icons';
import { MAX_PHOTOS, type PhotoEntry } from './formTypes';
import { FORMATS_HINT, IMAGE_ACCEPT, screenImages } from './imageFiles';

interface PhotoStepProps {
  photos: PhotoEntry[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}

/** Gallery photos; the main photo is picked separately on the first step. */
export const PhotoStep = ({ photos, onAdd, onRemove }: PhotoStepProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const full = photos.length >= MAX_PHOTOS;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const { accepted, rejected } = screenImages(Array.from(files));
    const room = MAX_PHOTOS - photos.length;
    const issues = [...rejected];
    if (accepted.length > room) {
      issues.push(`Only ${MAX_PHOTOS} gallery photos are allowed: ${accepted.length - room} not added.`);
    }
    setProblems(issues);
    if (room > 0) onAdd(accepted.slice(0, room));
  };

  return (
    <div className="flex flex-col gap-6">
      {!full && (
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          className={`flex flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed cursor-pointer transition-colors py-12 px-6 text-center ${
            dragging
              ? 'border-[#8B0000] bg-[#8B0000]/[0.05]'
              : 'border-[#1A1614]/[0.15] bg-white/60 hover:border-[#1A1614]/30 hover:bg-white'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#1A1614]/[0.05] flex items-center justify-center text-[#6B6560]">
            <CameraIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[#1A1614] text-sm font-medium">Drop photos here or click to browse</p>
            <p className="text-[#6B6560] text-xs mt-1">{FORMATS_HINT} each, up to {MAX_PHOTOS} photos</p>
          </div>
        </div>
      )}
      <input
        ref={inputRef} type="file" accept={IMAGE_ACCEPT} multiple className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />

      {problems.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1 text-[#8B0000] text-xs">
          {problems.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((p, i) => (
            <div key={p.preview} className="relative group rounded-[16px] overflow-hidden aspect-square bg-[#F3F0EB]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => onRemove(i)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-[#8B0000] flex items-center justify-center shadow-sm hover:bg-white"
              >
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {!full && (
            <button
              type="button"
              aria-label="Add more photos"
              onClick={() => inputRef.current?.click()}
              className="rounded-[16px] aspect-square border-2 border-dashed border-[#1A1614]/[0.15] hover:border-[#1A1614]/30 hover:bg-white flex items-center justify-center text-[#6B6560] transition-colors"
            >
              <PlusIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      <p className="text-[#6B6560] text-xs text-center">
        These photos appear in the memorial&apos;s gallery. The main photo is set on the first step.
      </p>
    </div>
  );
};
