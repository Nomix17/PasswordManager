"use strict";
const userNameInput = document.querySelector(".username-input");
const passwordInput = document.querySelector(".password-input");
const saveBtn = document.querySelector(".save-btn");
const signIn = document.querySelector(".signIn-link");
saveBtn?.addEventListener("click", () => {
    const userNameValue = userNameInput?.value;
    const passwordValue = passwordInput?.value;
    if (userNameValue != null && userNameValue.trim() != "" &&
        passwordValue != null && passwordValue.trim() != "") {
    }
});
signIn?.addEventListener("click", () => {
    window.location.href = "signIn.html";
});
