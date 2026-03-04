import { type JSX } from "react";
import { CredentialsForm } from "./CredentialsForm";
import "./styles/FormContainer.css"

export function SignUp(): JSX.Element {
  const signUpRequest = async (userName: string, password: string) => {
    try {
      const res = await fetch("http://localhost:8080/sign_up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userName,
          password
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error("Login request failed:", error);
      throw error;
    }
  }

  return (
    <div className="form-container">
      <h1>Sign Up</h1>
      <CredentialsForm onBtnClicked={signUpRequest}/>
    </div>
  );
}

