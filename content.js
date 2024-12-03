let audioElement = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "readText") {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      getOpenAITTS(selectedText);
    }
  }
});

async function getOpenAITTS(text) {
  try {
    // Get API key from storage
    const result = await chrome.storage.sync.get(["openaiApiKey"]);
    if (!result.openaiApiKey) {
      alert("Please set your OpenAI API key in the extension popup");
      return;
    }

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${result.openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "alloy",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate speech");
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Stop any currently playing audio
    if (audioElement) {
      audioElement.pause();
      URL.revokeObjectURL(audioElement.src);
    }

    // Create and play new audio
    audioElement = new Audio(audioUrl);
    audioElement.play();

    // Clean up when audio finishes playing
    audioElement.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
  } catch (error) {
    console.error("Error:", error);
    alert("Error generating speech. Please check your API key and try again.");
  }
}
