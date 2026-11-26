'use client';

import { useRef, useState } from 'react';
import { CameraIcon, CloseIcon, PlusIcon } from '@/components/ui/icons';
import { ERROR_TEXT, FOCUS, HINT } from '@/components/ui/styles';
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
          className={`flex flex-col items-center justify-center gap-4 rounded-tile border-2 border-dashed cursor-pointer transition-colors duration-300 py-12 px-6 text-center ${FOCUS} ${
            dragging
              ? 'border-bronze-deep bg-soft'
              : 'border-ink/20 bg-canvas hover:border-ink/35 hover:bg-soft'
          }`}
        >
          <span className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-bronze">
            <CameraIcon className="w-7 h-7" />
          </span>
          <span className="flex flex-col gap-1">
            <span className="type-action text-ink">Drop photos here or click to browse</span>
            <span className={HINT}>{FORMATS_HINT} each, up to {MAX_PHOTOS} photos</span>
          </span>
        </div>
      )}
      <input
        ref={inputRef} type="file" accept={IMAGE_ACCEPT} multiple className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />

      {problems.length > 0 && (
        <ul role="alert" className={`flex flex-col gap-1 ${ERROR_TEXT}`}>
          {problems.map((p) => <li key={p}>{p}</li>)}
        </ul>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((p, i) => (
            <div key={p.preview} className="relative rounded-[12px] overflow-hidden aspect-square bg-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => onRemove(i)}
                className={`absolute top-1.5 right-1.5 w-11 h-11 rounded-full bg-white/90 text-danger flex items-center justify-center shadow-control transition-opacity hover:opacity-85 ${FOCUS}`}
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
          {!full && (
            <button
              type="button"
              aria-label="Add more photos"
              onClick={() => inputRef.current?.click()}
              className={`rounded-[12px] aspect-square border-2 border-dashed border-ink/20 bg-canvas hover:border-ink/35 hover:bg-soft flex items-center justify-center text-bronze transition-colors duration-300 ${FOCUS}`}
            >
              <PlusIcon className="w-7 h-7" />
            </button>
          )}
        </div>
      )}

      <p className={`${HINT} text-center`}>
        These photos appear in the memorial&apos;s gallery. The main photo is set on the first step.
      </p>
    </div>
  );
};
