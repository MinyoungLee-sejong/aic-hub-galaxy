import {
  FALLBACK_FONT_FAMILIES,
  LocalFontAccessUnsupportedError,
  normalizeFontFamilies,
  queryInstalledFontFamilies,
} from './localFonts';

describe('local font discovery', () => {
  it('offers verified Mac fonts as a permission-free fallback', () => {
    expect(FALLBACK_FONT_FAMILIES).toContain('Apple SD Gothic Neo');
    expect(FALLBACK_FONT_FAMILIES).toContain('Avenir Next');
    expect(FALLBACK_FONT_FAMILIES).toContain('Noto Sans KR');
  });

  it('deduplicates and alphabetizes queried font families', () => {
    expect(
      normalizeFontFamilies([
        { family: 'Verdana' },
        { family: 'Avenir' },
        { family: 'Verdana' },
        { family: '  Avenir  ' },
      ]),
    ).toEqual(['Avenir', 'Verdana']);
  });

  it('returns installed families from a supported browser query', async () => {
    const fonts = await queryInstalledFontFamilies(async () => [
      { family: 'Nanum Gothic' },
      { family: 'Avenir' },
    ]);

    expect(fonts).toEqual(['Avenir', 'Nanum Gothic']);
  });

  it('reports when the browser cannot enumerate local fonts', async () => {
    await expect(queryInstalledFontFamilies(undefined)).rejects.toBeInstanceOf(
      LocalFontAccessUnsupportedError,
    );
  });
});
