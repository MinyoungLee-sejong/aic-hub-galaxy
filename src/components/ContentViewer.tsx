import { ExternalLink, RotateCw, Settings2, Sparkles } from 'lucide-react';
import { useState } from 'react';

type ContentViewerProps = {
  label: string;
  url: string;
  onOpenSettings: () => void;
};

export function ContentViewer({ label, url, onOpenSettings }: ContentViewerProps) {
  const [frameVersion, setFrameVersion] = useState(0);

  if (!url) {
    return (
      <section className="content-panel empty-content" aria-label="Empty destination">
        <div className="empty-orbit" aria-hidden="true">
          <Sparkles size={34} />
        </div>
        <p className="eyebrow">READY WHEN YOU ARE</p>
        <h2>No destination yet</h2>
        <p>Add a link for {label} in your personal settings to bring your tools into this space.</p>
        <button className="secondary-button" type="button" onClick={onOpenSettings}>
          <Settings2 size={17} />
          Configure link
        </button>
      </section>
    );
  }

  return (
    <section className="content-panel framed-content" aria-label={`${label} content`}>
      <div className="content-toolbar">
        <div className="content-identity">
          <span className="content-status" />
          <div>
            <strong>{label}</strong>
            <span>{url}</span>
          </div>
        </div>
        <div className="toolbar-actions">
          <button
            className="icon-button"
            type="button"
            onClick={() => setFrameVersion((value) => value + 1)}
            aria-label="Reload content"
          >
            <RotateCw size={17} />
          </button>
          <a className="open-link" href={url} target="_blank" rel="noreferrer">
            <ExternalLink size={16} />
            <span>Open in new tab</span>
          </a>
        </div>
      </div>
      <div className="frame-shell">
        <iframe key={frameVersion} src={url} title={label} />
        <p className="embed-note">
          Nothing showing? This site may block embedded views. Use “Open in new tab” above.
        </p>
      </div>
    </section>
  );
}
