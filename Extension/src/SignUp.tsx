import { type JSX } from "react";
import { CredentialsForm } from "./CredentialsForm";

export function SignUp(): JSX.Element {

  const signUpRequest = async (userName: string, password: string) => {
    const res = await fetch("https://localhost:8080/sign_up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `HTTP error! Status: ${res.status}`);
    }

    return data;
  };

  return (
    <CredentialsForm formTitle={"Sign Up"} requestFunction={signUpRequest} />
  );
}

