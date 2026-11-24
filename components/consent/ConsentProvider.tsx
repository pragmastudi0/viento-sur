'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  CONSENT_EVENT, CONSENT_STORAGE_KEY, consentModeState, cookieDomainsFor, createConsent,
  isAnalyticsCookie, parseConsent, type ConsentState,
} from '@/lib/consent';
import { setAnalyticsEnabled } from '@/lib/analytics';
import CookieBanner from './CookieBanner';
import CookiePreferences from './CookiePreferences';
import AnalyticsLoader from './AnalyticsLoader';
import ClickTracking from './ClickTracking';

interface ConsentContextValue {
  consent: ConsentState | null;
  ready: boolean;
  save: (analytics: boolean) => void;
  openPreferences: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readStoredConsent(): ConsentState | null {
  try { return parseConsent(localStorage.getItem(CONSENT_STORAGE_KEY)); } catch { return null; }
}

function deleteAnalyticsCookies() {
  const names = document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(isAnalyticsCookie);
  for (const name of names) {
    for (const domain of cookieDomainsFor(window.location.hostname)) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
    }
  }
}

/** Aplica la decisión a Consent Mode y al estado local de medición. */
function applyConsent(analytics: boolean, gaId: string | null) {
  setAnalyticsEnabled(analytics);
  window.gtag?.('consent', 'update', consentModeState(analytics));
  if (gaId) (window as unknown as Record<string, boolean>)[`ga-disable-${gaId}`] = !analytics;
  if (!analytics) deleteAnalyticsCookies();
}

export function ConsentProvider({ children, gaId }: { children: ReactNode; gaId: string | null }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const admin = usePathname().startsWith('/admin');

  useEffect(() => {
    const stored = readStoredConsent();
    setConsent(stored);
    applyConsent(stored?.analytics === true, gaId);
    setReady(true);
    // Sincroniza la decisión entre pestañas abiertas del sitio.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CONSENT_STORAGE_KEY) return;
      const next = parseConsent(event.newValue);
      setConsent(next);
      applyConsent(next?.analytics === true, gaId);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [gaId]);

  const save = useCallback((analytics: boolean) => {
    const next = createConsent(analytics);
    try { localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next)); } catch { /* Sin almacenamiento: la decisión vale para esta visita. */ }
    applyConsent(analytics, gaId);
    setConsent(next);
    setPreferencesOpen(false);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: next }));
  }, [gaId]);

  const openPreferences = useCallback(() => setPreferencesOpen(true), []);
  const value = useMemo(() => ({ consent, ready, save, openPreferences }), [consent, ready, save, openPreferences]);
  const analyticsAllowed = ready && consent?.analytics === true && !admin;

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {analyticsAllowed && <AnalyticsLoader gaId={gaId} />}
      {analyticsAllowed && <ClickTracking />}
      {ready && !admin && !consent && !preferencesOpen && <CookieBanner onAcceptAll={() => save(true)} onRejectAll={() => save(false)} onConfigure={openPreferences} />}
      {preferencesOpen && (
        <CookiePreferences
          initialAnalytics={consent?.analytics ?? false}
          onSave={save}
          onClose={() => setPreferencesOpen(false)}
        />
      )}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent debe usarse dentro de <ConsentProvider>');
  return ctx;
}
