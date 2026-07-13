/**
 * @file src/repositories/supabase_laravel/field-visit.ts
 * @description Repositorio de Visitas de Campo para el provider `supabase_laravel`.
 * Diseñado para el rol Voluntario con enfoque offline-first.
 *
 * Flujo de subida de evidencias:
 *  1. El componente sube los archivos (blob) a Supabase Storage directamente.
 *  2. Obtiene las URLs públicas de Storage.
 *  3. Construye un array de `EvidencePayloadItem` con tipo + url.
 *  4. Llama a `addEvidence` o `completeEvent` pasando ese array en el DTO.
 *  5. Este repositorio NO maneja la subida de archivos (SRP).
 *
 * Contratos del backend:
 *  - POST /api/events/{id}/evidences → body: `{ evidences: [{ tipo, url, descripcion }] }`
 *  - PUT  /api/events/{id}/complete  → body: `{ evidences: [{ tipo, url, descripcion }] }`
 *
 * Endpoints cubiertos:
 *  - GET /api/events/{id}/evidences
 *  - POST /api/events/{id}/evidences
 *  - PUT  /api/events/{id}/complete
 */

import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import type { IFieldVisitRepository } from '../contracts/field-visit';
import type {
  Evidence,
  CreateEvidenceDTO,
  CompleteEventDTO,
  Event,
} from '@/types/index';

export class SupabaseLaravelFieldVisitRepository implements IFieldVisitRepository {
  /**
   * Obtiene la lista de evidencias asociadas a un evento.
   * @param eventId UUID del evento.
   * @returns Array de evidencias (fotos de canasta, fotos de evidencia, firmas).
   */
  async getEvidences(eventId: string): Promise<Evidence[]> {
    return apiGet<Evidence[]>(`/api/events/${encodeURIComponent(eventId)}/evidences`);
  }

  /**
   * Agrega una evidencia a un evento de campo.
   * El backend espera el DTO envuelto en un array bajo la clave `evidences`.
   * La URL debe ser pública (obtenida tras subir el archivo a Supabase Storage).
   *
   * @param eventId UUID del evento.
   * @param dto     Datos de la evidencia con tipo (foto_canasta|foto_evidencia|firma) y URL.
   * @returns La primera evidencia creada (el backend puede retornar un array).
   */
  async addEvidence(eventId: string, dto: CreateEvidenceDTO): Promise<Evidence> {
    // El backend valida `evidences` como array requerido
    const response = await apiPost<Evidence[] | Evidence>(
      `/api/events/${encodeURIComponent(eventId)}/evidences`,
      { evidences: [dto] }
    );
    // El backend puede retornar array o un solo objeto
    return Array.isArray(response) ? response[0] : response;
  }

  /**
   * Marca un evento como completado y registra las evidencias finales.
   * Cambia el status del evento a `realizada` en el servidor.
   *
   * El backend espera:
   * ```json
   * { "evidences": [{ "tipo": "foto_canasta", "url": "...", "descripcion": "..." }] }
   * ```
   *
   * @param eventId UUID del evento a completar.
   * @param dto     DTO con array de evidencias (ya subidas) y notas de cierre.
   * @returns El objeto con el evento actualizado y las evidencias creadas.
   */
  async completeEvent(eventId: string, dto: CompleteEventDTO): Promise<Event> {
    const response = await apiPut<{ event: Event; evidences: Evidence[] } | Event>(
      `/api/events/${encodeURIComponent(eventId)}/complete`,
      { evidences: dto.evidences }
    );
    // El backend retorna { event, evidences } — extraemos solo el evento
    if ('event' in response) {
      return response.event;
    }
    return response as Event;
  }
}
