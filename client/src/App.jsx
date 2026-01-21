import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [text, setText] = useState("");
  const roomId = "demo-room"; // static for Day-2

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("receive-changes", (content) => {
      setText(content);
    });

    return () => {
      socket.off("receive-changes");
    };
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    socket.emit("send-changes", {
      roomId,
      content: value,
    });
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Real-Time Collaboration Tool</h2>
      <p>Room: {roomId}</p>

      <textarea
        value={text}
        onChange={handleChange}
        rows="10"
        cols="60"
        placeholder="Start typing..."
      />
    </div>
  );
}

export default App;


