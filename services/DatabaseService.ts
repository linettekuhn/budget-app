import badgesJson from "@/assets/data/badges.json";
import {
  AwardedBadge,
  BadgeDefinition,
  CategorySpend,
  CategoryType,
  RecurringTransaction,
  Salary,
  TransactionType,
} from "@/types";
import * as SQLite from "expo-sqlite";
import { rrulestr } from "rrule";
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
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS badges (
        badge_key TEXT PRIMARY KEY,
        unlocked INTEGER DEFAULT 0,
        unlocked_at TEXT
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        type TEXT NOT NULL,
        budget DECIMAL(13, 2),
        is_default INTEGER DEFAULT 0
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount DECIMAL(13, 2) NOT NULL,
        type TEXT NOT NULL,
        date TEXT DEFAULT (CURRENT_TIMESTAMP),
        categoryId INTEGER,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS recurring_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount DECIMAL(13, 2) NOT NULL,
        type TEXT NOT NULL,
        date TEXT DEFAULT (CURRENT_TIMESTAMP),
        categoryId INTEGER,
        rrule TEXT NOT NULL,
        lastGenerated TEXT DEFAULT (CURRENT_TIMESTAMP),
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS salary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        amount DECIMAL(13, 2) NOT NULL,
        monthly DECIMAL(13, 2) NOT NULL,
        hoursPerWeek DECIMAL(5, 2)
      )
    `);

    await this.seedDefaultAppData();
    await this.seedDefaultCategories();
    await this.seedDefaultBadges();
  }

  private static async seedDefaultAppData() {
    const db = await this.getDatabase();

    const existing = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE key = 'app_start_date'"
    );

    if (existing) return;

    const now = new Date().toISOString();
    await db.runAsync(
      "INSERT INTO app_meta (key, value) VALUES ('app_start_date', ?)",
      [now]
    );

    await db.runAsync(
      "INSERT INTO app_meta (key, value) VALUES ('app_current_streak', 1)"
    );

    await db.runAsync(
      "INSERT INTO app_meta (key, value) VALUES ('app_last_active', ?)",
      [now]
    );
  }

  static async seedDefaultCategories() {
    const db = await this.getDatabase();

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

  private static async seedDefaultBadges() {
    const db = await this.getDatabase();

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

    await db.execAsync(`DROP TABLE IF EXISTS transactions`);
    await db.execAsync(`DROP TABLE IF EXISTS recurring_transactions`);
    await db.execAsync(`DROP TABLE IF EXISTS categories`);
    await db.execAsync(`DROP TABLE IF EXISTS salary`);
    await db.execAsync(`DROP TABLE IF EXISTS badges`);
    await db.execAsync(`DROP TABLE IF EXISTS app_meta`);

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
  static async insertCategories(
    categories: CategoryType[],
    budgets: Record<number, { raw: string; display: string }>
  ) {
    const db = await this.getDatabase();

    // (?, ?) for each category
    const placeholders = categories.map(() => "(?, ?, ?, ?, 1)").join(", ");

    // values to fill up parameter placeholders
    const values: (string | number)[] = [];
    categories.forEach((cat) => {
      const budgetRaw = budgets[cat.id]?.raw || "0";
      const budgetAmount = parseFloat((Number(budgetRaw) / 100).toFixed(2));
      values.push(cat.name, cat.color, cat.type, budgetAmount);
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
      `INSERT INTO categories (name, color, type, budget, is_default) VALUES (?, ?, ?, ?, 0)`,
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

  static async addRecurringTransaction(transaction: {
    name: string;
    amount: number;
    type: "income" | "expense";
    categoryId: number;
    date: string;
    rrule: string;
  }) {
    const db = await this.getDatabase();

    await db.runAsync(
      `INSERT INTO recurring_transactions (name, amount, type, categoryId, date, rrule, lastGenerated)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        transaction.name,
        transaction.amount,
        transaction.type,
        transaction.categoryId,
        transaction.date,
        transaction.rrule,
        transaction.date,
      ]
    );

    this.addTransaction(transaction);
  }

  static async addMissedRecurringTransactions() {
    const db = await this.getDatabase();

    const recurringTransactions = await db.getAllAsync<RecurringTransaction>(
      "SELECT * FROM recurring_transactions"
    );

    for (const recurring of recurringTransactions) {
      const last = new Date(recurring.lastGenerated);
      const now = new Date();
      const rrule = rrulestr(recurring.rrule);
      const datesMissed = rrule.between(last, now, false);

      // add a transaction on each missed date
      if (!datesMissed.length) continue;
      for (const occurrenceDate of datesMissed) {
        this.addTransaction({
          name: recurring.name,
          amount: recurring.amount,
          type: recurring.type,
          categoryId: recurring.categoryId,
          date: occurrenceDate.toISOString(),
        });
      }

      // update last generated date
      const lastGenerated = datesMissed[datesMissed.length - 1];
      await db.runAsync(
        `
        UPDATE recurring_transactions
        SET lastGenerated = ?
        WHERE id = ?
      `,
        [lastGenerated.toISOString(), recurring.id]
      );
    }
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

  static async getBadges() {
    const db = await this.getDatabase();

    return await db.getAllAsync<AwardedBadge>(
      `
      SELECT badge_key, unlocked, unlocked_at
      FROM badges
      `
    );
  }

  // App Meta Table Integration
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

  static async getStreak() {
    const db = await this.getDatabase();

    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE key = 'app_current_streak'"
    );

    return Number(row?.value || 0);
  }

  static async getLastActiveDate() {
    const db = await this.getDatabase();

    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE key = 'app_last_active'"
    );

    if (row) {
      return new Date(row.value);
    }
  }

  static async updateStreak(date: string, currentStreak: number) {
    const db = await this.getDatabase();

    await db.runAsync(
      "UPDATE app_meta SET value = ? WHERE key = 'app_last_active'",
      [date]
    );

    await db.runAsync(
      "UPDATE app_meta SET value = ? WHERE key = 'app_last_active'",
      [String(currentStreak)]
    );
  }

  static async insertName(name: string) {
    const db = await this.getDatabase();

    await db.runAsync(
      "INSERT INTO app_meta (key, value) VALUES ('user_name', ?)",
      [name]
    );
  }

  static async getName() {
    const db = await this.getDatabase();

    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE key = 'user_name'"
    );

    if (row) {
      return row.value;
    }
  }
}
