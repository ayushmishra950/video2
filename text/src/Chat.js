

// // WhatsAppChatVideo.jsx
// import React, { useState, useEffect, useRef } from "react";
// import { io } from "socket.io-client";
// import SimplePeer from "simple-peer";
// import { FaVideo, FaPhoneSlash } from "react-icons/fa";

// // Connect to Socket.IO server
// const socket = io("http://localhost:5000");

// const WhatsAppChatVideo = () => {
//   // Chat states
//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [username, setUsername] = useState("");

//   // Video call states
//   const [inCall, setInCall] = useState(false);
//   const myVideoRef = useRef(null);
//   const [remoteVideos, setRemoteVideos] = useState([]); // {id, stream}
//   const peersRef = useRef({}); // { peerId: SimplePeer }
//   const [stream, setStream] = useState(null);

//   const chatEndRef = useRef(null);
//   const [clientId, setClientId] = useState("");

//   // Ask username
//   useEffect(() => {
//     let name = prompt("Enter your name:");
//     if (!name) name = "Guest";
//     setUsername(name);

//     socket.on("connect", () => setClientId(socket.id));
//   }, []);

//   // Receive chat messages
//   useEffect(() => {
//     const handleChat = (msg) => setMessages((prev) => [...prev, msg]);
//     socket.on("chat", handleChat);
//     return () => socket.off("chat", handleChat);
//   }, []);

//   // Auto scroll chat
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Start video call
//   const startCall = () => {
//     setInCall(true);
//     navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
//       .then((mediaStream) => {
//         setStream(mediaStream);
//         if (myVideoRef.current) myVideoRef.current.srcObject = mediaStream;

//         socket.emit("ready-for-call");

//         // New user joined
//         socket.on("new-user", (newUserId) => {
//           const peer = new SimplePeer({
//             initiator: true,
//             trickle: false,
//             stream: mediaStream,
//             config: {
//       iceServers: [
//         { urls: "stun:stun.l.google.com:19302" },
//           { urls: "turn:turnserver.example.com", username: "user", credential: "pass" }
//       ]
//     }
//           });

//           peer.on("signal", (signal) => {
//             socket.emit("signal", { signal, to: newUserId });
//           });

//           peer.on("stream", (userStream) => {
//             setRemoteVideos((prev) => [...prev, { id: newUserId, stream: userStream }]);
//           });

//           peersRef.current[newUserId] = peer;
//         });

//         // Receive signal
//         socket.on("signal", ({ signal, from }) => {
//           if (!peersRef.current[from]) {
//             const peer = new SimplePeer({
//               initiator: false,
//               trickle: false,
//               stream: mediaStream,
//               config: {
//       iceServers: [
//         { urls: "stun:stun.l.google.com:19302" },
//           { urls: "turn:turnserver.example.com", username: "user", credential: "pass" }
//       ]
//     }
//             });

//             peer.on("signal", (signalData) => {
//               socket.emit("signal", { signal: signalData, to: from });
//             });

//             peer.on("stream", (userStream) => {
//               setRemoteVideos((prev) => [...prev, { id: from, stream: userStream }]);
//             });

//             peersRef.current[from] = peer;
//             peer.signal(signal);
//           } else {
//             peersRef.current[from].signal(signal);
//           }
//         });

//         // User left
//         socket.on("user-left", (id) => {
//           if (peersRef.current[id]) {
//             peersRef.current[id].destroy();
//             delete peersRef.current[id];
//           }
//           setRemoteVideos((prev) => prev.filter((v) => v.id !== id));
//         });
//       })
//       .catch((err) => console.error(err));
//   };

//   // End call
//   const endCall = () => {
//     setInCall(false);
//     Object.values(peersRef.current).forEach((p) => p.destroy());
//     peersRef.current = {};
//     setRemoteVideos([]);
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//       setStream(null);
//     }
//   };

//   // Send chat message
//   const sendMessage = () => {
//     if (!userInput.trim()) return;

//     const msg = {
//       user: username,
//       text: userInput,
//       time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//     };

//     socket.emit("chatMessage", msg);
//     setUserInput("");
//   };

//   // ----------------- RENDER -----------------
//   if (inCall) {
//     return (
//       <div style={styles.container}>
//         {/* Video Call */}
//         <div style={styles.videoContainer}>
//           <video ref={myVideoRef} autoPlay playsInline muted style={styles.video} />
//           {remoteVideos.map((v) => (
//             <video
//               key={v.id}
//               ref={(el) => el && (el.srcObject = v.stream)}
//               autoPlay
//               playsInline
//               style={styles.video}
//             />
//           ))}
//         </div>

//         {/* End call button */}
//         <button style={styles.endCallBtn} onClick={endCall}>
//           <FaPhoneSlash /> End Call
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div style={styles.container}>
//       {/* Header */}
//       <div style={styles.header}>
//         <h3 style={{ color: "white", margin: 0 }}>WhatsApp Chat</h3>
//         <small style={{ color: "#e0ffe0" }}>Logged in as: {username}</small>
//         <FaVideo style={styles.videoIcon} onClick={startCall} title="Start Video Call" />
//       </div>

