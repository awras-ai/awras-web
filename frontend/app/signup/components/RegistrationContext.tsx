"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { RegistrationData, initialRegistrationData } from "../../signup/types";

interface RegistrationContextType {
  data: RegistrationData;
  setData: (data: Partial<RegistrationData>) => void;
}

const RegistrationContext = createContext<RegistrationContextType | null>(null);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [data, setRegistrationData] = useState<RegistrationData>(
    initialRegistrationData,
  );

  const setData = (newData: Partial<RegistrationData>) => {
    setRegistrationData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <RegistrationContext.Provider value={{ data, setData }}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error("useRegistration must be used within RegistrationProvider");
  }
  return context;
}
