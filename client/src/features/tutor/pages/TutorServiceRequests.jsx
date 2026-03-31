import { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataContext from "../../../context/DataContext";

function TutorServiceRequests() {
  const { currentUser, setCurrentUser } = useContext(DataContext);
  const { topicId, serviceId } = useParams();
  const navigate = useNavigate();

  const [updatingRequestId, setUpdatingRequestId] = useState(null);
  const [error, setError] = useState("");

  const topicIdNum = parseInt(topicId);
  const serviceIdNum = parseInt(serviceId);

  const topic = currentUser?.topics?.find((t) => t.id === topicIdNum);
  const service = topic?.tutor_services?.find((s) => s.id === serviceIdNum);

  if (!service) return <div>Loading...</div>;

  const requests = service.requests || [];

  function updateRequestStatus(requestId, status) {
    setError("");
    setUpdatingRequestId(requestId);

    fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error || "Failed to update request");
        return data;
      })
      .then((updatedReq) => {
        if (!currentUser) return;
        if (!topic || !service) return;

        const updatedRequests = (service.requests || []).map((r) =>
          r.id === updatedReq.id ? { ...r, ...updatedReq } : r
        );
        const updatedService = { ...service, requests: updatedRequests };

        const updatedServices = (topic.tutor_services || []).map((s) =>
          s.id === service.id ? updatedService : s
        );
        const updatedTopic = { ...topic, tutor_services: updatedServices };

        const updatedTopics = (currentUser.topics || []).map((t) =>
          t.id === topic.id ? updatedTopic : t
        );
        const updatedUser = { ...currentUser, topics: updatedTopics };

        setCurrentUser(updatedUser);
      })
      .catch((err) => setError(err.message))
      .finally(() => setUpdatingRequestId(null));
  }

  return (
    <div className="py-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/tutor_topics")}>
        ← Back
      </button>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="mb-3">{topic?.topic}</h2>
          <p><strong>Rate:</strong> ${service.rate}/hour</p>
          <p><strong>Description:</strong> {service.description || "No description"}</p>
        </div>
      </div>

      <h3>Student Requests ({requests.length})</h3>
      {requests.length === 0 ? (
        <p className="text-muted">No requests for this service.</p>
      ) : (
        <div className="d-grid gap-2">
          {requests.map((req) => (
            <div key={req.id} className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <p className="mb-1"><strong>Student:</strong> {req.student?.name}</p>
                    <span
                      className={`badge bg-${
                        req.status === "pending"
                          ? "warning"
                          : req.status === "accepted"
                          ? "success"
                          : "danger"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => updateRequestStatus(req.id, "accepted")}
                      disabled={updatingRequestId === req.id || req.status === "accepted"}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => updateRequestStatus(req.id, "rejected")}
                      disabled={updatingRequestId === req.id || req.status === "rejected"}
                    >
                      Reject
                    </button>
                  </div>
                </div>
                <p className="mb-0 text-muted">{req.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TutorServiceRequests;
