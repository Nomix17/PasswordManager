const userNameInput: HTMLInputElement | null = document.querySelector(".username-input");
const passwordInput: HTMLInputElement | null = document.querySelector(".password-input");
const saveBtn: HTMLButtonElement | null = document.querySelector(".save-btn");
const signIn: HTMLAnchorElement | null = document.querySelector(".signIn-link");

saveBtn?.addEventListener("click",()=>{
  const userNameValue = userNameInput?.value;
  const passwordValue = passwordInput?.value;

  if(userNameValue != null  && userNameValue.trim() != "" &&
     passwordValue != null && passwordValue.trim() != "") {

  }
});

signIn?.addEventListener("click", ()=>{
  window.location.href = "signIn.html";
});

