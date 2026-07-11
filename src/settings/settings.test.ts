import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  isAllowedUrl,
  loadSettings,
  resetSettings,
  saveSettings,
} from './settings';

describe('settings storage', () => {
  it('returns four default menu items when no settings have been saved', () => {
    const settings = loadSettings();

    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(settings).toMatchObject({ version: 2, fontFamily: '' });
    expect(settings.menus.map((menu) => menu.label)).toEqual([
      'AIC Preset',
      'AIC LoRA',
      'AIC Modifier',
      'AIC - CRET',
    ]);
  });

  it('migrates version 1 settings without losing saved destinations', () => {
    localStorage.setItem(
      'aic-hub.settings.v1',
      JSON.stringify({
        version: 1,
        tryNowUrl: 'https://example.com/start',
        menus: [{ id: 'legacy', label: 'Legacy tool', url: 'https://example.com/tool' }],
      }),
    );

    expect(loadSettings()).toEqual({
      version: 2,
      fontFamily: '',
      tryNowUrl: 'https://example.com/start',
      menus: [{ id: 'legacy', label: 'Legacy tool', url: 'https://example.com/tool' }],
    });
  });

  it('saves settings and loads them again', () => {
    const changed = {
      ...DEFAULT_SETTINGS,
      tryNowUrl: 'https://example.com',
      menus: [{ id: 'docs', label: 'Docs', url: 'https://example.com/docs' }],
    };

    saveSettings(changed);

    expect(loadSettings()).toEqual(changed);
    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toContain('example.com');
  });

  it('restores defaults when stored data is malformed', () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, '{not-json');

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('accepts empty, http, and https URLs but rejects unsafe schemes', () => {
    expect(isAllowedUrl('')).toBe(true);
    expect(isAllowedUrl('https://example.com')).toBe(true);
    expect(isAllowedUrl('http://localhost:3000')).toBe(true);
    expect(isAllowedUrl('javascript:alert(1)')).toBe(false);
    expect(isAllowedUrl('example.com')).toBe(false);
  });

  it('refuses to save settings with an unsafe URL', () => {
    const invalid = {
      ...DEFAULT_SETTINGS,
      tryNowUrl: 'javascript:alert(1)',
    };

    expect(() => saveSettings(invalid)).toThrow('invalid name or URL');
    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull();
  });

  it('clears saved values and returns a fresh copy of the defaults', () => {
    saveSettings({ ...DEFAULT_SETTINGS, tryNowUrl: 'https://example.com' });

    const reset = resetSettings();
    reset.menus[0].label = 'Changed locally';

    expect(localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull();
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

});
