import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataContext from "../context/DataContext";

function TutorServiceRequests() {
  const { currentUser } = useContext(DataContext);
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);

  useEffect(() => {
    if (currentUser?.topics) {
      let found = null;
      for (const topic of currentUser.topics) {
        found = topic.tutor_services?.find((s) => s.id === parseInt(serviceId));
        if (found) break;
      }
      setService(found);
    }
  }, [currentUser, serviceId]);

  if (!service) return <div>Loading...</div>;

  const requests = service.requests || [];

  return (
    <div className="py-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/topics")}>
        ← Back
      </button>

      <div className="card mb-4">
        <div className="card-body">
          <h2 className="mb-3">{service.topic?.topic}</h2>
          <p><strong>Rate:</strong> ${service.rate}/hour</p>
          <p><strong>Description:</strong> {service.description || "No description"}</p>
        </div>
      </div>

      <h3>Student Requests ({requests.length})</h3>
      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        requests.map((req) => (
          <div key={req.id} className="card mb-2">
            <div className="card-body">
              <p><strong>Student:</strong> {req.student_id}</p>
              <p><strong>Status:</strong> {req.status}</p>
              <p><strong>Message:</strong> {req.description}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default TutorServiceRequests;
