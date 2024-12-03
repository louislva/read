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
    const result = await chrome.storage.sync.get(["openaiApiKey"]);
    if (!result.openaiApiKey) {
      alert("Please set your OpenAI API key in the extension popup");
      return;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${result.openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-audio-preview",
        modalities: ["text", "audio"],
        audio: { voice: "alloy", format: "wav" },
        messages: [
          {
            role: "user",
            content:
              "Please read the attached section of text out loud. Please do it in a thick Kiwi accent. The accent is very important.\n\n---\n\n" +
              text,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate speech");
    }

    const responseData = await response.json();
    const audioData = responseData.choices[0].message.audio.data;
    const audioBlob = new Blob(
      [
        new Uint8Array(
          atob(audioData)
            .split("")
            .map((char) => char.charCodeAt(0))
        ),
      ],
      { type: "audio/wav" }
    );
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
