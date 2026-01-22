import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const socket = io("http://localhost:5000");

function App() {
  const [content, setContent] = useState("");
  const roomId = "demo-room";

  useEffect(() => {
    socket.emit("join-room", roomId);

    socket.on("receive-changes", (data) => {
      setContent(data);
    });

    return () => {
      socket.off("receive-changes");
    };
  }, []);

  const handleChange = (value) => {
    setContent(value);
    socket.emit("send-changes", {
      roomId,
      content: value,
    });
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Real-Time Collaboration Tool</h2>
      <p>Room: {roomId}</p>

      <ReactQuill
        theme="snow"
        value={content}
        onChange={handleChange}
        placeholder="Start collaborating..."
      />
    </div>
  );
}

export default App;



