import { useEffect } from "react";
import { useUserAuthData } from "./contexts/UserDataContext";
import { useNavigate } from "react-router-dom";

export function Home() {
  const context = useUserAuthData();
  const navigate = useNavigate();  

  const isUnauthenticated: boolean = (context?.userName == null ||
                             context?.sessionToken == null ||
                             context?.userName.trim() === "" ||
                             context?.sessionToken.trim() === "");

  useEffect(() => {
    if(isUnauthenticated)
      navigate("/login");
  },[isUnauthenticated, navigate]);

  return (
    <>
      <h1>Welcome {context?.userName}</h1>
      <h2>Session Token: {context?.sessionToken}</h2>
    </>
  );
}
