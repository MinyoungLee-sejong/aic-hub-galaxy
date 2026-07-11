export type MenuItem = {
  id: string;
  label: string;
  url: string;
};

export type AppSettings = {
  version: 2;
  fontFamily: string;
  tryNowUrl: string;
  menus: MenuItem[];
};

type LegacyAppSettings = {
  version: 1;
  tryNowUrl: string;
  menus: MenuItem[];
};

export const SETTINGS_STORAGE_KEY = 'aic-hub.settings.v2';
export const LEGACY_SETTINGS_STORAGE_KEY = 'aic-hub.settings.v1';

export const DEFAULT_SETTINGS: AppSettings = {
  version: 2,
  fontFamily: '',
  tryNowUrl: '',
  menus: [
    { id: 'aic-preset', label: 'AIC Preset', url: '' },
    { id: 'aic-lora', label: 'AIC LoRA', url: '' },
    { id: 'aic-modifier', label: 'AIC Modifier', url: '' },
    { id: 'aic-cret', label: 'AIC - CRET', url: '' },
  ],
};

const copySettings = (settings: AppSettings): AppSettings => ({
  ...settings,
  menus: settings.menus.map((menu) => ({ ...menu })),
});

export function isAllowedUrl(value: string): boolean {
  const url = value.trim();
  if (!url) return true;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isMenuItem(value: unknown): value is MenuItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.label === 'string' &&
    item.label.trim().length > 0 &&
    typeof item.url === 'string' &&
    isAllowedUrl(item.url)
  );
}

function isAppSettings(value: unknown): value is AppSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as Record<string, unknown>;
  return (
    settings.version === 2 &&
    typeof settings.fontFamily === 'string' &&
    settings.fontFamily.length <= 200 &&
    typeof settings.tryNowUrl === 'string' &&
    isAllowedUrl(settings.tryNowUrl) &&
    Array.isArray(settings.menus) &&
    settings.menus.every(isMenuItem)
  );
}

function isLegacyAppSettings(value: unknown): value is LegacyAppSettings {
  if (!value || typeof value !== 'object') return false;
  const settings = value as Record<string, unknown>;
  return (
    settings.version === 1 &&
    typeof settings.tryNowUrl === 'string' &&
    isAllowedUrl(settings.tryNowUrl) &&
    Array.isArray(settings.menus) &&
    settings.menus.every(isMenuItem)
  );
}

function parseSettings(stored: string): AppSettings | null {
  try {
    const parsed: unknown = JSON.parse(stored);
    if (isAppSettings(parsed)) return copySettings(parsed);
    if (isLegacyAppSettings(parsed)) {
      return {
        version: 2,
        fontFamily: '',
        tryNowUrl: parsed.tryNowUrl,
        menus: parsed.menus.map((menu) => ({ ...menu })),
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function loadSettings(): AppSettings {
  const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (stored) return parseSettings(stored) ?? copySettings(DEFAULT_SETTINGS);

  const legacy = localStorage.getItem(LEGACY_SETTINGS_STORAGE_KEY);
  if (legacy) return parseSettings(legacy) ?? copySettings(DEFAULT_SETTINGS);

  return copySettings(DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  if (!isAppSettings(settings)) {
    throw new Error('Settings contain an invalid name or URL.');
  }

  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(copySettings(settings)));
}

export function resetSettings(): AppSettings {
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
  localStorage.removeItem(LEGACY_SETTINGS_STORAGE_KEY);
  return copySettings(DEFAULT_SETTINGS);
}
