/**
 * Client-side screening of picked images, mirroring the backend allow-list
 * (apps/media/validators.py): JPEG, PNG, WebP, with a matching extension, up to 15 MB.
 */

const ALLOWED: Record<string, readonly string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

/** Value for `<input accept>`: limits the picker to supported formats. */
export const IMAGE_ACCEPT = Object.keys(ALLOWED).join(',');

/** Matches MAX_IMAGE_UPLOAD_BYTES on the backend. */
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export const FORMATS_HINT = 'JPG, PNG or WebP, up to 15 MB';

export interface ScreenedImages {
  accepted: File[];
  /** One human-readable reason per rejected file. */
  rejected: string[];
}

function extension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot).toLowerCase();
}

export function screenImages(files: Iterable<File>): ScreenedImages {
  const accepted: File[] = [];
  const rejected: string[] = [];
  for (const file of files) {
    const extensions = ALLOWED[file.type];
    if (!extensions || !extensions.includes(extension(file.name))) {
      rejected.push(`${file.name}: unsupported format (use JPG, PNG or WebP)`);
    } else if (file.size > MAX_IMAGE_BYTES) {
      rejected.push(`${file.name}: larger than 15 MB`);
    } else {
      accepted.push(file);
    }
  }
  return { accepted, rejected };
}
