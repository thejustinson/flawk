/**
 * Bump a `major.minor` version string. Editing a published agent creates the
 * next minor version as a fresh draft; the published one is never mutated.
 */
export function nextVersion(current: string): string {
  const match = current.match(/^(\d+)\.(\d+)$/);
  if (!match) return "0.1";
  return `${match[1]}.${Number(match[2]) + 1}`;
}
