import { CategorySpend, CategoryType, Salary, TransactionType } from "@/types";
import * as SQLite from "expo-sqlite";

export default class DatabaseService {
  private static db: SQLite.SQLiteDatabase | null = null;

  static async getDatabase() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync("app.db");
    }
    return this.db;
  }

  static async initalize() {
    const db = await this.getDatabase();

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          color TEXT NOT NULL,
          type TEXT NOT NULL,
          budget DECIMAL(13, 2)
        );
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          amount DECIMAL(13, 2) NOT NULL,
          type TEXT NOT NULL,
          date TEXT DEFAULT (datetime('now')),
          categoryId INTEGER,
          FOREIGN KEY (categoryId) REFERENCES categories(id)
          );
        CREATE TABLE IF NOT EXISTS salary (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          amount DECIMAL(13, 2) NOT NULL,
          monthly DECIMAL(13, 2) NOT NULL,
          hoursPerWeek DECIMAL(5, 2)
          )
          `);

    await this.seedDefaultCategories(db);
  }

  private static async seedDefaultCategories(db: SQLite.SQLiteDatabase) {
    type CountResult = { count: number };
    const existingCategories = await db.getAllAsync<CountResult>(
      "SELECT COUNT(*) as count FROM categories"
    );
    if (existingCategories[0].count === 0) {
      await db.execAsync(`
          INSERT INTO categories (name, color, type) VALUES
            ('Utilities', '#FF6B6B', 'need'),
            ('Transport', '#4ECDC4', 'need'),
            ('Groceries', '#FFD93D', 'need'),
            ('Rent', '#3DFF8B', 'need'),
            ('Insurance', '#6A4C93', 'need'),
            ('Debt', '#FF8C00', 'need'),
            ('Restaurants', '#b2d100ff', 'want'),
            ('Beauty', '#6980ffff', 'want'),
            ('Shopping', '#DA70D6', 'want'),
            ('Subscription', '#9370DB', 'want'),
            ('Entertainment', '#20B2AA', 'want');
        `);
    }
  }

  static async resetTables() {
    const db = await this.getDatabase();

    await db.execAsync(`
      DROP TABLE IF EXISTS transactions;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS salary;
    `);

    await this.initalize();
  }

  static async updateCategoryBudgets(
    categoryAmounts: Record<number, { raw: string }>
  ) {
    const db = await this.getDatabase();
    await db.execAsync("BEGIN TRANSACTION");

    try {
      const updates = Object.entries(categoryAmounts).map(async (cat) => {
        const id = parseInt(cat[0]);
        const rawAmount = cat[1].raw;

        if (parseFloat(rawAmount) === 0) {
          throw new Error("Budgets cannot be 0");
        }

        await db.runAsync(
          `
              UPDATE categories
              SET budget = ?
              WHERE id = ?
              `,
          [parseFloat((Number(rawAmount) / 100).toFixed(2)), id]
        );
      });

      await Promise.all(updates);
      await db.execAsync("COMMIT");
    } catch (error: unknown) {
      await db.execAsync("ROLLBACK");
      throw error;
    }
  }

  static async clearCategories() {
    const db = await this.getDatabase();
    await db.runAsync("DELETE FROM categories");
  }

  static async clearTransactions() {
    const db = await this.getDatabase();
    await db.runAsync("DELETE FROM transactions");
  }

  static async insertCategories(categories: CategoryType[]) {
    const db = await this.getDatabase();

    // (?, ?) for each category
    const placeholders = categories.map(() => "(?, ?, ?, ?)").join(", ");

    // values to fill up parameter placeholders
    const values: (string | number)[] = [];
    categories.forEach((cat) => {
      values.push(cat.name, cat.color, cat.type, cat.budget);
    });

    const query = `INSERT INTO categories (name, color, type, budget) VALUES ${placeholders}`;

    await db.runAsync(query, values);
  }

  static async saveSalary(
    type: string,
    amount: number,
    monthly: number,
    hoursPerWeek: number | null
  ) {
    const db = await this.getDatabase();

    await db.runAsync(
      `INSERT INTO salary (type, amount, monthly, hoursPerWeek) VALUES (?, ?, ?, ?)`,
      [type, amount, monthly, hoursPerWeek]
    );
  }

  static async addTransaction(transaction: {
    name: string;
    amount: number;
    type: "income" | "expense";
    categoryId: number;
    date: string;
  }) {
    const db = await this.getDatabase();

    await db.runAsync(
      `INSERT INTO transactions (name, amount, type, categoryId, date)
       VALUES (?, ?, ?, ?, ?);`,
      [
        transaction.name,
        transaction.amount,
        transaction.type,
        transaction.categoryId,
        transaction.date,
      ]
    );
  }

  static async addCategory(
    name: string,
    categoryColor: string,
    categoryType: "need" | "want",
    budget: number
  ) {
    const db = await this.getDatabase();

    await db.runAsync(
      `INSERT INTO categories (name, color, type, budget) VALUES (?, ?, ?, ?)`,
      [name, categoryColor, categoryType, budget]
    );
  }

  static async checkCategoryNameExists(name: string) {
    const db = await this.getDatabase();

    type CountResult = { count: number };
    const existing = await db.getAllAsync<CountResult>(
      "SELECT COUNT(*) as count FROM categories WHERE name = ?",
      [name]
    );

    if (existing[0].count !== 0) {
      return true;
    }

    return false;
  }

  static async updateCategory(
    color: string,
    categoryType: "need" | "want",
    budget: number,
    id: number
  ) {
    const db = await this.getDatabase();

    await db.runAsync(
      `UPDATE categories SET color = ?, type = ?, budget = ? WHERE id = ?`,
      [color, categoryType, budget, id]
    );
  }

  static async getCategories() {
    const db = await this.getDatabase();

    return await db.getAllAsync<CategoryType>("SELECT * FROM categories");
  }

  static async getCategoryTransactions(
    categoryId: number,
    year: number,
    month: number
  ) {
    const db = await this.getDatabase();

    const monthStr = month.toString().padStart(2, "0");

    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-31`;

    return await db.getAllAsync<TransactionType>(
      `
      SELECT
        t.id,
        t.name,
        t.amount,
        t.type,
        t.categoryId,
        t.date,
        c.name AS categoryName,
        c.color AS categoryColor
      FROM transactions t
      INNER JOIN categories c ON t.categoryId = c.id
      WHERE t.categoryId = ?
      AND t.date BETWEEN ? AND ?
      ORDER BY t.date DESC
    `,
      [categoryId, startDate, endDate]
    );
  }

  static async getTransactionsByMonth(year: number, month: number) {
    const db = await this.getDatabase();

    const monthStr = month.toString().padStart(2, "0");

    const startDate = `${year}-${monthStr}-01`;
    const endDate = `${year}-${monthStr}-31`;

    return await db.getAllAsync<TransactionType>(
      `
      SELECT id, name, amount, type, categoryId, date
      FROM transactions
      WHERE date BETWEEN ? AND ?
      ORDER BY date DESC
      `,
      [startDate, endDate]
    );
  }
  static async getCategoriesSpend(month?: string) {
    const db = await this.getDatabase();
    const monthFilter = month ? month : new Date().toISOString().slice(0, 7);

    return await db.getAllAsync<CategorySpend>(
      `
      SELECT
          c.id,
          c.name,
          c.color,
          c.budget,
          c.type,
          IFNULL(SUM(
              CASE 
                  WHEN t.type = 'expense' THEN t.amount
                  WHEN t.type = 'income' THEN -t.amount
                  ELSE 0
              END
          ), 0) AS totalSpent
      FROM categories c
      LEFT JOIN transactions t 
          ON c.id = t.categoryId
          AND strftime('%Y-%m', t.date) = ?
      GROUP BY c.id
    `,
      [monthFilter]
    );
  }

  static async getCategorySpend(categoryId: number, month?: string) {
    const db = await this.getDatabase();
    const monthFilter = month ? month : new Date().toISOString().slice(0, 7);

    return await db.getFirstAsync<CategorySpend>(
      `
      SELECT
          c.id,
          c.name,
          c.color,
          c.budget,
          c.type,
          IFNULL(SUM(
              CASE 
                  WHEN t.type = 'expense' THEN t.amount
                  WHEN t.type = 'income' THEN -t.amount
                  ELSE 0
              END
          ), 0) AS totalSpent
      FROM categories c
      LEFT JOIN transactions t 
          ON c.id = t.categoryId
          AND strftime('%Y-%m', t.date) = ?
      WHERE c.id = ?
      GROUP BY c.id
    `,
      [monthFilter, categoryId]
    );
  }

  static async getSalary() {
    const db = await this.getDatabase();
    return db.getFirstAsync<Salary>("SELECT * FROM salary");
  }
}
