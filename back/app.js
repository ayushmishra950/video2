
// y complete or sahi code hai for video call and chat with multiple people



// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.meetingId = null;

//   // USER JOINS MEETING
//   socket.on("ready-for-call", ({ meetingId }) => {
//     socket.meetingId = meetingId;
//     socket.join(meetingId);

//     console.log(`User ${socket.id} joined meeting ${meetingId}`);

//     // Notify others in room
//     socket.to(meetingId).emit("new-user", {
//       newUserId: socket.id,
//       meeting: meetingId,
//     });
//   });

//   // HANDLE SIGNAL
//   socket.on("signal", ({ signal, to, meeting }) => {
//     io.to(to).emit("signal", {
//       signal,
//       from: socket.id,
//       meeting,
//     });
//   });

//   // CHAT
//   socket.on("chatMessage", (msg) => {
//     io.emit("chat", msg);
//   });

//   // USER LEFT
//   socket.on("disconnect", () => {
//     console.log("User left:", socket.id);

//     if (socket.meetingId) {
//       socket.to(socket.meetingId).emit("user-left", socket.id);
//     }
//   });
// });

// server.listen(5000, () => {
//   console.log("Server running on port 5000");
// });























const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.meetingId = null;

  // ------------------------ JOIN MEETING ------------------------
  socket.on("join-meeting", ({ meetingId }) => {
    socket.meetingId = meetingId;
    socket.join(meetingId);

    console.log(`User ${socket.id} joined ${meetingId}`);

    // notify others
    socket.to(meetingId).emit("new-user", { userId: socket.id });
  });

  // ------------------------ SIGNALING ------------------------
  socket.on("signal", ({ to, signal }) => {
    io.to(to).emit("signal", {
      from: socket.id,
      signal,
    });
  });

  // ------------------------ CHAT ------------------------
  socket.on("chatMessage", (msg) => {
    io.emit("chat", msg);
  });

  // ------------------------ WHITEBOARD ------------------------
  socket.on("draw", ({ x, y, color, size }) => {
    if (socket.meetingId) {
      socket.to(socket.meetingId).emit("draw", { x, y, color, size });
    }
  });

  // ------------------------ DISCONNECT ------------------------
  socket.on("disconnect", () => {
    console.log("User left:", socket.id);

    if (socket.meetingId) {
      socket.to(socket.meetingId).emit("user-left", { userId: socket.id });
    }
  });
});

app.get("/", (req, res) => {
  res.send("Server working: Chat, Whiteboard, Video, File Sharing");
});

server.listen(5000, "0.0.0.0", () => console.log("Server running on port 5000"));
