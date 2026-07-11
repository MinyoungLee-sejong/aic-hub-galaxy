import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from './App';

function openSettings() {
  fireEvent.click(screen.getByRole('button', { name: 'Open settings' }));
  return screen.getByRole('dialog', { name: 'Personalize your hub' });
}

describe('AIC Hub', () => {
  it('opens on the galaxy landing page', () => {
    render(<App />);

    const hero = screen.getByRole('region', { name: 'AIC Hub introduction' });
    expect(hero).not.toHaveClass('hero-layout');
    expect(screen.getByRole('heading', { name: 'Imagine It. Create It.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try now' }).closest('.hero-copy')).toBeInTheDocument();
    expect(document.querySelector('.try-arrow')).not.toBeInTheDocument();
    expect(screen.getByText('AIC Hub')).toBeInTheDocument();
    expect(document.querySelector('.brand-mark')).not.toBeInTheDocument();
  });

  it('applies a selected local font to the whole application', () => {
    render(<App />);
    const dialog = openSettings();

    expect(within(dialog).getByRole('combobox', { name: 'App font' })).toHaveValue('');
    fireEvent.change(within(dialog).getByRole('combobox', { name: 'App font' }), {
      target: { value: 'Avenir Next' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(document.querySelector('.app')).toHaveStyle({
      '--app-font-family': '"Avenir Next", sans-serif',
    });
  });

  it('enters the workspace and explains how to configure an empty destination', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Try now' }));

    expect(screen.getByText('No destination yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AIC Preset' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse menu' })).toBeInTheDocument();
  });

  it('collapses and expands the workspace menu', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Try now' }));

    fireEvent.click(screen.getByRole('button', { name: 'Collapse menu' }));

    expect(screen.getByRole('button', { name: 'Expand menu' })).toBeInTheDocument();
  });

  it('adds a menu destination and loads it in the content frame', () => {
    render(<App />);
    const dialog = openSettings();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Add menu' }));
    const nameInputs = within(dialog).getAllByLabelText('Menu name');
    const urlInputs = within(dialog).getAllByLabelText('Menu URL');
    fireEvent.change(nameInputs.at(-1)!, { target: { value: 'Galaxy Docs' } });
    fireEvent.change(urlInputs.at(-1)!, { target: { value: 'https://example.com/docs' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    fireEvent.click(screen.getByRole('button', { name: 'Try now' }));
    fireEvent.click(screen.getByRole('button', { name: 'Galaxy Docs' }));

    const frame = screen.getByTitle('Galaxy Docs');
    expect(frame).toHaveAttribute('src', 'https://example.com/docs');
    expect(screen.getByRole('link', { name: 'Open in new tab' })).toHaveAttribute(
      'href',
      'https://example.com/docs',
    );
  });

  it('does not apply edits when settings are cancelled', () => {
    render(<App />);
    const dialog = openSettings();
    fireEvent.change(within(dialog).getByLabelText('Try now URL'), {
      target: { value: 'https://example.com' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    const reopened = openSettings();
    expect(within(reopened).getByLabelText('Try now URL')).toHaveValue('');
  });

  it('validates unsafe URLs before saving', () => {
    render(<App />);
    const dialog = openSettings();
    fireEvent.change(within(dialog).getByLabelText('Try now URL'), {
      target: { value: 'javascript:alert(1)' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(within(dialog).getByRole('alert')).toHaveTextContent('Use a full http:// or https:// URL');
  });

  it('reorders menus with keyboard-friendly controls', () => {
    render(<App />);
    const dialog = openSettings();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Move AIC LoRA up' }));

    const menuNames = within(dialog).getAllByLabelText('Menu name');
    expect(menuNames[0]).toHaveValue('AIC LoRA');
    expect(menuNames[1]).toHaveValue('AIC Preset');
  });

  it('opens a configured Try now destination', () => {
    render(<App />);
    const dialog = openSettings();
    fireEvent.change(within(dialog).getByLabelText('Try now URL'), {
      target: { value: 'https://example.com/start' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    fireEvent.click(screen.getByRole('button', { name: 'Try now' }));

    expect(screen.getByTitle('Try now')).toHaveAttribute('src', 'https://example.com/start');
  });

  it('deletes a menu item from the saved sidebar', () => {
    render(<App />);
    const dialog = openSettings();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete AIC Preset' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Try now' }));

    expect(screen.queryByRole('button', { name: 'AIC Preset' })).not.toBeInTheDocument();
  });

  it('restores the four default menu items', () => {
    render(<App />);
    let dialog = openSettings();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete AIC Preset' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    dialog = openSettings();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset' }));

    const names = within(dialog).getAllByLabelText('Menu name');
    expect(names).toHaveLength(4);
    expect(names[0]).toHaveValue('AIC Preset');
  });
});
