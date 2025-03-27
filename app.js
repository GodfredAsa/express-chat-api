const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const chatRoutes = require("./routes/chatRoutes");

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const activeUsers = new Map(); // Stores connected users

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for user identity (optional: receive userId from frontend)
  socket.on("userConnected", (userId) => {
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} is now online.`);
    io.emit("updateUserStatus", Array.from(activeUsers.keys())); // Send active users list
  });

  // Handle incoming messages
  socket.on("sendMessage", (msg) => {
    io.emit("receiveMessage", msg);
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    const userId = [...activeUsers.entries()].find(([_, id]) => id === socket.id)?.[0];
    if (userId) {
      activeUsers.delete(userId);
      console.log(`User ${userId} disconnected.`);
      io.emit("updateUserStatus", Array.from(activeUsers.keys())); // Notify clients
    }
  });
});


app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(
    () => console.log("MongoDB Connected")
  ).catch(
    (err) => console.log(err)
  );

app.use("/api/chat", chatRoutes);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessage", (msg) => {
    io.emit("receiveMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
// chat-pass
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
