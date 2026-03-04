import {type JSX } from "react";
import { CredentialsForm } from "./CredentialsForm";
import "./styles/FormContainer.css"

export function Login(): JSX.Element {
  const sendLoginInfo = (userName: string, password: string) => {
  };

  const signInClicked = () => {
    window.location.href = "";
  }

  return (
    <div className="form-container">
      <h1>Login</h1>
      <CredentialsForm onBtnClicked={sendLoginInfo}/>
      <a className="signIn-link" href=" " onClick={signInClicked}>create Account</a>
    </div>
  );
}
