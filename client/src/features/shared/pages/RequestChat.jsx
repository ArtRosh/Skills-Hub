import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import DataContext from "../../../context/DataContext";

function RequestChat() {
  const { currentUser } = useContext(DataContext);
  const { requestId } = useParams();
  const navigate = useNavigate();
  const socketUrl =
    process.env.REACT_APP_SOCKET_URL ||
    (window.location.port === "3000" ? "http://localhost:5555" : window.location.origin);

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const socketRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`/api/requests/${requestId}/messages`, {
      credentials: "include",
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || "Failed to load messages");
        return data;
      })
      .then((data) => setMessages(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [requestId]);

  useEffect(() => {
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_chat", { request_id: Number(requestId) });
    });

    socket.on("new_message", (message) => {
      if (message.request_id !== Number(requestId)) return;
      setMessages((current) => [...current, message]);
    });

    socket.on("error", (payload) => {
      if (payload?.error) setError(payload.error);
    });

    return () => {
      socket.disconnect();
    };
  }, [requestId, socketUrl]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!content.trim()) return;

    setError("");

    if (!socketRef.current?.connected) {
      fetch(`/api/requests/${requestId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: content.trim() }),
      })
        .then(async (r) => {
          const data = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(data.error || "Failed to send message");
          return data;
        })
        .then((message) => setMessages((current) => [...current, message]))
        .catch((err) => setError(err.message));

      setContent("");
      return;
    }

    socketRef.current?.emit("send_message", {
      request_id: Number(requestId),
      content: content.trim(),
    });
    setContent("");
  }

  return (
    <div className="py-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="card mb-3">
        <div className="card-body">
          <h2 className="mb-0">Chat</h2>
          <p className="text-muted mb-0">Request #{requestId}</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Loading messages...</p>
      ) : (
        <div className="card mb-3">
          <div className="card-body" style={{ maxHeight: 420, overflowY: "auto" }}>
            {messages.length === 0 ? (
              <p className="text-muted mb-0">No messages yet.</p>
            ) : (
              <div className="d-grid gap-2">
                {messages.map((message) => {
                  const isMine = message.sender_id === currentUser?.id;
                  return (
                    <div
                      key={message.id}
                      className={`p-2 rounded ${isMine ? "bg-primary text-white ms-auto" : "bg-light"}`}
                      style={{ maxWidth: "75%" }}
                    >
                      <div className="small fw-semibold mb-1">{message.sender?.name}</div>
                      <div>{message.content}</div>
                      <div className="small opacity-75 mt-1">
                        {message.created_at ? new Date(message.created_at).toLocaleString() : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="card-body d-flex gap-2">
          <input
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a message..."
          />
          <button className="btn btn-primary" type="submit">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default RequestChat;