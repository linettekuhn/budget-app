import DatabaseService from "./DatabaseService";

export default class StreakService {
  static async updateStreak() {
    const today = new Date();
    let lastActive = await DatabaseService.getLastActiveDate();
    let currentStreak = await DatabaseService.getStreak();

    if (!lastActive) {
      lastActive = today;
      await DatabaseService.updateStreak(today.toISOString(), 1);
      return 1;
    }

    const daysDiff = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    // no days have passed, keep streak
    if (daysDiff === 0) {
      return currentStreak;
    }

    // one day has passed, increase streak
    if (daysDiff === 1) {
      currentStreak += 1;
    } else {
      // more than one day passed, reset streak
      currentStreak = 1;
    }

    // update streak in database
    await DatabaseService.updateStreak(today.toISOString(), currentStreak);
    return currentStreak;
  }
}
