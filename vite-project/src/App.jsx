import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001");

function App() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");

  useEffect(() => {
    socket.on("message", (msg) => {
      if (msg.user === username) return;
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("users", (users) => {
      setUsers(users);
    });

    socket.on("typing", (user) => {
      setTyping(`${user} is typing...`);
      setTimeout(() => setTyping(""), 2000);
    });

    return () => {
      socket.off("message");
      socket.off("users");
      socket.off("typing");
    };
  }, [username]);

  const joinChat = () => {
    if (!username) return;
    socket.emit("join", username);
    setJoined(true);
  };

  const sendMessage = () => {
    if (!message) return;

    const msgData = {
      user: username,
      text: message,
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, msgData]);
    socket.emit("sendMessage", msgData);
    setMessage("");
  };

  const handleTyping = () => {
    socket.emit("typing", username);
  };

  if (!joined) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Enter Username</h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your name"
        />
        <br /><br />
        <button onClick={joinChat}>Enter Chat</button>
      </div>
    );
  }

  return (
    <div style={{ width: "600px", margin: "auto", marginTop: "50px" }}>
      <h2 style={{ textAlign: "center" }}>Chat Room</h2>
      <p>Online: {users.join(", ")}</p>

      <div
        style={{
          border: "1px solid gray",
          height: "300px",
          overflowY: "scroll",
          padding: "10px",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <strong>{m.user}</strong>: {m.text}
            <span style={{ fontSize: "12px", marginLeft: "10px", color: "gray" }}>
              {m.time}
            </span>
          </div>
        ))}
      </div>

      <p style={{ color: "gray" }}>{typing}</p>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          style={{ flex: 1 }}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;