import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const socket = io("http://localhost:5000");
const roomId = "demo-room";
const username = "Afsheen";

function App() {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [users, setUsers] = useState([]);

  // 🔹 Initialize editor ONCE
  useEffect(() => {
    if (quillRef.current) return;

    quillRef.current = new Quill(editorRef.current, {
      theme: "snow",
      placeholder: "Start collaborating...",
    });

    quillRef.current.on("text-change", (delta, oldDelta, source) => {
      if (source !== "user") return;

      socket.emit("send-changes", {
        roomId,
        delta,
      });
    });
  }, []);

  // 🔹 Socket logic (ALWAYS active)
  useEffect(() => {
    socket.emit("join-room", { roomId, username });

    socket.on("receive-changes", (delta) => {
      quillRef.current?.updateContents(delta, "silent");
    });

    // 👥 Presence updates
    socket.on("room-users", (users) => {
      setUsers(users);
    });

    return () => {
      socket.off("receive-changes");
      socket.off("room-users");
    };
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Real-Time Collaboration Tool</h2>
      <p>Room: {roomId}</p>

      {/* 👥 Online Users */}
      <div style={{ marginBottom: "15px" }}>
        <strong>Online Users:</strong>
        <ul>
          {users.map((u) => (
            <li key={u.id}>{u.username}</li>
          ))}
        </ul>
      </div>

      <div
        ref={editorRef}
        style={{ height: "300px", background: "white" }}
      />
    </div>
  );
}

export default App;
