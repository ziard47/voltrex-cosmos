import { describe, it, expect } from 'vitest'
import {
  findBrandByOfficialDomain,
  isOfficialDomain,
  getSafeOfficialDestination,
  OFFICIAL_BRANDS,
} from './officialCatalog'

describe('officialCatalog', () => {
  it('identifies primary official brand domains', () => {
    const brand = findBrandByOfficialDomain('paypal.com')
    expect(brand).not.toBeNull()
    expect(brand?.id).toBe('paypal')
    expect(brand?.name).toBe('PayPal')
    expect(isOfficialDomain('paypal.com')).toBe(true)
  })

  it('supports legitimate regional domains (ccTLDs)', () => {
    // google.co.uk and google.de must be recognized as authentic Google domains
    const ukBrand = findBrandByOfficialDomain('google.co.uk')
    expect(ukBrand?.id).toBe('google')

    const deBrand = findBrandByOfficialDomain('google.de')
    expect(deBrand?.id).toBe('google')

    const jpAmazon = findBrandByOfficialDomain('amazon.co.jp')
    expect(jpAmazon?.id).toBe('amazon')
  })

  it('does not identify typosquats or lookalikes as official', () => {
    expect(isOfficialDomain('paypaal.com')).toBe(false)
    expect(isOfficialDomain('pаypal.com')).toBe(false)
    expect(isOfficialDomain('g00gle.com')).toBe(false)
    expect(isOfficialDomain('apple-security.com')).toBe(false)
  })

  it('returns canonical destination URLs without fabricating paths or guessing', () => {
    const paypal = OFFICIAL_BRANDS.find((b) => b.id === 'paypal')!
    expect(getSafeOfficialDestination(paypal)).toBe('https://paypal.com')

    const google = OFFICIAL_BRANDS.find((b) => b.id === 'google')!
    expect(getSafeOfficialDestination(google)).toBe('https://google.com')
  })
})
