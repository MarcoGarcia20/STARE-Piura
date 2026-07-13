/**
 * @file src/types/index.ts
 * @description Source of truth de tipos de dominio de STARE Piura.
 *
 * REGLA: Ningún componente, store, service o repositorio define sus propios tipos de entidad.
 * Todos importan desde aquí. Esto garantiza que mock y backend real compartan exactamente
 * los mismos contratos.
 *
 * Módulos:
 *  - Shared (distritos, fondos, medios de pago)
 *  - Organization (comedores, asilos, vasos de leche, albergues)
 *  - Mype (micro y pequeñas empresas aliadas)
 *  - Donor (donantes)
 *  - Donation (donaciones monetarias y en especie)
 *  - FinancialTransaction (movimientos del kardex)
 *  - Event (visitas de asistencia social)
 *  - SupplyItem (ítem de bolsa de suministros)
 *  - Notification (alertas del sistema)
 *  - User / Auth
 */

// ─── Shared Primitives ────────────────────────────────────────────────────────

export type PiuraDistrict =
  | 'Piura Centro'
  | 'Catacaos'
  | 'Castilla'
  | 'Veintiséis de Octubre'
  | 'Sullana'
  | 'Chulucanas'
  | 'Sechura'
  | 'Paita'
  | 'Talara'
  | 'Tambogrande'
  | 'Ayabaca'
  | 'Morropón'
  | 'Huancabamba';

export type FundType = 'caja_chica' | 'fondo_adquisicion';

export type MovementType = 'ingreso' | 'egreso';

export type DonationMethod =
  | 'yape'
  | 'plin'
  | 'efectivo'
  | 'transferencia'
  | 'especie';

export type DonationType = 'monetaria' | 'especie';

// ─── User / Auth ──────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'coordinador' | 'voluntario';

export interface User {
  id: string;
  email: string;
  nombre: string;
  role: UserRole;
  telefono?: string;
  activo: boolean;
  avatar_url?: string;
  created_at: string;
}

// ─── Organization (Organizaciones Beneficiarias) ──────────────────────────────

export type OrganizationType =
  | 'comedor'
  | 'asilo'
  | 'albergue'
  | 'vaso_de_leche'
  | 'pronoei'
  | 'otro';

