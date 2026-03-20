import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuthData } from "./contexts/UserDataContext";
import { usePasswordsEntries } from "./contexts/PasswordsEntriesContext";
import { PasswordEntryInputs, PasswordEntry } from "./PasswordEntryInputs"; 
import { NewPasswordManagerOverlay } from "./NewPassOverlay";
import { Cryptography } from "./Cryptography";
import "./styles/Home.css"

async function getPasswordsDataReq(userName: string | undefined, sessionToken: string | undefined ) {
  if(userName == null || sessionToken == null) return [];
  const res = await fetch("http://localhost:8080/get_passwords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionUserName: userName, sessionToken })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message 
        ? `From Server: ${data.message}` 
        : `From Server: HTTP error! Status: ${res.status}`
    );
  }

  return data;
}

async function postPasswordsInServer(userName: string | undefined, sessionToken: string | undefined, passwords: any) {
  if(userName == null || sessionToken == null) return [];
  const res = await fetch("http://localhost:8080/update_passwords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionUserName: userName, sessionToken, newPasswords: passwords })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message 
        ? `From Server: ${data.message}` 
        : `From Server: HTTP error! Status: ${res.status}`
    );
  }

  return data;
}

function formatPasswordEntries(data:any) {
  if(data == null) return[];
  return data.map(
    (row: any) => (
      new PasswordEntry(row?.id, row?.type, row?.userName, row?.password, row?.iv)
    )
  )
}

export function Home() {
  const [notify, setNotify] = useState<{ message: string; success: boolean } | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");

  const authContext = useUserAuthData();
  const passEntryContext = usePasswordsEntries();
  const navigate = useNavigate();  

  const [newPassOverlayVisibility, setNewPassOverlayVisibility] = useState<boolean>(false);

  const isUnauthenticated: boolean = (
    authContext?.userName == null || authContext?.userName.trim() === "" ||
    authContext?.sessionToken == null || authContext?.sessionToken.trim() === ""
  );

  useEffect(() => {
    if(isUnauthenticated)
      navigate("/login");
  },[isUnauthenticated, navigate]);

  useEffect(() => {
    getPasswordsDataReq(authContext?.userName, authContext?.sessionToken)
    .then (
      async(passwordsData) => {
        const decryptedPasswords = await decryptPasswordsEntries(
          formatPasswordEntries(passwordsData.data)
        );
        if(decryptedPasswords != null) {
          passEntryContext?.setPasswordsEntries(
            decryptedPasswords
          );
        }
      }
    )
    .catch((err: any) => {
      console.error(err);
    })
  }, [passEntryContext?.setPasswordsEntries, authContext]);

  useEffect(() => {
    if (!notify) return;
    const timer = setTimeout(() => setNotify(null), 3000);
    return () => clearTimeout(timer);
  }, [notify]);

  const sendPasswords = async () => {
    if(passEntryContext?.passwordsEntries == null) return;
    const encryptedPasswordsEntries = await encryptPasswordsEntries(passEntryContext?.passwordsEntries);
    if(encryptedPasswordsEntries == null) return;

    const passwords =
      encryptedPasswordsEntries.map(
      (passEntry: PasswordEntry) => (passEntry.formatToJson())
    );

    try {
      const postRes = await postPasswordsInServer(authContext?.userName, authContext?.sessionToken, passwords);
      if(postRes.success && postRes.updated_passwords) {
        const decryptedPasswords = await decryptPasswordsEntries(
          formatPasswordEntries(postRes.updated_passwords)
        );
        if(decryptedPasswords == null) return;
        passEntryContext?.setPasswordsEntries(decryptedPasswords);
      }

      setNotify({ message: postRes.message, success: postRes.success });
    } catch(err: any) {
      console.error(err);
      setNotify({ message: err.message, success: false })
    }
  }

  const newPasswordEntry = () => {
    setNewPassOverlayVisibility(true);
  }

  return (
    <>
      { 
        <NewPasswordManagerOverlay overlayVisibility={newPassOverlayVisibility} setOverlayVisibility={setNewPassOverlayVisibility} />
      }
      {notify && (
        <div className={`notify-div ${notify.success ? "success" : "error"}`}>
          {notify.message}
        </div>
      )}

      <div className="home-container" inert={newPassOverlayVisibility}>
        <div className="topBar-div">
          <input
            placeholder="Search" 
            onChange={event => setSearchValue(event?.target?.value.toLowerCase() ?? "")}
          />
          <button type="submit" onClick={newPasswordEntry}>New</button>
        </div>
        <div className="passEntries-container">
          {
            passEntryContext?.passwordsEntries
              .map((entry:PasswordEntry,index:number) => ({entry,index}))
              .filter(({entry}) => entry.type.toLowerCase().startsWith(searchValue) || searchValue.trim() === "")
              .map(({entry,index}) => (
                <PasswordEntryInputs key={entry.id} passwordEntryIndex={index}/>
              ))
          }
        </div>
        <div className="save-div">
          <button type="submit" className="send-newpass-btn" onClick={sendPasswords}>
            Save
          </button>
        </div>
      </div>
    </>
  );
}

async function encryptPasswordsEntries(passwordEntries: PasswordEntry[]):Promise<PasswordEntry[] | null> {
  const key: CryptoKey | null = Cryptography.getDerivateKey();
  if(key == null) return null;
  return Promise.all(
    passwordEntries.map(
      async (passEntry: PasswordEntry) => {
        const [encryptedPass, iv] = await Cryptography.encrypt(passEntry.password, key);
        return new PasswordEntry(
          passEntry?.id,
          passEntry?.type,
          passEntry?.userName,
          encryptedPass,
          iv
        )
      }
    )
  )
}

async function decryptPasswordsEntries(passwordEntries: PasswordEntry[]): Promise<PasswordEntry[] | null> {
  const key = await Cryptography.getDerivateKey();
  if(key == null) return null;
  return Promise.all(
    passwordEntries.filter((passEntry:PasswordEntry) => passEntry.iv != null)
    .map(
      async (passEntry: PasswordEntry) => {
        const decryptedPass = await Cryptography.decrypt(passEntry.password, passEntry.iv!, key);
        return new PasswordEntry(
          passEntry?.id,
          passEntry?.type,
          passEntry?.userName,
          decryptedPass,
          passEntry.iv
        )
      }
    )
  )
}
