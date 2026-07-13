import type { IDonorRepository } from '../contracts/donor';
import type { Donor, CreateDonorDTO } from '@/types/index';
import {
  fetchDonors,
  fetchDonorById,
  createDonor,
} from '@/lib/supabase/donors';

export class SupabaseDonorRepository implements IDonorRepository {
  async getAll(): Promise<Donor[]> {
    return fetchDonors() as Promise<Donor[]>;
  }

  async getById(id: string): Promise<Donor | null> {
    try {
      return (await fetchDonorById(id)) as Donor;
    } catch (e: any) {
      if (e?.code === 'PGRST116') return null;
      throw e;
    }
  }

  async create(dto: CreateDonorDTO): Promise<Donor> {
    return createDonor(dto as any) as Promise<Donor>;
  }
}
