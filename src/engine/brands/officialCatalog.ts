import type { OfficialBrand } from '../types'

export const CATALOG_VERSION = '2.0.0'

export const OFFICIAL_BRANDS: OfficialBrand[] = [
  {
    id: 'paypal',
    name: 'PayPal',
    category: 'financial',
    primaryDomain: 'paypal.com',
    officialDomains: [
      'paypal.com',
      'paypal.ca',
      'paypal.co.uk',
      'paypal.de',
      'paypal.fr',
      'paypal.me',
      'paypal-community.com',
    ],
    brandTokens: ['paypal'],
  },
  {
    id: 'google',
    name: 'Google',
    category: 'technology',
    primaryDomain: 'google.com',
    officialDomains: [
      'google.com',
      'google.co.uk',
      'google.ca',
      'google.de',
      'google.fr',
      'google.es',
      'google.it',
      'google.co.jp',
      'google.com.au',
      'youtube.com',
      'gmail.com',
      'gstatic.com',
      'googleusercontent.com',
      'withgoogle.com',
    ],
    brandTokens: ['google', 'youtube', 'gmail'],
  },
  {
    id: 'apple',
    name: 'Apple',
    category: 'technology',
    primaryDomain: 'apple.com',
    officialDomains: ['apple.com', 'icloud.com', 'apple.co', 'me.com'],
    brandTokens: ['apple', 'icloud'],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    category: 'technology',
    primaryDomain: 'microsoft.com',
    officialDomains: [
      'microsoft.com',
      'office.com',
      'live.com',
      'azure.com',
      'microsoft365.com',
      'outlook.com',
      'bing.com',
      'windows.com',
      'sharepoint.com',
      'msn.com',
      'xbox.com',
      'microsoftonline.com',
    ],
    brandTokens: ['microsoft', 'office365', 'microsoft365', 'outlook', 'azure'],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    category: 'ecommerce',
    primaryDomain: 'amazon.com',
    officialDomains: [
      'amazon.com',
      'amazon.co.uk',
      'amazon.de',
      'amazon.co.jp',
      'amazon.fr',
      'amazon.it',
      'amazon.ca',
      'amazon.es',
      'primevideo.com',
      'media-amazon.com',
    ],
    brandTokens: ['amazon', 'primevideo'],
  },
  {
    id: 'chase',
    name: 'Chase Bank',
    category: 'financial',
    primaryDomain: 'chase.com',
    officialDomains: ['chase.com', 'jpmorganchase.com', 'jpmorgan.com'],
    brandTokens: ['chase', 'jpmorgan'],
  },
  {
    id: 'bankofamerica',
    name: 'Bank of America',
    category: 'financial',
    primaryDomain: 'bankofamerica.com',
    officialDomains: ['bankofamerica.com', 'bofa.com'],
    brandTokens: ['bankofamerica', 'bofa'],
  },
  {
    id: 'wellsfargo',
    name: 'Wells Fargo',
    category: 'financial',
    primaryDomain: 'wellsfargo.com',
    officialDomains: ['wellsfargo.com'],
    brandTokens: ['wellsfargo'],
  },
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'communication',
    primaryDomain: 'netflix.com',
    officialDomains: ['netflix.com'],
    brandTokens: ['netflix'],
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'technology',
    primaryDomain: 'github.com',
    officialDomains: [
      'github.com',
      'github.io',
      'githubassets.com',
      'githubusercontent.com',
    ],
    brandTokens: ['github'],
  },
  {
    id: 'meta',
    name: 'Meta / Facebook',
    category: 'social',
    primaryDomain: 'meta.com',
    officialDomains: [
      'meta.com',
      'facebook.com',
      'fb.com',
      'instagram.com',
      'whatsapp.com',
      'messenger.com',
    ],
    brandTokens: ['facebook', 'instagram', 'whatsapp'],
  },
  {
    id: 'x',
    name: 'X (formerly Twitter)',
    category: 'social',
    primaryDomain: 'x.com',
    officialDomains: ['x.com', 'twitter.com', 't.co'],
    brandTokens: ['twitter'],
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    category: 'financial',
    primaryDomain: 'coinbase.com',
    officialDomains: ['coinbase.com'],
    brandTokens: ['coinbase'],
  },
  {
    id: 'binance',
    name: 'Binance',
    category: 'financial',
    primaryDomain: 'binance.com',
    officialDomains: ['binance.com', 'binance.us'],
    brandTokens: ['binance'],
  },
  {
    id: 'steam',
    name: 'Steam (Valve)',
    category: 'general',
    primaryDomain: 'steampowered.com',
    officialDomains: ['steampowered.com', 'steamcommunity.com', 'valvesoftware.com'],
    brandTokens: ['steampowered', 'steamcommunity'],
  },
]

// Build fast lookup index for official domains
const DOMAIN_TO_BRAND_MAP = new Map<string, OfficialBrand>()
for (const brand of OFFICIAL_BRANDS) {
  for (const domain of brand.officialDomains) {
    DOMAIN_TO_BRAND_MAP.set(domain.toLowerCase(), brand)
  }
}

/**
 * Checks if a domain is a verified official domain or legitimate regional domain.
 */
export function findBrandByOfficialDomain(
  registrableDomain: string | null
): OfficialBrand | null {
  if (!registrableDomain) return null
  const cleaned = registrableDomain.toLowerCase().trim()
  return DOMAIN_TO_BRAND_MAP.get(cleaned) || null
}

/**
 * Checks if a hostname belongs to an official brand (including subdomains of official domains).
 */
export function isOfficialDomain(registrableDomain: string | null): boolean {
  return findBrandByOfficialDomain(registrableDomain) !== null
}

/**
 * Safely resolves the verified official destination for a brand.
 * Strictly guarantees that URLs are never fabricated from untrusted strings.
 */
export function getSafeOfficialDestination(brand: OfficialBrand): string {
  return `https://${brand.primaryDomain}`
}
