import { BadgeService } from "@/services/BadgeService";
import { useCallback } from "react";

export const useBadgeCheck = () => {
  const checkBadges = useCallback(async () => {
    try {
      await BadgeService.checkBadges();
    } catch (error) {
      console.error("Failed to check badges:", error);
    }
  }, []);

  return { checkBadges };
};
