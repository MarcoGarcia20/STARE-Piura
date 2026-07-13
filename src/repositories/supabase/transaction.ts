import type { ITransactionRepository } from '../contracts/transaction';
import type { FinancialTransaction, CreateTransactionDTO, FundBalances } from '@/types/index';
import { fetchTransactions, createTransaction } from '@/lib/supabase/transactions';

function calcBalances(transactions: FinancialTransaction[]): FundBalances {
  const balances: FundBalances = {
    general: 0,
    desayunos: 0,
    almuerzos: 0,
    cenas: 0,
    eventos_especiales: 0,
  };

  for (const tx of transactions) {
    const monto = Number(tx.monto);
    if (tx.tipo === 'ingreso') {
      balances.general += monto;
      if (tx.fondo && tx.fondo in balances) {
        balances[tx.fondo as keyof FundBalances] += monto;
      }
    } else {
      balances.general -= monto;
      if (tx.fondo && tx.fondo in balances) {
        balances[tx.fondo as keyof FundBalances] -= monto;
      }
    }
  }

  return balances;
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
