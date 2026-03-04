import { type JSX } from "react";
import { CredentialsForm } from "./CredentialsForm";
import "./styles/FormContainer.css"

export function SignIn(): JSX.Element {
  const sendSignInInfo = (userName: string, password: string) => {
  };

  return (
    <div className="form-container">
      <h1>Sign In</h1>
      <CredentialsForm onBtnClicked={sendSignInInfo}/>
    </div>
  );
}

