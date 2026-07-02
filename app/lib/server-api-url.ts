/** Server-side API base URL (Docker internal network when set). */
export function getServerApiUrl(): string {
  return (
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ''
  );
}
