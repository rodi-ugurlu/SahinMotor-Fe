import type { TicketCategory } from '../types/auth';

export const serviceSpecialtyCategories: Array<{ value: TicketCategory; label: string }> = [
  { value: 'Motor', label: 'Motor' },
  { value: 'Elektrik', label: 'Elektrik' },
  { value: 'Hidrolik', label: 'Hidrolik' },
  { value: 'Pnömatik', label: 'Pnömatik' },
  { value: 'GenelBakim', label: 'Genel Bakım' },
  { value: 'ECU', label: 'ECU / Yazılım' },
];

export const suggestedExpertiseTags = [
  'motor',
  'şanzıman',
  'debriyaj',
  'fren',
  'süspansiyon',
  'egzoz',
  'enjeksiyon',
  'karbüratör',
  'ateşleme',
  'akü',
  'marş motoru',
  'alternatör',
  'radyatör',
  'yağ değişimi',
  'filtre',
  'buji',
  'zincir',
  'dişli',
  'lastik',
  'jant',
  'amortisör',
  'rot balans',
  'kaporta',
  'boya',
  'kask',
  'mont',
  'eldiven',
  'bot',
  'ceket',
  'koruma ekipmanı',
  'navigasyon',
  'kamera',
  'alarm',
  'çanta',
  'sele',
  'ayna',
  'far',
  'sinyal',
  'stop lambası',
  'gösterge paneli',
  'hız göstergesi',
  'yağ pompası',
  'su pompası',
  'termostat',
  'subap',
  'piston',
  'segman',
  'krank',
  'kam mili',
];

export function normalizeExpertiseTag(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR');
}

export function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function serviceSpecialtyLabel(value: string): string {
  const found = serviceSpecialtyCategories.find((c) => c.value === value);
  return found?.label ?? value;
}
