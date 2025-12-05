

// const express = require('express');
// const http = require('http');
// const cors = require('cors');
// const { Server } = require('socket.io');



// // Express app setup
// const app = express();
// const port = 5000;
// app.use(express.json());
// app.use(cors());

// // HTTP server (required for Socket.IO)
// const server = http.createServer(app);

// // Socket.IO setup
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// // Store connected clients for video call
// let clients = [];

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);
//   clients.push(socket.id);

//   // -----------------------
//   // Video Call Signaling
//   // -----------------------
//   socket.on("ready-for-call", () => {
//     if (clients.length === 2) {
//       clients.forEach(clientId => {
//         const otherId = clients.find(id => id !== clientId);
//         io.to(clientId).emit("start-call", { initiator: clients[0], peerId: otherId });
//       });
//     }
//   });

//   socket.on("signal", ({ signal, to }) => {
//     io.to(to).emit("signal", { signal });
//   });

//   // -----------------------
//   // Chat Functionality
//   // -----------------------
//   socket.on("chatMessage", (msg) => {
//     // Broadcast to all clients
//     io.emit("chat", msg);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);

//     // Inform the other user immediately
//     socket.broadcast.emit("user-left", socket.id);

//     clients = clients.filter(id => id !== socket.id);
// });

// });

// // Test route
// app.get('/', (req, res) => {
//   res.send("Hello World - Server is running");
// });

// // Start server
// server.listen(port, "0.0.0.0", () => {
//   console.log(`Server running at http://localhost:${port}`);
// });






















const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");

// --------------------
// Express App Setup
// --------------------
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// HTTP server (required for Socket.IO)
const server = http.createServer(app);

// --------------------
// Socket.IO Setup
// --------------------
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store connected clients
let clients = []; // { id: socket.id }

// --------------------
// Socket.IO Logic
// --------------------
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    clients.push(socket.id);

    // --------------------
    // Multi-user Video Call Signaling
    // --------------------

    // New user is ready for call
    socket.on("ready-for-call", () => {
        // Inform all existing users about this new user
        const otherClients = clients.filter(id => id !== socket.id);
        otherClients.forEach(clientId => {
            io.to(clientId).emit("new-user", socket.id);
        });
    });

    // Relay signaling data between peers
    socket.on("signal", ({ signal, to }) => {
        io.to(to).emit("signal", { signal, from: socket.id });
    });

    // --------------------
    // Chat Functionality
    // --------------------
    socket.on("chatMessage", (msg) => {
        io.emit("chat", msg);
    });

    // --------------------
    // Disconnect Handling
    // --------------------
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);

        // Inform all other users immediately
        socket.broadcast.emit("user-left", socket.id);

        // Remove from clients array
        clients = clients.filter(id => id !== socket.id);
    });
});

// --------------------
// Test Route
// --------------------
app.get('/', (req, res) => {
    res.send("Hello World - Server is running");
});

// --------------------
// Start Server
// --------------------
server.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${port}`);
});

