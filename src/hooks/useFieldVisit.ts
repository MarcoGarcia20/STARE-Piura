/**
 * @file src/hooks/useFieldVisit.ts
 * @description Hook React para la gestión de Visitas de Campo (rol Voluntario).
 *
 * Diseñado para uso offline-first: las URLs de evidencia deben ser públicas
 * (ya subidas al Storage en el cliente) antes de llamar a `addEvidence` o `completeEvent`.
 *
 * Carga las evidencias automáticamente cuando se provee un `eventId`.
 *
 * @example
 * ```tsx
 * const { evidences, isLoading, addEvidence, completeEvent } = useFieldVisit('evt-001');
 *
 * // Subir evidencia (la URL ya fue obtenida del Storage)
 * await addEvidence({ tipo: 'foto', url: 'https://...supabase.../foto.jpg' });
 *
 * // Cerrar el evento
 * await completeEvent({ evidencia_urls: ['https://...'], notas_cierre: 'Sin novedades.' });
 * ```
 */

import { useEffect, useCallback } from 'react';
import { useFieldVisitStore } from '@/stores/field-visit';
import type { CreateEvidenceDTO, CompleteEventDTO } from '@/types/index';

/**
 * Hook para gestión de visitas de campo.
 *
 * @param eventId UUID del evento de campo activo. Si se provee, carga las evidencias al montar.
 *
 * @returns Objeto con el estado y las acciones para gestionar la visita de campo.
 *
 * | Campo            | Descripción                                              |
 * |------------------|----------------------------------------------------------|
 * | `evidences`      | Lista de evidencias del evento activo.                   |
 * | `isLoading`      | `true` mientras hay una operación en curso.              |
 * | `error`          | Mensaje de error de la última operación fallida.         |
 * | `addEvidence`    | Agrega una evidencia (URL pública ya subida al Storage). |
 * | `completeEvent`  | Cierra el evento con evidencias y notas de cierre.       |
 * | `refreshEvidences` | Recarga las evidencias del evento desde el backend.    |
 */
export function useFieldVisit(eventId?: string) {
  const {
    evidences,
    loading: isLoading,
    error,
    setActiveEventId,
    fetchEvidences,
    addEvidence: storeAddEvidence,
    completeEvent: storeCompleteEvent,
  } = useFieldVisitStore();

  // Establecer evento activo y cargar evidencias cuando cambia eventId
  useEffect(() => {
    if (eventId) {
      setActiveEventId(eventId);
      fetchEvidences(eventId);
    } else {
      setActiveEventId(null);
    }
  }, [eventId, setActiveEventId, fetchEvidences]);

  /**
   * Agrega una evidencia al evento activo.
   * La URL debe ser pública (ya subida a Supabase Storage en el cliente).
   *
   * @param dto Tipo de evidencia, URL pública y descripción opcional.
   */
  const addEvidence = useCallback(
    (dto: CreateEvidenceDTO) => {
      if (!eventId) {
        return Promise.reject(new Error('No hay un evento activo para agregar evidencias.'));
      }
      return storeAddEvidence(eventId, dto);
    },
    [eventId, storeAddEvidence]
  );

  /**
   * Cierra el evento de campo y registra las evidencias finales.
   * Cambia el status del evento a `realizada`.
   *
   * El body que se envía al backend tiene el formato:
   * ```json
   * { "evidences": [{ "tipo": "foto_canasta", "url": "https://...", "descripcion": "..." }] }
   * ```
   * Los tipos válidos son: `"foto_canasta"`, `"foto_evidencia"`, `"firma"`.
   *
   * @param dto DTO con el array de evidencias (ya subidas al Storage).
   */
  const completeEvent = useCallback(
    (dto: CompleteEventDTO) => {
      if (!eventId) {
        return Promise.reject(new Error('No hay un evento activo para completar.'));
      }
      return storeCompleteEvent(eventId, dto);
    },
    [eventId, storeCompleteEvent]
  );

  /**
   * Recarga las evidencias desde el backend.
   */
  const refreshEvidences = useCallback(() => {
    if (eventId) {
      return fetchEvidences(eventId);
    }
    return Promise.resolve();
  }, [eventId, fetchEvidences]);

  return {
    evidences,
    isLoading,
    error,
    addEvidence,
    completeEvent,
    refreshEvidences,
  };
}
