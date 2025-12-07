


//  y code sahi hai chat or video call ka code bhi hai but ye error aya hai ki simple peer is not defined and socket io client is also not defined so please help me with that.


// import React, { useState, useEffect, useRef } from "react";
// import { io } from "socket.io-client";
// import SimplePeer from "simple-peer";
// import { FaVideo, FaPhoneSlash } from "react-icons/fa";

// const socket = io("http://192.168.1.26:5000");

// const WhatsAppChatVideo = () => {
//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [username, setUsername] = useState("");
//   const [inCall, setInCall] = useState(false);
//   const [stream, setStream] = useState(null);
//   const [remoteVideos, setRemoteVideos] = useState([]);
//   const peersRef = useRef({});
//   const myVideoRef = useRef(null);
//   const chatEndRef = useRef(null);
//   const [meetingId, setMeetingId] = useState("");

//   // Ask username
//   useEffect(() => {
//     let name = prompt("Enter your name:");
//     if (!name) name = "Guest";
//     setUsername(name);
//   }, []);

//   // Chat receiver
//   useEffect(() => {
//     socket.on("chat", (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     });
//   }, []);

//   // Auto scroll chat
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // -------------------------------------
//   // HANDLE WEBRTC EVENTS ONCE
//   // -------------------------------------
//   useEffect(() => {
//     if (!meetingId || !stream) return;

//     const handleNewUser = ({ newUserId, meeting }) => {
//       if (meeting !== meetingId) return;
//       createPeer(newUserId, stream, true);
//     };

//     const handleSignal = ({ signal, from, meeting }) => {
//       if (meeting !== meetingId) return;

//       if (!peersRef.current[from]) {
//         createPeer(from, stream, false, signal);
//       } else {
//         peersRef.current[from].signal(signal);
//       }
//     };

//     const handleUserLeft = (id) => {
//       if (peersRef.current[id]) {
//         peersRef.current[id].destroy();
//         delete peersRef.current[id];
//       }
//       setRemoteVideos((prev) => prev.filter((v) => v.id !== id));
//     };

//     socket.on("new-user", handleNewUser);
//     socket.on("signal", handleSignal);
//     socket.on("user-left", handleUserLeft);

//     return () => {
//       socket.off("new-user", handleNewUser);
//       socket.off("signal", handleSignal);
//       socket.off("user-left", handleUserLeft);
//     };
//   }, [meetingId, stream]);

//   // -------------------------------------
//   // Start Call (with meeting ID)
//   // -------------------------------------
//   const handleVideoClick = () => {
//     const type = prompt("Type 'create' to create meeting or 'join' to join:");

//     if (type === "create") {
//       const newId =
//         prompt("Enter meeting ID:") || Math.random().toString(36).slice(2, 8);
//       setMeetingId(newId);
//       alert("Meeting created! Share this ID: " + newId);
//       startCall(newId);
//     } else if (type === "join") {
//       const joinId = prompt("Enter meeting ID:");
//       if (!joinId) return alert("Enter meeting ID!");
//       setMeetingId(joinId);
//       startCall(joinId);
//     }
//   };

//   const startCall = async (meetId) => {
//     setInCall(true);

//     const mediaStream = await navigator.mediaDevices?.getUserMedia({
//       video: true,
//       audio: true,
//     });

//     setStream(mediaStream);
//     if (myVideoRef.current) myVideoRef.current.srcObject = mediaStream;

//     socket.emit("ready-for-call", { meetingId: meetId });
//   };

//   // -------------------------------------
//   // PEER CREATION
//   // -------------------------------------
//   const createPeer = (peerId, mediaStream, initiator, incomingSignal = null) => {
//     const peer = new SimplePeer({
//       initiator,
//       trickle: false,
//       stream: mediaStream,
//       config: {
//         iceServers: [
//           { urls: "stun:stun.l.google.com:19302" },
//           {
//             urls: "turn:turnserver.example.com",
//             username: "user",
//             credential: "pass",
//           },
//         ],
//       },
//     });

//     peer.on("signal", (signalData) => {
//       socket.emit("signal", {
//         signal: signalData,
//         to: peerId,
//         meeting: meetingId,
//       });
//     });

