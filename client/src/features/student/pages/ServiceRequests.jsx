import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataContext from "../../../context/DataContext";

function StudentServiceRequests() {
  const { currentUser } = useContext(DataContext);
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);

  useEffect(() => {
    if (currentUser?.topics) {
      let found = null;
      for (const topic of currentUser.topics) {
        found = topic.tutor_services?.find((s) => s.id === parseInt(serviceId));
        if (found) {
          found.topic = topic; // attach the topic to the service
          break;
        }
      }
      setService(found);
    }
  }, [currentUser, serviceId]);

  if (!service) return <div>Loading...</div>;

  const requests = service.requests || [];

  return (
    <div className="py-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/student_topics")}>
        ← Back
      </button>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="mb-3">{service.topic?.topic}</h2>
          <p><strong>Tutor:</strong> {service.tutor?.name}</p>
          <p><strong>Rate:</strong> ${service.rate}/hour</p>
          <p><strong>Description:</strong> {service.description || "No description"}</p>
        </div>
      </div>

      <h3>My Requests ({requests.length})</h3>
      {requests.length === 0 ? (
        <p className="text-muted">No requests for this service.</p>
      ) : (
        <div className="d-grid gap-2">
          {requests.map((req) => (
            <div key={req.id} className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
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
                <p className="mb-0 text-muted">{req.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentServiceRequests;
