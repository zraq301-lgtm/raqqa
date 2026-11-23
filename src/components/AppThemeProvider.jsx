import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../config/apiConfig';

const defaultSettings = {
  primaryColor: '#e94d7b',
  accentColor: '#c93764',
  backgroundColor: '#fff8fa',
  fontFamily: 'Tajawal',
  branding: { enabled: true, name: 'رِقّة', color: '#b12a68', fontFamily: 'Tajawal', fontSize: '32px', fontWeight: '800', letterSpacing: '0px' },
  pages: {},
  celebration: { type: 'none', endAt: null },
};
const AppThemeContext = createContext(defaultSettings);

function safeSettings(payload) {
  const settings = payload?.settings || payload || {};
  // The current API preserves page settings but may omit the top-level branding key.
  // Keep the admin-controlled logo working through the supported pages container.
  const remoteBranding = settings.branding && typeof settings.branding === 'object'
    ? settings.branding
    : settings.pages?.__branding;
  const branding = remoteBranding && typeof remoteBranding === 'object'
    ? { ...defaultSettings.branding, ...remoteBranding }
    : { ...defaultSettings.branding };
  if (!remoteBranding?.fontSize || remoteBranding.fontSize === '24px') branding.fontSize = defaultSettings.branding.fontSize;
  if (typeof remoteBranding?.enabled !== 'boolean') branding.enabled = defaultSettings.branding.enabled;
  return {
    ...defaultSettings,
    ...settings,
    pages: settings.pages && typeof settings.pages === 'object' ? settings.pages : {},
    branding,
    celebration: settings.celebration && typeof settings.celebration === 'object' ? settings.celebration : defaultSettings.celebration,
  };
}

function celebrationItems(type) {
  const choices = type === 'hearts' ? ['♡', '♥', '💗']
    : type === 'stars' ? ['⭐', '✨', '🌟']
      : type === 'confetti' ? ['🎊', '🎉', '✨']
        : type === 'hearts-stars' ? ['💗', '⭐', '✨'] : [];
  return Array.from({ length: 14 }, (_, index) => ({
    id: index,
    icon: choices[index % Math.max(choices.length, 1)],
    left: `${(index * 37 + 5) % 97}%`,
    delay: `${(index % 7) * -1.8}s`,
    duration: `${8 + (index % 5)}s`,
    size: `${15 + (index % 4) * 5}px`,
  }));
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}

export default function AppThemeProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(apiUrl('api/settings/theme'), { cache: 'no-store' });
        if (!response.ok) return;
        const payload = await response.json();
        if (active) setSettings(safeSettings(payload));
      } catch (error) {
        console.debug('[Raqqa] Theme settings unavailable; using defaults.', error?.message || error);
      }
    };
    load();
    const timer = window.setInterval(load, 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--female-pink', settings.primaryColor);
    root.style.setProperty('--pink', settings.primaryColor);
    root.style.setProperty('--pink-dark', settings.accentColor);
    root.style.setProperty('--main-theme-color', settings.backgroundColor);
    root.style.setProperty('--soft-bg', settings.backgroundColor);
    root.style.setProperty('--app-font-family', `'${settings.fontFamily}', sans-serif`);
    document.body.style.fontFamily = `'${settings.fontFamily}', sans-serif`;
  }, [settings]);

  useEffect(() => {
    const endAt = Date.parse(settings.celebration?.endAt || '');
    if (!Number.isFinite(endAt) || endAt <= Date.now()) return undefined;
    const timer = window.setTimeout(() => {
      setSettings((current) => ({
        ...current,
        celebration: { ...current.celebration, type: 'none' },
      }));
    }, endAt - Date.now() + 50);
    return () => window.clearTimeout(timer);
  }, [settings.celebration?.endAt]);

  const celebrationActive = settings.celebration?.type !== 'none'
    && settings.celebration?.endAt
    && Date.parse(settings.celebration.endAt) > Date.now();
  const items = useMemo(() => celebrationActive ? celebrationItems(settings.celebration.type) : [], [celebrationActive, settings.celebration?.type]);

  return (
    <AppThemeContext.Provider value={settings}>
      {children}
      {celebrationActive && (
        <div className="celebration-overlay" aria-hidden="true">
          {items.map((item) => (
            <span key={item.id} className="celebration-particle" style={{ left: item.left, animationDelay: item.delay, animationDuration: item.duration, fontSize: item.size }}>
              {item.icon}
            </span>
          ))}
        </div>
      )}
    </AppThemeContext.Provider>
  );
}
