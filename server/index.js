require("dotenv").config();

const connectDB = require("./db");
connectDB();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 👥 Track users per room
const usersInRoom = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🔹 Join room with username
  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);

    if (!usersInRoom[roomId]) {
      usersInRoom[roomId] = [];
    }
    socket.on("typing", ({ roomId, username }) => {
  socket.to(roomId).emit("user-typing", username);
});

socket.on("stop-typing", (roomId) => {
  socket.to(roomId).emit("user-stop-typing");
});


    // ✅ Prevent duplicate entries
    const alreadyExists = usersInRoom[roomId].some(
      (user) => user.id === socket.id
    );

    if (!alreadyExists) {
      usersInRoom[roomId].push({
        id: socket.id,
        username,
      });
    }

    // Broadcast updated user list
    io.to(roomId).emit("room-users", usersInRoom[roomId]);
  });

  // 🔹 Real-time editor sync (unchanged)
  socket.on("send-changes", ({ roomId, delta }) => {
    socket.to(roomId).emit("receive-changes", delta);
  });

  // 🔹 Handle disconnect
  socket.on("disconnect", () => {
    for (const roomId in usersInRoom) {
      usersInRoom[roomId] = usersInRoom[roomId].filter(
        (user) => user.id !== socket.id
      );

      io.to(roomId).emit("room-users", usersInRoom[roomId]);
    }

    console.log("User disconnected:", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



