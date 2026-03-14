import { useState } from "react";
import { usePasswordsEntries } from "./contexts/PasswordsEntriesContext";
import { useUserAuthData } from "./contexts/UserDataContext";
import Close  from "./assets/Close";
import OpenedEye from "./assets/OpenedEye";
import ClosedEye from "./assets/ClosedEye";
import "./styles/PasswordEntryInputs.css";

export class PasswordEntry {
  id: string | undefined;
  type: string;
  userName: string;
  password: string;

  constructor(id: string | undefined, type: string, userName: string, password: string) {
    this.id = id;
    this.type = type;
    this.userName = userName;
    this.password = password;
  }

  formatToJson(): any {
    return {
      id: this.id,
      type: this.type,
      userName: this.userName,
      password: this.password
    };
  }
};


async function removePasswordEntryReq (
  userName: string | undefined,
  sessionToken: string | undefined,
  passwordEntryToRemove: PasswordEntry | undefined
) {
  if(userName == null || sessionToken == null) return [];
  const res = await fetch("http://localhost:8080/remove_password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionUserName: userName, sessionToken , passwordEntryToRemove})
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`From Server: ${data.message}` || `From Server: HTTP error! Status: ${res.status}`);
  }

  return data;
}
export function PasswordEntryInputs ({passwordEntryIndex}:{passwordEntryIndex:number}){
  const [displayPassword, setDisplayPassword] = useState<boolean>(false);
  const passEntriesContext = usePasswordsEntries();
  const authContext = useUserAuthData();
  const setPassEntry: React.Dispatch<React.SetStateAction<PasswordEntry[]>> | undefined = passEntriesContext?.setPasswordsEntries;
  const currentPassEntry: PasswordEntry | undefined = passEntriesContext?.passwordsEntries[passwordEntryIndex];

  const userNameInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUserName = event.target?.value;
    if (setPassEntry != null) {
      setPassEntry(data => {
        const updated = [...data];
        const entry = new PasswordEntry(updated[passwordEntryIndex].id, updated[passwordEntryIndex].type, newUserName, updated[passwordEntryIndex].password);
        updated[passwordEntryIndex] = entry;
        return updated;
      });
    }
  }

  const passwordInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target?.value;
    if (setPassEntry != null) {
      setPassEntry(data => {
        const updated = [...data];
        const entry = new PasswordEntry(updated[passwordEntryIndex].id, updated[passwordEntryIndex].type, updated[passwordEntryIndex].userName, newPassword);
        updated[passwordEntryIndex] = entry;
        return updated;
      });
    }
  }

  const deletePassEntry = async () => {
    const sessionUserName = authContext?.userName;
    const sessionToken = authContext?.sessionToken;
    if(currentPassEntry?.id != null) {
      removePasswordEntryReq(sessionUserName, sessionToken, currentPassEntry);
    }
    if (setPassEntry != null) {
      setPassEntry(data => {
        const updated = data.filter(
          (_: PasswordEntry,index: number) => (passwordEntryIndex !== index)
        );
        return updated;
      });
    }

  }

  return (
    <div className="passwordEntry-container">
      <div className="inputs-container">

        <div className="input-row">
          <p className="username-parag">{currentPassEntry?.type}:</p>
          <input 
            className="usernameEntry-input"
            defaultValue={currentPassEntry?.userName ?? ""}
            onChange={userNameInputChanged}
           />
        </div>

        <div className="input-row">
          <p>Password:</p>
          <div className="input-container">
            <input 
              className="passwordEntry-input" 
              defaultValue={currentPassEntry?.password ?? ""} 
              onChange={passwordInputChanged}
              type={displayPassword ? "text" : "password"}
            />
            <button 
              type="submit" 
              className="displayPassword" 
              onClick={() => setDisplayPassword(state => !state)}
            >
              {displayPassword ? <ClosedEye/> : <OpenedEye/>}
            </button>

          </div>
        </div>
      </div>
      <button type="button" className="deletePassEntry-btn" onClick={deletePassEntry}>
        <Close/>
      </button>
    </div>
  );
}
