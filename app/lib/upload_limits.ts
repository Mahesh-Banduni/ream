export const UPLOAD_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5 MB
  AUDIO: 50 * 1024 * 1024, // 50 MB
  VIDEO: 500 * 1024 * 1024, // 500 MB
};

export function formatBytes(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}