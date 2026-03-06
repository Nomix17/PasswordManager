import { useState, createContext, type ReactNode, useContext } from "react";
import { PasswordEntry } from "../PasswordEntryInputs";

type PasswordEntriesContextType = {
  passwordsEntries: PasswordEntry[];
  setPasswordsEntries: React.Dispatch<React.SetStateAction<PasswordEntry[]>>;
} | null;

const passwordsEntriesContext = createContext<PasswordEntriesContextType>(null);

export function PasswordEntriesProvider({children}: {children: ReactNode}) {
  const [passwordsEntries, setPasswordsEntries] = useState<PasswordEntry[]>([]);

  return (
    <passwordsEntriesContext.Provider value={{passwordsEntries, setPasswordsEntries}}>
      {children}
    </passwordsEntriesContext.Provider>
  );
}

export function usePasswordsEntries() {
  const context = useContext(passwordsEntriesContext);
  return context;
}
