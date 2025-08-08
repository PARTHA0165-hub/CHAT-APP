const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 4000;

let onlineUsers = {};
let messages = [];

io.on('connection', (socket) => {

  socket.on('join', ({ username }) => {
    onlineUsers[socket.id] = username;
    socket.broadcast.emit('user-joined', { username });
    io.emit('online-users', Object.values(onlineUsers));
    socket.emit('history', messages.slice(-50));
  });

  socket.on('send-message', (msg) => {
    const payload = {
      username: onlineUsers[socket.id] || 'Unknown',
      text: msg,
      time: new Date().toISOString(),
    };
    messages.push(payload);
    io.emit('receive-message', payload);
  });

  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('typing', { username: onlineUsers[socket.id], isTyping });
  });

  socket.on('disconnect', () => {
    const username = onlineUsers[socket.id];
    delete onlineUsers[socket.id];
    socket.broadcast.emit('user-left', { username });
    io.emit('online-users', Object.values(onlineUsers));
  });
});

app.get('/', (req, res) => res.send('Chat server running...'));

server.listen(PORT);
