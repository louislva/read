document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveButton = document.getElementById("saveButton");

  // Load saved API key
  chrome.storage.sync.get(["openaiApiKey"], (result) => {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
    }
  });

  // Save API key
  saveButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
        saveButton.textContent = "Saved!";
        setTimeout(() => {
          saveButton.textContent = "Save API Key";
        }, 2000);
      });
    }
  });
});
