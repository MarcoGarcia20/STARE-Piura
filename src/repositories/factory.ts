/**
 * @file src/repositories/factory.ts
<<<<<<< Updated upstream
 * @description Fábrica de repositorios de la aplicación.
 * Retorna las instancias de repositorios de acuerdo al DataProvider configurado:
 *   - 'mock'            → datos falsos sin conexión
 *   - 'supabase'        → operaciones directas a Supabase (lectura/escritura)
 *   - 'supabase_laravel' → lecturas desde Supabase, escrituras vía API Laravel
 */

import { config } from '@/lib/config';
import type { DataProvider } from '@/lib/config';
=======
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
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
import {
  SupabaseOrganizationRepository,
  SupabaseMypeRepository,
  SupabaseDonorRepository,
  SupabaseDonationRepository,
  SupabaseEventRepository,
  SupabaseTransactionRepository,
  SupabaseNotificationRepository
} from './supabase';

=======
// ─── Interfaz pública del contenedor ─────────────────────────────────────────

/**
 * Contenedor de todos los repositorios del sistema.
 * Permite acceder a cualquier repositorio con tipado fuerte.
 */
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
const PROVIDER_MAP: Record<DataProvider, Repositories> = {
  mock: {
    organizations: new MockOrganizationRepository(),
    mypes: new MockMypeRepository(),
    donors: new MockDonorRepository(),
    donations: new MockDonationRepository(),
    events: new MockEventRepository(),
    transactions: new MockTransactionRepository(),
    notifications: new MockNotificationRepository(),
  },
  supabase: {
    organizations: new SupabaseOrganizationRepository(),
    mypes: new SupabaseMypeRepository(),
    donors: new SupabaseDonorRepository(),
    donations: new SupabaseDonationRepository(),
    events: new SupabaseEventRepository(),
    transactions: new SupabaseTransactionRepository(),
    notifications: new SupabaseNotificationRepository(),
  },
  supabase_laravel: {
    organizations: new SupabaseLaravelOrganizationRepository(),
    mypes: new SupabaseLaravelMypeRepository(),
    donors: new SupabaseLaravelDonorRepository(),
    donations: new SupabaseLaravelDonationRepository(),
    events: new SupabaseLaravelEventRepository(),
    transactions: new SupabaseLaravelTransactionRepository(),
    notifications: new SupabaseLaravelNotificationRepository(),
  },
};
=======
// ─── Caché singleton ─────────────────────────────────────────────────────────
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
  cachedRepositories = PROVIDER_MAP[config.dataProvider];
=======
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
>>>>>>> Stashed changes

  return cachedRepositories!;
}
