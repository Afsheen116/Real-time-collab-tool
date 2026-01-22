import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const socket = io("http://localhost:5000");
const roomId = "demo-room";

function App() {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

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
    socket.emit("join-room", roomId);

    socket.on("receive-changes", (delta) => {
      quillRef.current?.updateContents(delta, "silent");
    });

    return () => {
      socket.off("receive-changes");
    };
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Real-Time Collaboration Tool</h2>
      <p>Room: {roomId}</p>

      <div
        ref={editorRef}
        style={{ height: "300px", background: "white" }}
      />
    </div>
  );
}

export default App;
