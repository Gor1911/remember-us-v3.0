'use client';

import { useRef, useState } from 'react';
import { livingPortrait } from '@/app/lib/api';
import type { MemorialPageListItem, PortraitStatus } from '@/app/lib/types';
import { PORTRAIT_STATUS_LABEL } from './portraitStatus';
import { BTN_DANGER, BTN_SECONDARY } from './styles';

const MAX_BYTES = 100 * 1024 * 1024;
const SMALL = '!px-4 !py-2 !text-xs !rounded-[12px]';

type SettableStatus = Exclude<PortraitStatus, 'none' | 'done'>;
const SETTABLE: { status: SettableStatus; label: string }[] = [
  { status: 'pending', label: 'Set pending' },
  { status: 'processing', label: 'Set processing' },
  { status: 'failed', label: 'Set failed' },
];

interface PortraitToolsProps {
  page: MemorialPageListItem;
  onChanged: () => void;
}

export const PortraitTools = ({ page, onChanged }: PortraitToolsProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const status = page.portrait_animation_status ?? 'none';

  const finish = (ok: boolean, err: string, msg: string) => {
    setBusy('');
    if (ok) { setMessage(msg); onChanged(); } else setError(err);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(''); setMessage('');
    if (!/\.(mp4|webm)$/i.test(file.name) && !/^video\/(mp4|webm)$/.test(file.type)) {
      setError('Please choose an MP4 or WebM video.'); return;
    }
    if (file.size > MAX_BYTES) { setError('The video must be 100 MB or smaller.'); return; }
    setBusy('upload');
    const fd = new FormData();
    fd.append('file', file);
    const res = await livingPortrait.upload(page.slug, fd);
    finish(res.success, res.success ? '' : res.error, 'Living Portrait uploaded.');
  };

  const setStatus = async (s: SettableStatus) => {
    setBusy(s); setError(''); setMessage('');
    const res = await livingPortrait.setStatus(page.slug, s);
    finish(res.success, res.success ? '' : res.error, 'Status updated.');
  };

  const remove = async () => {
    setBusy('remove'); setError(''); setMessage('');
    const res = await livingPortrait.remove(page.slug);
    finish(res.success, res.success ? '' : res.error, 'Video removed.');
  };

  const fileId = `portrait-file-${page.id}`;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-[#1A1614]">Living Portrait: <span className="font-medium">{PORTRAIT_STATUS_LABEL[status]}</span></p>
      <label htmlFor={fileId} className="text-xs text-[#6B6560]">Upload finished video (MP4 or WebM, up to 100 MB)</label>
      <input
        ref={fileRef} id={fileId} type="file" accept="video/mp4,video/webm,.mp4,.webm"
        disabled={busy !== ''} onChange={(e) => void onFile(e)}
        className="text-xs text-[#1A1614] file:mr-3 file:rounded-[10px] file:border file:border-[#1A1614]/15 file:bg-white file:px-3 file:py-1.5 file:text-xs"
      />
      <div className="flex flex-wrap gap-2">
        {SETTABLE.filter((s) => s.status !== status).map((s) => (
          <button key={s.status} type="button" disabled={busy !== ''} onClick={() => void setStatus(s.status)} className={`${BTN_SECONDARY} ${SMALL}`}>
            {busy === s.status ? 'Saving…' : s.label}
          </button>
        ))}
        {status === 'done' && (
          <button type="button" disabled={busy !== ''} onClick={() => void remove()} className={`${BTN_DANGER} ${SMALL}`}>
            {busy === 'remove' ? 'Removing…' : 'Remove video'}
          </button>
        )}
      </div>
      <p role="status" className="text-xs text-[#6B6560] empty:hidden">
        {busy === 'upload' ? 'Uploading video…' : message}
      </p>
      <p role="alert" className="text-xs text-[#8B0000] empty:hidden">{error}</p>
    </div>
  );
};
