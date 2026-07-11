export type LocalFontData = {
  family: string;
  fullName?: string;
  postscriptName?: string;
  style?: string;
};

export type LocalFontQuery = () => Promise<LocalFontData[]>;

export const FALLBACK_FONT_FAMILIES = [
  'Apple SD Gothic Neo',
  'Avenir',
  'Avenir Next',
  'Baskerville',
  'Courier New',
  'Georgia',
  'Helvetica Neue',
  'Hiragino Sans',
  'Nanum Gothic',
  'Nanum Myeongjo',
  'Noto Sans KR',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
] as const;

export class LocalFontAccessUnsupportedError extends Error {
  constructor() {
    super('This browser cannot list installed fonts.');
    this.name = 'LocalFontAccessUnsupportedError';
  }
}

export function normalizeFontFamilies(fonts: Array<Pick<LocalFontData, 'family'>>): string[] {
  return [...new Set(fonts.map((font) => font.family.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function getBrowserFontQuery(): LocalFontQuery | undefined {
  if (typeof window === 'undefined') return undefined;
  const fontWindow = window as Window & { queryLocalFonts?: LocalFontQuery };
  return typeof fontWindow.queryLocalFonts === 'function'
    ? fontWindow.queryLocalFonts.bind(window)
    : undefined;
}

export async function queryInstalledFontFamilies(query?: LocalFontQuery): Promise<string[]> {
  const fontQuery = query ?? getBrowserFontQuery();
  if (!fontQuery) throw new LocalFontAccessUnsupportedError();
  return normalizeFontFamilies(await fontQuery());
}
