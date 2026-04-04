(() => {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "OPEN_POPUP") {
      chrome.storage.local.set({
        auto_popup: "true",
        new_type: msg.new_type,
        new_user_name: msg.new_user_name,
        new_password: msg.new_password
      });
      chrome.action.openPopup();
    }
  });
})();
