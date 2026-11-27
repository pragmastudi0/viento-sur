import { describe, expect, it } from 'vitest';
import { runInNewContext } from 'node:vm';
import {
  CONSENT_STORAGE_KEY, CONSENT_VERSION, consentBootstrapScript, consentModeState, cookieDomainsFor,
  createConsent, gaMeasurementId, isAnalyticsCookie, parseConsent,
} from '@/lib/consent';
import { sanitizeParams } from '@/lib/analytics';
import { breadcrumbJsonLd, pageMetadata, productJsonLd, serializeJsonLd } from '@/lib/seo';

describe('consent storage', () => {
  it('accepts only the current version with boolean analytics', () => {
    expect(parseConsent(JSON.stringify(createConsent(true)))).toMatchObject({ version: CONSENT_VERSION, analytics: true });
    expect(parseConsent(JSON.stringify({ version: CONSENT_VERSION - 1, analytics: true, updatedAt: 'x' }))).toBeNull();
    expect(parseConsent(JSON.stringify({ version: CONSENT_VERSION, analytics: 'yes', updatedAt: 'x' }))).toBeNull();
    expect(parseConsent('{broken')).toBeNull();
    expect(parseConsent(null)).toBeNull();
  });

  it('never grants advertising signals', () => {
    for (const analytics of [true, false]) {
      const state = consentModeState(analytics);
      expect(state.ad_storage).toBe('denied');
      expect(state.ad_user_data).toBe('denied');
      expect(state.ad_personalization).toBe('denied');
      expect(state.analytics_storage).toBe(analytics ? 'granted' : 'denied');
    }
  });

  it('validates the GA4 measurement id', () => {
    expect(gaMeasurementId('G-ABC123XYZ9')).toBe('G-ABC123XYZ9');
    expect(gaMeasurementId(' g-abc123xyz9 ')).toBe('G-ABC123XYZ9');
    expect(gaMeasurementId('UA-1234-1')).toBeNull();
    expect(gaMeasurementId('')).toBeNull();
    expect(gaMeasurementId(undefined)).toBeNull();
  });

  it('identifies GA cookies and candidate domains', () => {
    expect(isAnalyticsCookie('_ga')).toBe(true);
    expect(isAnalyticsCookie('_ga_ABC123')).toBe(true);
    expect(isAnalyticsCookie('sb-x-auth-token')).toBe(false);
    expect(cookieDomainsFor('www.example.com.ar')).toEqual(['', '.www.example.com.ar', '.example.com.ar', '.com.ar']);
  });
});

describe('consent bootstrap script', () => {
  function run(stored: string | null) {
    const dataLayer: unknown[][] = [];
    const window: Record<string, unknown> = { dataLayer };
    const localStorage = { getItem: (key: string) => (key === CONSENT_STORAGE_KEY ? stored : null) };
    runInNewContext(consentBootstrapScript(), { window, localStorage, dataLayer });
    return dataLayer.map(args => Array.from(args as ArrayLike<unknown>));
  }

  it('sets denied defaults before anything else', () => {
    const calls = run(null);
    expect(calls[0]).toEqual(['consent', 'default', consentModeState(false)]);
    expect(calls.some(c => c[1] === 'update')).toBe(false);
  });

  it('restores a valid stored grant before tags load', () => {
    const calls = run(JSON.stringify(createConsent(true)));
    expect(calls.at(-1)).toEqual(['consent', 'update', { analytics_storage: 'granted' }]);
  });

  it('ignores a stored rejection or outdated version', () => {
    expect(run(JSON.stringify(createConsent(false))).some(c => c[1] === 'update')).toBe(false);
    expect(run(JSON.stringify({ ...createConsent(true), version: 0 })).some(c => c[1] === 'update')).toBe(false);
  });
});

describe('analytics params', () => {
  it('drops values that look like personal data and truncates long strings', () => {
    const clean = sanitizeParams({ email: 'a@b.com', phone: '351 768 1444', name: 'Lanin', long: 'x'.repeat(150), value: 1000, missing: undefined });
    expect(clean).toEqual({ name: 'Lanin', long: 'x'.repeat(100), value: 1000 });
  });
});

describe('seo helpers', () => {
  it('builds self-referencing canonical and social metadata', () => {
    const meta = pageMetadata({ title: 'Catálogo', description: 'd', path: '/catalogo' });
    expect(String(meta.alternates?.canonical)).toMatch(/\/catalogo$/);
    expect(meta.openGraph).toMatchObject({ title: 'Catálogo | Viento Sur', url: meta.alternates?.canonical });
    expect(meta.robots).toBeUndefined();
    expect(pageMetadata({ title: 't', description: 'd', path: '/x', noindex: true }).robots).toEqual({ index: false, follow: true });
  });

  it('produces product and breadcrumb JSON-LD without invented fields', () => {
    const product = productJsonLd({ name: 'Lanin', slug: 'lanin', description: 'd', price: 85000, images: ['https://x/img.jpg'], category: 'Lámparas de pie' });
    expect(product.offers).toMatchObject({ price: '85000.00', priceCurrency: 'ARS' });
    expect(product.offers).not.toHaveProperty('availability');
    expect(product).not.toHaveProperty('aggregateRating');
    const crumbs = breadcrumbJsonLd([{ name: 'Inicio', path: '/' }, { name: 'Lanin', path: '/productos/lanin' }]);
    expect(crumbs.itemListElement[1]).toMatchObject({ position: 2, name: 'Lanin' });
  });

  it('escapes script-breaking characters', () => {
    expect(serializeJsonLd({ a: '</script><b>' })).not.toContain('</script>');
  });
});
