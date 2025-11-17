import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertSupplierSchema, insertSaleSchema, insertExpenseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const data = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(data);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  app.get("/api/customers/:id/sales", async (req, res) => {
    try {
      const sales = await storage.getSalesByCustomer(req.params.id);
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer sales" });
    }
  });

  // Supplier routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const data = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(data);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create supplier" });
    }
  });

  // Sale routes
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales" });
    }
  });

  app.get("/api/sales/:id", async (req, res) => {
    try {
      const sale = await storage.getSale(req.params.id);
      if (!sale) {
        return res.status(404).json({ error: "Sale not found" });
      }
      res.json(sale);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sale" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const data = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(data);
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create sale" });
    }
  });

  app.patch("/api/sales/:id/payment", async (req, res) => {
    try {
      const { status, paidAmount } = req.body;
      await storage.updateSalePaymentStatus(req.params.id, status, paidAmount);
      const updatedSale = await storage.getSale(req.params.id);
      res.json(updatedSale);
    } catch (error) {
      res.status(500).json({ error: "Failed to update sale payment" });
    }
  });

  // Expense routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const { category } = req.query;
      if (category && typeof category === "string") {
        const expenses = await storage.getExpensesByCategory(category as any);
        return res.json(expenses);
      }
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.getExpense(req.params.id);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const data = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(data);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create expense" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const [totalSales, totalReceived, totalPending, totalExpenses] = await Promise.all([
        storage.getTotalSales(),
        storage.getTotalReceived(),
        storage.getTotalPending(),
        storage.getTotalExpenses(),
      ]);

      const netProfit = totalReceived - totalExpenses;

      res.json({
        totalSales,
        totalReceived,
        totalPending,
        totalExpenses,
        netProfit,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/expenses-by-category", async (req, res) => {
    try {
      const data = await storage.getExpensesByCategory();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses by category" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
