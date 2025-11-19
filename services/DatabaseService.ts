import badgesJson from "@/assets/data/badges.json";
import {
  BadgeDefinition,
  CategorySpend,
  CategoryType,
  Salary,
  TransactionType,
} from "@/types";
import * as SQLite from "expo-sqlite";
const badges = badgesJson as BadgeDefinition[];
type CountResult = { count: number };

export default class DatabaseService {
  private static db: SQLite.SQLiteDatabase | null = null;

  static async getDatabase() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync("app.db");
    }
    return this.db;
  }

  // Database Initalization
  static async initalize() {
    const db = await this.getDatabase();

    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS app_meta (
          key TEXT PRIMARY KEY,
          value TEXT
        );
        CREATE TABLE IF NOT EXISTS badges (
          badge_key TEXT PRIMARY KEY,
          unlocked INTEGER DEFAULT 0,
          unlocked_at TEXT
        );
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          color TEXT NOT NULL,
          type TEXT NOT NULL,
          budget DECIMAL(13, 2),
          is_default INTEGER DEFAULT 0
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

    await this.seedDefaultAppData(db);
    await this.seedDefaultCategories(db);
    await this.seedDefaultBadges(db);
  }

  private static async seedDefaultAppData(db: SQLite.SQLiteDatabase) {
    const existing = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE key = 'app_start_date'"
    );

    if (existing) return;

    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO app_meta (key, value) VALUES ('app_start_date', ?)`,
      [now]
    );
  }

  private static async seedDefaultCategories(db: SQLite.SQLiteDatabase) {
    const existingCategories = await db.getAllAsync<CountResult>(
      "SELECT COUNT(*) as count FROM categories"
    );
    if (existingCategories[0].count === 0) {
      await db.execAsync(`
          INSERT INTO categories (name, color, type, is_default) VALUES
            ('Utilities', '#FF6B6B', 'need', 1),
            ('Transport', '#4ECDC4', 'need', 1),
            ('Groceries', '#FFD93D', 'need', 1),
            ('Rent', '#3DFF8B', 'need', 1),
            ('Insurance', '#6A4C93', 'need', 1),
            ('Debt', '#FF8C00', 'need', 1),
            ('Restaurants', '#b2d100ff', 'want', 1),
            ('Beauty', '#6980ffff', 'want', 1),
            ('Shopping', '#DA70D6', 'want', 1),
            ('Subscription', '#9370DB', 'want', 1),
            ('Entertainment', '#20B2AA', 'want', 1);
        `);
    }
  }

  private static async seedDefaultBadges(db: SQLite.SQLiteDatabase) {
    const existing = await db.getAllAsync<CountResult>(
      "SELECT COUNT(*) AS count FROM badges"
    );

    if (existing[0].count === 0) {
      await db.execAsync("BEGIN TRANSACTION;");

      for (const badge of badges) {
        await db.runAsync(
          `INSERT INTO badges (badge_key, unlocked, unlocked_at) VALUES (?, 0, NULL)`,
          [badge.key]
        );
      }
      try {
        await db.execAsync("COMMIT");
      } catch (error) {
        await db.execAsync("ROLLBACK");
        throw error;
      }
    }
  }

  // Database Reset
  static async resetTables() {
    const db = await this.getDatabase();

    await db.execAsync(`
      DROP TABLE IF EXISTS transactions;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS salary;
    `);

    await this.initalize();
  }

  // Categories Table Interaction
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
  static async insertCategories(categories: CategoryType[]) {
    const db = await this.getDatabase();

    // (?, ?) for each category
    const placeholders = categories.map(() => "(?, ?, ?, ?, 0)").join(", ");

    // values to fill up parameter placeholders
    const values: (string | number)[] = [];
    categories.forEach((cat) => {
      values.push(cat.name, cat.color, cat.type, cat.budget);
    });

    const query = `INSERT INTO categories (name, color, type, budget, is_default) VALUES ${placeholders}`;

    await db.runAsync(query, values);
  }

  static async clearCategories() {
    const db = await this.getDatabase();
    await db.runAsync("DELETE FROM categories");
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

  static async checkCustomCategoryCreated() {
    const db = await this.getDatabase();

    const existing = await db.getAllAsync<CountResult>(
      "SELECT COUNT(*) as count FROM categories WHERE is_default = 0"
    );

    if (existing[0].count > 0) {
      return true;
    }

    return false;
  }

  // Salary Table Interaction
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

  static async getSalary() {
    const db = await this.getDatabase();
    return db.getFirstAsync<Salary>("SELECT * FROM salary");
  }

  // Transactions Table Interaction
  static async clearTransactions() {
    const db = await this.getDatabase();
    await db.runAsync("DELETE FROM transactions");
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

  static async getAllTransactions() {
    const db = await this.getDatabase();

    return await db.getAllAsync<TransactionType>(
      `
      SELECT id, name, amount, type, categoryId, date
      FROM transactions
      ORDER BY date DESC
      `,
      []
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

  // Badges Table Interaction
  static async checkBadgeUnlocked(badgeKey: string) {
    const db = await this.getDatabase();

    type BadgeDatabaseRow = {
      badge_key: string;
      unlocked: number;
      unlocked_at: string;
    };
    const row = await db.getFirstAsync<BadgeDatabaseRow>(
      "SELECT badge_key, unlocked, unlocked_at FROM badges WHERE badge_key = ?",
      [badgeKey]
    );

    if (row && row.unlocked !== 0) {
      return true;
    }

    return false;
  }

  static async unlockBadge(badgeKey: string) {
    const db = await this.getDatabase();
    const now = new Date().toISOString();

    type BadgeDatabaseRow = {
      badge_key: string;
      unlocked: number;
      unlocked_at: string;
    };
    await db.getFirstAsync<BadgeDatabaseRow>(
      ` 
        UPDATE badges
        SET unlocked = 1,
            unlocked_at = ?
        WHERE badge_key = ?
      `,
      [now, badgeKey]
    );

    return await this.checkBadgeUnlocked(badgeKey);
  }

  static async monthsSinceAppStart() {
    const db = await this.getDatabase();

    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE key = 'app_start_date'"
    );

    if (row) {
      const startDate = new Date(row.value);
      const now = new Date();

      const yearsDiff = now.getFullYear() - startDate.getFullYear();
      const monthsDiff = now.getMonth() - startDate.getMonth();

      const totalMonthsPassed = yearsDiff * 12 + monthsDiff;

      return totalMonthsPassed > 0 ? totalMonthsPassed : 0;
    }
  }
}
