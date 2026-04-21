const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    users[socket.id] = username;

    io.emit("message", {
      user: "System",
      text: `${username} joined the chat`,
      time: new Date().toLocaleTimeString(),
    });

    io.emit("users", Object.values(users));
  });

  socket.on("sendMessage", (msg) => {
    socket.broadcast.emit("message", msg);
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];

    if (username) {
      io.emit("message", {
        user: "System",
        text: `${username} left the chat`,
        time: new Date().toLocaleTimeString(),
      });
    }

    delete users[socket.id];
    io.emit("users", Object.values(users));
  });
});

server.listen(5001, () => {
  console.log("Server running on 5001");
});