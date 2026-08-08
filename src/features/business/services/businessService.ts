import type { Business } from '../types/business';
import { getDealers } from '../../dealers/services/dealersService';

export async function getBusinesses(): Promise<Business[]> {
  const dealers = await getDealers();
  return dealers.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    logoUrl: d.logoUrl,
  }));
}
