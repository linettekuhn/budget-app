import DatabaseService from "@/services/DatabaseService";
import { IncomeSource, PayType } from "@/types";
import {
  buildPaydayRule,
  derivePayAmount,
  getTotalIncomeForMonth,
  toDateString,
} from "@/utils/incomeUtils";
import * as crypto from "expo-crypto";
import { useCallback, useEffect, useState } from "react";
import { Toast } from "toastify-react-native";

export function useIncomeSources() {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadFlag, setReloadFlag] = useState(false);

  const reload = useCallback(() => setReloadFlag((flag) => !flag), []);

  const loadSources = useCallback(async () => {
    try {
      const data = await DatabaseService.getActiveIncomeSources();
      setSources(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Toast.show({
          type: "error",
          text1: error.message,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "An error occurred loading income sources",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSources();
  }, [loadSources, reloadFlag]);

  const addIncomeSource = useCallback(
    async (input: {
      name: string;
      basisType: PayType;
      basisAmount: number;
      hoursPerWeek: number | null;
    }) => {
      try {
        const today = new Date();
        const startDate = toDateString(today);
        const payAmount = derivePayAmount(
          input.basisType,
          input.basisAmount,
          input.hoursPerWeek,
        );
        const paydayRule = buildPaydayRule(input.basisType, today);

        await DatabaseService.saveIncomeSource({
          id: crypto.randomUUID(),
          name: input.name,
          basisType: input.basisType,
          basisAmount: input.basisAmount,
          payAmount,
          paydayRule,
          startDate,
          endDate: null,
          hoursPerWeek: input.hoursPerWeek,
          effectiveFrom: startDate,
          sourceVersion: 1,
        });

        reload();
        Toast.show({ type: "success", text1: "Income source added!" });
      } catch (error) {
        Toast.show({
          type: "error",
          text1:
            error instanceof Error
              ? error.message
              : "Failed to add income source",
        });
      }
    },
    [reload],
  );

  const editIncomeSource = useCallback(
    async (
      id: string,
      input: {
        name: string;
        basisType: PayType;
        basisAmount: number;
        hoursPerWeek: number | null;
      },
    ) => {
      try {
        const payAmount = derivePayAmount(
          input.basisType,
          input.basisAmount,
          input.hoursPerWeek,
        );
        const paydayRule = buildPaydayRule(input.basisType, new Date());

        await DatabaseService.editIncomeSource(id, {
          name: input.name,
          basisType: input.basisType,
          basisAmount: input.basisAmount,
          payAmount,
          paydayRule,
          hoursPerWeek: input.hoursPerWeek,
        });

        reload();
        Toast.show({ type: "success", text1: "Income updated!" });
      } catch (error) {
        Toast.show({
          type: "error",
          text1:
            error instanceof Error ? error.message : "Failed to update income",
        });
      }
    },
    [reload],
  );

  const deactivateIncomeSource = useCallback(
    async (id: string) => {
      try {
        await DatabaseService.deactivateIncomeSource(id);
        reload();
        Toast.show({ type: "success", text1: "Income source removed." });
      } catch (error) {
        Toast.show({
          type: "error",
          text1:
            error instanceof Error
              ? error.message
              : "Failed to remove income source",
        });
      }
    },
    [reload],
  );

  const getMonthlyTotal = useCallback(
    (year: number, month: number): number => {
      return getTotalIncomeForMonth(sources, year, month);
    },
    [sources],
  );

  return {
    sources,
    loading,
    reload,
    addIncomeSource,
    editIncomeSource,
    deactivateIncomeSource,
    getMonthlyTotal,
  };
}
