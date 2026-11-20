'use client';

import { useRef, useState } from 'react';
import { CameraIcon, PersonIcon } from '@/components/dashboard/Icons';
import type { PhotoEntry } from './formTypes';
import { FORMATS_HINT, IMAGE_ACCEPT, screenImages } from './imageFiles';

interface PortraitPickerProps {
  portrait: PhotoEntry | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

const LINK_BUTTON =
  'text-xs font-medium text-[#1A1614] underline underline-offset-4 hover:text-[#8B0000] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000]';

/** Main photo of the memorial (page cover), kept apart from the gallery. */
export const PortraitPicker = ({ portrait, onSelect, onRemove }: PortraitPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const { accepted, rejected } = screenImages([files[0]]);
    setError(rejected[0] ?? '');
    if (accepted[0]) onSelect(accepted[0]);
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={portrait ? 'Replace main photo' : 'Add main photo'}
        className={`relative w-36 aspect-[4/5] rounded-[20px] overflow-hidden transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0000] ${
          portrait
            ? 'bg-[#F3F0EB] border border-[#1A1614]/[0.08]'
            : 'border-2 border-dashed border-[#1A1614]/[0.15] bg-white/60 hover:border-[#1A1614]/30 hover:bg-white'
        }`}
      >
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={portrait.preview} alt="Main photo preview" className="w-full h-full object-cover" />
        ) : (
          <span className="flex flex-col items-center justify-center gap-2 h-full px-3 text-[#6B6560]">
            <span className="w-11 h-11 rounded-full bg-[#1A1614]/[0.05] flex items-center justify-center">
              <PersonIcon className="w-5 h-5" />
            </span>
            <span className="text-xs font-medium text-[#1A1614]">Add main photo</span>
          </span>
        )}
        {portrait && (
          <span className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 text-[#1A1614] flex items-center justify-center shadow-sm">
            <CameraIcon className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      {portrait ? (
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => inputRef.current?.click()} className={LINK_BUTTON}>Replace</button>
          <button type="button" onClick={() => { setError(''); onRemove(); }} className={LINK_BUTTON}>Remove</button>
        </div>
      ) : (
        <p className="text-muted text-[11px] text-center max-w-36">Optional. {FORMATS_HINT}</p>
      )}
      {error && <p role="alert" className="text-[#8B0000] text-xs text-center max-w-48">{error}</p>}

      <input
        ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
};