//       {/* Chat Area */}
//       <div style={styles.chatBox}>
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             style={{
//               ...styles.messageBubble,
//               alignSelf: msg.user === username ? "flex-end" : "flex-start",
//               backgroundColor: msg.user === username ? "#dcf8c6" : "white",
//             }}
//           >
//             <div style={styles.msgUser}>{msg.user}</div>
//             <div>{msg.text}</div>
//             <div style={styles.msgTime}>{msg.time}</div>
//           </div>
//         ))}
//         <div ref={chatEndRef}></div>
//       </div>

//       {/* Input Area */}
//       <div style={styles.inputArea}>
//         <input
//           type="text"
//           placeholder="Type a message"
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           style={styles.input}
//         />
//         <button onClick={sendMessage} style={styles.sendBtn}>
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default WhatsAppChatVideo;

// // ------------------- STYLES -------------------
// const styles = {
//   container: {
//     width: "450px",
//     height: "750px",
//     margin: "20px auto",
//     display: "flex",
//     flexDirection: "column",
//     border: "1px solid #ddd",
//     borderRadius: "10px",
//     overflow: "hidden",
//     fontFamily: "Arial",
//     backgroundColor: "#f0f0f0",
//   },
//   header: {
//     backgroundColor: "#075E54",
//     padding: "12px",
//     textAlign: "center",
//     position: "relative",
//   },
//   videoIcon: {
//     position: "absolute",
//     right: "10px",
//     top: "12px",
//     color: "white",
//     fontSize: "20px",
//     cursor: "pointer",
//   },
//   videoContainer: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: "10px",
//     flexWrap: "wrap",
//     padding: "10px",
//     flex: 1,
//     backgroundColor: "#000",
//   },
//   video: {
//     width: "200px",
//     height: "150px",
//     border: "1px solid #ccc",
//     borderRadius: "5px",
//     backgroundColor: "black",
//   },
//   endCallBtn: {
//     backgroundColor: "#f44336",
//     color: "white",
//     padding: "10px",
//     margin: "10px auto",
//     border: "none",
//     borderRadius: "10px",
//     cursor: "pointer",
//     display: "flex",
//     alignItems: "center",
//     gap: "5px",
//     fontSize: "16px",
//   },
//   chatBox: {
//     flex: 1,
//     padding: "10px",
//     overflowY: "auto",
//     display: "flex",
//     flexDirection: "column",
//     gap: "8px",
//     backgroundColor: "#e5ddd5",
//     borderTop: "1px solid #ccc",
//   },
//   messageBubble: {
//     maxWidth: "70%",
//     padding: "10px",
//     borderRadius: "10px",
//     boxShadow: "0px 1px 2px rgba(0,0,0,0.2)",
//   },
//   msgUser: {
//     fontSize: "12px",
//     color: "#075E54",
//     marginBottom: "3px",
//   },
//   msgTime: {
//     fontSize: "10px",
//     textAlign: "right",
//     color: "#555",
//     marginTop: "3px",
//   },
//   inputArea: {
//     padding: "10px",
//     display: "flex",
//     gap: "8px",
//     backgroundColor: "#eee",
//   },
//   input: {
//     flex: 1,
//     padding: "10px",
//     borderRadius: "20px",
//     border: "1px solid #ccc",
//   },
//   sendBtn: {
//     padding: "10px 15px",
//     backgroundColor: "#25D366",
//     border: "none",
//     borderRadius: "20px",
//     color: "white",
//     cursor: "pointer",
//   },
// };





































import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import SimplePeer from "simple-peer";
import { FaVideo, FaPhoneSlash } from "react-icons/fa";

const socket = io("http://192.168.1.26:5000");

const WhatsAppChatVideo = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [username, setUsername] = useState("");
  const [inCall, setInCall] = useState(false);
  const [stream, setStream] = useState(null);
  const [remoteVideos, setRemoteVideos] = useState([]);
  const peersRef = useRef({});
  const myVideoRef = useRef(null);
  const chatEndRef = useRef(null);
  const [meetingId, setMeetingId] = useState("");

  // Ask username
  useEffect(() => {
    let name = prompt("Enter your name:");
    if (!name) name = "Guest";
    setUsername(name);
  }, []);

  // Chat receiver
  useEffect(() => {
    socket.on("chat", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -------------------------------------
  // HANDLE WEBRTC EVENTS ONCE
  // -------------------------------------
  useEffect(() => {
    if (!meetingId || !stream) return;

    const handleNewUser = ({ newUserId, meeting }) => {
      if (meeting !== meetingId) return;
      createPeer(newUserId, stream, true);
    };

    const handleSignal = ({ signal, from, meeting }) => {
      if (meeting !== meetingId) return;

      if (!peersRef.current[from]) {
        createPeer(from, stream, false, signal);
      } else {
        peersRef.current[from].signal(signal);
      }
    };

    const handleUserLeft = (id) => {
      if (peersRef.current[id]) {
        peersRef.current[id].destroy();
        delete peersRef.current[id];
      }
      setRemoteVideos((prev) => prev.filter((v) => v.id !== id));
    };

    socket.on("new-user", handleNewUser);
    socket.on("signal", handleSignal);
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("new-user", handleNewUser);
      socket.off("signal", handleSignal);
      socket.off("user-left", handleUserLeft);
    };
  }, [meetingId, stream]);

  // -------------------------------------
  // Start Call (with meeting ID)
  // -------------------------------------
  const handleVideoClick = () => {
    const type = prompt("Type 'create' to create meeting or 'join' to join:");

    if (type === "create") {
      const newId =
        prompt("Enter meeting ID:") || Math.random().toString(36).slice(2, 8);
      setMeetingId(newId);
      alert("Meeting created! Share this ID: " + newId);
      startCall(newId);
    } else if (type === "join") {
      const joinId = prompt("Enter meeting ID:");
      if (!joinId) return alert("Enter meeting ID!");
      setMeetingId(joinId);
      startCall(joinId);
    }
  };

  const startCall = async (meetId) => {
    setInCall(true);

    const mediaStream = await navigator.mediaDevices?.getUserMedia({
      video: true,
      audio: true,
    });

    setStream(mediaStream);
    if (myVideoRef.current) myVideoRef.current.srcObject = mediaStream;

    socket.emit("ready-for-call", { meetingId: meetId });
  };

  // -------------------------------------
  // PEER CREATION
  // -------------------------------------
  const createPeer = (peerId, mediaStream, initiator, incomingSignal = null) => {
    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream: mediaStream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:turnserver.example.com",
            username: "user",
            credential: "pass",
          },
        ],
      },
    });

    peer.on("signal", (signalData) => {
      socket.emit("signal", {
        signal: signalData,
        to: peerId,
        meeting: meetingId,
      });
    });

    peer.on("stream", (userStream) => {
      setRemoteVideos((prev) => [...prev, { id: peerId, stream: userStream }]);
    });

    if (incomingSignal) peer.signal(incomingSignal);

    peersRef.current[peerId] = peer;
  };

  // End Call
  const endCall = () => {
    setInCall(false);
    Object.values(peersRef.current).forEach((p) => p.destroy());
    peersRef.current = {};
    setRemoteVideos([]);

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  // Send chat message
  const sendMessage = () => {
    if (!userInput.trim()) return;
    const msg = {
      user: username,
      text: userInput,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    socket.emit("chatMessage", msg);
    setUserInput("");
  };

  // -------------------------------------
  // UI
  // -------------------------------------
  if (inCall) {
    return (
      <div style={styles.container}>
        <div style={styles.videoContainer}>
          <video ref={myVideoRef} autoPlay muted playsInline style={styles.video} />

          {remoteVideos.map((v) => (
            <video
              key={v.id}
              autoPlay
              playsInline
              style={styles.video}
              ref={(el) => el && (el.srcObject = v.stream)}
            />
          ))}
        </div>

        <button onClick={endCall} style={styles.endCallBtn}>
          <FaPhoneSlash /> End Call
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={{ color: "white" }}>WhatsApp Chat</h3>
        <small style={{ color: "#e0ffe0" }}>Logged in as: {username}</small>
        <FaVideo style={styles.videoIcon} onClick={handleVideoClick} />
      </div>

      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.messageBubble,
              alignSelf: msg.user === username ? "flex-end" : "flex-start",
              background: msg.user === username ? "#dcf8c6" : "white",
            }}
          >
            <strong>{msg.user}</strong>
            <div>{msg.text}</div>
            <small>{msg.time}</small>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputArea}>
        <input
          style={styles.input}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type message..."
        />
        <button style={styles.sendBtn} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default WhatsAppChatVideo;

// Styles
const styles = {
  container: {
    width: "450px",
    height: "750px",
    background: "#f0f0f0",
    margin: "20px auto",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    border: "1px solid #ddd",
  },
  header: {
    background: "#075E54",
    padding: "12px",
    textAlign: "center",
    position: "relative",
  },
  videoIcon: {
    position: "absolute",
    right: "10px",
    top: "12px",
    color: "white",
    fontSize: "20px",
    cursor: "pointer",
  },
  videoContainer: {
    flex: 1,
    background: "#000",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
    padding: "10px",
  },
  video: {
    width: "200px",
    height: "150px",
    background: "black",
    borderRadius: "10px",
  },
  endCallBtn: {
    background: "red",
    color: "white",
    padding: "10px",
    margin: "10px",
    borderRadius: "12px",
  },
  chatBox: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
  },
  messageBubble: {
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "10px",
    maxWidth: "70%",
  },
  inputArea: {
    padding: "10px",
    background: "#eee",
    display: "flex",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
  },
  sendBtn: {
    background: "#25D366",
    padding: "10px 15px",
    borderRadius: "20px",
    color: "white",
  },
};
