import punycode from 'punycode/'
import type { ConfusableAnalysis } from '../types'

/**
 * Curated mapping of Unicode confusable characters to Latin base characters.
 * Sources: Unicode Technical Standard #39 (UTS #39 Security Mechanisms)
 * Covers Cyrillic, Greek, lookalike symbols, and number-for-letter substitutions.
 */
interface ConfusableMapping {
  replacement: string
  script: 'Cyrillic' | 'Greek' | 'Digit' | 'Latin_Variant' | 'Symbol'
}

const CONFUSABLES_MAP: Record<string, ConfusableMapping> = {
  // Cyrillic Lowercase
  '\u0430': { replacement: 'a', script: 'Cyrillic' }, // а
  '\u0432': { replacement: 'b', script: 'Cyrillic' }, // в
  '\u0441': { replacement: 'c', script: 'Cyrillic' }, // с
  '\u0434': { replacement: 'd', script: 'Cyrillic' }, // д
  '\u0435': { replacement: 'e', script: 'Cyrillic' }, // е
  '\u0451': { replacement: 'e', script: 'Cyrillic' }, // ё
  '\u0456': { replacement: 'i', script: 'Cyrillic' }, // і (Ukrainian/Belarusian)
  '\u0458': { replacement: 'j', script: 'Cyrillic' }, // ј
  '\u043A': { replacement: 'k', script: 'Cyrillic' }, // к
  '\u043C': { replacement: 'm', script: 'Cyrillic' }, // м
  '\u043D': { replacement: 'h', script: 'Cyrillic' }, // н
  '\u043E': { replacement: 'o', script: 'Cyrillic' }, // о
  '\u0440': { replacement: 'p', script: 'Cyrillic' }, // р
  '\u0442': { replacement: 't', script: 'Cyrillic' }, // т
  '\u0443': { replacement: 'y', script: 'Cyrillic' }, // у
  '\u0445': { replacement: 'x', script: 'Cyrillic' }, // х
  '\u0455': { replacement: 's', script: 'Cyrillic' }, // ѕ (Macedonian)

  // Cyrillic Uppercase
  '\u0410': { replacement: 'a', script: 'Cyrillic' }, // А
  '\u0412': { replacement: 'b', script: 'Cyrillic' }, // В
  '\u0421': { replacement: 'c', script: 'Cyrillic' }, // С
  '\u0415': { replacement: 'e', script: 'Cyrillic' }, // Е
  '\u0406': { replacement: 'i', script: 'Cyrillic' }, // І
  '\u0408': { replacement: 'j', script: 'Cyrillic' }, // Ј
  '\u041A': { replacement: 'k', script: 'Cyrillic' }, // К
  '\u041C': { replacement: 'm', script: 'Cyrillic' }, // М
  '\u041D': { replacement: 'h', script: 'Cyrillic' }, // Н
  '\u041E': { replacement: 'o', script: 'Cyrillic' }, // О
  '\u0420': { replacement: 'p', script: 'Cyrillic' }, // Р
  '\u0422': { replacement: 't', script: 'Cyrillic' }, // Т
  '\u0423': { replacement: 'y', script: 'Cyrillic' }, // У
  '\u0425': { replacement: 'x', script: 'Cyrillic' }, // Х
  '\u0405': { replacement: 's', script: 'Cyrillic' }, // Ѕ

  // Greek Lowercase
  '\u03B1': { replacement: 'a', script: 'Greek' }, // α
  '\u03B2': { replacement: 'b', script: 'Greek' }, // β
  '\u03B3': { replacement: 'y', script: 'Greek' }, // γ
  '\u03B5': { replacement: 'e', script: 'Greek' }, // ε
  '\u03B9': { replacement: 'i', script: 'Greek' }, // ι
  '\u03BA': { replacement: 'k', script: 'Greek' }, // κ
  '\u03BD': { replacement: 'v', script: 'Greek' }, // ν
  '\u03BF': { replacement: 'o', script: 'Greek' }, // ο
  '\u03C1': { replacement: 'p', script: 'Greek' }, // ρ
  '\u03C4': { replacement: 't', script: 'Greek' }, // τ
  '\u03C5': { replacement: 'y', script: 'Greek' }, // υ
  '\u03C7': { replacement: 'x', script: 'Greek' }, // χ

  // Greek Uppercase
  '\u0391': { replacement: 'a', script: 'Greek' }, // Α
  '\u0392': { replacement: 'b', script: 'Greek' }, // Β
  '\u0395': { replacement: 'e', script: 'Greek' }, // Ε
  '\u0397': { replacement: 'h', script: 'Greek' }, // Η
  '\u0399': { replacement: 'i', script: 'Greek' }, // Ι
  '\u039A': { replacement: 'k', script: 'Greek' }, // Κ
  '\u039C': { replacement: 'm', script: 'Greek' }, // Μ
  '\u039D': { replacement: 'n', script: 'Greek' }, // Ν
  '\u039F': { replacement: 'o', script: 'Greek' }, // Ο
  '\u03A1': { replacement: 'p', script: 'Greek' }, // Ρ
  '\u03A4': { replacement: 't', script: 'Greek' }, // Τ
  '\u03A7': { replacement: 'x', script: 'Greek' }, // Χ
  '\u03A5': { replacement: 'y', script: 'Greek' }, // Υ

  // Digit Substitutions / Leet Speak in Domains
  '0': { replacement: 'o', script: 'Digit' },
  '1': { replacement: 'l', script: 'Digit' },
  '3': { replacement: 'e', script: 'Digit' },
  '4': { replacement: 'a', script: 'Digit' },
  '5': { replacement: 's', script: 'Digit' },
  '8': { replacement: 'b', script: 'Digit' },
}

