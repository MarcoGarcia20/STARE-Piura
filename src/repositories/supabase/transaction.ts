import type { ITransactionRepository } from '../contracts/transaction';
import type { FinancialTransaction, CreateTransactionDTO, FundBalances } from '@/types/index';
import { fetchTransactions, createTransaction } from '@/lib/supabase/transactions';

function calcBalances(transactions: FinancialTransaction[]): FundBalances {
  let cajaChica = 0;
  let fondoAdquisicion = 0;

  for (const tx of transactions) {
    const monto = Number(tx.monto);
    if (tx.fondo === 'caja_chica') {
      cajaChica += tx.tipo === 'ingreso' ? monto : -monto;
    } else if (tx.fondo === 'fondo_adquisicion') {
      fondoAdquisicion += tx.tipo === 'ingreso' ? monto : -monto;
    }
  }

  return {
    caja_chica: Math.max(0, cajaChica),
    fondo_adquisicion: Math.max(0, fondoAdquisicion),
  };
}


export class SupabaseTransactionRepository implements ITransactionRepository {
  async getAll(): Promise<FinancialTransaction[]> {
    return fetchTransactions() as Promise<FinancialTransaction[]>;
  }

  async create(dto: CreateTransactionDTO): Promise<FinancialTransaction> {
    return createTransaction(dto as any) as Promise<FinancialTransaction>;
  }

  async getBalances(): Promise<FundBalances> {
    const transactions = await this.getAll();
    return calcBalances(transactions);
  }
}
