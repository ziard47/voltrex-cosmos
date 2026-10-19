/**
 * Safely sanitizes text intended for host display to ensure no injection occurs.
 */
export function sanitizeHostnameText(raw: string): string {
  if (!raw) return 'Unknown site'
  // Remove control characters (C0: 0-31, DEL: 127, C1: 128-159)
  return Array.from(raw)
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0
      return code >= 32 && (code < 127 || code > 159)
    })
    .join('')
    .trim()
}

/**
 * Validates whether an external URL is safe to open (only allows http/https schemes).
 * Blocks javascript:, data:, vbscript: or other dangerous pseudo-schemes.
 */
export function isSafeWebUrl(url: string): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}
