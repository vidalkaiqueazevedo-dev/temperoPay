import {
  type Customer,
  type InsertCustomer,
  type Supplier,
  type InsertSupplier,
  type Sale,
  type InsertSale,
  type Expense,
  type InsertExpense,
  type PaymentStatus,
  type ExpenseCategory,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Customer methods
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByName(name: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomerDebt(id: string, debt: string): Promise<void>;

  // Supplier methods
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;

  // Sale methods
  getSales(): Promise<Sale[]>;
  getSale(id: string): Promise<Sale | undefined>;
  getSalesByCustomer(customerId: string): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  updateSalePaymentStatus(id: string, status: PaymentStatus, paidAmount?: string): Promise<void>;

  // Expense methods
  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  getExpensesByCategory(category: ExpenseCategory): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;

  // Analytics methods
  getTotalSales(): Promise<number>;
  getTotalReceived(): Promise<number>;
  getTotalPending(): Promise<number>;
  getTotalExpenses(): Promise<number>;
  getExpensesByCategory(): Promise<{ category: ExpenseCategory; total: number }[]>;
}

export class MemStorage implements IStorage {
  private customers: Map<string, Customer>;
  private suppliers: Map<string, Supplier>;
  private sales: Map<string, Sale>;
  private expenses: Map<string, Expense>;

  constructor() {
    this.customers = new Map();
    this.suppliers = new Map();
    this.sales = new Map();
    this.expenses = new Map();
  }

  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values()).sort(
      (a, b) => parseFloat(b.totalDebt) - parseFloat(a.totalDebt)
    );
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByName(name: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      (customer) => customer.name.toLowerCase() === name.toLowerCase()
    );
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...insertCustomer,
      id,
      totalDebt: "0",
      createdAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomerDebt(id: string, debt: string): Promise<void> {
    const customer = this.customers.get(id);
    if (customer) {
      customer.totalDebt = debt;
      this.customers.set(id, customer);
    }
  }

  // Supplier methods
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = {
      ...insertSupplier,
      id,
      createdAt: new Date(),
    };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  // Sale methods
  async getSales(): Promise<Sale[]> {
    return Array.from(this.sales.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getSale(id: string): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async getSalesByCustomer(customerId: string): Promise<Sale[]> {
    return Array.from(this.sales.values())
      .filter((sale) => sale.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = randomUUID();
    const paidAmount = insertSale.paidAmount || "0";
    
    // Find or create customer first
    let customer = await this.getCustomerByName(insertSale.customerName);
    if (!customer) {
      customer = await this.createCustomer({
        name: insertSale.customerName,
        phone: null,
      });
    }

    const sale: Sale = {
      ...insertSale,
      id,
      paidAmount,
      createdAt: new Date(),
      customerId: customer.id,
    };

    // Update customer debt if sale is not fully paid
    if (insertSale.paymentStatus === "fiado" || insertSale.paymentStatus === "parcial") {
      const pendingAmount = parseFloat(insertSale.amount) - parseFloat(paidAmount);
      const newDebt = parseFloat(customer.totalDebt) + pendingAmount;
      await this.updateCustomerDebt(customer.id, newDebt.toFixed(2));
    }

    this.sales.set(id, sale);
    return sale;
  }

  async updateSalePaymentStatus(
    id: string,
    status: PaymentStatus,
    paidAmount?: string
  ): Promise<void> {
    const sale = this.sales.get(id);
    if (sale) {
      const oldPaidAmount = parseFloat(sale.paidAmount);
      const newPaidAmount = paidAmount ? parseFloat(paidAmount) : oldPaidAmount;
      
      sale.paymentStatus = status;
      sale.paidAmount = newPaidAmount.toFixed(2);
      this.sales.set(id, sale);

      // Update customer debt
      if (sale.customerId) {
        const customer = await this.getCustomer(sale.customerId);
        if (customer) {
          const totalAmount = parseFloat(sale.amount);
          const pendingAmount = totalAmount - newPaidAmount;
          const currentDebt = parseFloat(customer.totalDebt);
          const oldPendingAmount = totalAmount - oldPaidAmount;
          const newDebt = currentDebt - oldPendingAmount + pendingAmount;
          await this.updateCustomerDebt(customer.id, Math.max(0, newDebt).toFixed(2));
        }
      }
    }
  }

  // Expense methods
  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async getExpensesByCategory(category: ExpenseCategory): Promise<Expense[]> {
    return Array.from(this.expenses.values())
      .filter((expense) => expense.category === category)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = {
      ...insertExpense,
      id,
      createdAt: new Date(),
      supplierId: null,
    };
    this.expenses.set(id, expense);
    return expense;
  }

  // Analytics methods
  async getTotalSales(): Promise<number> {
    const sales = await this.getSales();
    return sales.reduce((total, sale) => total + parseFloat(sale.amount), 0);
  }

  async getTotalReceived(): Promise<number> {
    const sales = await this.getSales();
    return sales.reduce((total, sale) => total + parseFloat(sale.paidAmount), 0);
  }

  async getTotalPending(): Promise<number> {
    const sales = await this.getSales();
    return sales.reduce(
      (total, sale) => total + (parseFloat(sale.amount) - parseFloat(sale.paidAmount)),
      0
    );
  }

  async getTotalExpenses(): Promise<number> {
    const expenses = await this.getExpenses();
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  }

  async getExpensesByCategory(): Promise<{ category: ExpenseCategory; total: number }[]> {
    const expenses = await this.getExpenses();
    const categoryTotals = new Map<ExpenseCategory, number>();

    expenses.forEach((expense) => {
      const current = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, current + parseFloat(expense.amount));
    });

    return Array.from(categoryTotals.entries()).map(([category, total]) => ({
      category,
      total,
    }));
  }
}

export const storage = new MemStorage();
