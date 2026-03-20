const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// ✅ PASTE YOUR GROQ API KEY HERE
const GROQ_API_KEY = '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';

const conversationHistory = [];

// Auto resize textarea
userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = userInput.scrollHeight + 'px';
});

// Send on Enter
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Add message to chat
function addMessage(content, role) {
  const div = document.createElement('div');
  div.classList.add('message', role);
  div.textContent = content;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

// Send message to Groq
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  conversationHistory.push({ role: 'user', content: text });

  userInput.value = '';
  userInput.style.height = 'auto';
  sendBtn.disabled = true;

  const thinkingDiv = addMessage('⏳ Thinking...', 'thinking');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful, friendly, and smart AI assistant.'
          },
          ...conversationHistory
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || 'API Error');

    const reply = data.choices[0].message.content;

    thinkingDiv.className = 'message bot';
    thinkingDiv.textContent = reply;

    conversationHistory.push({ role: 'assistant', content: reply });

  } catch (err) {
    thinkingDiv.className = 'message error';
    thinkingDiv.textContent = '❌ Error: ' + err.message;
  }

  sendBtn.disabled = false;
  chatBox.scrollTop = chatBox.scrollHeight;
}