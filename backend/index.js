import cors from "cors";
import express from "express";
import fs from "fs";
import cron from "node-cron";

// create server app
const app = express();

// use middleware to allow CORS and JSON parsing
app.use(cors());
app.use(express.json());

const TOKENS_FILE_PATH = "./tokens.json";

// returns tokens.json file as object
function readTokens() {
  return JSON.parse(fs.readFileSync(TOKENS_FILE_PATH, "utf-8"));
}

// save JSON object to tokens.json
function saveTokens(data) {
  fs.writeFileSync(TOKENS_FILE_PATH, JSON.stringify(data, null, 2));
}

// endpoint to register push token (identify users to send push)
app.post("/register-push-token", (req, res) => {
  // get token and userId from request body
  const { userId, token } = req.body;
  if (!userId || !token)
    return res.status(400).json({ error: "Missing userId or token" });

  // get stored tokens
  const tokens = readTokens();
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

// daily streak reminder scheduler
cron.schedule("0 20 * * *", async () => {
  // get stored tokens
  const tokens = readTokens();
  const now = Date.now();

  // loop through all tokens
  for (const user of tokens.users) {
    // skip users that opt out
    const userSettings = user.settings ?? {
      daily: true,
      weekly: true,
      midMonth: true,
    };

    if (!userSettings.daily) continue;

    const lastActive = user.lastActive || 0;
    const hoursSinceActive = (now - lastActive) / 1000 / 3600;
    const userStreak = user.currentStreak || 1;

    // only send notif if user has been inactive for more than 12 hours
    if (hoursSinceActive >= 12 && userStreak >= 2) {
      try {
        await sendPush(
          user.token,
          "Daily Streak Reminder",
          "Don't let the streak die! Check your budget today."
        );
      } catch (e) {
        console.error(`Failed to send push to ${user.userId}:`, e);
      }
    }
  }
});

// weekly summary scheduler
cron.schedule("0 9 * * 0", async () => {
  // get stored tokens
  const tokens = readTokens();

  // loop through all tokens
  for (const user of tokens.users) {
    // skip users that opt out
    const userSettings = user.settings ?? {
      daily: true,
      weekly: true,
      midMonth: true,
    };

    if (!userSettings.weekly) continue;

    // get weekly spent
    const weeklySpent = user.weeklySpent || 0;

    // send weekly summary if user has spent this week
    if (weeklySpent > 0) {
      try {
        await sendPush(
          user.token,
          "Weekly Summary",
          `You've spent $${weeklySpent} this week. Keep tracking!`
        );
      } catch (e) {
        console.error(`Failed to send push to ${user.userId}:`, e);
      }
    } else {
      try {
        await sendPush(
          user.token,
          "Weekly Summary",
          `You haven't spent anything this week. Remember to track your expenses!`
        );
      } catch (e) {
        console.error(`Failed to send push to ${user.userId}:`, e);
      }
    }
  }
});

// half month summary scheduler
cron.schedule("0 9 15 * *", async () => {
  // get stored tokens
  const tokens = readTokens();

  // loop through all tokens
  for (const user of tokens.users) {
    // skip users that opt out
    const userSettings = user.settings ?? {
      daily: true,
      weekly: true,
      midMonth: true,
    };

    if (!userSettings.midMonth) continue;

    // get spent percent
    const spentPercent = user.spentPercent || 0;

    // send mid-month budget check in
    if (spentPercent > 0) {
      try {
        await sendPush(
          user.token,
          "Mid-Month Budget Check",
          `You're halfway through the month and you've spent ${spentPercent}% of your budget.`
        );
      } catch (e) {
        console.error(`Failed to send push to ${user.userId}:`, e);
      }
    }
  }
});

app.listen(3005, () => console.log("Push backend running on port 3005"));
