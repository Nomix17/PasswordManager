import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuthData } from "./contexts/UserDataContext";
import { usePasswordsEntries } from "./contexts/PasswordsEntriesContext";
import { PasswordEntryInputs, PasswordEntry } from "./PasswordEntryInputs"; 
import { NewPasswordManagerOverlay } from "./NewPassOverlay";
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
    throw new Error(`From Server: ${data.message}` || `From Server: HTTP error! Status: ${res.status}`);
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
    throw new Error(`From Server: ${data.message}` || `From Server: HTTP error! Status: ${res.status}`);
  }

  return data;
}

function formatPasswordEntries(data:any) {
  if(data == null) return[];
  return data.map(
    (row: any) => (
      new PasswordEntry(row?.id, row?.type, row?.userName, row?.password)
    )
  );
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
      passwordsData => {
        passEntryContext?.setPasswordsEntries(
          formatPasswordEntries(passwordsData?.data)
        );
      }
    )
    .catch((err: any) => {
      console.error(err.message);
    })
  }, [passEntryContext?.setPasswordsEntries, authContext]);

  useEffect(() => {
    if (!notify) return;
    const timer = setTimeout(() => setNotify(null), 3000);
    return () => clearTimeout(timer);
  }, [notify]);

  const sendPasswords = async () => {
    const passwords =  
      passEntryContext?.passwordsEntries.map(
      (passEntry: PasswordEntry) => (passEntry.formatToJson())
    );

    try {
      const postRes = await postPasswordsInServer(authContext?.userName, authContext?.sessionToken, passwords);
      if(postRes.success && postRes.updated_passwords) {
        passEntryContext?.setPasswordsEntries(formatPasswordEntries(postRes.updated_passwords));
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

      <div className="home-container">
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
