require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");
const Message = require("./models/Message");
const connectDB = require("./db");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

connectDB();

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", async (socket) => {
  console.log("A user connected:", socket.id);

  const messages = await Message.find().sort({ createdAt: -1 }).limit(10);
  socket.emit("loadMessages", messages.reverse());

  socket.on("chatMessage", async (data) => {
    const newMessage = new Message({
      username: data.username,
      message: data.message,
    });
    await newMessage.save();

    io.emit("chatMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
