import { Menu } from 'lucide-react';
import { lazy, Suspense, useMemo, useState, type CSSProperties } from 'react';
import { AppHeader } from './components/AppHeader';
import { ContentViewer } from './components/ContentViewer';
import { SettingsPanel } from './components/SettingsPanel';
import { Sidebar } from './components/Sidebar';
import {
  loadSettings,
  resetSettings,
  saveSettings,
  type AppSettings,
  type MenuItem,
} from './settings/settings';
import './styles.css';

export type AppView = 'landing' | 'workspace';
type ActiveDestination = { type: 'try-now' } | { type: 'menu'; id: string };

const GalaxyBackground = lazy(async () => {
  const module = await import('./galaxy/GalaxyBackground');
  return { default: module.GalaxyBackground };
});

export function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [view, setView] = useState<AppView>('landing');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [active, setActive] = useState<ActiveDestination>({ type: 'try-now' });

  const destination = useMemo(() => {
    if (active.type === 'try-now') return { label: 'Try now', url: settings.tryNowUrl };
    const menu = settings.menus.find((item) => item.id === active.id);
    return menu ?? { label: 'Selected menu', url: '' };
  }, [active, settings]);

  const selectMenu = (menu: MenuItem) => {
    setActive({ type: 'menu', id: menu.id });
    setView('workspace');
    setMobileMenuOpen(false);
  };

  const enterWorkspace = () => {
    setActive({ type: 'try-now' });
    setView('workspace');
  };

  const applySettings = (next: AppSettings) => {
    saveSettings(next);
    setSettings(next);
    setSettingsOpen(false);
  };

  const restoreDefaults = () => {
    const defaults = resetSettings();
    setSettings(defaults);
  };

  const appFontStyle = settings.fontFamily
    ? ({ '--app-font-family': `${JSON.stringify(settings.fontFamily)}, sans-serif` } as CSSProperties)
    : undefined;

  return (
    <main className={`app ${view === 'workspace' ? 'is-workspace' : 'is-landing'}`} style={appFontStyle}>
      <Suspense
        fallback={
          <div className="galaxy-background" aria-hidden="true">
            <div className="galaxy-visuals">
              <div className="galaxy-fallback"><div className="css-stars" /></div>
            </div>
          </div>
        }
      >
        <GalaxyBackground />
      </Suspense>
      <div className="space-vignette" aria-hidden="true" />

      <AppHeader onOpenSettings={() => setSettingsOpen(true)} onGoHome={() => setView('landing')} />

      {view === 'landing' ? (
        <section className="hero" aria-label="AIC Hub introduction">
          <div className="hero-copy">
            <div className="hero-kicker"><span /> A NEW CREATIVE ORBIT</div>
            <h1 aria-label="Imagine It. Create It.">Imagine It.<br /><em>Create It.</em></h1>
            <p>One universe for every tool you use to imagine, shape, and create.</p>
            <button className="try-button" type="button" onClick={enterWorkspace} aria-label="Try now">
              Try now
            </button>
          </div>
        </section>
      ) : (
        <div className={`workspace ${sidebarCollapsed ? 'has-collapsed-sidebar' : ''}`}>
          <button
            className="mobile-menu-button"
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={19} /> Menu
          </button>
          <Sidebar
            menus={settings.menus}
            activeMenuId={active.type === 'menu' ? active.id : null}
            collapsed={sidebarCollapsed}
            mobileOpen={mobileMenuOpen}
            onToggle={() => setSidebarCollapsed((value) => !value)}
            onCloseMobile={() => setMobileMenuOpen(false)}
            onSelect={selectMenu}
          />
          <div className="workspace-content">
            <ContentViewer
              label={destination.label}
              url={destination.url}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          </div>
        </div>
      )}

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onSave={applySettings}
          onReset={restoreDefaults}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </main>
  );
}
