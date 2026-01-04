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
import * as crypto from "expo-crypto";
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
        id TEXT PRIMARY KEY,
        value TEXT,
        createdAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        deletedAt TEXT
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS badges (
        id TEXT PRIMARY KEY,
        unlocked INTEGER DEFAULT 0,
        unlocked_at TEXT,
        createdAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        deletedAt TEXT
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        type TEXT NOT NULL,
        budget DECIMAL(13, 2),
        is_default INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        deletedAt TEXT
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        amount DECIMAL(13, 2) NOT NULL,
        type TEXT NOT NULL,
        date TEXT DEFAULT (CURRENT_TIMESTAMP),
        categoryId TEXT,
        createdAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        deletedAt TEXT,
        FOREIGN KEY (categoryId) REFERENCES categories(id)        
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS recurring_transactions (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        amount DECIMAL(13, 2) NOT NULL,
        type TEXT NOT NULL,
        date TEXT DEFAULT (CURRENT_TIMESTAMP),
        categoryId TEXT,
        rrule TEXT NOT NULL,
        lastGenerated TEXT DEFAULT (CURRENT_TIMESTAMP),
        createdAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        deletedAt TEXT,
        FOREIGN KEY (categoryId) REFERENCES categories(id)        
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS salary (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        amount DECIMAL(13, 2) NOT NULL,
        monthly DECIMAL(13, 2) NOT NULL,
        hoursPerWeek DECIMAL(5, 2),        
        createdAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        deletedAt TEXT
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS pending_changes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tableName TEXT NOT NULL,
        rowUUID TEXT NOT NULL,
        action TEXT NOT NULL,
        payload TEXT,
        createdAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        synced INTEGER DEFAULT 0
      )
    `);

    await this.seedDefaultAppData();
    await this.seedDefaultCategories();
    await this.seedDefaultBadges();
  }

  private static async seedDefaultAppData() {
    const db = await this.getDatabase();

    const existing = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE id = 'app_start_date'"
    );

    if (existing) return;

    const now = new Date().toISOString();
    await db.runAsync(
      "INSERT INTO app_meta (id, value) VALUES ('app_start_date', ?)",
      [now]
    );
    await this.logChange("app_meta", "app_start_date", "create", {
      id: "app_start_date",
      value: now,
    });

    await db.runAsync(
      "INSERT INTO app_meta (id, value) VALUES ('app_current_streak', 1)"
    );
    await this.logChange("app_meta", "app_current_streak", "create", {
      id: "app_current_streak",
      value: 1,
    });

    await db.runAsync(
      "INSERT INTO app_meta (id, value) VALUES ('app_last_active', ?)",
      [now]
    );
    await this.logChange("app_meta", "app_last_active", "create", {
      id: "app_last_active",
      value: now,
    });
  }

  static async seedDefaultCategories() {
    const db = await this.getDatabase();

    const categories = [
      { name: "Utilities", color: "#32A2A8", type: "need" },
      { name: "Transport", color: "#4ECDC4", type: "need" },
      { name: "Groceries", color: "#FFD93D", type: "need" },
      { name: "Rent", color: "#3DFF8B", type: "need" },
      { name: "Insurance", color: "#6A4C93", type: "need" },
      { name: "Debt", color: "#FF8C00", type: "need" },
      { name: "Restaurants", color: "#b2d100ff", type: "want" },
      { name: "Beauty", color: "#6980ffff", type: "want" },
      { name: "Shopping", color: "#DA70D6", type: "want" },
      { name: "Subscription", color: "#9370DB", type: "want" },
      { name: "Entertainment", color: "#20B2AA", type: "want" },
    ];

    for (const cat of categories) {
      const existing = await db.getAllAsync<CategoryType>(
        "SELECT * FROM categories WHERE name = ?",
        [cat.name]
      );

      if (!existing.length) {
        const id = `cat_${cat.name.toLowerCase().replace(" ", "_")}`;
        await db.runAsync(
          `
            INSERT INTO categories (id, name, color, type, is_default)
            VALUES (?, ?, ?, ?, 1)
          `,
          [id, cat.name, cat.color, cat.type]
        );
      }
    }
  }

  private static async seedDefaultBadges() {
    const db = await this.getDatabase();

    const existing = await db.getAllAsync<CountResult>(
      "SELECT COUNT(*) AS count FROM badges WHERE deletedAt IS NULL"
    );

    if (existing[0].count === 0) {
      await db.execAsync("BEGIN TRANSACTION;");

      for (const badge of badges) {
        await db.runAsync(
          `INSERT INTO badges (id, unlocked, unlocked_at) VALUES (?, 0, NULL)`,
          [badge.id]
        );
        await this.logChange("badges", badge.id, "create", {
          id: badge.id,
          unlocked: 0,
          unlocked_at: null,
        });
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
    await db.execAsync(`DROP TABLE IF EXISTS pending_changes`);

    await this.initalize();
  }

  // Pending Changes Table Integration
  static async logChange(
    tableName: string,
    rowUUID: string,
    action: "create" | "update" | "delete",
    payload: any
  ) {
    const db = await this.getDatabase();
    await db.runAsync(
      `
      INSERT INTO pending_changes (tableName, rowUUID, action, payload)
      VALUES (?, ?, ?, ?)
    `,
      [tableName, rowUUID, action, JSON.stringify(payload)]
    );
  }

  static async insertFromSync(table: string, id: string, data: any) {
    const db = await this.getDatabase();

    const keys = Object.keys(data);
    const placeholders = keys.map(() => "?").join(", ");
    const values = keys.map((id) => data[id]);
    await db.runAsync(
      `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`,
      [...values]
    );
  }

  static async updateFromSync(table: string, id: string, data: any) {
    const db = await this.getDatabase();

    const keys = Object.keys(data);
    const columns = keys.map((id) => `${id} = ?`).join(", ");
    const values = keys.map((id) => data[id]);

    await db.runAsync(`UPDATE ${table} SET ${columns} WHERE id = ?`, [
      ...values,
      id,
    ]);
  }

  static async deleteFromSync(table: string, id: string) {
    const db = await this.getDatabase();
    await db.runAsync(
      `UPDATE ${table} SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [id]
    );
  }

  static async getPendingChanges() {
    const db = await this.getDatabase();

    return await db.getAllAsync(
      `SELECT * FROM pending_changes WHERE tableName = "categories"`
    );
  }

  // Categories Table Interaction
  static async updateCategoryBudgets(
    categoryAmounts: Record<string, { raw: string }>
  ) {
    const db = await this.getDatabase();
    await db.execAsync("BEGIN TRANSACTION");

    try {
      const updates = Object.entries(categoryAmounts).map(async (cat) => {
        const id = cat[0];
        const rawAmount = cat[1].raw;

        if (parseFloat(rawAmount) === 0) {
          throw new Error("Budgets cannot be 0");
        }

        const budgetAmount = parseFloat((Number(rawAmount) / 100).toFixed(2));

        await db.runAsync(
          `
            UPDATE categories
            SET budget = ?, updatedAt = CURRENT_TIMESTAMP 
            WHERE id = ?
          `,
          [budgetAmount, id]
        );

        await this.logChange("categories", id, "update", {
          budget: budgetAmount,
        });
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
    budgets: Record<string, { raw: string; display: string }>
  ) {
    const db = await this.getDatabase();

    const ids = categories.map(
      (cat) => `cat_${cat.name.toLowerCase().replace(" ", "_")}`
    );

    // (?, ?) for each category
    const placeholders = categories.map(() => `(?, ?, ?, ?, ?, 1)`).join(", ");

    // values to fill up parameter placeholders
    const values: (string | number)[] = [];
    categories.forEach((cat, index) => {
      const budgetRaw = budgets[cat.id]?.raw || "0";
      const budgetAmount = parseFloat((Number(budgetRaw) / 100).toFixed(2));
      values.push(ids[index], cat.name, cat.color, cat.type, budgetAmount);
    });

    const query = `INSERT INTO categories (id, name, color, type, budget, is_default) VALUES ${placeholders}`;

    await db.runAsync(query, values);

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const budgetRaw = budgets[category.id]?.raw || "0";
      await this.logChange("categories", ids[i], "create", {
        name: category.name,
        color: category.color,
        type: category.type,
        budget: parseFloat((Number(budgetRaw) / 100).toFixed(2)),
      });
    }
  }

  static async clearCategories() {
    const db = await this.getDatabase();
    const categories = await db.getAllAsync<{ id: string }>(
      "SELECT id FROM categories WHERE deletedAt IS NULL"
    );
    await db.runAsync(`DELETE FROM categories`);
  }

  static async addCategory(
    name: string,
    categoryColor: string,
    categoryType: "need" | "want",
    budget: number
  ) {
    const db = await this.getDatabase();

    const exists = await this.checkCategoryNameExists(name);
    if (exists) {
      throw new Error(`Category name "${name}" already exists`);
    }

    const id = `cat_${name.toLowerCase().replace(" ", "_")}`;
    await db.runAsync(
      `INSERT INTO categories (id, name, color, type, budget, is_default) VALUES (?, ?, ?, ?, ?, 0)`,
      [id, name, categoryColor, categoryType, budget]
    );

    await this.logChange("categories", id, "create", {
      name,
      color: categoryColor,
      type: categoryType,
      budget,
    });
  }

  static async checkCategoryNameExists(name: string) {
    const db = await this.getDatabase();

    const existing = await db.getAllAsync<CountResult>(
      "SELECT COUNT(*) as count FROM categories WHERE name = ? AND deletedAt IS NULL",
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
    id: string
  ) {
    const db = await this.getDatabase();

    await db.runAsync(
      `
      UPDATE categories 
      SET color = ?, type = ?, budget = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
      `,
      [color, categoryType, budget, id]
    );

    await this.logChange("categories", id, "update", {
      color,
      type: categoryType,
      budget,
    });
  }

  static async getCategories() {
    const db = await this.getDatabase();

    return await db.getAllAsync<CategoryType>(
      "SELECT * FROM categories WHERE deletedAt IS NULL"
    );
  }

  static async checkCustomCategoryCreated() {
    const db = await this.getDatabase();

    const existing = await db.getAllAsync<CountResult>(
      "SELECT COUNT(*) as count FROM categories WHERE is_default = 0 AND deletedAt IS NULL"
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

    const id = "primary_salary";

    await db.runAsync(
      `INSERT INTO salary (id, type, amount, monthly, hoursPerWeek) VALUES (?, ?, ?, ?, ?)`,
      [id, type, amount, monthly, hoursPerWeek]
    );

    await this.logChange("salary", id, "create", {
      type,
      amount,
      monthly,
      hoursPerWeek,
    });
  }

  static async getSalary() {
    const db = await this.getDatabase();
    return db.getFirstAsync<Salary>(
      "SELECT * FROM salary WHERE deletedAt IS NULL"
    );
  }

  static async updateSalary(
    type: string,
    amount: number,
    monthly: number,
    hoursPerWeek: number | null
  ) {
    const db = await this.getDatabase();

    const id = "primary_salary";

    await db.runAsync(
      `
      UPDATE salary 
      SET type = ?, amount = ?, monthly = ?, hoursPerWeek = ?
      WHERE id = ?
      `,
      [type, amount, monthly, hoursPerWeek, id]
    );

    await this.logChange("salary", id, "update", {
      type,
      amount,
      monthly,
      hoursPerWeek,
    });
  }

  // Transactions Table Interaction
  static async clearTransactions() {
    const db = await this.getDatabase();
    const transactions = await db.getAllAsync<{ id: string }>(
      "SELECT id FROM transactions WHERE deletedAt IS NULL"
    );
    await db.runAsync(`DELETE FROM transactions`);
    for (const transaction of transactions) {
      await this.logChange("transactions", transaction.id, "delete", {});
    }
  }

  static async addTransaction(transaction: {
    name: string;
    amount: number;
    type: "income" | "expense";
    categoryId: string;
    date: string;
  }) {
    const db = await this.getDatabase();
    const id = crypto.randomUUID();
    await db.runAsync(
      `INSERT INTO transactions (id, name, amount, type, categoryId, date)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        id,
        transaction.name,
        transaction.amount,
        transaction.type,
        transaction.categoryId,
        transaction.date,
      ]
    );
    await this.logChange("transactions", id, "create", transaction);
  }

  static async addRecurringTransaction(transaction: {
    name: string;
    amount: number;
    type: "income" | "expense";
    categoryId: string;
    date: string;
    rrule: string;
  }) {
    const db = await this.getDatabase();
    const id = crypto.randomUUID();

    const { rrule, ...transactionData } = transaction;
    await db.runAsync(
      `INSERT INTO recurring_transactions (id, name, amount, type, categoryId, date, rrule, lastGenerated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        transactionData.name,
        transactionData.amount,
        transactionData.type,
        transactionData.categoryId,
        transactionData.date,
        rrule,
        transactionData.date,
      ]
    );
    await this.logChange("recurring_transactions", id, "create", transaction);
    await this.addTransaction(transactionData);
  }

  static async addMissedRecurringTransactions() {
    const db = await this.getDatabase();

    const recurringTransactions = await db.getAllAsync<RecurringTransaction>(
      "SELECT * FROM recurring_transactions WHERE deletedAt IS NULL"
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
        SET lastGenerated = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        [lastGenerated.toISOString(), recurring.id]
      );

      await this.logChange("recurring_transactions", recurring.id, "update", {
        lastGenerated: lastGenerated.toISOString(),
      });
    }
  }

  static async updateRecurringTransaction(transaction: {
    id: string;
    name: string;
    amount: number;
    type: "income" | "expense";
    date: string;
    categoryId: string;
    rrule: string;
    lastGenerated: string;
  }) {
    const db = await this.getDatabase();
    const { rrule, ...transactionData } = transaction;
    await db.runAsync(
      `
      UPDATE recurring_transactions 
      SET name = ?, amount = ?, type = ?, categoryId = ?, date = ?, rrule = ?
      WHERE id = ?;
      `,
      [
        transactionData.name,
        transactionData.amount,
        transactionData.type,
        transactionData.categoryId,
        transactionData.date,
        rrule,
        transaction.id,
      ]
    );
    await this.logChange(
      "recurring_transactions",
      transaction.id,
      "update",
      transaction
    );
  }

  static async deleteRecurringTransaction(id: string) {
    const db = await this.getDatabase();

    await db.runAsync(
      `
      UPDATE recurring_transactions
      SET deletedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [id]
    );

    await this.logChange("recurring_transactions", id, "delete", {});
  }

  static async getAllRecurringTransactions() {
    const db = await this.getDatabase();
    return await db.getAllAsync<RecurringTransaction>(
      `
      SELECT * FROM recurring_transactions 
      WHERE deletedAt IS NULL
      ORDER BY date DESC
      `
    );
  }

  static async getCategoryTransactions(
    categoryId: string,
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
      WHERE t.categoryId = ? AND t.deletedAt IS NULL
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
      WHERE deletedAt IS NULL AND date BETWEEN ? AND ? 
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
      WHERE deletedAt IS NULL
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
      WHERE c.deletedAt IS NULL
      GROUP BY c.id
    `,
      [monthFilter]
    );
  }

  static async getCategorySpend(categoryId: string, month?: string) {
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
      WHERE c.id = ? AND c.deletedAt IS NULL
      GROUP BY c.id
    `,
      [monthFilter, categoryId]
    );
  }

  // Badges Table Interaction
  static async checkBadgeUnlocked(badgeKey: string) {
    const db = await this.getDatabase();

    type BadgeDatabaseRow = {
      id: string;
      unlocked: number;
      unlocked_at: string;
    };
    const row = await db.getFirstAsync<BadgeDatabaseRow>(
      "SELECT id, unlocked, unlocked_at FROM badges WHERE id = ? AND deletedAt IS NULL",
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

    await db.runAsync(
      ` 
        UPDATE badges
        SET unlocked = 1,
            unlocked_at = ?,
            updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [now, badgeKey]
    );

    await this.logChange("badges", badgeKey, "update", {
      unlocked: 1,
      unlocked_at: now,
    });

    return await this.checkBadgeUnlocked(badgeKey);
  }

  static async getBadges() {
    const db = await this.getDatabase();

    return await db.getAllAsync<AwardedBadge>(
      `
      SELECT id, unlocked, unlocked_at
      FROM badges
      WHERE deletedAt IS NULL
      `
    );
  }

  // App Meta Table Integration
  static async monthsSinceAppStart() {
    const db = await this.getDatabase();

    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE id = 'app_start_date' AND deletedAt IS NULL"
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
      "SELECT value FROM app_meta WHERE id = 'app_current_streak' AND deletedAt IS NULL"
    );

    return Number(row?.value || 0);
  }

  static async getLastActiveDate() {
    const db = await this.getDatabase();

    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE id = 'app_last_active' AND deletedAt IS NULL"
    );

    if (row) {
      return new Date(row.value);
    }
  }

  static async getAppStartDate() {
    const db = await this.getDatabase();

    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE id = 'app_start_date' AND deletedAt IS NULL"
    );

    if (row) {
      return new Date(row.value);
    }
  }

  static async updateStreak(date: string, currentStreak: number) {
    const db = await this.getDatabase();

    await db.runAsync(
      "UPDATE app_meta SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = 'app_last_active'",
      [date]
    );
    await this.logChange("app_meta", "app_last_active", "update", {
      value: date,
    });

    await db.runAsync(
      "UPDATE app_meta SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = 'app_current_streak'",
      [String(currentStreak)]
    );
    await this.logChange("app_meta", "app_current_streak", "update", {
      value: String(currentStreak),
    });
  }

  static async insertName(name: string) {
    const db = await this.getDatabase();

    await db.runAsync(
      "INSERT INTO app_meta (id, value) VALUES ('user_name', ?)",
      [name]
    );

    await this.logChange("app_meta", "user_name", "create", {
      id: "user_name",
      value: name,
    });
  }

  static async getName() {
    const db = await this.getDatabase();

    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE id = 'user_name' AND deletedAt IS NULL"
    );

    if (row) {
      return row.value;
    }
  }

  static async updateName(name: string) {
    const db = await this.getDatabase();

    await db.runAsync(
      "UPDATE app_meta SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = 'user_name'",
      [name]
    );

    await this.logChange("app_meta", "user_name", "update", {
      value: name,
    });
  }

  static async getLastSyncDate() {
    const db = await this.getDatabase();

    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE id = 'app_last_sync' AND deletedAt IS NULL"
    );

    if (row) {
      return new Date(row.value);
    }

    return undefined;
  }

  static async updateLastSyncDate(date: string) {
    const db = await this.getDatabase();

    await db.runAsync(
      "UPDATE app_meta SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = 'app_last_sync'",
      [date]
    );
  }
}
