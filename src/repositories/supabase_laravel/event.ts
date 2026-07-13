/**
 * @file src/repositories/supabase_laravel/event.ts
 * @description Repositorio de Eventos y Suministros para el provider `supabase_laravel`.
 * Cubre los módulos de Eventos y Suministros (items + RPC de cobertura).
 *
 * Endpoints cubiertos:
 *  - GET    /api/events
 *  - GET    /api/events/{id}
 *  - POST   /api/events
 *  - PUT    /api/events/{id}
 *  - DELETE /api/events/{id}
 *  - GET    /api/supply-items          (filtrando por event_id)
 *  - POST   /api/supply-items
 *  - PUT    /api/supply-items/{id}
 *  - DELETE /api/supply-items/{id}
 *  - POST   /api/supply-items/cubrir   (RPC)
 */

import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type { IEventRepository } from '../contracts/event';
import type {
  Event,
  CreateEventDTO,
  UpdateEventDTO,
  SupplyItem,
  CreateSupplyItemDTO,
  UpdateSupplyItemDTO,
  CoverSupplyItemDTO,
} from '@/types/index';

export class SupabaseLaravelEventRepository implements IEventRepository {
  // ─── Eventos ───────────────────────────────────────────────────────────────

  /**
   * Obtiene la lista completa de eventos.
   */
  async getAll(): Promise<Event[]> {
    return apiGet<Event[]>('/api/events');
  }

  /**
   * Obtiene un evento por su ID.
   * @param id UUID del evento.
   * @returns El evento o `null` si no existe (404).
   */
  async getById(id: string): Promise<Event | null> {
    try {
      return await apiGet<Event>(`/api/events/${id}`);
    } catch (err: unknown) {
      if (err instanceof Error && 'status' in err && (err as { status: number }).status === 404) {
        return null;
      }
      throw err;
    }
  }

  /**
   * Crea un nuevo evento / visita de asistencia social.
   * @param dto Datos del evento a crear.
   * @returns El evento creado con ID y timestamps asignados por el servidor.
   */
  async create(dto: CreateEventDTO): Promise<Event> {
    return apiPost<Event>('/api/events', dto);
  }

  /**
   * Actualiza un evento existente.
   * @param id  UUID del evento.
   * @param dto Campos a actualizar (estado, notas, etc.).
   */
  async update(id: string, dto: UpdateEventDTO): Promise<Event> {
    return apiPut<Event>(`/api/events/${id}`, dto);
  }

  /**
   * Elimina un evento.
   * @param id UUID del evento a eliminar.
   */
  async delete(id: string): Promise<void> {
    await apiDelete(`/api/events/${id}`);
  }

  // ─── Supply Items ───────────────────────────────────────────────────────────

  /**
   * Obtiene los ítems de bolsa de suministros asociados a un evento.
   * Pasa el `event_id` como query parameter al backend.
   *
   * @param eventId UUID del evento.
   */
  async getSupplyItems(eventId: string): Promise<SupplyItem[]> {
    return apiGet<SupplyItem[]>(`/api/supply-items?event_id=${encodeURIComponent(eventId)}`);
  }

  /**
   * Agrega un nuevo ítem a la bolsa de suministros de un evento.
   * @param dto Datos del ítem de suministros.
   */
  async createSupplyItem(dto: CreateSupplyItemDTO): Promise<SupplyItem> {
    return apiPost<SupplyItem>('/api/supply-items', dto);
  }

  /**
   * Actualiza la cantidad cubierta/requerida de un ítem de suministros.
   * @param itemId UUID del ítem.
   * @param dto    Campos a actualizar.
   */
  async updateSupplyItem(itemId: string, dto: UpdateSupplyItemDTO): Promise<SupplyItem> {
    return apiPut<SupplyItem>(`/api/supply-items/${itemId}`, dto);
  }

  /**
   * Elimina un ítem de la bolsa de suministros.
   * @param itemId UUID del ítem.
   */
  async deleteSupplyItem(itemId: string): Promise<void> {
    await apiDelete(`/api/supply-items/${itemId}`);
  }

  /**
   * RPC: Cubre (incrementa la cobertura de) un ítem de suministros.
   * Corresponde al endpoint `POST /api/supply-items/{id}/cubrir`.
   *
   * El backend recibe el ID del ítem en la URL (no en el cuerpo)
   * y ejecuta una función RPC transaccional en Supabase para evitar
   * condiciones de carrera entre múltiples voluntarios.
   *
   * @param dto DTO con el ID del ítem y la cantidad a cubrir.
   * @returns El ítem de suministros con la cobertura actualizada.
   */
  async coverSupplyItem(dto: CoverSupplyItemDTO): Promise<SupplyItem> {
    // El ID va en la URL; el backend ignora supply_item_id en el body
    return apiPost<SupplyItem>(`/api/supply-items/${encodeURIComponent(dto.supply_item_id)}/cubrir`, {
      cantidad_a_cubrir: dto.cantidad_a_cubrir,
      donor_id: dto.donor_id,
    });
  }
}
