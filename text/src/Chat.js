

// import React, { useState, useEffect, useRef } from "react";
// import { io } from "socket.io-client";
// import SimplePeer from "simple-peer";

// // Socket.IO client
// const socket = io("http://localhost:5000");

// const WhatsAppChatWithVideo = () => {
//   // --- Chat states ---
//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [username, setUsername] = useState("");

//   // --- Video states ---
//   const myVideoRef = useRef();
//   const [remoteVideos, setRemoteVideos] = useState([]); // [{id, stream}]
//   const peersRef = useRef({}); // { peerId: SimplePeer instance }
//   const [stream, setStream] = useState(null);

//   const chatEndRef = useRef(null);

//   const [clientId, setClientId] = useState("");

//   // Ask username & save client ID from server
//   useEffect(() => {
//     let name = prompt("Enter your name:");
//     if (!name) name = "Guest";
//     setUsername(name);

//     socket.on("connect", () => {
//       setClientId(socket.id);
//     });
//   }, []);

//   // --- Receive chat messages ---
//   useEffect(() => {
//     const handleChat = (msg) => setMessages(prev => [...prev, msg]);
//     socket.on("chat", handleChat);
//     return () => socket.off("chat", handleChat);
//   }, []);

//   // Auto scroll chat
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // --- Setup Video Call ---
//   useEffect(() => {
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//       .then(mediaStream => {
//         setStream(mediaStream);
//         if (myVideoRef.current) myVideoRef.current.srcObject = mediaStream;

//         // Inform server we are ready
//         socket.emit("ready-for-call");

//         // When a new user joins, create peer (initiator)
//         socket.on("new-user", (newUserId) => {
//           const peer = new SimplePeer({
//             initiator: true,
//             trickle: false,
//             stream: mediaStream
//           });

//           peer.on("signal", signal => {
//             socket.emit("signal", { signal, to: newUserId });
//           });

//           peer.on("stream", userStream => {
//             setRemoteVideos(prev => [...prev, { id: newUserId, stream: userStream }]);
//           });

//           peersRef.current[newUserId] = peer;
//         });

//         // When receiving signaling data
//         socket.on("signal", ({ signal, from }) => {
//           if (!peersRef.current[from]) {
//             const peer = new SimplePeer({
//               initiator: false,
//               trickle: false,
//               stream: mediaStream
//             });

//             peer.on("signal", signalData => {
//               socket.emit("signal", { signal: signalData, to: from });
//             });

//             peer.on("stream", userStream => {
//               setRemoteVideos(prev => [...prev, { id: from, stream: userStream }]);
//             });

//             peersRef.current[from] = peer;
//             peer.signal(signal);
//           } else {
//             peersRef.current[from].signal(signal);
//           }
//         });

//         // Handle user disconnect
//         socket.on("user-left", (id) => {
//           if (peersRef.current[id]) {
//             peersRef.current[id].destroy();
//             delete peersRef.current[id];
//           }
//           setRemoteVideos(prev => prev.filter(v => v.id !== id));
//         });

//       })
//       .catch(err => console.error("Error accessing media devices:", err));
//   }, []);

//   // --- Send chat message ---
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

//   return (
//     <div style={styles.container}>
//       {/* Header */}
//       <div style={styles.header}>
//         <h3 style={{ color: "white", margin: 0 }}>WhatsApp Chat + Video</h3>
//         <small style={{ color: "#e0ffe0" }}>Logged in as: {username}</small>
//       </div>

//       {/* Video Section */}
//       <div style={styles.videoContainer}>
//         <video ref={myVideoRef} autoPlay playsInline muted style={styles.video} />
//         {remoteVideos.map(v => (
//           <video
//             key={v.id}
//             ref={el => { if (el) el.srcObject = v.stream; }}
//             autoPlay
//             playsInline
//             style={styles.video}
//           />
//         ))}
//       </div>

//       {/* Chat area */}
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

//       {/* Input */}
//       <div style={styles.inputArea}>
//         <input
//           type="text"
//           placeholder="Type a message"
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           style={styles.input}
//         />
//         <button onClick={sendMessage} style={styles.sendBtn}>Send</button>
//       </div>
//     </div>
//   );
// };

