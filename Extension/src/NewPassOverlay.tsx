import React, { useState, useRef, useEffect } from "react";
import { usePasswordsEntries } from "./contexts/PasswordsEntriesContext";
import { PasswordEntry } from "./PasswordEntryInputs";
import "./styles/NewPassOverlay.css";
import {X, Dices}  from "lucide-react";
import { checkPasswordStrength } from "./checkPasswordStrength";

interface Props {
  overlayVisibility: boolean;
  setOverlayVisibility: React.Dispatch<React.SetStateAction<boolean>>;
}

export function NewPasswordManagerOverlay({ overlayVisibility, setOverlayVisibility }: Props) {
  const passTypeRef = useRef<HTMLInputElement>(null);
  const passUserNameRef = useRef<HTMLInputElement>(null);
  const passPasswordRef = useRef<HTMLInputElement>(null);

  const [passwordWarningMessage, setPasswordWarningMessage] = useState("");
  const [errors, setErrors] = useState({ type: false, userName: false, password: false });

  const passEntriesContext = usePasswordsEntries();
  const setPasswordEntries = passEntriesContext?.setPasswordsEntries;

  const closeOverlay = () => {
    setOverlayVisibility(false);
    setPasswordWarningMessage("");
  }

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

    const passwordIsValid = checkPasswordStrength(passPassword);
    setPasswordWarningMessage(passwordIsValid.message);

    const newErrors = {
      type: passType === "",
      userName: passUserName === "",
      password: passPassword === "" || !passwordIsValid.success,
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

  const generateRandomPassword = () => {
    const getRandomInt = (max:number) => {
      const maxValid = Math.floor(0xFFFFFFFF / max) * max;
      let rand;
      do {
        rand = window.crypto.getRandomValues(new Uint32Array(1))[0];
      } while (rand >= maxValid);
      return rand % max;
    }

    const getRandomChar = () => {
      const charType = getRandomInt(3);
      const randChar = 
        charType === 0 
          ? 48 + getRandomInt(10)
        :charType === 1
          ? 65 + getRandomInt(26)
          : 97 + getRandomInt(26)
      return String.fromCharCode(randChar);
    }

    let newPassword = "";
    for(let i=0 ; i < 20 + getRandomInt(10) ; i++) {
      newPassword += getRandomChar();
    }
    console.log(newPassword);
    if(passPasswordRef?.current)
      passPasswordRef.current.value = newPassword;
  }

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
          <X />
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
        <div className="passwordDiv">
          <input
            ref={passPasswordRef}
            className={`passPassword-input${errors.password ? " shake" : ""}`}
            placeholder="Password"
            onKeyDown={handleEnterKey}
            type="password"
          />

          <button className="generateRandomPassword" onClick={generateRandomPassword}>
            <Dices />
          </button>
        </div>
        <p
          className={
            passwordWarningMessage === ""
              ? "passwordWarningParag hidden"
              : "passwordWarningParag"
          }
        >
          {passwordWarningMessage}
        </p>

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
