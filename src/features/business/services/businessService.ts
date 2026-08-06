import type { Business } from '../types/business';

const MOCK_BUSINESSES: Business[] = [
  {
    id: 'sahin-motor',
    name: 'Şahin Motor',
    description: 'Sıfır Motor Satışı, Bakım ve Onarım Hizmetleri',
  },
  {
    id: 'koman-motor',
    name: 'Koman Motor',
    description: 'Kask, Mont ve Koruma Ekipmanları Satışı',
  },
];

export async function getBusinesses(): Promise<Business[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_BUSINESSES), 600);
  });
}
