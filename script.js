// Checks that everything is loaded before running the script

document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chat-form");
  const userInput = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  if (!chatForm || !userInput || !chatBox) {
    console.error("Required DOM elements missing");
    return;
  }

  const apiKey = ""; // Add to enable the chatbot

  let hasErroredOnce = false; // Tracks the error state


// Connects to the OpenAI API 
  
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
          role: "user", content: message
        }]
      })
    });

    
// Error handling for a lack of an API response or any errors and alerts to the console

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

// Handles visual responses/messages from the API to the HTML the chat boxes

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


  // Handles other errors with the API and displays a message to the user

    try {
      const reply = await getChatbotResponse(message);
      appendMessage("bot", reply);
      hasErroredOnce = false; // Resets on successful message
    } catch (err) {
      if (!hasErroredOnce) {
        appendMessage("bot", "Component is currently unavailable, possibly due to API fees. This is meant to happen. I'm poor.");
        hasErroredOnce = true;
      } else {
        appendMessage("bot", "The indomitable spirit of the chatbot is currently on a break.");
      }
      console.error(err);
    }
  });
});
