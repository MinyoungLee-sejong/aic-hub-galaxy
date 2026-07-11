import { UserRound } from 'lucide-react';

type AppHeaderProps = {
  onOpenSettings: () => void;
  onGoHome: () => void;
};

export function AppHeader({ onOpenSettings, onGoHome }: AppHeaderProps) {
  return (
    <header className="app-header">
      <button className="brand" type="button" onClick={onGoHome} aria-label="Go to landing page">
        <span>AIC Hub</span>
      </button>
      <button className="profile-button" type="button" onClick={onOpenSettings} aria-label="Open settings">
        <UserRound size={21} strokeWidth={1.8} />
        <span className="profile-glow" aria-hidden="true" />
      </button>
    </header>
  );
}
