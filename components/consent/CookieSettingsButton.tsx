'use client';

import { useConsent } from './ConsentProvider';

export default function CookieSettingsButton({ className, children = 'Preferencias de cookies' }: { className?: string; children?: React.ReactNode }) {
  const { openPreferences } = useConsent();
  return (
    <button type="button" onClick={openPreferences} className={className} aria-haspopup="dialog">
      {children}
    </button>
  );
}
