import Link from 'next/link';
import { PersonIcon } from './Icons';

export const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
    <div className="w-16 h-16 rounded-full bg-white border border-[#1A1614]/[0.08] flex items-center justify-center text-muted">
      <PersonIcon className="w-7 h-7" />
    </div>
    <div>
      <p className="text-[#1A1614] font-medium">No memorials yet</p>
      <p className="text-[#6B6560] text-sm mt-1">Create your first memorial to get started</p>
    </div>
    <Link
      href="/memorial/new"
      className="px-6 py-3 bg-[#8B0000] hover:bg-[#A00000] text-white text-sm font-medium rounded-[14px] transition-colors no-underline"
    >
      Create Memorial
    </Link>
  </div>
);