//     peer.on("stream", (userStream) => {
//       setRemoteVideos((prev) => [...prev, { id: peerId, stream: userStream }]);
//     });

//     if (incomingSignal) peer.signal(incomingSignal);

//     peersRef.current[peerId] = peer;
//   };

//   // End Call
//   const endCall = () => {
//     setInCall(false);
//     Object.values(peersRef.current).forEach((p) => p.destroy());
//     peersRef.current = {};
//     setRemoteVideos([]);

//     if (stream) {
//       stream.getTracks().forEach((t) => t.stop());
//       setStream(null);
//     }
//   };

//   // Send chat message
//   const sendMessage = () => {
//     if (!userInput.trim()) return;
//     const msg = {
//       user: username,
//       text: userInput,
//       time: new Date().toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       }),
//     };
//     socket.emit("chatMessage", msg);
//     setUserInput("");
//   };

//   // -------------------------------------
//   // UI
//   // -------------------------------------
//   if (inCall) {
//     return (
//       <div style={styles.container}>
//         <div style={styles.videoContainer}>
//           <video ref={myVideoRef} autoPlay muted playsInline style={styles.video} />

//           {remoteVideos.map((v) => (
//             <video
//               key={v.id}
//               autoPlay
//               playsInline
//               style={styles.video}
//               ref={(el) => el && (el.srcObject = v.stream)}
//             />
//           ))}
//         </div>

//         <button onClick={endCall} style={styles.endCallBtn}>
//           <FaPhoneSlash /> End Call
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <h3 style={{ color: "white" }}>WhatsApp Chat</h3>
//         <small style={{ color: "#e0ffe0" }}>Logged in as: {username}</small>
//         <FaVideo style={styles.videoIcon} onClick={handleVideoClick} />
//       </div>

