import badgesJson from "@/assets/data/badges.json";
import DatabaseService from "@/services/DatabaseService";
import { BadgeDefinition, BadgeType } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { Toast } from "toastify-react-native";
export function useBadges() {
  const [reloadFlag, setReloadFlag] = useState(false);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBadges = useCallback(async () => {
    const badgesDefinitions = badgesJson as BadgeDefinition[];
    const definitionsMap = new Map(
      badgesDefinitions.map((def) => [def.id, def])
    );
    try {
      const data = await DatabaseService.getBadges();

      // use data and badgesDefinitions to create badgeType
      const badges: BadgeType[] = data.map((row) => {
        const badgeDefinition = definitionsMap.get(row.id);

        return {
          id: row.id,
          title: badgeDefinition ? badgeDefinition.title : "",
          description: badgeDefinition ? badgeDefinition.description : "",
          unlocked: Boolean(row.unlocked),
          unlocked_at: new Date(row.unlocked_at),
        };
      });

      setBadges(badges);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error occurred loading badges",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBadges();
  }, [loadBadges]);

  useEffect(() => {
    loadBadges();
  }, [reloadFlag, loadBadges]);

  const reload = useCallback(() => setReloadFlag((flag) => !flag), []);
  return { badges, loading, setBadges, reload };
}
