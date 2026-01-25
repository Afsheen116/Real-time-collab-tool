import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const socket = io("http://localhost:5000");

// 📂 Multi-document support via URL
const roomId = window.location.pathname.split("/")[2] || "demo-room";
const username =
  sessionStorage.getItem("username") ||
  (() => {
    const name = prompt("Enter your name") || "Guest";
    sessionStorage.setItem("username", name);
    return name;
  })();


function App() {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [users, setUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  // 🔹 Initialize editor ONCE
  useEffect(() => {
    if (quillRef.current) return;

    quillRef.current = new Quill(editorRef.current, {
      theme: "snow",
      placeholder: "Start collaborating...",
    });

    quillRef.current.on("text-change", (delta, oldDelta, source) => {
      if (source !== "user") return;

      // ✍️ Typing indicator
      socket.emit("typing", { roomId, username });

      clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => {
        socket.emit("stop-typing", roomId);
      }, 1000);

      // 🔄 Real-time sync
      socket.emit("send-changes", {
        roomId,
        delta,
      });
    });
  }, []);

  // 🔹 Socket listeners
  useEffect(() => {
    socket.emit("join-room", { roomId, username });

    socket.on("receive-changes", (delta) => {
      quillRef.current?.updateContents(delta, "silent");
    });

    // 👥 Presence
    socket.on("room-users", (users) => {
      setUsers(users);
    });

    // ✍️ Typing events
    socket.on("user-typing", (name) => {
      if (name !== username) {
        setTypingUser(name);
      }
    });

    socket.on("user-stop-typing", () => {
      setTypingUser("");
    });

    return () => {
      socket.off("receive-changes");
      socket.off("room-users");
      socket.off("user-typing");
      socket.off("user-stop-typing");
    };
  }, []);

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "auto",
        padding: "30px",
        background: "#f9f9f9",
        borderRadius: "8px",
      }}
    >
<h2>📝 Real-Time Document Collaboration</h2>
<p style={{ color: "#666", marginTop: "-10px" }}>
  Edit together. Instantly.
</p>

      <p>
        <strong>Room:</strong> {roomId}
      </p>

      {/* 👥 Online Users */}
      <div style={{ marginBottom: "10px" }}>
        <strong>Online Users:</strong>
        <ul>
          {users.map((u) => (
            <li
              key={u.id}
              style={{
                display: "inline-block",
                marginRight: "8px",
                background: "#e0f2fe",
                padding: "4px 8px",
                borderRadius: "12px",
              }}
            >
              {u.username}
            </li>
          ))}
        </ul>
      </div>
      <button
  onClick={() => {
    navigator.clipboard.writeText(window.location.href);
    alert("Room link copied!");
  }}
  style={{
    marginBottom: "10px",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    cursor: "pointer",
  }}
>
  🔗 Copy Room Link
</button>


      {/* ✍️ Typing Indicator */}
      {typingUser && (
        <p style={{ fontStyle: "italic", color: "#555" }}>
          {typingUser} is typing…
        </p>
      )}

    <div
  ref={editorRef}
  style={{
    height: "300px",
    background: "white",
    borderRadius: "10px",
    border: "5px solid #ddd",
  }}
/>
<p
  style={{
    fontSize: "15px",
    color: "#777",
    marginTop: "6px",
  }}
>
  Changes are saved and synced in real time
</p>

    </div>  
    
    
  );
}

export default App;
