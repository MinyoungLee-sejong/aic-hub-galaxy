import { ArrowDown, ArrowUp, Plus, RotateCcw, ScanSearch, Trash2, Type, X } from 'lucide-react';
import { useState } from 'react';
import {
  FALLBACK_FONT_FAMILIES,
  LocalFontAccessUnsupportedError,
  queryInstalledFontFamilies,
} from '../fonts/localFonts';
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  isAllowedUrl,
} from '../settings/settings';

type SettingsPanelProps = {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onReset: () => void;
  onClose: () => void;
};

function cloneSettings(settings: AppSettings): AppSettings {
  return { ...settings, menus: settings.menus.map((menu) => ({ ...menu })) };
}

function createMenuId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `menu-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function SettingsPanel({ settings, onSave, onReset, onClose }: SettingsPanelProps) {
  const [draft, setDraft] = useState(() => cloneSettings(settings));
  const [error, setError] = useState('');
  const [fontFamilies, setFontFamilies] = useState<string[]>(() =>
    [...new Set([...FALLBACK_FONT_FAMILIES, settings.fontFamily].filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    ),
  );
  const [fontStatus, setFontStatus] = useState<'idle' | 'loading' | 'loaded' | 'unsupported' | 'denied'>('idle');

  const updateMenu = (index: number, field: 'label' | 'url', value: string) => {
    setDraft((current) => ({
      ...current,
      menus: current.menus.map((menu, menuIndex) =>
        index === menuIndex ? { ...menu, [field]: value } : menu,
      ),
    }));
  };

  const moveMenu = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.menus.length) return current;
      const menus = [...current.menus];
      [menus[index], menus[target]] = [menus[target], menus[index]];
      return { ...current, menus };
    });
  };

  const save = () => {
    const hasInvalidName = draft.menus.some((menu) => !menu.label.trim());
    const hasInvalidUrl =
      !isAllowedUrl(draft.tryNowUrl) || draft.menus.some((menu) => !isAllowedUrl(menu.url));
    if (hasInvalidName) {
      setError('Every menu needs a name.');
      return;
    }
    if (hasInvalidUrl) {
      setError('Use a full http:// or https:// URL, or leave the field empty.');
      return;
    }
    onSave({
      ...draft,
      tryNowUrl: draft.tryNowUrl.trim(),
      menus: draft.menus.map((menu) => ({
        ...menu,
        label: menu.label.trim(),
        url: menu.url.trim(),
      })),
    });
  };

  const loadInstalledFonts = async () => {
    setFontStatus('loading');
    try {
      const installed = await queryInstalledFontFamilies();
      setFontFamilies(
        [...new Set([...FALLBACK_FONT_FAMILIES, ...installed, draft.fontFamily].filter(Boolean))].sort(
          (a, b) => a.localeCompare(b),
        ),
      );
      setFontStatus('loaded');
    } catch (fontError) {
      setFontStatus(fontError instanceof LocalFontAccessUnsupportedError ? 'unsupported' : 'denied');
    }
  };

  return (
    <div className="settings-layer">
      <button className="settings-scrim" onClick={onClose} aria-label="Close settings" />
      <section className="settings-panel" role="dialog" aria-modal="true" aria-label="Personalize your hub">
        <header className="settings-header">
          <div>
            <p className="eyebrow">PERSONAL SPACE</p>
            <h2>Make it yours.</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close settings panel">
            <X size={20} />
          </button>
        </header>

        <div className="settings-scroll">
          <section className="font-setting" aria-labelledby="font-setting-title">
            <div className="font-setting-title">
              <span className="font-setting-icon"><Type size={17} /></span>
              <div>
                <strong id="font-setting-title">App font</strong>
                <small>Apply one local font across the entire hub.</small>
              </div>
            </div>
            <label className="field-group font-field">
              <span>Font family</span>
              <select
                aria-label="App font"
                value={draft.fontFamily}
                onChange={(event) => setDraft({ ...draft, fontFamily: event.target.value })}
              >
                <option value="">Default font</option>
                {fontFamilies.map((fontFamily) => (
                  <option value={fontFamily} key={fontFamily}>{fontFamily}</option>
                ))}
              </select>
            </label>
            <div className="font-preview" style={draft.fontFamily ? { fontFamily: `"${draft.fontFamily}", sans-serif` } : undefined}>
              Imagine It. Create It.
            </div>
            <div className="font-access-row">
              <button
                className="text-button font-load-button"
                type="button"
                onClick={loadInstalledFonts}
                disabled={fontStatus === 'loading'}
              >
                <ScanSearch size={15} />
                {fontStatus === 'loading' ? 'Loading fonts…' : 'Load installed fonts'}
              </button>
              {fontStatus === 'loaded' && <small>{fontFamilies.length} font families available.</small>}
              {fontStatus === 'unsupported' && <small>This browser uses the verified Mac font list above.</small>}
              {fontStatus === 'denied' && <small>Font access was not allowed. You can still use the list above.</small>}
            </div>
          </section>

          <label className="field-group">
            <span>Try now URL</span>
            <input
              aria-label="Try now URL"
              value={draft.tryNowUrl}
              onChange={(event) => setDraft({ ...draft, tryNowUrl: event.target.value })}
              placeholder="https://your-start-page.com"
            />
            <small>The landing button opens this address inside the workspace.</small>
          </label>

          <div className="menu-editor-heading">
            <div>
              <span>Menu destinations</span>
              <small>{draft.menus.length} links</small>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  menus: [...current.menus, { id: createMenuId(), label: '', url: '' }],
                }))
              }
              aria-label="Add menu"
            >
              <Plus size={16} /> Add
            </button>
          </div>

          <div className="menu-editor-list">
            {draft.menus.map((menu, index) => (
              <article className="menu-editor-card" key={menu.id}>
                <div className="menu-editor-index">{String(index + 1).padStart(2, '0')}</div>
                <div className="menu-editor-fields">
                  <label>
                    <span>Menu name</span>
                    <input
                      aria-label="Menu name"
                      value={menu.label}
                      onChange={(event) => updateMenu(index, 'label', event.target.value)}
                      placeholder="Menu name"
                    />
                  </label>
                  <label>
                    <span>URL</span>
                    <input
                      aria-label="Menu URL"
                      value={menu.url}
                      onChange={(event) => updateMenu(index, 'url', event.target.value)}
                      placeholder="https://..."
                    />
                  </label>
                </div>
                <div className="menu-editor-actions">
                  <button
                    type="button"
                    onClick={() => moveMenu(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${menu.label || 'new menu'} up`}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveMenu(index, 1)}
                    disabled={index === draft.menus.length - 1}
                    aria-label={`Move ${menu.label || 'new menu'} down`}
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        menus: current.menus.filter((item) => item.id !== menu.id),
                      }))
                    }
                    aria-label={`Delete ${menu.label || 'new menu'}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
        </div>

        <footer className="settings-footer">
          <button
            className="reset-button"
            type="button"
            onClick={() => {
              setDraft(cloneSettings(DEFAULT_SETTINGS));
              onReset();
            }}
          >
            <RotateCcw size={15} /> Reset
          </button>
          <div>
            <button className="ghost-button" type="button" onClick={onClose}>Cancel</button>
            <button className="primary-button" type="button" onClick={save}>Save changes</button>
          </div>
        </footer>
      </section>
    </div>
  );
}
