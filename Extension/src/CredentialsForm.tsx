import React, { useState, useRef, type JSX } from "react";
import "./styles/CredentialsForm.css"
import { useNavigate } from 'react-router-dom';
import { useUserAuthData } from "./contexts/UserDataContext";
import { LoadingGif } from "./LoadingGif";
import { Cryptography } from "./Cryptography";
import { checkPasswordStrength } from "./checkPasswordStrength";

export function CredentialsForm({formTitle, requestFunction}: {
  formTitle:string,
  requestFunction:Function
}): JSX.Element {

  const context = useUserAuthData();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const userNameInput  = useRef<HTMLInputElement>(null);
  const passwordInput  = useRef<HTMLInputElement>(null);

  const sendCredential = async (userName: string, password: string) => {
    setIsLoading(true);
    setResponseMessage(null);
    setIsError(false);
    try {
      const hashedPass = await Cryptography.hashSHA256(password);
      const data = await requestFunction(userName, hashedPass);
      context?.setSessionToken(data.sessionToken);
      context?.setUserName(userName);
      if (data.success) {
        try {
          const res = await Cryptography.derivateKeyFromPassword(userName,password);
          if (!res.success)
            throw new Error(res.err_msg ?? "Unknown Error");

          setResponseMessage("Account created! Redirecting...");
          navigate("/home");
        } catch(error) {
          console.log(error);
        }
      } else {
        setIsError(true);
        setResponseMessage(data.message || `${formTitle} failed. Please try again.`);
      }
    } catch (error) {
      console.error(`${formTitle} request failed:`, error);
      setIsError(true);
      setResponseMessage(error instanceof Error ? error.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserData = () => {
    const userNameValue = userNameInput.current?.value;
    const passwordValue = passwordInput.current?.value;

    if( userNameValue != null && passwordValue != null ) {
      if(userNameValue.trim() !== "" && passwordValue.trim() !== "") {
        const passwordStrenghtRes = checkPasswordStrength(passwordValue)
        const passwordIsValid = passwordStrenghtRes?.success || formTitle.toLowerCase() === "login";
        if(passwordIsValid) {
          setResponseMessage("")
          sendCredential(userNameValue, passwordValue);
        } else {
          setResponseMessage(passwordStrenghtRes?.message)
        }

      } else if (userNameValue.trim() !== "") {
        setResponseMessage("Please enter your password")
      } else if(passwordValue.trim() !== "") {
        setResponseMessage("Please enter your username")
      } else {
        setResponseMessage("Please enter you username and password")
      }
    }
  }

  const handleEnterKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      getUserData();
    }
  };

  return (
    <div className="form-container">

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <p className="dummy-text"></p>
            <LoadingGif/>
            <p className="loading-text">
              {formTitle.toLowerCase() === "login" 
                ? "Verifying your credentials..." 
                : "Setting up your account..."}
            </p>
          </div>
        </div>
      )}

      <h1>{formTitle}</h1>
      <div className="form-div">
        <input className="username-input" placeholder="UserName" onKeyDown={handleEnterKey} ref={userNameInput} />
        <input className="password-input" type="password" placeholder="Password" onKeyDown={handleEnterKey} ref={passwordInput} />
        {responseMessage && (
          <p className={`response-message ${isError ? "response-error" : "response-success"}`}>
            {responseMessage}
          </p>
        )}

        <button className="send-btn" type="submit" onClick={getUserData}>Submit</button>

        <a className={formTitle.toLowerCase() === "login" ? "signUp-link" : "signUp-link  hidden"} href="/sign_up">
          Create Account
        </a>
      </div>
    </div>
  );
}
