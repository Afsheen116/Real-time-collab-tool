import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Real-Time Collaboration Tool</h1>
      <p>Socket is connected. Check browser console.</p>
    </div>
  );
}

export default App;

