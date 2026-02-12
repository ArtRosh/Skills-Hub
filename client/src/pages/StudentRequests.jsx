import { useContext, useState } from "react";
import DataContext from "../context/DataContext";

function StudentRequests() {
  const { currentUser } = useContext(DataContext);
  const [expandedServices, setExpandedServices] = useState({});

  const toggleExpanded = (serviceId) => {
    setExpandedServices((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  if (!currentUser || currentUser.role !== "student") {
    return <p>You must be logged in as a student to view this page.</p>;
  }

  const topics = currentUser.topics || [];

  return (
    <div className="py-4">
      <h1 className="mb-3">My Requests</h1>

      {topics.length === 0 ? (
        <p className="text-muted">You haven't made any requests yet.</p>
      ) : (
        <div className="d-grid gap-3">
          {topics.map((topic) => (
            <div key={topic.id} className="card">
              <div className="card-body">
                <h5 className="card-title">{topic.topic}</h5>
                <p className="card-text text-muted">{topic.description}</p>

                {topic.tutor_services.length === 0 ? (
                  <p className="text-muted small">No services in this topic</p>
                ) : (
                  <div className="d-grid gap-2">
                    {topic.tutor_services.map((service) => (
                      <div key={service.id} className="border rounded p-3">
                        <div className="bg-light p-3 rounded mb-3">
                          <p className="mb-1">
                            <strong>Tutor:</strong> {service.tutor?.name}
                          </p>
                          <p className="mb-1">
                            <strong>Rate:</strong> ${service.rate}/hour
                          </p>
                          <p className="mb-0 text-muted small">
                            <strong>Service:</strong> {service.description || "No description"}
                          </p>
                        </div>

                        {service.requests.length === 0 ? (
                          <p className="text-muted small mb-0">No requests for this service</p>
                        ) : (
                          <div>
                            <button
                              className="btn btn-link btn-sm p-0"
                              onClick={() => toggleExpanded(service.id)}
                            >
                              {expandedServices[service.id] ? "▼" : "▶"} Requests (
                              {service.requests.length})
                            </button>

                            {expandedServices[service.id] && (
                              <div className="mt-3 pt-3 border-top">
                                {service.requests.map((req) => (
                                  <div key={req.id} className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
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
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentRequests;
