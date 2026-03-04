import { useState, createContext, type ReactNode, useContext } from "react";

type userDataContext = {
  userName:string,
  setUserName: React.Dispatch<React.SetStateAction<string>>,
  password:string,
  setPassword: React.Dispatch<React.SetStateAction<string>>
}

const userAuthData = createContext<userDataContext | null>(null);

export function UserAuthDataProvider({children}: {children: ReactNode}) {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <userAuthData.Provider value={{userName, setUserName, password, setPassword}}>
      {children}
    </userAuthData.Provider>
  );
}

export function useUserAuthData() {
  const context = useContext(userAuthData);
  return context;
}
