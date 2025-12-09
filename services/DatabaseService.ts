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
        uuid TEXT UNIQUE,
        value TEXT,
        createdAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        deletedAt TEXT
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS badges (
        badge_key TEXT PRIMARY KEY,
        uuid TEXT UNIQUE,
        unlocked INTEGER DEFAULT 0,
        unlocked_at TEXT,
        createdAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        deletedAt TEXT
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE,
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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE,
        name TEXT NOT NULL,
        amount DECIMAL(13, 2) NOT NULL,
        type TEXT NOT NULL,
        date TEXT DEFAULT (CURRENT_TIMESTAMP),
        categoryId INTEGER,
        FOREIGN KEY (categoryId) REFERENCES categories(id),        
        createdAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        deletedAt TEXT
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS recurring_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE,
        name TEXT NOT NULL,
        amount DECIMAL(13, 2) NOT NULL,
        type TEXT NOT NULL,
        date TEXT DEFAULT (CURRENT_TIMESTAMP),
        categoryId INTEGER,
        rrule TEXT NOT NULL,
        lastGenerated TEXT DEFAULT (CURRENT_TIMESTAMP),
        FOREIGN KEY (categoryId) REFERENCES categories(id),        
        createdAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        updatedAt TEXT DEFAULT (CURRENT_TIMESTAMP),
        deletedAt TEXT
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS salary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT UNIQUE,
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
      "SELECT value FROM app_meta WHERE key = 'app_start_date'"
    );

    if (existing) return;

    const now = new Date().toISOString();
    const uuidStartDate = crypto.randomUUID();
    await db.runAsync(
      "INSERT INTO app_meta (key, uuid, value) VALUES ('app_start_date', ?, ?)",
      [uuidStartDate, now]
    );
    await this.logChange("app_meta", uuidStartDate, "create", {
      key: "app_start_date",
      value: now,
    });

    const uuidCurrentStreak = crypto.randomUUID();
    await db.runAsync(
      "INSERT INTO app_meta (key, uuid, value) VALUES ('app_current_streak', ?, 1)",
      [uuidCurrentStreak]
    );
    await this.logChange("app_meta", uuidCurrentStreak, "create", {
      key: "app_current_streak",
      value: 1,
    });

    const uuidLastActive = crypto.randomUUID();
    await db.runAsync(
      "INSERT INTO app_meta (key, uuid, value) VALUES ('app_last_active', ?, ?)",
      [uuidLastActive, now]
    );
    await this.logChange("app_meta", uuidLastActive, "create", {
      key: "app_last_active",
      value: now,
    });
  }

  static async seedDefaultCategories() {
    const db = await this.getDatabase();

    const existingCategories = await db.getAllAsync<CountResult>(
      "SELECT COUNT(*) as count FROM categories WHERE deletedAt IS NULL"
    );
    if (existingCategories[0].count === 0) {
      const categories = [
        { name: "Utilities", color: "#FF6B6B", type: "need" },
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
        const uuid = crypto.randomUUID();
        await db.runAsync(
          `
            INSERT INTO categories (uuid, name, color, type, is_default)
            VALUES (?, ?, ?, ?, 1)
          `,
          [uuid, cat.name, cat.color, cat.type]
        );

        await this.logChange("categories", uuid, "create", cat);
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
        const uuid = crypto.randomUUID();
        await db.runAsync(
          `INSERT INTO badges (badge_key, uuid, unlocked, unlocked_at) VALUES (?, ?, 0, NULL)`,
          [badge.key, uuid]
        );
        await this.logChange("badges", uuid, "create", {
          badge_key: badge.key,
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

        const row = await db.getFirstAsync<{ uuid: string }>(
          "SELECT uuid FROM categories WHERE id = ? AND deletedAt IS NULL",
          [id]
        );

        if (!row) {
          throw new Error(`Category with id ${id} not found`);
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

        await this.logChange("categories", row.uuid, "update", {
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
    budgets: Record<number, { raw: string; display: string }>
  ) {
    const db = await this.getDatabase();

    const uuids = categories.map(() => crypto.randomUUID());

    // (?, ?) for each category
    const placeholders = categories.map(() => `(?, ?, ?, ?, ?, 1)`).join(", ");

    // values to fill up parameter placeholders
    const values: (string | number)[] = [];
    categories.forEach((cat, index) => {
      const budgetRaw = budgets[cat.id]?.raw || "0";
      const budgetAmount = parseFloat((Number(budgetRaw) / 100).toFixed(2));
      values.push(uuids[index], cat.name, cat.color, cat.type, budgetAmount);
    });

    const query = `INSERT INTO categories (uuid, name, color, type, budget, is_default) VALUES ${placeholders}`;

    await db.runAsync(query, values);

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      await this.logChange("categories", uuids[i], "create", {
        name: category.name,
        color: category.color,
        type: category.type,
        budget: budgets[category.id]?.raw || "0",
      });
    }
  }

  static async clearCategories() {
    const db = await this.getDatabase();
    const categories = await db.getAllAsync<{ uuid: string }>(
      "SELECT uuid FROM categories WHERE deletedAt IS NULL"
    );
    await db.runAsync(
      "UPDATE categories SET deletedAt = CURRENT_TIMESTAMP WHERE deletedAt IS NULL"
    );
    for (const cat of categories) {
      await this.logChange("categories", cat.uuid, "delete", {});
    }
  }

  static async addCategory(
    name: string,
    categoryColor: string,
    categoryType: "need" | "want",
    budget: number
  ) {
    const db = await this.getDatabase();
    const uuid = crypto.randomUUID();
    await db.runAsync(
      `INSERT INTO categories (uuid, name, color, type, budget, is_default) VALUES (?, ?, ?, ?, ?, 0)`,
      [uuid, name, categoryColor, categoryType, budget]
    );

    await this.logChange("categories", uuid, "create", {
      name,
      categoryColor,
      categoryType,
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
    id: number
  ) {
    const db = await this.getDatabase();

    const row = await db.getFirstAsync<{ uuid: string }>(
      "SELECT uuid FROM categories WHERE id = ? AND deletedAt IS NULL",
      [id]
    );

    if (!row) {
      throw new Error(`Category with id ${id} not found`);
    }

    const uuid = row.uuid;

    await db.runAsync(
      `
      UPDATE categories 
      SET color = ?, type = ?, budget = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
      `,
      [color, categoryType, budget, id]
    );

    await this.logChange("categories", uuid, "update", {
      color,
      categoryType,
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

    const uuid = crypto.randomUUID();

    await db.runAsync(
      `INSERT INTO salary (uuid, type, amount, monthly, hoursPerWeek) VALUES (?, ?, ?, ?, ?)`,
      [uuid, type, amount, monthly, hoursPerWeek]
    );

    await this.logChange("salary", uuid, "create", {
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

  // Transactions Table Interaction
  static async clearTransactions() {
    const db = await this.getDatabase();
    const transactions = await db.getAllAsync<{ uuid: string }>(
      "SELECT uuid FROM transactions WHERE deletedAt IS NULL"
    );
    await db.runAsync(
      "UPDATE transactions SET deletedAt = CURRENT_TIMESTAMP WHERE deletedAt IS NULL"
    );
    for (const transaction of transactions) {
      await this.logChange("transactions", transaction.uuid, "delete", {});
    }
  }

  static async addTransaction(transaction: {
    name: string;
    amount: number;
    type: "income" | "expense";
    categoryId: number;
    date: string;
  }) {
    const db = await this.getDatabase();
    const uuid = crypto.randomUUID();
    await db.runAsync(
      `INSERT INTO transactions (uuid, name, amount, type, categoryId, date)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        uuid,
        transaction.name,
        transaction.amount,
        transaction.type,
        transaction.categoryId,
        transaction.date,
      ]
    );
    await this.logChange("transactions", uuid, "create", transaction);
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
    const uuid = crypto.randomUUID();
    await db.runAsync(
      `INSERT INTO recurring_transactions (uuid, name, amount, type, categoryId, date, rrule, lastGenerated)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        uuid,
        transaction.name,
        transaction.amount,
        transaction.type,
        transaction.categoryId,
        transaction.date,
        transaction.rrule,
        transaction.date,
      ]
    );
    await this.logChange("recurring_transactions", uuid, "create", transaction);
    await this.addTransaction(transaction);
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

      await this.logChange("recurring_transactions", recurring.uuid, "update", {
        lastGenerated: lastGenerated.toISOString(),
      });
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
        t.uuid,
        t.name,
        t.amount,
        t.type,
        t.categoryId,
        t.date,
        c.name AS categoryName,
        c.color AS categoryColor
      FROM transactions t
      INNER JOIN categories c ON t.categoryId = c.id
      WHERE t.categoryId = ? AND deletedAt IS NULL
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
      SELECT uuid, id, name, amount, type, categoryId, date
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
      SELECT uuid, id, name, amount, type, categoryId, date
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
      WHERE deletedAt IS NULL
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
      WHERE c.id = ? AND deletedAt IS NULL
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
      "SELECT badge_key, unlocked, unlocked_at FROM badges WHERE badge_key = ? AND deletedAt IS NULL",
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

    const row = await db.getFirstAsync<{ uuid: string }>(
      "SELECT uuid FROM badges WHERE badge_key = ? AND deletedAt IS NULL",
      [badgeKey]
    );

    if (!row) {
      throw new Error(`Badge with id ${badgeKey} not found`);
    }

    await db.getFirstAsync<BadgeDatabaseRow>(
      ` 
        UPDATE badges
        SET unlocked = 1,
            unlocked_at = ?,
            updatedAt = CURRENT_TIMESTAMP
        WHERE badge_key = ?
      `,
      [now, badgeKey]
    );

    await this.logChange("badges", row.uuid, "update", {
      unlocked: 1,
      unlocked_at: now,
    });

    return await this.checkBadgeUnlocked(badgeKey);
  }

  static async getBadges() {
    const db = await this.getDatabase();

    return await db.getAllAsync<AwardedBadge>(
      `
      SELECT badge_key, unlocked, unlocked_at
      FROM badges
      WHERE deletedAt IS NULL
      `
    );
  }

  // App Meta Table Integration
  static async monthsSinceAppStart() {
    const db = await this.getDatabase();

    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE key = 'app_start_date' AND deletedAt IS NULL"
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
      "SELECT value FROM app_meta WHERE key = 'app_current_streak' AND deletedAt IS NULL"
    );

    return Number(row?.value || 0);
  }

  static async getLastActiveDate() {
    const db = await this.getDatabase();

    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE key = 'app_last_active' AND deletedAt IS NULL"
    );

    if (row) {
      return new Date(row.value);
    }
  }

  static async getAppStartDate() {
    const db = await this.getDatabase();

    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE key = 'app_start_date' AND deletedAt IS NULL"
    );

    if (row) {
      return new Date(row.value);
    }
  }

  static async updateStreak(date: string, currentStreak: number) {
    const db = await this.getDatabase();

    await db.runAsync(
      "UPDATE app_meta SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key = 'app_last_active'",
      [date]
    );
    const lastActiveRow = await db.getFirstAsync<{ uuid: string }>(
      "SELECT uuid FROM app_meta WHERE key = 'app_current_streak'"
    );
    if (lastActiveRow) {
      await this.logChange("app_meta", lastActiveRow.uuid, "update", {
        value: date,
      });
    }

    await db.runAsync(
      "UPDATE app_meta SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key = 'app_current_streak'",
      [String(currentStreak)]
    );
    const streakRow = await db.getFirstAsync<{ uuid: string }>(
      "SELECT uuid FROM app_meta WHERE key = 'app_current_streak'"
    );
    if (streakRow) {
      await this.logChange("app_meta", streakRow.uuid, "update", {
        value: currentStreak,
      });
    }
  }

  static async insertName(name: string) {
    const db = await this.getDatabase();
    const uuid = crypto.randomUUID();

    await db.runAsync(
      "INSERT INTO app_meta (key, uuid, value) VALUES ('user_name', ?, ?)",
      [uuid, name]
    );

    await this.logChange("app_meta", uuid, "create", {
      key: "user_name",
      value: name,
    });
  }

  static async getName() {
    const db = await this.getDatabase();

    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_meta WHERE key = 'user_name' AND deletedAt IS NULL"
    );

    if (row) {
      return row.value;
    }
  }
}
