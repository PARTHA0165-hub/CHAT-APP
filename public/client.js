const socket = io();

const chatForm = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("message");

socket.on("loadMessages", (messages) => {
  messages.forEach((msg) => {
    displayMessage(msg.username, msg.message);
  });
});

socket.on("chatMessage", (data) => {
  displayMessage(data.username, data.message);
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const message = messageInput.value.trim();

  if (username && message) {
    socket.emit("chatMessage", { username, message });
    messageInput.value = "";
    messageInput.focus();
  }
});

function displayMessage(username, message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<strong>${username}:</strong> ${message}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
