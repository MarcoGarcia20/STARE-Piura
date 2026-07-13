/**
 * Types and interfaces for the STARE Piura application.
 */

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

export interface BolsaItem {
  id: string;
  name: string;
  unit: string;
  targetQty: number;
  currentQty: number;
  unitPriceEstimate: number; // in PEN (Soles)
}

export type EventStatus = 'programado' | 'en_progreso' | 'completado' | 'cancelado';

export interface SocialEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format (YYYY-MM-DD)
  district: PiuraDistrict;
  targetAudience: string; // e.g. "Niños de PRONOEI", "Adultos mayores del asilo"
  status: EventStatus;
  itemsBolsa: BolsaItem[];
}

export type DonationMethod = 'Yape' | 'Plin' | 'Efectivo_CajaChica' | 'Adquisicion_Directa' | 'Especie';

export interface MicroDonation {
  id: string;
  mypeName: string;
  mypeCategory: string; // e.g., "Bodega", "Farmacia", "Panadería"
  district: PiuraDistrict;
  date: string;
  method: DonationMethod;
  amount?: number; // monetary amount in PEN if applicable
  itemsDonated?: { itemName: string; qty: number }[]; // in-kind items
  eventId: string; // Associated social event
  phone?: string;
  ruc?: string;
  txNumber?: string;
  receiptFileName?: string;
  comment?: string;
}

export type MovementType = 'ingreso' | 'egreso';
export type FundSourceType = 'caja_chica' | 'fondo_adquisicion';

export interface BalanceMovement {
  id: string;
  amount: number;
  type: MovementType;
  fund: FundSourceType;
  description: string;
  date: string;
  method: string;
}

export interface FundBalances {
  cajaChica: number;
  fondoAdquisicion: number;
}

export interface MypeProfile {
  id: string;
  name: string;
  ruc: string;
  phone: string;
  district: PiuraDistrict;
  category: string; // e.g. "Bodega", "Panadería"
  contactPerson: string;
  registeredAt: string;
}
export type { User, UserRole, EvidenceTipo } from './types/index';
