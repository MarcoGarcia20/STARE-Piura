/**
 * @file src/repositories/factory.ts
 * @description Fábrica de repositorios de la aplicación STARE Piura.
 *
 * Retorna las instancias de repositorios Mock o de producción (supabase_laravel)
 * de acuerdo al `DataProvider` configurado en `VITE_DATA_PROVIDER`.
 *
 * Principio Open/Closed (OCP): para agregar un nuevo provider, únicamente
 * hay que agregar una nueva rama en el factory sin modificar los repositorios.
 */

import { isMockMode } from '@/lib/config';

// ─── Contratos ────────────────────────────────────────────────────────────────
import type {
  IOrganizationRepository,
  IMypeRepository,
  IDonorRepository,
  IDonationRepository,
  IEventRepository,
  ITransactionRepository,
  INotificationRepository,
  ISupplyBagRepository,
  IUserRepository,
  IFieldVisitRepository,
} from './contracts';

// ─── Mocks ────────────────────────────────────────────────────────────────────
import {
  MockOrganizationRepository,
  MockMypeRepository,
  MockDonorRepository,
  MockDonationRepository,
  MockEventRepository,
  MockTransactionRepository,
  MockNotificationRepository,
  MockSupplyBagRepository,
  MockUserRepository,
  MockFieldVisitRepository,
} from './mock';

// ─── Supabase + Laravel ───────────────────────────────────────────────────────
import {
  SupabaseLaravelOrganizationRepository,
  SupabaseLaravelMypeRepository,
  SupabaseLaravelDonorRepository,
  SupabaseLaravelDonationRepository,
  SupabaseLaravelEventRepository,
  SupabaseLaravelTransactionRepository,
  SupabaseLaravelNotificationRepository,
  SupabaseLaravelSupplyBagRepository,
  SupabaseLaravelUserRepository,
  SupabaseLaravelFieldVisitRepository,
} from './supabase_laravel';

// ─── Interfaz pública del contenedor ─────────────────────────────────────────

/**
 * Contenedor de todos los repositorios del sistema.
 * Permite acceder a cualquier repositorio con tipado fuerte.
 */
export interface Repositories {
  organizations: IOrganizationRepository;
  mypes: IMypeRepository;
  donors: IDonorRepository;
  donations: IDonationRepository;
  events: IEventRepository;
  transactions: ITransactionRepository;
  notifications: INotificationRepository;
  supplyBags: ISupplyBagRepository;
  users: IUserRepository;
  fieldVisits: IFieldVisitRepository;
}

// ─── Caché singleton ─────────────────────────────────────────────────────────

let cachedRepositories: Repositories | null = null;

/**
 * Retorna las instancias singleton de todos los repositorios.
 * La selección entre Mock y supabase_laravel se realiza una sola vez
 * al primer llamado, basándose en `VITE_DATA_PROVIDER`.
 *
 * @returns Objeto inmutable con todos los repositorios.
 */
export function getRepositories(): Repositories {
  if (cachedRepositories) {
    return cachedRepositories;
  }

  if (isMockMode) {
    cachedRepositories = {
      organizations: new MockOrganizationRepository(),
      mypes: new MockMypeRepository(),
      donors: new MockDonorRepository(),
      donations: new MockDonationRepository(),
      events: new MockEventRepository(),
      transactions: new MockTransactionRepository(),
      notifications: new MockNotificationRepository(),
      supplyBags: new MockSupplyBagRepository(),
      users: new MockUserRepository(),
      fieldVisits: new MockFieldVisitRepository(),
    };
  } else {
    cachedRepositories = {
      organizations: new SupabaseLaravelOrganizationRepository(),
      mypes: new SupabaseLaravelMypeRepository(),
      donors: new SupabaseLaravelDonorRepository(),
      donations: new SupabaseLaravelDonationRepository(),
      events: new SupabaseLaravelEventRepository(),
      transactions: new SupabaseLaravelTransactionRepository(),
      notifications: new SupabaseLaravelNotificationRepository(),
      supplyBags: new SupabaseLaravelSupplyBagRepository(),
      users: new SupabaseLaravelUserRepository(),
      fieldVisits: new SupabaseLaravelFieldVisitRepository(),
    };
  }

  return cachedRepositories;
}