// export default WhatsAppChatWithVideo;

// // --------------------
// // STYLES
// // --------------------
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
//   },

//   videoContainer: {
//     display: "flex",
//     justifyContent: "space-around",
//     padding: "10px",
//     gap: "10px",
//     flexWrap: "wrap",
//   },

//   video: {
//     width: "200px",
//     height: "150px",
//     border: "1px solid #ccc",
//     borderRadius: "5px",
//     backgroundColor: "black",
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





































// import React, { useState, useEffect, useRef } from "react";
// import { io } from "socket.io-client";
// import SimplePeer from "simple-peer";

// // Socket.IO client
// const socket = io("http://localhost:5000");

// const WhatsAppChatWithVideo = () => {
//   // CHAT states
//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [username, setUsername] = useState("");
//   const chatEndRef = useRef(null);

//   // VIDEO states
//   const [inCall, setInCall] = useState(false); // <== NEW (switch between Chat & Call screen)
//   const myVideoRef = useRef();
//   const [remoteVideos, setRemoteVideos] = useState([]);
//   const peersRef = useRef({});
//   const [stream, setStream] = useState(null);

//   const [clientId, setClientId] = useState("");

//   // Ask username
//   useEffect(() => {
//     let name = prompt("Enter your name:");
//     if (!name) name = "Guest";
//     setUsername(name);

//     socket.on("connect", () => {
//       setClientId(socket.id);
//     });
//   }, []);

//   // Receive chat messages
//   useEffect(() => {
//     const handleChat = (msg) => setMessages((prev) => [...prev, msg]);
//     socket.on("chat", handleChat);
//     return () => socket.off("chat", handleChat);
//   }, []);

//   // Auto scroll
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // VIDEO CALL LOGIC
//   useEffect(() => {
//     if (!inCall) return; // <== Only setup video when in call

//     navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//       .then((mediaStream) => {
//         setStream(mediaStream);
//         if (myVideoRef.current) myVideoRef.current.srcObject = mediaStream;

//         socket.emit("ready-for-call");

//         socket.on("new-user", (newUserId) => {
//           const peer = new SimplePeer({
//             initiator: true,
//             trickle: false,
//             stream: mediaStream,
//           });

//           peer.on("signal", (signal) => {
//             socket.emit("signal", { signal, to: newUserId });
//           });

//           peer.on("stream", (userStream) => {
//             setRemoteVideos((prev) => [...prev, { id: newUserId, stream: userStream }]);
//           });

//           peersRef.current[newUserId] = peer;
//         });

//         socket.on("signal", ({ signal, from }) => {
//           if (!peersRef.current[from]) {
//             const peer = new SimplePeer({
//               initiator: false,
//               trickle: false,
//               stream: mediaStream,
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

//         socket.on("user-left", (id) => {
//           if (peersRef.current[id]) {
//             peersRef.current[id].destroy();
//             delete peersRef.current[id];
//           }
//           setRemoteVideos((prev) => prev.filter((v) => v.id !== id));
//         });
//       })
//       .catch((err) => console.error("Media Error:", err));
//   }, [inCall]);


//   // End Call Function
//   const endCall = () => {
//     setInCall(false);

//     // Stop streams
//     if (stream) {
//       stream.getTracks().forEach((t) => t.stop());
//     }

//     // Destroy peers
//     Object.values(peersRef.current).forEach((p) => p.destroy());
//     peersRef.current = {};
//     setRemoteVideos([]);
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

//   // ---------------------------------------------
//   // RENDER UI (Chat Screen OR Video Screen)
//   // ---------------------------------------------

//   // === If video call is ON ===
//   if (inCall) {
//     return (
//       <div style={styles.callScreen}>
//         <div style={styles.callVideos}>
//           <video ref={myVideoRef} autoPlay playsInline muted style={styles.callVideo} />

//           {remoteVideos.map((v) => (
//             <video
//               key={v.id}
//               autoPlay
//               playsInline
//               ref={(el) => el && (el.srcObject = v.stream)}
//               style={styles.callVideo}
//             />
//           ))}
//         </div>

//         <button onClick={endCall} style={styles.endCallBtn}>End Call</button>
//       </div>
//     );
//   }