export interface Organization {
  id: string;
  nombre: string;
  tipo: OrganizationType;
  direccion: string;
  distrito: PiuraDistrict;
  telefono?: string;
  encargado: string;
  email?: string;
  beneficiarios_estimados: number;
  necesidades: string[];
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationDTO {
  nombre: string;
  tipo: OrganizationType;
  direccion: string;
  distrito: PiuraDistrict;
  telefono?: string;
  encargado: string;
  email?: string;
  beneficiarios_estimados: number;
  necesidades?: string[];
}

export type UpdateOrganizationDTO = Partial<CreateOrganizationDTO> & {
  activo?: boolean;
};

// ─── Mype (Micro y Pequeñas Empresas Aliadas) ────────────────────────────────

export type MypeRubro =
  | 'Bodega'
  | 'Panadería'
  | 'Farmacia'
  | 'Restaurant'
  | 'Ferretería'
  | 'Librería'
  | 'Textil'
  | 'Otro';

export interface Mype {
  id: string;
  razon_social: string;
  ruc: string;
  rubro: MypeRubro;
  contacto: string;
  telefono: string;
  email?: string;
  distrito: PiuraDistrict;
  activo: boolean;
  historial_aportes: number; // total PEN aportado
  created_at: string;
}

export interface CreateMypeDTO {
  razon_social: string;
  ruc: string;
  rubro: MypeRubro;
  contacto: string;
  telefono: string;
  email?: string;
  distrito: PiuraDistrict;
}

export type UpdateMypeDTO = Partial<CreateMypeDTO> & { activo?: boolean; historial_aportes?: number };

// ─── Donor (Donantes) ─────────────────────────────────────────────────────────

export type DonorType = 'persona_natural' | 'empresa';

export interface Donor {
  id: string;
  nombres: string;
  tipo: DonorType;
  documento: string; // DNI o RUC
  telefono?: string;
  email?: string;
  distrito?: PiuraDistrict;
  mype_id?: string;   // si es una MYPE registrada
  created_at: string;
}

export interface CreateDonorDTO {
  nombres: string;
  tipo: DonorType;
  documento: string;
  telefono?: string;
  email?: string;
  distrito?: PiuraDistrict;
  mype_id?: string;
}

export type UpdateDonorDTO = Partial<CreateDonorDTO>;

// ─── Donation (Donaciones) ────────────────────────────────────────────────────

export interface DonationItem {
  item_nombre: string;
  cantidad: number;
  unidad?: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  donor_nombre: string;       // denormalizado para display rápido
  tipo: DonationType;
  medio_pago?: DonationMethod; // solo monetaria
  monto?: number;              // solo monetaria, en PEN
  items?: DonationItem[];      // solo especie
  descripcion?: string;
  fondo_destino?: FundType;    // solo monetaria
  event_id?: string;           // visita asociada (opcional)
  comprobante_url?: string;
  fecha: string;               // ISO date UTC-5
  created_at: string;
}

export interface CreateDonationDTO {
  donor_id: string;
  donor_nombre: string;
  tipo: DonationType;
  medio_pago?: DonationMethod;
  monto?: number;
  items?: DonationItem[];
  descripcion?: string;
  fondo_destino?: FundType;
  event_id?: string;
  comprobante_url?: string;
  fecha: string;
}

export type UpdateDonationDTO = Partial<Pick<Donation, 'descripcion' | 'comprobante_url' | 'event_id'>>;

// ─── FinancialTransaction (Kardex / Movimientos) ─────────────────────────────

export interface FinancialTransaction {
  id: string;
  tipo: MovementType;
  concepto: string;
  monto: number;        // en PEN
  fondo: FundType;
  fecha: string;        // ISO date
  donation_id?: string; // enlace a donación (si es ingreso por donación)
  created_at: string;
}

export interface CreateTransactionDTO {
  tipo: MovementType;
  concepto: string;
  monto: number;
  fondo: FundType;
  fecha: string;
  donation_id?: string;
}

export interface FundBalances {
  caja_chica: number;
  fondo_adquisicion: number;
}

// ─── Event (Visitas y Eventos de Asistencia Social) ──────────────────────────

export type EventStatus = 'programada' | 'en_curso' | 'realizada' | 'cancelada';

export interface Event {
  id: string;
  organization_id?: string;
  organization_nombre?: string;  // denormalizado
  title: string;
  description?: string;
  distrito: PiuraDistrict;
  target_audience: string;
  start_time: string;   // ISO datetime
  end_time: string;     // ISO datetime
  status: EventStatus;
  coordinador_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventDTO {
  organization_id?: string;
  organization_nombre?: string;
  title: string;
  description?: string;
  distrito: PiuraDistrict;
  target_audience: string;
  start_time: string;
  end_time: string;
  coordinador_id?: string;
  notes?: string;
}

export type UpdateEventDTO = Partial<Omit<CreateEventDTO, 'organization_id'>> & {
  status?: EventStatus;
  notes?: string;
};

// ─── SupplyItem (Ítems de Bolsa de Suministros) ───────────────────────────────

export type SupplyCategory = 'viveres' | 'medicina' | 'abrigo' | 'limpieza' | 'educacion' | 'otro';

export interface SupplyItem {
  id: string;
  event_id: string;
  /** Bolsa de suministros a la que pertenece el ítem (opcional). */
  supply_bag_id?: string;
  nombre: string;
  categoria: SupplyCategory;
  unidad: string;
  cantidad_requerida: number;
  cantidad_cubierta: number;
  precio_unitario_estimado: number;  // PEN
  created_at: string;
}

export interface CreateSupplyItemDTO {
  event_id: string;
  supply_bag_id?: string;
  nombre: string;
  categoria: SupplyCategory;
  unidad: string;
  cantidad_requerida: number;
  cantidad_cubierta?: number;
  precio_unitario_estimado: number;
}

export type UpdateSupplyItemDTO = Partial<Pick<SupplyItem, 'cantidad_cubierta' | 'cantidad_requerida' | 'precio_unitario_estimado'>>;

/**
 * DTO para el RPC `POST /api/supply-items/cubrir`.
 * Cubre (o incrementa la cobertura de) un ítem de suministros.
 */
export interface CoverSupplyItemDTO {
  supply_item_id: string;
  cantidad_a_cubrir: number;
  /** Identificador del donante o MYPE que cubre el ítem (opcional). */
  donor_id?: string;
}

// ─── SupplyBag (Bolsas de Suministros) ────────────────────────────────────────

export type SupplyBagStatus = 'pendiente' | 'parcial' | 'completa';

export interface SupplyBag {
  id: string;
  event_id: string;
  nombre: string;
  descripcion?: string;
  status: SupplyBagStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplyBagDTO {
  event_id: string;
  nombre: string;
  descripcion?: string;
}

export type UpdateSupplyBagDTO = Partial<Pick<SupplyBag, 'nombre' | 'descripcion' | 'status'>>;

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType =
  | 'donacion_recibida'
  | 'visita_proxima'
  | 'bolsa_incompleta'
  | 'fondo_bajo'
  | 'evento_actualizado'
  | 'sistema';

export interface Notification {
  id: string;
  user_id?: string;
  tipo: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, string | number | boolean>;  // payload extra (event_id, donation_id, etc.)
  created_at: string;
}

// ─── Evidence (Evidencias de Visita de Campo) ────────────────────────────────

export type EvidenceType = 'foto_canasta' | 'foto_evidencia' | 'firma';
export type EvidenceTipo = EvidenceType;


export interface Evidence {
  id: string;
  event_id: string;
  /** Voluntario que subió la evidencia. */
  user_id: string;
  tipo: EvidenceType;
  /** URL pública en Supabase Storage (ya subida antes de llamar al endpoint). */
  url: string;
  descripcion?: string;
  created_at: string;
}

export interface CreateEvidenceDTO {
  tipo: EvidenceType;
  /** URL pública obtenida tras subir el archivo a Supabase Storage. */
  url: string;
  descripcion?: string;
}

/** Estructura que el backend valida dentro del array `evidences`. */
export interface EvidencePayloadItem {
  tipo: EvidenceType;
  url: string;
  descripcion?: string;
}

/**
 * DTO para `PUT /api/events/{id}/complete`.
 * El frontend ya realizó la subida de los blobs a Supabase Storage
 * y pasa los objetos de evidencia en el array que el backend espera.
 */
export interface CompleteEventDTO {
  /** Array de evidencias a registrar (ya subidas al Storage). */
  evidences: EvidencePayloadItem[];
  /** Notas de cierre de la visita (campo libre, opcional). */
  notas_cierre?: string;
}

// ─── User Management (Gestión de Usuarios — Rol Admin) ────────────────────────

export interface RegisterUserDTO {
  email: string;
  password: string;
  nombre: string;
  role: UserRole;
  telefono?: string;
}

export interface UpdateUserDTO {
  nombre?: string;
  role?: UserRole;
  telefono?: string;
  activo?: boolean;
}

// ─── Aggregated / Computed Types ──────────────────────────────────────────────

/** Estadísticas de donaciones por donante (para Directorio MYPE) */
export interface DonorStats {
  donor_id: string;
  total_donaciones: number;
  total_monetario: number;   // PEN
  total_especie: number;     // cantidad de ítems donados
  ultima_donacion?: string;  // fecha
}

/** KPIs del dashboard (calculados en el service) */
export interface DashboardKPIs {
  saldo_caja_chica: number;
  saldo_fondo_adquisicion: number;
  total_donaciones_mes: number;     // PEN
  total_donaciones_count_mes: number;
  visitas_programadas_mes: number;
  visitas_realizadas_mes: number;
  cobertura_bolsas_pct: number;     // 0-100
  beneficiarios_alcanzados_mes: number;
  organizaciones_activas: number;
}

/** Evento enriquecido con ítems de bolsa y métricas de cobertura */
export interface EventWithBolsa extends Event {
  supply_items: SupplyItem[];
  cobertura_pct: number;   // 0-100
  items_faltantes: number;
  costo_estimado_brecha: number;  // PEN
}
