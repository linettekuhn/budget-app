import cors from "cors";
import express from "express";
import { readFileSync, renameSync, writeFileSync } from "fs";
import cron from "node-cron";

// create server app
const app = express();

// use middleware to allow CORS and JSON parsing
app.use(cors());
app.use(express.json());

const TOKENS_FILE_PATH = "./tokens.json";

// DEV ONLY. set to null in production
const DEV_TEST_USER_ID = null;

// returns tokens.json file as object
function readTokens() {
  try {
    return JSON.parse(readFileSync(TOKENS_FILE_PATH, "utf-8"));
  } catch {
    const empty = { users: [] };
    saveTokens(empty);
    return empty;
  }
}

// save JSON object to tokens.json atomically
function saveTokens(data) {
  const tmp = TOKENS_FILE_PATH + ".tmp";
  writeFileSync(tmp, JSON.stringify(data, null, 2));
  renameSync(tmp, TOKENS_FILE_PATH);
}

// endpoint to register push token (identify users to send push)
app.post("/register-push-token", (req, res) => {
  // get token and userId from request body
  const { userId, token } = req.body;
  if (!userId || !token)
    return res.status(400).json({ error: "Missing userId or token" });

  // get stored tokens
  const tokens = readTokens();

  // remove this notification token from any other user that has it
  tokens.users = tokens.users.filter(
    (user) => user.token !== token || user.userId === userId,
  );

  const existing = tokens.users.find((user) => user.userId === userId);

  // update or store new token
  if (existing) {
    existing.token = token;
    existing.lastActive = Date.now();
  } else {
    tokens.users.push({
      userId,
      token,
      lastActive: Date.now(),
    });
  }

  // save tokens to file
  saveTokens(tokens);

  res.json({ ok: true });
});

// endpoint to update last active
app.post("/ping", (req, res) => {
  const { userId, spentPercent, weeklySpent, currentStreak } = req.body;

  // get stored tokens
  const tokens = readTokens();

  // update last active of user to now
  const user = tokens.users.find((user) => user.userId === userId);
  if (user) {
    user.lastActive = Date.now();
    user.spentPercent = spentPercent;
    user.weeklySpent = weeklySpent;
    user.currentStreak = currentStreak;
  }

  // save tokens to file
  saveTokens(tokens);

  res.json({ ok: true });
});

// endpoint to update notification settings
app.post("/update-notification-settings", (req, res) => {
  const { userId, settings } = req.body;

  // get stored tokens
  const tokens = readTokens();

  // update user settings
  const user = tokens.users.find((user) => user.userId === userId);
  if (user && settings) {
    user.settings = {
      daily: settings.daily ?? user.settings?.daily ?? true,
      weekly: settings.weekly ?? user.settings?.weekly ?? true,
      midMonth: settings.midMonth ?? user.settings?.midMonth ?? true,
    };
  }

  // save tokens to file
  saveTokens(tokens);

  res.json({ ok: true });
});

