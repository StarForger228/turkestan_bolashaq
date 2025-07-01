let messageCount = 0;
const maxMessages = 5;

// Открытие/закрытие окна чата
const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotWindow = document.getElementById("chatbot-window");

// --- История чата ---
function saveChatHistory() {
  const box = document.getElementById("chatbot-messages");
  const messages = Array.from(box.children).map(msg => ({
    sender: msg.classList.contains('user') ? 'user' : 'bot',
    text: msg.textContent
  }));
  localStorage.setItem('chatbotHistory', JSON.stringify(messages));
}

function loadChatHistory() {
  const box = document.getElementById("chatbot-messages");
  box.innerHTML = '';
  const messages = JSON.parse(localStorage.getItem('chatbotHistory') || '[]');
  messages.forEach(msg => addMessage(msg.sender, msg.text));
}

if (chatbotToggle && chatbotWindow) {
  chatbotToggle.addEventListener("click", () => {
    chatbotWindow.classList.toggle("hidden");
    if (!chatbotWindow.classList.contains("hidden")) {
      chatbotToggle.style.display = 'none';
      loadChatHistory();
      setTimeout(() => {
        const box = document.getElementById("chatbot-messages");
        if (box) box.scrollTop = box.scrollHeight;
      }, 100);
    } else {
      chatbotToggle.style.display = '';
    }
  });
}

// Обработка отправки сообщений
const chatForm = document.getElementById("chatbot-form");
if (chatForm) {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (messageCount >= maxMessages) {
      addMessage("bot", "🔒 Вы достигли лимита в 5 вопросов. Попробуйте позже.");
      saveChatHistory();
      return;
    }

    const input = document.getElementById("chatbot-input");
    const userMessage = input.value.trim();
    input.value = "";

    if (!userMessage) return;

    addMessage("user", userMessage);
    const loadingMsg = addMessage("bot", "⏳ Печатает...");
    saveChatHistory();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      loadingMsg.textContent = data.response;
      messageCount++;
      saveChatHistory();
    } catch (err) {
      loadingMsg.textContent = "⚠️ Ошибка сервера. Попробуйте позже.";
      saveChatHistory();
    }
  });
}

function addMessage(sender, text) {
  const box = document.getElementById("chatbot-messages");
  const msg = document.createElement("div");
  msg.className = `chatbot-message ${sender}`;
  msg.textContent = text;
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
  return msg;
}