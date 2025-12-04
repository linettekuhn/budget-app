import { CategoryType } from "@/types";
import React, { createContext, ReactNode, useContext, useState } from "react";

type OnboardingState = {
  categories: CategoryType[];
  budgets: Record<number, { raw: string; display: string }>;
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
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<OnboardingState>({
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

  return (
    <OnboardingContext.Provider value={{ state, setState, reset }}>
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
