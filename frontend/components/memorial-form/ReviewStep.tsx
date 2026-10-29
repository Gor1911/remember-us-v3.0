import { TypeIcon } from '@/components/dashboard/Icons';
import type { FormState, PhotoEntry } from './formTypes';

interface ReviewRowProps {
  label: string;
  children: React.ReactNode;
}

const ReviewRow = ({ label, children }: ReviewRowProps) => (
  <div className="flex items-center justify-between gap-4 py-1">
    <span className="text-[#6B6560] text-[11px] uppercase tracking-widest shrink-0">{label}</span>
    <span className="text-[#1A1614] text-sm text-right">{children}</span>
  </div>
);

interface ReviewStepProps {
  form: FormState;
  photos: PhotoEntry[];
  apiError: string;
  uploadStatus: string;
}

export const ReviewStep = ({ form, photos, apiError, uploadStatus }: ReviewStepProps) => {
  const isMilitary = form.page_type === 'military';
  return (
    <div className="glass rounded-[32px] p-6 md:p-10 flex flex-col gap-6">
      <ReviewRow label="Type">
        <span className="inline-flex items-center gap-1.5 capitalize">
          <TypeIcon type={form.page_type} className="w-3.5 h-3.5" /> {form.page_type}
        </span>
      </ReviewRow>
      <ReviewRow label="Name">{form.first_name} {form.last_name}</ReviewRow>
      {form.birth_date && <ReviewRow label="Born">{form.birth_date}</ReviewRow>}
      {form.death_date && <ReviewRow label="Passed">{form.death_date}</ReviewRow>}
      {isMilitary && form.military_rank && <ReviewRow label="Rank">{form.military_rank}</ReviewRow>}
      {isMilitary && form.military_branch && <ReviewRow label="Branch">{form.military_branch}</ReviewRow>}
      {isMilitary && form.service_start && (
        <ReviewRow label="Service">{form.service_start} — {form.service_end || 'present'}</ReviewRow>
      )}
      {photos.length > 0 && <ReviewRow label="Photos">{photos.length} selected</ReviewRow>}

      {form.biography && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[#6B6560] text-[11px] uppercase tracking-widest">Biography</span>
          <p className="text-[#1A1614]/80 text-sm leading-relaxed line-clamp-4">{form.biography}</p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.slice(0, 4).map((p) => (
            <div key={p.preview} className="rounded-[10px] overflow-hidden aspect-square bg-[#F3F0EB]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {photos.length > 4 && (
            <div className="rounded-[10px] aspect-square bg-[#1A1614]/[0.05] flex items-center justify-center">
              <span className="text-[#6B6560] text-xs">+{photos.length - 4}</span>
            </div>
          )}
        </div>
      )}

      {apiError && <p role="alert" className="text-[#8B0000] text-sm text-center">{apiError}</p>}
      {uploadStatus && (
        <div className="flex items-center gap-2 justify-center">
          <span className="w-3.5 h-3.5 border border-[#1A1614]/30 border-t-[#1A1614] rounded-full animate-spin" />
          <span className="text-[#6B6560] text-sm">{uploadStatus}</span>
        </div>
      )}
    </div>
  );
};
