import { useRef, type JSX } from "react";
import "./styles/CredentialsForm.css"

export function CredentialsForm({onBtnClicked}: {onBtnClicked:Function}): JSX.Element {
  
  const userNameInput  = useRef<HTMLInputElement>(null);
  const passwordInput  = useRef<HTMLInputElement>(null);
  const warningsParag = useRef<HTMLParagraphElement>(null);

  const getUserData = () => {
    const userNameValue = userNameInput.current?.value;
    const passwordValue = passwordInput.current?.value;

    if( warningsParag.current && userNameValue != null && passwordValue != null ) {
      if( userNameValue.trim() !== "" && passwordValue.trim() !== "") {
        onBtnClicked(userNameValue, passwordValue);
        warningsParag.current.textContent = "";

      } else if (userNameValue.trim() !== "") {
        warningsParag.current.textContent = "Please enter your username";
      } else if(passwordValue.trim() !== "") {
        warningsParag.current.textContent = "Please enter your password";
      } else {
        warningsParag.current.textContent = "Please enter you username and password";
      }
    }
  }

  return (
    <div className="form-div">
      <input className="username-input" placeholder="UserName" ref={userNameInput} />
      <input className="password-input" placeholder="Password" ref={passwordInput} />
      <button className="send-btn" type="submit" onClick={getUserData}>Submit</button>
      <p className="warnings-parag" ref={warningsParag}></p>
    </div>
  );
}
