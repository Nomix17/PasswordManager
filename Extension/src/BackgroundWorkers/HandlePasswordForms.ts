import {
  passwordInputSelectorQueury,
  userNameInputElSelectorQueury,
  submitBtnElSelectorQueuery
} from "./CSSSelectorQueries";

let UserNameValue: string = "";
let PasswordValue: string = "";
let oldSubmitBtn: HTMLButtonElement | null = null;

type  passwordForm = {
  userNameInputEl: HTMLInputElement | null,
  passwordInputEl: HTMLInputElement | null,
  submitBtnEl: HTMLButtonElement | null
}

const target = document;
const observer = new MutationObserver(manageUpdatedDom);
observer.observe(target, {
  attributes: true,
  childList: true,
  subtree: true
});

function manageUpdatedDom(mutationList: MutationRecord[]) {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      console.log("A child node has been added or removed.");
      const passwordFormElements: passwordForm = findPasswordForm();
      addEventListeners(passwordFormElements);

    }
  }
}

function addEventListeners(passwordFormElements: passwordForm) {
  const {userNameInputEl, passwordInputEl, submitBtnEl} = passwordFormElements;

  userNameInputEl?.addEventListener("change", ()=>{
    UserNameValue = userNameInputEl?.value ?? "";
  });

  passwordInputEl?.addEventListener("change", ()=>{
    PasswordValue = passwordInputEl?.value ?? "";
  });

  const sendChromeRuntimeMsg = () => {
    if(userNameInputEl == null) return;
    chrome.runtime.sendMessage({
      type: 'OPEN_POPUP',
      new_type: getWebSiteName(window.location.href),
      new_user_name: UserNameValue,
      new_password: PasswordValue
    });
  }

  submitBtnEl?.addEventListener("click", sendChromeRuntimeMsg);
  oldSubmitBtn?.removeEventListener("click", sendChromeRuntimeMsg);
  oldSubmitBtn = submitBtnEl ?? oldSubmitBtn;
}

function findPasswordForm() : passwordForm {
  return {
    userNameInputEl: document.querySelector(passwordInputSelectorQueury),
    passwordInputEl: document.querySelector(userNameInputElSelectorQueury),
    submitBtnEl: document.querySelector(submitBtnElSelectorQueuery),
  }
}

function getWebSiteName (url: string): string | null {
  const domainName = new URL(url);
  const processedDomain = domainName.hostname.replace(/^www\./, "").split(".");
  processedDomain.pop();
  return processedDomain.join("-");
}
