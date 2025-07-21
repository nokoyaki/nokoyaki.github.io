document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chat-form");
  const userInput = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  if (!chatForm || !userInput || !chatBox) {
    console.error("Required DOM elements missing");
    return;
  }

  const apiKey = "";

  let hasErroredOnce = false; // 👈 Track error state

  async function getChatbotResponse(message) {
    const endpoint = "https://api.openai.com/v1/chat/completions";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-nano",
        messages: [{
          role: "user", content: message // 👈 use actual message here
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("OpenAI API response:", data);

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      throw new Error("No response from API");
    }
  }

  function appendMessage(sender, message) {
    if (!chatBox) return;

    const div = document.createElement("div");
    div.classList.add("chat-bubble", "fade-in-up");

    if (sender === "user") {
      div.classList.add("self-end", "bg-green-200");
    } else {
      div.classList.add("self-start", "bg-blue-100");
    }

    div.textContent = message;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage("user", message);
    userInput.value = "";

    try {
      const reply = await getChatbotResponse(message);
      appendMessage("bot", reply);
      hasErroredOnce = false; // 👈 Reset on success
    } catch (err) {
      if (!hasErroredOnce) {
        appendMessage("bot", "Component is currently disabled due to API fees. This is meant to happen. I'm poor.");
        hasErroredOnce = true;
      } else {
        appendMessage("bot", "Ah yes, messaging again while the component is disabled. Dumbass.");
      }
      console.error(err);
    }
  });
});