//   // === Default: CHAT SCREEN ===
//   return (
//     <div style={styles.container}>
//       {/* Header */}
//       <div style={styles.header}>
//         <h3 style={{ color: "white", margin: 0 }}>{username}</h3>

//         {/* Video Call Button */}
//         <button
//           onClick={() => setInCall(true)}
//           style={styles.videoIcon}
//         >
//           📹
//         </button>
//       </div>

//       {/* Chat List */}
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

//       {/* Input */}
//       <div style={styles.inputArea}>
//         <input
//           type="text"
//           placeholder="Message"
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           style={styles.input}
//         />
//         <button onClick={sendMessage} style={styles.sendBtn}>Send</button>
//       </div>
//     </div>
//   );
// };

// export default WhatsAppChatWithVideo;






















// const styles = {
//   container: {
//     width: "450px",
//     height: "750px",
//     margin: "20px auto",
//     display: "flex",
//     flexDirection: "column",
//     backgroundColor: "#e5ddd5",
//     borderRadius: "10px",
//     overflow: "hidden",
//     border: "1px solid #ccc",
//   },

//   header: {
//     backgroundColor: "#075E54",
//     padding: "15px 18px",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   videoIcon: {
//     fontSize: "22px",
//     color: "white",
//     cursor: "pointer",
//     border: "none",
//     background: "none",
//   },

//   chatBox: {
//     flex: 1,
//     padding: "10px",
//     overflowY: "auto",
//     display: "flex",
//     flexDirection: "column",
//     gap: "8px",
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

//   /* --- CALL SCREEN --- */
//   callScreen: {
//     width: "450px",
//     height: "750px",
//     margin: "20px auto",
//     backgroundColor: "black",
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "space-between",
//     padding: "10px",
//     borderRadius: "10px",
//     overflow: "hidden",
//   },

//   callVideos: {
//     display: "flex",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     gap: "10px",
//     marginTop: "20px",
//   },

//   callVideo: {
//     width: "220px",
//     height: "160px",
//     backgroundColor: "black",
//     borderRadius: "10px",
//   },

//   endCallBtn: {
//     backgroundColor: "red",
//     padding: "14px",
//     borderRadius: "50px",
//     border: "none",
//     color: "white",
//     fontSize: "16px",
//     cursor: "pointer",
//     margin: "0 auto 20px",
//     width: "120px",
//   },
// };


























































// WhatsAppChatVideo.jsx
import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import SimplePeer from "simple-peer";
import { FaVideo, FaPhoneSlash } from "react-icons/fa";

// Connect to Socket.IO server
const socket = io("http://192.168.32.132:5000");

