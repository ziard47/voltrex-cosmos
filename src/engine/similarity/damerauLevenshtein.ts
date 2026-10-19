/**
 * Computes Damerau-Levenshtein distance between two strings.
 * Accounts for insertions, deletions, substitutions, and transpositions of adjacent characters.
 */
export function damerauLevenshteinDistance(source: string, target: string): number {
  if (source === target) return 0
  const sLen = source.length
  const tLen = target.length

  if (sLen === 0) return tLen
  if (tLen === 0) return sLen

  // Distance matrix
  const matrix: number[][] = []

  for (let i = 0; i <= sLen; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= tLen; j++) {
    matrix[0]![j] = j
  }

  for (let i = 1; i <= sLen; i++) {
    const sChar = source.charCodeAt(i - 1)
    for (let j = 1; j <= tLen; j++) {
      const tChar = target.charCodeAt(j - 1)
      const cost = sChar === tChar ? 0 : 1

      // Elementary operations
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1, // deletion
        matrix[i]![j - 1]! + 1, // insertion
        matrix[i - 1]![j - 1]! + cost // substitution
      )

      // Adjacent transposition
      if (
        i > 1 &&
        j > 1 &&
        sChar === target.charCodeAt(j - 2) &&
        source.charCodeAt(i - 2) === tChar
      ) {
        matrix[i]![j] = Math.min(
          matrix[i]![j]!,
          matrix[i - 2]![j - 2]! + 1 // transposition
        )
      }
    }
  }

  return matrix[sLen]![tLen]!
}

/**
 * Calculates normalized similarity ratio (0 = completely different, 1 = identical).
 */
export function stringSimilarityRatio(s1: string, s2: string): number {
  const maxLen = Math.max(s1.length, s2.length)
  if (maxLen === 0) return 1.0
  const dist = damerauLevenshteinDistance(s1, s2)
  return Math.max(0, 1 - dist / maxLen)
}
