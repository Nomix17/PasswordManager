import { usePasswordsEntries } from "./contexts/PasswordsEntriesContext";
import "./styles/PasswordEntryInputs.css";

export class PasswordEntry {
  id: string;
  type: string;
  userName: string;
  password: string;

  constructor(id: string, type: string, userName: string, password: string) {
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

export function PasswordEntryInputs ({passwordEntryIndex}:{passwordEntryIndex:number}){
  const passEntriesContext = usePasswordsEntries();
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

  const deletePassEntry = () => {
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
          <input 
            className="passwordEntry-input" 
            defaultValue={currentPassEntry?.password ?? ""} 
            onChange={passwordInputChanged}
          />
        </div>
      </div>
      <button type="button" className="deletePassEntry-btn" onClick={deletePassEntry}>✕</button>
    </div>
  );
}
