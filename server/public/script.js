
const form = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const messagesContainer = document.getElementById('messages');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (message === '') return;

  appendMessage('user', message);
  userInput.value = '';

  try {
    const response = await fetch('http://localhost:5002/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    appendMessage('bot', data.reply);
  } catch (error) {
    console.error(error);
    appendMessage('bot', 'Sorry, there was an error processing your request.');
  }
});

function appendMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
  const messageText = document.createElement('p');
  messageText.innerText = text;
  messageDiv.appendChild(messageText);
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

appendMessage('bot', 'Hello! I am here to provide information on mental health resources. How can I assist you today?');
