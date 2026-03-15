import React, { useState, useRef, useEffect } from "react";
import { usePasswordsEntries } from "./contexts/PasswordsEntriesContext";
import { PasswordEntry } from "./PasswordEntryInputs";
import "./styles/NewPassOverlay.css";
import Close  from "./assets/Close";

interface Props {
  overlayVisibility: boolean;
  setOverlayVisibility: React.Dispatch<React.SetStateAction<boolean>>;
}

export function NewPasswordManagerOverlay({ overlayVisibility, setOverlayVisibility }: Props) {
  const passTypeRef = useRef<HTMLInputElement>(null);
  const passUserNameRef = useRef<HTMLInputElement>(null);
  const passPasswordRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState({ type: false, userName: false, password: false });

  const setPasswordEntries = usePasswordsEntries()?.setPasswordsEntries;

  const closeOverlay = () => setOverlayVisibility(false);


  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOverlayVisibility(false);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  },[setOverlayVisibility]);

  const addNewPasswordEntry = () => {
    const passType = passTypeRef.current?.value.trim() ?? "";
    const passUserName = passUserNameRef.current?.value.trim() ?? "";
    const passPassword = passPasswordRef.current?.value.trim() ?? "";

    const newErrors = {
      type: passType === "",
      userName: passUserName === "",
      password: passPassword === "",
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      setTimeout(() => setErrors({ type: false, userName: false, password: false }), 600);
      return;

    } else if(
        passTypeRef.current &&
        passUserNameRef.current &&
        passPasswordRef.current
    ) {
      passTypeRef.current.value = "";
      passUserNameRef.current.value = "";
      passPasswordRef.current.value = "";
    }

    const newEntry = new PasswordEntry(undefined, passType, passUserName, passPassword);
    setPasswordEntries?.((data: PasswordEntry[]) => [...data, newEntry]);

    closeOverlay();
  };

  const handleEnterKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      addNewPasswordEntry();
    }
  }

  return (
    <div 
      className={overlayVisibility ? "newPassOverlay-div" : "newPassOverlay-div hidden"} 
    >
      <div className="newPass-div">
        <button className="close-btn" type="submit" aria-label="Close" onClick={closeOverlay}>
          <Close />
        </button>
        <h1>New Password</h1>

        <input
          ref={passTypeRef}
          className={`passType-input${errors.type ? " shake" : ""}`}
          placeholder="Type"
          onKeyDown={handleEnterKey}
        />
        <input
          ref={passUserNameRef}
          className={`passUserName-input${errors.userName ? " shake" : ""}`}
          placeholder="Username / Email"
          onKeyDown={handleEnterKey}
        />
        <input
          ref={passPasswordRef}
          className={`passPassword-input${errors.password ? " shake" : ""}`}
          placeholder="Password"
          onKeyDown={handleEnterKey}
          type="password"
        />

        <div className="button-group">
          <button type="submit" className="secondary-btn" onClick={closeOverlay}>
            Cancel
          </button>
          <button type="submit" className="primary-btn" onClick={addNewPasswordEntry}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