const WhatsAppChatVideo = () => {
  // Chat states
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [username, setUsername] = useState("");

  // Video call states
  const [inCall, setInCall] = useState(false);
  const myVideoRef = useRef(null);
  const [remoteVideos, setRemoteVideos] = useState([]); // {id, stream}
  const peersRef = useRef({}); // { peerId: SimplePeer }
  const [stream, setStream] = useState(null);

  const chatEndRef = useRef(null);
  const [clientId, setClientId] = useState("");

  // Ask username
  useEffect(() => {
    let name = prompt("Enter your name:");
    if (!name) name = "Guest";
    setUsername(name);

    socket.on("connect", () => setClientId(socket.id));
  }, []);

  // Receive chat messages
  useEffect(() => {
    const handleChat = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on("chat", handleChat);
    return () => socket.off("chat", handleChat);
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start video call
  const startCall = () => {
    setInCall(true);
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (myVideoRef.current) myVideoRef.current.srcObject = mediaStream;

        socket.emit("ready-for-call");

        // New user joined
        socket.on("new-user", (newUserId) => {
          const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: mediaStream,
            config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
          { urls: "turn:turnserver.example.com", username: "user", credential: "pass" }
      ]
    }
          });

          peer.on("signal", (signal) => {
            socket.emit("signal", { signal, to: newUserId });
          });

          peer.on("stream", (userStream) => {
            setRemoteVideos((prev) => [...prev, { id: newUserId, stream: userStream }]);
          });

          peersRef.current[newUserId] = peer;
        });

        // Receive signal
        socket.on("signal", ({ signal, from }) => {
          if (!peersRef.current[from]) {
            const peer = new SimplePeer({
              initiator: false,
              trickle: false,
              stream: mediaStream,
              config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
          { urls: "turn:turnserver.example.com", username: "user", credential: "pass" }
      ]
    }
            });

            peer.on("signal", (signalData) => {
              socket.emit("signal", { signal: signalData, to: from });
            });

            peer.on("stream", (userStream) => {
              setRemoteVideos((prev) => [...prev, { id: from, stream: userStream }]);
            });

            peersRef.current[from] = peer;
            peer.signal(signal);
          } else {
            peersRef.current[from].signal(signal);
          }
        });

        // User left
        socket.on("user-left", (id) => {
          if (peersRef.current[id]) {
            peersRef.current[id].destroy();
            delete peersRef.current[id];
          }
          setRemoteVideos((prev) => prev.filter((v) => v.id !== id));
        });
      })
      .catch((err) => console.error(err));
  };

  // End call
  const endCall = () => {
    setInCall(false);
    Object.values(peersRef.current).forEach((p) => p.destroy());
    peersRef.current = {};
    setRemoteVideos([]);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Send chat message
  const sendMessage = () => {
    if (!userInput.trim()) return;

    const msg = {
      user: username,
      text: userInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    socket.emit("chatMessage", msg);
    setUserInput("");
  };

  // ----------------- RENDER -----------------
  if (inCall) {
    return (
      <div style={styles.container}>
        {/* Video Call */}
        <div style={styles.videoContainer}>
          <video ref={myVideoRef} autoPlay playsInline muted style={styles.video} />
          {remoteVideos.map((v) => (
            <video
              key={v.id}
              ref={(el) => el && (el.srcObject = v.stream)}
              autoPlay
              playsInline
              style={styles.video}
            />
          ))}
        </div>

        {/* End call button */}
        <button style={styles.endCallBtn} onClick={endCall}>
          <FaPhoneSlash /> End Call
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={{ color: "white", margin: 0 }}>WhatsApp Chat</h3>
        <small style={{ color: "#e0ffe0" }}>Logged in as: {username}</small>
        <FaVideo style={styles.videoIcon} onClick={startCall} title="Start Video Call" />
      </div>

      {/* Chat Area */}
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.messageBubble,
              alignSelf: msg.user === username ? "flex-end" : "flex-start",
              backgroundColor: msg.user === username ? "#dcf8c6" : "white",
            }}
          >
            <div style={styles.msgUser}>{msg.user}</div>
            <div>{msg.text}</div>
            <div style={styles.msgTime}>{msg.time}</div>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Area */}
      <div style={styles.inputArea}>
        <input
          type="text"
          placeholder="Type a message"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendBtn}>
          Send
        </button>
      </div>
    </div>
  );
};

export default WhatsAppChatVideo;

// ------------------- STYLES -------------------
const styles = {
  container: {
    width: "450px",
    height: "750px",
    margin: "20px auto",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden",
    fontFamily: "Arial",
    backgroundColor: "#f0f0f0",
  },
  header: {
    backgroundColor: "#075E54",
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    padding: "10px",
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    width: "200px",
    height: "150px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "black",
  },
  endCallBtn: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "10px",
    margin: "10px auto",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "16px",
  },
  chatBox: {
    flex: 1,
    padding: "10px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    backgroundColor: "#e5ddd5",
    borderTop: "1px solid #ccc",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0px 1px 2px rgba(0,0,0,0.2)",
  },
  msgUser: {
    fontSize: "12px",
    color: "#075E54",
    marginBottom: "3px",
  },
  msgTime: {
    fontSize: "10px",
    textAlign: "right",
    color: "#555",
    marginTop: "3px",
  },
  inputArea: {
    padding: "10px",
    display: "flex",
    gap: "8px",
    backgroundColor: "#eee",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    border: "1px solid #ccc",
  },
  sendBtn: {
    padding: "10px 15px",
    backgroundColor: "#25D366",
    border: "none",
    borderRadius: "20px",
    color: "white",
    cursor: "pointer",
  },
};
