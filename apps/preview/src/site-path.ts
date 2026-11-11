/** Shared base for landing, nested workbench, standalone preview and public assets. */
export function sitePath(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}
