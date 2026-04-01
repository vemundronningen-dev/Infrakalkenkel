import { parseStringPromise } from 'xml2js';

type ParsedItem = {
  line_index: number;
  postnr: string;
  code: string;
  title: string;
  description: string;
  unit: string;
  quantity: number;
};

export type ParsedEstimate = {
  project_name: string;
  currency: string;
  items: ParsedItem[];
  raw: unknown;
};

const toText = (value: unknown): string => {
  if (Array.isArray(value)) return toText(value[0]);
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object' && '_' in value && typeof value._ === 'string') return value._.trim();
  return '';
};

const toNumber = (value: unknown): number => {
  const n = Number.parseFloat(toText(value).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

const collectDescription = (post: Record<string, unknown>): string => {
  const code = (post.Kode as Record<string, unknown>) || {};
  const kodetekst = (code.Kodetekst as Record<string, unknown>) || {};

  const parts = [
    toText(kodetekst.Overskrift),
    toText(post.Stikkordvalg),
    toText(post.Matrisevalg),
    toText(post.AndreKravJa),
    toText(post.AndreKravNei),
    toText(post.Uformatert)
  ].filter(Boolean);

  return parts.join('\n');
};

export async function parseNs3459Xml(xmlContent: string): Promise<ParsedEstimate> {
  const parsed = await parseStringPromise(xmlContent, {
    explicitArray: false,
    mergeAttrs: true,
    trim: true
  });

  type XmlObject = Record<string, unknown>;

  const root = parsed as XmlObject;
  const project = (root.ProsjektNS as XmlObject | undefined) ?? root;
  const postValue = project.Post;
  const postNodes = postValue ? (Array.isArray(postValue) ? postValue : [postValue]) : [];

  const items: ParsedItem[] = postNodes.map((post: Record<string, unknown>, index: number) => {
    const codeNode = (post.Kode as Record<string, unknown>) || {};
    const kodetekstNode = (codeNode.Kodetekst as Record<string, unknown>) || {};
    const prisinfo = (post.Prisinfo as Record<string, unknown>) || {};

    return {
      line_index: index,
      postnr: toText(post.Postnr),
      code: toText(codeNode.ID),
      title: toText(kodetekstNode.Overskrift),
      description: collectDescription(post),
      unit: toText(prisinfo.Enhet),
      quantity: toNumber(prisinfo.Mengde)
    };
  });

  return {
    project_name: toText(project.Navn) || 'Untitled project',
    currency: toText(project.Valuta) || 'NOK',
    items,
    raw: parsed
  };
}
