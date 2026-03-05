import { type JSX } from "react";
import { CredentialsForm } from "./CredentialsForm";

export function Login(): JSX.Element {

  const signUpRequest = async (userName: string, password: string) => {
    const res = await fetch("http://localhost:8080/login", {
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
    <CredentialsForm formTitle={"Login"} requestFunction={signUpRequest} />
  );
}