//       <div style={styles.chatBox}>
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             style={{
//               ...styles.messageBubble,
//               alignSelf: msg.user === username ? "flex-end" : "flex-start",
//               background: msg.user === username ? "#dcf8c6" : "white",
//             }}
//           >
//             <strong>{msg.user}</strong>
//             <div>{msg.text}</div>
//             <small>{msg.time}</small>
//           </div>
//         ))}
//         <div ref={chatEndRef} />
//       </div>

//       <div style={styles.inputArea}>
//         <input
//           style={styles.input}
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           placeholder="Type message..."
//         />
//         <button style={styles.sendBtn} onClick={sendMessage}>
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default WhatsAppChatVideo;

// // Styles
// const styles = {
//   container: {
//     width: "450px",
//     height: "750px",
//     background: "#f0f0f0",
//     margin: "20px auto",
//     borderRadius: "10px",
//     display: "flex",
//     flexDirection: "column",
//     overflow: "hidden",
//     border: "1px solid #ddd",
//   },
//   header: {
//     background: "#075E54",
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
//     flex: 1,
//     background: "#000",
//     display: "flex",
//     flexWrap: "wrap",
//     gap: "10px",
//     justifyContent: "center",
//     padding: "10px",
//   },
//   video: {
//     width: "200px",
//     height: "150px",
//     background: "black",
//     borderRadius: "10px",
//   },
//   endCallBtn: {
//     background: "red",
//     color: "white",
//     padding: "10px",
//     margin: "10px",
//     borderRadius: "12px",
//   },
//   chatBox: {
//     flex: 1,
//     padding: "10px",
//     overflowY: "auto",
//   },
//   messageBubble: {
//     padding: "10px",
//     borderRadius: "10px",
//     marginBottom: "10px",
//     maxWidth: "70%",
//   },
//   inputArea: {
//     padding: "10px",
//     background: "#eee",
//     display: "flex",
//     gap: "10px",
//   },
//   input: {
//     flex: 1,
//     padding: "10px",
//     borderRadius: "20px",
//   },
//   sendBtn: {
//     background: "#25D366",
//     padding: "10px 15px",
//     borderRadius: "20px",
//     color: "white",
//   },
// };







































// import React, { useState, useEffect, useRef } from "react";
// import { io } from "socket.io-client";
// import SimplePeer from "simple-peer";
// import { FaVideo, FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaVideoSlash } from "react-icons/fa";

// const socket = io("http://localhost:5000");

// // Remote video component
// const RemoteVideo = ({ stream }) => {
//   const ref = useRef();
//   useEffect(() => {
//     if (ref.current) ref.current.srcObject = stream;
//   }, [stream]);
//   return <video ref={ref} autoPlay playsInline style={styles.video} />;
// };

// const WhatsAppChatVideo = () => {
//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [username, setUsername] = useState("");
//   const [inCall, setInCall] = useState(false);
//   const [stream, setStream] = useState(null);
//   const [remoteVideos, setRemoteVideos] = useState([]);
//   const [meetingId, setMeetingId] = useState("");

//   const [file, setFile] = useState(null);
//   const [fileProgress, setFileProgress] = useState(0);

//   const [brushColor, setBrushColor] = useState("#000");
//   const [brushSize, setBrushSize] = useState(2);

//   const [cameraOn, setCameraOn] = useState(true);
//   const [micOn, setMicOn] = useState(true);

//   const peersRef = useRef({});
//   const myVideoRef = useRef();
//   const chatEndRef = useRef();
//   const canvasRef = useRef();
//   const ctxRef = useRef();
//   const drawing = useRef(false);

//   // ------------------ Username ------------------
//   useEffect(() => {
//     const name = prompt("Enter your name:") || "Guest";
//     setUsername(name);
//   }, []);

//   // ------------------ Chat Receive ------------------
//   useEffect(() => {
//     socket.on("chat", (m) => setMessages((p) => [...p, m]));
//   }, []);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // ------------------ WebRTC listeners ------------------
//   useEffect(() => {
//     if (!meetingId || !stream) return;

//     socket.on("new-user", ({ userId }) => {
//       createPeer(userId, stream, true);
//     });

//     socket.on("signal", ({ from, signal }) => {
//       if (!peersRef.current[from]) {
//         createPeer(from, stream, false, signal);
//       } else {
//         peersRef.current[from].signal(signal);
//       }
//     });

//     socket.on("user-left", ({ userId }) => {
//       if (peersRef.current[userId]) peersRef.current[userId].destroy();
//       delete peersRef.current[userId];
//       setRemoteVideos((p) => p.filter((v) => v.id !== userId));
//     });

//     socket.on("draw", ({ x, y, color, size }) => {
//       if (!ctxRef.current) return;
//       ctxRef.current.strokeStyle = color;
//       ctxRef.current.lineWidth = size;
//       ctxRef.current.lineTo(x, y);
//       ctxRef.current.stroke();
//       ctxRef.current.beginPath();
//       ctxRef.current.moveTo(x, y);
//     });
//   }, [meetingId, stream]);

//   // ------------------ Start Call ------------------
//   const handleVideoClick = async () => {
//     const choice = prompt("Type 'create' or 'join'");

//     if (choice === "create") {
//       const id = Math.random().toString(36).slice(2, 8);
//       setMeetingId(id);
//       alert("Share Meeting ID: " + id);
//       startCall(id);
//     } else {
//       const id = prompt("Enter Meeting ID");
//       if (!id) return;
//       setMeetingId(id);
//       startCall(id);
//     }
//   };

//   const startCall = async (mid) => {
//     setInCall(true);

//     const media = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });

//     setStream(media);
//     myVideoRef.current.srcObject = media;

//     socket.emit("join-meeting", { meetingId: mid });

//     // Setup canvas
//     const canvas = canvasRef.current;
//     canvas.width = 400;
//     canvas.height = 300;
//     const ctx = canvas.getContext("2d");
//     ctxRef.current = ctx;

//     canvas.onmousedown = () => (drawing.current = true);
//     canvas.onmouseup = () => {
//       drawing.current = false;
//       ctx.beginPath();
//     };
//     canvas.onmousemove = (e) => {
//       if (!drawing.current) return;

//       const rect = canvas.getBoundingClientRect();
//       const x = e.clientX - rect.left;
//       const y = e.clientY - rect.top;

//       ctx.lineWidth = brushSize;
//       ctx.strokeStyle = brushColor;
//       ctx.lineTo(x, y);
//       ctx.stroke();
//       ctx.beginPath();
//       ctx.moveTo(x, y);

//       socket.emit("draw", { x, y, color: brushColor, size: brushSize });
//     };
//   };

//   // ------------------ Create Peer ------------------
//   const createPeer = (peerId, mediaStream, initiator, incoming = null) => {
//     const peer = new SimplePeer({
//       initiator,
//       trickle: false,
//       stream: mediaStream,
//     });

//     peer.on("signal", (signal) => {
//       socket.emit("signal", { to: peerId, signal });
//     });

//     peer.on("stream", (userStream) => {
//       setRemoteVideos((p) => [...p.filter((v) => v.id !== peerId), { id: peerId, stream: userStream }]);
//     });

//     peer.on("data", (data) => {
//       const blob = new Blob([data]);
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "file";
//       a.click();
//     });

//     peer.on("close", () => {
//       delete peersRef.current[peerId];
//       setRemoteVideos((p) => p.filter((v) => v.id !== peerId));
//     });

//     if (incoming) peer.signal(incoming);

//     peersRef.current[peerId] = peer;
//   };

//   // ------------------ File Sharing ------------------
//   const sendFile = () => {
//     if (!file) return alert("Select a file first!");

//     const connectedPeers = Object.values(peersRef.current).filter((p) => p.connected);
//     if (connectedPeers.length === 0) return alert("No connected peers!");

//     const reader = new FileReader();
//     reader.onload = () => {
//       const buffer = reader.result;
//       const chunkSize = 16 * 1024;
//       let offset = 0;

//       const sendChunk = () => {
//         const slice = buffer.slice(offset, offset + chunkSize);

//         Object.values(peersRef.current).forEach((peer) => {
//           if (peer.connected) {
//             try {
//               peer.send(slice);
//             } catch (e) {
//               console.warn("Send error:", e);
//             }
//           }
//         });

//         offset += chunkSize;
//         setFileProgress((offset / buffer.byteLength) * 100);

//         if (offset < buffer.byteLength) requestAnimationFrame(sendChunk);
//       };

//       sendChunk();
//     };

//     reader.readAsArrayBuffer(file);
//   };

//   // ------------------ Camera / Mic Toggle ------------------
//   const toggleCamera = () => {
//     if (!stream) return;
//     const videoTrack = stream.getVideoTracks()[0];
//     videoTrack.enabled = !videoTrack.enabled;
//     setCameraOn(videoTrack.enabled);
//   };

//   const toggleMic = () => {
//     if (!stream) return;
//     const audioTrack = stream.getAudioTracks()[0];
//     audioTrack.enabled = !audioTrack.enabled;
//     setMicOn(audioTrack.enabled);
//   };

//   // ------------------ End Call ------------------
//   const endCall = () => {
//     setInCall(false);

//     Object.values(peersRef.current).forEach((p) => p.destroy());
//     peersRef.current = {};
//     setRemoteVideos([]);

//     if (stream) stream.getTracks().forEach((t) => t.stop());
//     setStream(null);

//     setFileProgress(0);
//   };

//   // ------------------ Chat Send ------------------
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

//   // ------------------ UI ------------------
//   if (inCall) {
//     return (
//       <div style={styles.container}>
//         <div style={styles.videoContainer}>
//           <video ref={myVideoRef} autoPlay muted playsInline style={styles.video} />
//           {remoteVideos.map((v) => (
//             <RemoteVideo key={v.id} stream={v.stream} />
//           ))}
//         </div>

//         {/* Camera & Mic Controls */}
//         <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "10px" }}>
//           <button onClick={toggleCamera} style={styles.controlBtn}>
//             {cameraOn ? <FaVideo /> : <FaVideoSlash />}
//           </button>
//           <button onClick={toggleMic} style={styles.controlBtn}>
//             {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
//           </button>
//         </div>

//         <h4>Whiteboard</h4>
//         <canvas ref={canvasRef} style={{ border: "2px solid #000" }} />

//         <div>
//           <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} />
//           <input type="number" min="1" max="10" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} />
//         </div>

//         <div>
//           <h4>File Share</h4>
//           <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//           <button
//             onClick={sendFile}
//             disabled={Object.values(peersRef.current).filter((p) => p.connected).length === 0}
//           >
//             Send
//           </button>
//           {fileProgress > 0 && <div>Progress: {fileProgress.toFixed(0)}%</div>}
//         </div>

//         <button onClick={endCall} style={styles.endCallBtn}>
//           <FaPhoneSlash /> End
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div style={styles.container}>
//       <div style={styles.header}>
//         <h3 style={{ color: "white" }}>WhatsApp Chat</h3>
//         <small style={{ color: "lightgreen" }}>Hi: {username}</small>
//         <FaVideo style={styles.videoIcon} onClick={handleVideoClick} />
//       </div>

//       <div style={styles.chatBox}>
//         {messages.map((m, i) => (
//           <div
//             key={i}
//             style={{
//               ...styles.messageBubble,
//               alignSelf: m.user === username ? "flex-end" : "flex-start",
//               background: m.user === username ? "#dcf8c6" : "#fff",
//             }}
//           >
//             <strong>{m.user}</strong>
//             <div>{m.text}</div>
//             <small>{m.time}</small>
//           </div>
//         ))}
//         <div ref={chatEndRef} />
//       </div>

//       <div style={styles.inputArea}>
//         <input
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           style={styles.input}
//           placeholder="Type message..."
//         />
//         <button style={styles.sendBtn} onClick={sendMessage}>
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default WhatsAppChatVideo;

// // ------------------ STYLES ------------------
// const styles = {
//   container: {
//     width: "480px",
//     height: "850px",
//     background: "#f0f0f0",
//     margin: "20px auto",
//     borderRadius: "10px",
//     display: "flex",
//     flexDirection: "column",
//     overflow: "hidden",
//     border: "1px solid #ddd",
//   },
//   header: {
//     background: "#075E54",
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
//     flex: 1,
//     background: "#000",
//     display: "flex",
//     flexWrap: "wrap",
//     gap: "10px",
//     justifyContent: "center",
//     padding: "10px",
//   },
//   video: {
//     width: "200px",
//     height: "150px",
//     background: "black",
//     borderRadius: "10px",
//   },
//   endCallBtn: {
//     background: "red",
//     color: "white",
//     padding: "10px",
//     margin: "10px",
//     borderRadius: "12px",
//   },
//   controlBtn: {
//     background: "#333",
//     color: "white",
//     padding: "10px 15px",
//     borderRadius: "10px",
//     cursor: "pointer",
//     fontSize: "18px",
//   },
//   chatBox: { flex: 1, padding: "10px", overflowY: "auto" },
//   messageBubble: {
//     padding: "10px",
//     borderRadius: "10px",
//     marginBottom: "10px",
//     maxWidth: "70%",
//   },
//   inputArea: { padding: "10px", background: "#eee", display: "flex", gap: "10px" },
//   input: { flex: 1, padding: "10px", borderRadius: "20px" },
//   sendBtn: { background: "#25D366", padding: "10px 15px", borderRadius: "20px", color: "white" },
// };











































import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import SimplePeer from "simple-peer";
import { FaVideo, FaMicrophone, FaMicrophoneSlash, FaPhoneSlash, FaDesktop } from "react-icons/fa";

const socket = io("http://192.168.32.132:5000");

// Remote video component
const RemoteVideo = ({ stream }) => {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay playsInline style={styles.video} />;
};

const WhatsAppChatVideo = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [username, setUsername] = useState("");
  const [inCall, setInCall] = useState(false);
  const [stream, setStream] = useState(null);
  const [remoteVideos, setRemoteVideos] = useState([]);
  const [meetingId, setMeetingId] = useState("");
  const [file, setFile] = useState(null);
  const [fileProgress, setFileProgress] = useState(0);
  const [brushColor, setBrushColor] = useState("#000");
  const [brushSize, setBrushSize] = useState(2);
  const [screenSharing, setScreenSharing] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const peersRef = useRef({});
  const myVideoRef = useRef();
  const chatEndRef = useRef();
  const canvasRef = useRef();
  const ctxRef = useRef();
  const drawing = useRef(false);

  // ------------------ Username ------------------
  useEffect(() => {
    const name = prompt("Enter your name:") || "Guest";
    setUsername(name);
  }, []);

  // ------------------ Chat Receive ------------------
  useEffect(() => {
    socket.on("chat", (m) => setMessages((p) => [...p, m]));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ------------------ WebRTC listeners ------------------
  useEffect(() => {
    if (!meetingId || !stream) return;

    socket.on("new-user", ({ userId }) => {
      createPeer(userId, stream, true);
    });

    socket.on("signal", ({ from, signal }) => {
      if (!peersRef.current[from]) {
        createPeer(from, stream, false, signal);
      } else {
        peersRef.current[from].signal(signal);
      }
    });

    socket.on("user-left", ({ userId }) => {
      if (peersRef.current[userId]) peersRef.current[userId].destroy();
      delete peersRef.current[userId];
      setRemoteVideos((p) => p.filter((v) => v.id !== userId));
    });

    socket.on("draw", ({ x, y, color, size }) => {
      if (!ctxRef.current) return;
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = size;
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(x, y);
    });
  }, [meetingId, stream]);

  // ------------------ Start Call ------------------
  const handleVideoClick = async () => {
    const choice = prompt("Type 'create' or 'join'");
    if (choice === "create") {
      const id = Math.random().toString(36).slice(2, 8);
      setMeetingId(id);
      alert("Share Meeting ID: " + id);
      startCall(id);
    } else {
      const id = prompt("Enter Meeting ID");
      if (!id) return;
      setMeetingId(id);
      startCall(id);
    }
  };

  const startCall = async (mid) => {
    setInCall(true);

    const media = await navigator.mediaDevices?.getUserMedia({
      video: true,
      audio: true,
    });

    setStream(media);
    myVideoRef.current.srcObject = media;

    socket.emit("join-meeting", { meetingId: mid });

    // Setup canvas
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    canvas.onmousedown = () => (drawing.current = true);
    canvas.onmouseup = () => {
      drawing.current = false;
      ctx.beginPath();
    };
    canvas.onmousemove = (e) => {
      if (!drawing.current) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.lineWidth = brushSize;
      ctx.strokeStyle = brushColor;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);

      socket.emit("draw", { x, y, color: brushColor, size: brushSize });
    };
  };

  // ------------------ Create Peer ------------------
  const createPeer = (peerId, mediaStream, initiator, incoming = null) => {
    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream: mediaStream,
      config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }, // Google Public STUN server
      {
            urls: "turn:turnserver.example.com",
            username: "user",
            credential: "pass",
          },
    ],
  },
    });

    peer.on("signal", (signal) => {
      socket.emit("signal", { to: peerId, signal });
    });

    peer.on("stream", (userStream) => {
      setRemoteVideos((p) => [
        ...p.filter((v) => v.id !== peerId),
        { id: peerId, stream: userStream },
      ]);
    });

    peer.on("data", (data) => {
      const blob = new Blob([data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "file";
      a.click();
    });

    peer.on("close", () => {
      delete peersRef.current[peerId];
      setRemoteVideos((p) => p.filter((v) => v.id !== peerId));
    });

    if (incoming) peer.signal(incoming);

    peersRef.current[peerId] = peer;
  };

  // ------------------ File Sharing ------------------
  const sendFile = () => {
    if (!file) return alert("Select a file first!");

    const connectedPeers = Object.values(peersRef.current).filter((p) => p.connected);
    if (connectedPeers.length === 0) return alert("No connected peers!");

    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result;
      const chunkSize = 16 * 1024;
      let offset = 0;

      const sendChunk = () => {
        const slice = buffer.slice(offset, offset + chunkSize);

        Object.values(peersRef.current).forEach((peer) => {
          if (peer.connected) {
            try {
              peer.send(slice);
            } catch (e) {
              console.warn("Send error:", e);
            }
          }
        });

        offset += chunkSize;
        setFileProgress((offset / buffer.byteLength) * 100);

        if (offset < buffer.byteLength) requestAnimationFrame(sendChunk);
      };

      sendChunk();
    };

    reader.readAsArrayBuffer(file);
  };

  // ------------------ Screen Share ------------------
  const startScreenShare = async () => {
    if (!stream) return;
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenSharing(true);
      myVideoRef.current.srcObject = screenStream;

      Object.values(peersRef.current).forEach((peer) => {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peer._pc.getSenders().find((s) => s.track.kind === "video");
        sender.replaceTrack(videoTrack);
      });

      // Handle stop sharing
      screenStream.getVideoTracks()[0].onended = () => stopScreenShare();
    } catch (err) {
      console.error("Screen share failed:", err);
    }
  };

  const stopScreenShare = () => {
    if (!stream) return;
    setScreenSharing(false);
    myVideoRef.current.srcObject = stream;

    Object.values(peersRef.current).forEach((peer) => {
      const videoTrack = stream.getVideoTracks()[0];
      const sender = peer._pc.getSenders().find((s) => s.track.kind === "video");
      sender.replaceTrack(videoTrack);
    });
  };

  // ------------------ Toggle Video ------------------
  const toggleVideo = () => {
    if (!stream) return;
    stream.getVideoTracks()[0].enabled = !videoEnabled;
    setVideoEnabled(!videoEnabled);
  };

  // ------------------ Toggle Audio ------------------
  const toggleAudio = () => {
    if (!stream) return;
    stream.getAudioTracks()[0].enabled = !audioEnabled;
    setAudioEnabled(!audioEnabled);
  };

  // ------------------ End Call ------------------
  const endCall = () => {
    setInCall(false);
    Object.values(peersRef.current).forEach((p) => p.destroy());
    peersRef.current = {};
    setRemoteVideos([]);
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setFileProgress(0);
    setScreenSharing(false);
    setVideoEnabled(true);
    setAudioEnabled(true);
  };

  // ------------------ Chat Send ------------------
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

  // ------------------ UI ------------------
  if (inCall) {
    return (
      <div style={styles.container}>
        <div style={styles.videoContainer}>
          <video ref={myVideoRef} autoPlay muted playsInline style={styles.video} />
          {remoteVideos.map((v) => (
            <RemoteVideo key={v.id} stream={v.stream} />
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px", margin: "5px" }}>
          <button onClick={toggleVideo} style={styles.controlBtn}>
            <FaVideo /> {videoEnabled ? "Camera On" : "Camera Off"}
          </button>
          <button onClick={toggleAudio} style={styles.controlBtn}>
            {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />} {audioEnabled ? "Mic On" : "Mic Off"}
          </button>
          <button onClick={screenSharing ? stopScreenShare : startScreenShare} style={styles.controlBtn}>
            <FaDesktop /> {screenSharing ? "Stop Share" : "Share Screen"}
          </button>
          <button onClick={endCall} style={styles.endCallBtn}>
            <FaPhoneSlash /> End
          </button>
        </div>

        <h4>Whiteboard</h4>
        <canvas ref={canvasRef} style={{ border: "2px solid #000" }} />

        <div>
          <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} />
          <input
            type="number"
            min="1"
            max="10"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
        </div>

        <div>
          <h4>File Share</h4>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button
            onClick={sendFile}
            disabled={Object.values(peersRef.current).filter((p) => p.connected).length === 0}
          >
            Send
          </button>
          {fileProgress > 0 && <div>Progress: {fileProgress.toFixed(0)}%</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={{ color: "white" }}>WhatsApp Chat</h3>
        <small style={{ color: "lightgreen" }}>Hi: {username}</small>
        <FaVideo style={styles.videoIcon} onClick={handleVideoClick} />
      </div>

      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              ...styles.messageBubble,
              alignSelf: m.user === username ? "flex-end" : "flex-start",
              background: m.user === username ? "#dcf8c6" : "#fff",
            }}
          >
            <strong>{m.user}</strong>
            <div>{m.text}</div>
            <small>{m.time}</small>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div style={styles.inputArea}>
        <input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={styles.input}
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

// ------------------ STYLES ------------------
const styles = {
  container: {
    width: "500px",
    height: "950px",
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
    borderRadius: "12px",
    cursor: "pointer",
  },
  controlBtn: {
    background: "#128C7E",
    color: "white",
    padding: "10px",
    borderRadius: "12px",
    cursor: "pointer",
  },
  chatBox: { flex: 1, padding: "10px", overflowY: "auto" },
  messageBubble: {
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "10px",
    maxWidth: "70%",
  },
  inputArea: { padding: "10px", background: "#eee", display: "flex", gap: "10px" },
  input: { flex: 1, padding: "10px", borderRadius: "20px" },
  sendBtn: { background: "#25D366", padding: "10px 15px", borderRadius: "20px", color: "white" },
};
