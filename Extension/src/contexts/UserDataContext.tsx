import { useState, createContext, type ReactNode, useContext } from "react";

type userDataContext = {
  userName:string,
  setUserName: React.Dispatch<React.SetStateAction<string>>,
  sessionToken:string,
  setSessionToken: React.Dispatch<React.SetStateAction<string>>
}

const userAuthData = createContext<userDataContext | null>(null);

export function UserAuthDataProvider({children}: {children: ReactNode}) {
  const [userName, setUserName] = useState<string>("");
  const [sessionToken, setSessionToken] = useState<string>("");

  return (
    <userAuthData.Provider value={{userName, setUserName, sessionToken, setSessionToken}}>
      {children}
    </userAuthData.Provider>
  );
}

export function useUserAuthData() {
  const context = useContext(userAuthData);
  return context;
}
