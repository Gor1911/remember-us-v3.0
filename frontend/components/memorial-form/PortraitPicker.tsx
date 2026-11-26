'use client';

import { useRef, useState } from 'react';
import { CameraIcon, PersonIcon } from '@/components/ui/icons';
import { ERROR_TEXT, FOCUS, HINT, LINK } from '@/components/ui/styles';
import type { PhotoEntry } from './formTypes';
import { FORMATS_HINT, IMAGE_ACCEPT, screenImages } from './imageFiles';

interface PortraitPickerProps {
  portrait: PhotoEntry | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

const LINK_BUTTON = `type-caption font-medium ${LINK}`;

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
    <div className="flex flex-col items-center gap-3 shrink-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={portrait ? 'Replace main photo' : 'Add main photo'}
        className={`relative w-36 aspect-[4/5] rounded-tile overflow-hidden transition-colors duration-300 ${FOCUS} ${
          portrait
            ? 'bg-soft'
            : 'border-2 border-dashed border-ink/20 bg-canvas hover:border-ink/35 hover:bg-soft'
        }`}
      >
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={portrait.preview} alt="Main photo preview" className="w-full h-full object-cover" />
        ) : (
          <span className="flex flex-col items-center justify-center gap-2.5 h-full px-3">
            <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-bronze">
              <PersonIcon className="w-6 h-6" />
            </span>
            <span className="type-caption font-medium text-ink">Add main photo</span>
          </span>
        )}
        {portrait && (
          <span className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 text-ink flex items-center justify-center shadow-control">
            <CameraIcon className="w-4 h-4" />
          </span>
        )}
      </button>

      {portrait ? (
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => inputRef.current?.click()} className={LINK_BUTTON}>Replace</button>
          <button type="button" onClick={() => { setError(''); onRemove(); }} className={LINK_BUTTON}>Remove</button>
        </div>
      ) : (
        <p className={`${HINT} text-center max-w-44`}>
          Optional. A clear, front-facing photo works best — the living portrait is made from it. {FORMATS_HINT}.
        </p>
      )}
      {error && <p role="alert" className={`${ERROR_TEXT} text-center max-w-48`}>{error}</p>}

      <input
        ref={inputRef} type="file" accept={IMAGE_ACCEPT} className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
};