// sends push notification via expo
async function sendPush(token, title, body) {
  const message = {
    to: token,
    sound: "default",
    title: title,
    body: body,
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

function getDateKey() {
  return new Date().toISOString().slice(0, 10); // "2026-04-21"
}

function getWeekKey() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

// daily streak reminder scheduler
cron.schedule(
  "0 20 * * *",
  async () => {
    console.log(`[${new Date().toISOString()}] Daily cron fired`);
    const tokens = readTokens();
    const today = getDateKey();

    for (const user of tokens.users) {
      // DEV: only send to test user, skip everyone else
      if (DEV_TEST_USER_ID && user.userId !== DEV_TEST_USER_ID) {
        console.log(`[DEV] Skipping daily for non-test user ${user.userId}`);
        continue;
      }

      const userSettings = user.settings ?? {
        daily: true,
        weekly: true,
        midMonth: true,
      };
      if (!userSettings.daily) continue;
      if (user.lastSentDaily === today) {
        console.log(`[${user.userId}] Daily already sent today, skipping`);
        continue;
      }

      const lastActive = user.lastActive || 0;
      const hoursSinceActive = (Date.now() - lastActive) / 1000 / 3600;
      const userStreak = user.currentStreak || 1;

      if (hoursSinceActive >= 12 && userStreak >= 2) {
        try {
          console.log(`[${user.userId}] Sending daily reminder`);
          await sendPush(
            user.token,
            "Daily Streak Reminder",
            "Don't let the streak die! Check your budget today.",
          );
          user.lastSentDaily = today;
        } catch (e) {
          console.error(`Failed to send push to ${user.userId}:`, e);
        }
      } else {
        console.log(
          `[${user.userId}] Daily skipped — hoursSinceActive: ${hoursSinceActive.toFixed(2)}, streak: ${userStreak}`,
        );
      }
    }

    saveTokens(tokens);
  },
  { timezone: "America/New_York" },
);

// weekly summary scheduler
cron.schedule(
  "0 9 * * 0",
  async () => {
    console.log(`[${new Date().toISOString()}] Weekly cron fired`);
    const tokens = readTokens();
    const weekKey = getWeekKey();

    for (const user of tokens.users) {
      // DEV: only send to test user, skip everyone else
      if (DEV_TEST_USER_ID && user.userId !== DEV_TEST_USER_ID) {
        console.log(`[DEV] Skipping weekly for non-test user ${user.userId}`);
        continue;
      }

      const userSettings = user.settings ?? {
        daily: true,
        weekly: true,
        midMonth: true,
      };
      if (!userSettings.weekly) continue;
      if (user.lastSentWeekly === weekKey) {
        console.log(`[${user.userId}] Weekly already sent this week, skipping`);
        continue;
      }

      const hoursSinceActive =
        (Date.now() - (user.lastActive || 0)) / 1000 / 3600;
      const weeklySpent = user.weeklySpent || 0;

      try {
        console.log(`[${user.userId}] Sending weekly summary`);
        if (weeklySpent > 0 && hoursSinceActive < 48) {
          await sendPush(
            user.token,
            "Weekly Summary",
            `You've spent $${weeklySpent} this week. Keep tracking!`,
          );
          user.lastSentWeekly = weekKey;
        } else if (hoursSinceActive < 48) {
          await sendPush(
            user.token,
            "Weekly Summary",
            `You haven't logged any spending this week. Open the app to track your expenses!`,
          );
          user.lastSentWeekly = weekKey;
        } else {
          console.log(
            `[${user.userId}] Weekly skipped. Data too stale (${hoursSinceActive.toFixed(2)}h)`,
          );
        }
      } catch (e) {
        console.error(`Failed to send push to ${user.userId}:`, e);
      }
    }

    saveTokens(tokens);
  },
  { timezone: "America/New_York" },
);

// half month summary scheduler
cron.schedule(
  "0 9 15 * *",
  async () => {
    console.log(`[${new Date().toISOString()}] Mid-month cron fired`);
    const tokens = readTokens();
    const monthKey = getMonthKey();

    for (const user of tokens.users) {
      // DEV: only send to test user, skip everyone else
      if (DEV_TEST_USER_ID && user.userId !== DEV_TEST_USER_ID) {
        console.log(
          `[DEV] Skipping mid-month for non-test user ${user.userId}`,
        );
        continue;
      }

      const userSettings = user.settings ?? {
        daily: true,
        weekly: true,
        midMonth: true,
      };
      if (!userSettings.midMonth) continue;
      if (user.lastSentMidMonth === monthKey) {
        console.log(
          `[${user.userId}] Mid-month already sent this month, skipping`,
        );
        continue;
      }

      const hoursSinceActive =
        (Date.now() - (user.lastActive || 0)) / 1000 / 3600;
      const spentPercent = user.spentPercent || 0;

      if (spentPercent > 0 && hoursSinceActive < 48) {
        try {
          await sendPush(
            user.token,
            "Mid-Month Budget Check",
            `You're halfway through the month and you've spent ${spentPercent}% of your budget.`,
          );
          user.lastSentMidMonth = monthKey;
        } catch (e) {
          console.error(`Failed to send push to ${user.userId}:`, e);
        }
      } else if (hoursSinceActive < 48) {
        try {
          await sendPush(
            user.token,
            "Mid-Month Budget Check",
            `You're halfway through the month. Open the app to check your budget!`,
          );
          user.lastSentMidMonth = monthKey;
        } catch (e) {
          console.error(`Failed to send push to ${user.userId}:`, e);
        }
      } else {
        console.log(
          `[${user.userId}] Mid-month skipped. Data too stale (${hoursSinceActive.toFixed(2)}h)`,
        );
      }
    }

    saveTokens(tokens);
  },
  { timezone: "America/New_York" },
);

app.listen(3005, () => console.log("Push backend running on port 3005"));

app.get("/", (req, res) => {
  res.send("Piggy backend is running!");
});
