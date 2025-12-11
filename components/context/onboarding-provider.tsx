import DatabaseService from "@/services/DatabaseService";
import { CategoryType } from "@/types";
import { useRouter } from "expo-router";
import React, { createContext, ReactNode, useContext, useState } from "react";

type OnboardingState = {
  name: string;
  categories: CategoryType[];
  budgets: Record<string, { raw: string; display: string }>;
  salary: {
    type: "Hourly" | "Biweekly" | "Monthly" | "Yearly" | "Varies";
    amount: number;
    monthly: number;
    hoursPerWeek: number;
  };
};

// handles the onboarding state available to all children of context
type OnboardingContextType = {
  state: OnboardingState;
  setState: React.Dispatch<React.SetStateAction<OnboardingState>>;
  reset: () => void;
  resetOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [state, setState] = useState<OnboardingState>({
    name: "",
    categories: [],
    budgets: {},
    salary: {
      type: "Hourly",
      amount: 0,
      monthly: 0,
      hoursPerWeek: 0,
    },
  });

  const reset = () => {
    setState({
      name: "",
      categories: [],
      budgets: {},
      salary: {
        type: "Hourly",
        amount: 0,
        monthly: 0,
        hoursPerWeek: 0,
      },
    });
  };

  const resetOnboarding = async () => {
    await DatabaseService.clearCategories();
    await DatabaseService.seedDefaultCategories();

    reset();

    router.replace("/welcome");
  };

  return (
    <OnboardingContext.Provider
      value={{ state, setState, reset, resetOnboarding }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    console.log("no context");
    throw new Error("useOnboarding must be inside <OnboardingProvider>");
  }
  return context;
};
