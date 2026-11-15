/** Join class names, skipping falsy values. Handles CSS Module lookups typed as `string | undefined`. */
export function cx(...parts: readonly (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
