/**
 * @file src/repositories/mock/field-visit.ts
 * @description Implementación mock del repositorio de Visitas de Campo.
 * Simula el comportamiento offline-first: acepta URLs de evidencia
 * (ya "subidas" ficticiamente) y actualiza el estado del evento.
 */

import type { IFieldVisitRepository } from '../contracts/field-visit';
import type { Evidence, CreateEvidenceDTO, CompleteEventDTO, Event } from '@/types/index';
import { MOCK_EVENTS } from '@/mocks';
import { delay } from './utils';

export class MockFieldVisitRepository implements IFieldVisitRepository {
  private static evidences: Evidence[] = [];
  /** Referencia mutable a eventos (compartida con MockEventRepository via import). */
  private static events: Event[] = [...MOCK_EVENTS];

  async getEvidences(eventId: string): Promise<Evidence[]> {
    await delay();
    return MockFieldVisitRepository.evidences
      .filter((e) => e.event_id === eventId)
      .map((e) => ({ ...e }));
  }

  async addEvidence(eventId: string, dto: CreateEvidenceDTO): Promise<Evidence> {
    await delay();
    const newEvidence: Evidence = {
      id: `ev-${Date.now()}`,
      event_id: eventId,
      user_id: 'mock-current-user',
      tipo: dto.tipo,
      url: dto.url,
      descripcion: dto.descripcion,
      created_at: new Date().toISOString(),
    };
    MockFieldVisitRepository.evidences.push(newEvidence);
    return { ...newEvidence };
  }

  async completeEvent(eventId: string, dto: CompleteEventDTO): Promise<Event> {
    await delay();
    const idx = MockFieldVisitRepository.events.findIndex((e) => e.id === eventId);
    if (idx === -1) {
      throw new Error(`Evento con id ${eventId} no encontrado`);
    }

    // Registrar evidencias automáticamente desde las URLs del DTO
    for (const url of dto.evidencia_urls) {
      MockFieldVisitRepository.evidences.push({
        id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        event_id: eventId,
        user_id: 'mock-current-user',
        tipo: 'foto',
        url,
        created_at: new Date().toISOString(),
      });
    }

    const updated: Event = {
      ...MockFieldVisitRepository.events[idx],
      status: 'realizada',
      notes: dto.notas_cierre ?? MockFieldVisitRepository.events[idx].notes,
      updated_at: new Date().toISOString(),
    };
    MockFieldVisitRepository.events[idx] = updated;
    return { ...updated };
  }
}
