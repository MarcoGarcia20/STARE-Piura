/**
 * @file src/repositories/supabase_laravel/field-visit.ts
 * @description Repositorio de Visitas de Campo para el provider `supabase_laravel`.
 * Diseñado para el rol Voluntario con enfoque offline-first.
 *
 * Flujo de subida de evidencias:
 *  1. El componente sube los archivos (blob) a Supabase Storage directamente.
 *  2. Obtiene las URLs públicas de Storage.
 *  3. Llama a `addEvidence` o `completeEvent` pasando esas URLs en el DTO.
 *  4. Este repositorio NO maneja la subida de archivos (SRP).
 *
 * Endpoints cubiertos:
 *  - GET /api/events/{id}/evidences
 *  - POST /api/events/{id}/evidences
 *  - PUT  /api/events/{id}/complete
 */

import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import type { IFieldVisitRepository } from '../contracts/field-visit';
import type { Evidence, CreateEvidenceDTO, CompleteEventDTO, Event } from '@/types/index';

export class SupabaseLaravelFieldVisitRepository implements IFieldVisitRepository {
  /**
   * Obtiene la lista de evidencias asociadas a un evento.
   * @param eventId UUID del evento.
   * @returns Array de evidencias (fotos, videos, documentos).
   */
  async getEvidences(eventId: string): Promise<Evidence[]> {
    return apiGet<Evidence[]>(`/api/events/${encodeURIComponent(eventId)}/evidences`);
  }

  /**
   * Agrega una evidencia a un evento de campo.
   * La URL de la evidencia debe ser pública (obtenida tras subir el archivo
   * a Supabase Storage en el cliente).
   *
   * @param eventId UUID del evento.
   * @param dto     Datos de la evidencia con la URL pública.
   * @returns La evidencia creada con ID y timestamp del servidor.
   */
  async addEvidence(eventId: string, dto: CreateEvidenceDTO): Promise<Evidence> {
    return apiPost<Evidence>(`/api/events/${encodeURIComponent(eventId)}/evidences`, dto);
  }

  /**
   * Marca un evento como completado y registra las URLs de evidencia.
   * Cambia el status del evento a `realizada` en el servidor.
   *
   * @param eventId UUID del evento a completar.
   * @param dto     DTO con URLs de evidencia (ya subidas) y notas de cierre.
   * @returns El evento actualizado con status `realizada`.
   */
  async completeEvent(eventId: string, dto: CompleteEventDTO): Promise<Event> {
    return apiPut<Event>(`/api/events/${encodeURIComponent(eventId)}/complete`, dto);
  }
}
