import type { IEventRepository } from '../contracts/event';
import type {
  Event,
  CreateEventDTO,
  UpdateEventDTO,
  SupplyItem,
  CreateSupplyItemDTO,
  UpdateSupplyItemDTO,
} from '@/types/index';
import {
  fetchEvents,
  fetchEventById,
  createEvent,
  updateEvent,
} from '@/lib/supabase/events';
import {
  createSupplyItem,
  updateSupplyItem,
} from '@/lib/supabase/supply-items';
import { requireSupabase } from '@/lib/supabase/client';

export class SupabaseEventRepository implements IEventRepository {
  async getAll(): Promise<Event[]> {
    return fetchEvents() as Promise<Event[]>;
  }

  async getById(id: string): Promise<Event | null> {
    try {
      return (await fetchEventById(id)) as Event;
    } catch (e: any) {
      if (e?.code === 'PGRST116') return null;
      throw e;
    }
  }

  async create(dto: CreateEventDTO): Promise<Event> {
    return createEvent(dto as any) as Promise<Event>;
  }

  async update(id: string, dto: UpdateEventDTO): Promise<Event> {
    return updateEvent(id, dto as any) as Promise<Event>;
  }

  async getSupplyItems(eventId: string): Promise<SupplyItem[]> {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('supply_items')
      .select('*')
      .eq('event_id', eventId);

    if (error) throw error;
    return (data ?? []) as SupplyItem[];
  }

  async createSupplyItem(dto: CreateSupplyItemDTO): Promise<SupplyItem> {
    return createSupplyItem(dto as any) as Promise<SupplyItem>;
  }

  async updateSupplyItem(itemId: string, dto: UpdateSupplyItemDTO): Promise<SupplyItem> {
    return updateSupplyItem(itemId, dto as any) as Promise<SupplyItem>;
  }
}