/**
 * Determines primary script category of a Unicode character.
 */
function getCharacterScript(char: string): string {
  const code = char.codePointAt(0) ?? 0

  if ((code >= 0x0041 && code <= 0x005a) || (code >= 0x0061 && code <= 0x007a)) {
    return 'Latin'
  }
  if (code >= 0x0030 && code <= 0x0039) {
    return 'ASCII_Digit'
  }
  if (code === 0x002d || code === 0x002e) {
    return 'Punctuation'
  }
  if (code >= 0x00c0 && code <= 0x024f) {
    return 'Latin_Extended'
  }
  if ((code >= 0x0400 && code <= 0x04ff) || (code >= 0x0500 && code <= 0x052f)) {
    return 'Cyrillic'
  }
  if ((code >= 0x0370 && code <= 0x03ff) || (code >= 0x1f00 && code <= 0x1fff)) {
    return 'Greek'
  }
  if (code >= 0x0590 && code <= 0x05ff) {
    return 'Hebrew'
  }
  if (code >= 0x0600 && code <= 0x06ff) {
    return 'Arabic'
  }
  if (code >= 0x4e00 && code <= 0x9fff) {
    return 'Han'
  }
  if (code >= 0x3040 && code <= 0x309f) {
    return 'Hiragana'
  }
  if (code >= 0x30a0 && code <= 0x30ff) {
    return 'Katakana'
  }

  return 'Other'
}

/**
 * Analyzes a domain label or hostname for internationalized characters,
 * mixed scripts, and Unicode confusables.
 */
export function analyzeConfusables(domainOrLabel: string): ConfusableAnalysis {
  if (!domainOrLabel) {
    return {
      hasNonAscii: false,
      isPunycode: false,
      scripts: [],
      isMixedScript: false,
      containsConfusables: false,
      skeleton: '',
      confusableReplacements: [],
    }
  }

  const isPuny = domainOrLabel
    .toLowerCase()
    .split('.')
    .some((p) => p.startsWith('xn--'))

  // Decode punycode if necessary to inspect Unicode glyphs
  let unicodeStr = domainOrLabel
  if (isPuny) {
    try {
      unicodeStr = punycode.toUnicode(domainOrLabel)
    } catch {
      unicodeStr = domainOrLabel
    }
  }

  const hasNonAscii = Array.from(unicodeStr).some((ch) => (ch.codePointAt(0) ?? 0) > 127)
  const scriptsFound = new Set<string>()
  const replacements: ConfusableAnalysis['confusableReplacements'] = []
  let skeleton = ''

  let index = 0
  for (const char of unicodeStr) {
    const script = getCharacterScript(char)
    if (script !== 'Punctuation' && script !== 'ASCII_Digit') {
      scriptsFound.add(script)
    }

    const confusable = CONFUSABLES_MAP[char]
    if (confusable) {
      skeleton += confusable.replacement
      // Only record confusable if it is non-Latin/non-standard or digit
      if (confusable.script !== 'Latin_Variant') {
        replacements.push({
          original: char,
          replacement: confusable.replacement,
          charIndex: index,
          unicodeHex: `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`,
          script: confusable.script,
        })
      }
    } else {
      skeleton += char.toLowerCase()
    }

    index++
  }

  // Mixed-script occurs when Latin (or Latin_Extended) is combined with Cyrillic, Greek, etc. in same host
  const hasLatin = scriptsFound.has('Latin') || scriptsFound.has('Latin_Extended')
  const hasNonLatinScript =
    scriptsFound.has('Cyrillic') ||
    scriptsFound.has('Greek') ||
    scriptsFound.has('Hebrew') ||
    scriptsFound.has('Arabic')

  const isMixedScript = hasLatin && hasNonLatinScript

  return {
    hasNonAscii,
    isPunycode: isPuny,
    scripts: Array.from(scriptsFound),
    isMixedScript,
    containsConfusables: replacements.length > 0,
    skeleton,
    confusableReplacements: replacements,
  }
}
