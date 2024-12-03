chrome.commands.onCommand.addListener((command) => {
  if (command === "read-text") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "readText" });
    });
  }
});
