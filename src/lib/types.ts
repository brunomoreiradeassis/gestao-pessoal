export interface Extra {
  id: string;
  name: string;
  value: number;
  date: string; // ISO date
}

export interface MonthlySalary {
  month: number; // 1-12
  year: number;
  salary: number;
  extras: Extra[];
}

export interface DebtPayment {
  date: string; // ISO date
  amount: number;
}

export interface Debt {
  id: string;
  description: string;
  totalValue: number;
  installments: number; // 1 = parcela única
  paidInstallments: number;
  installmentValue: number;
  dueDate: string; // ISO date
  payments: DebtPayment[];
}

export interface GroceryItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface GroceryList {
  id: string;
  date: string; // ISO date
  name: string;
  items: GroceryItem[];
  total: number;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  criadoEm: string;
}

export type TabType = 'dashboard' | 'salary' | 'debts' | 'grocery' | 'cadastros';
