import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import DataContext from "../../../context/DataContext";
import RequestServiceModal from "./RequestServiceModal";

function TopicServicesList({ topic }) {
  const { currentUser } = useContext(DataContext);
  const [requestingService, setRequestingService] = useState(null);
  const services = topic.tutor_services || [];

  const isStudent = currentUser?.role === "student";

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-2">{topic.topic}</h5>
        <p className="card-text text-muted mb-4">{topic.description}</p>

        {services.length === 0 ? (
          <p className="text-muted small">No tutors available for this topic yet.</p>
        ) : (
          <div className="d-grid gap-2">
            {services.map((service) => (
              <div key={service.id} className="border rounded p-3 bg-light">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <p className="mb-2">
                      <strong>Tutor:</strong> {service.tutor?.name || "Tutor"}
                    </p>
                    <p className="mb-2">
                      <strong>Rate:</strong> ${service.rate}/hour
                    </p>
                    <p className="mb-0 text-muted small">
                      <strong>Service:</strong> {service.description || "No description"}
                    </p>
                  </div>
                  <div className="ms-2">
                    {isStudent ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setRequestingService(service)}
                      >
                        Request
                      </button>
                    ) : currentUser ? (
                      <span className="text-muted small fst-italic">Tutor View</span>
                    ) : (
                      <Link to="/login" className="btn btn-outline-primary btn-sm">
                        Login to Request
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RequestServiceModal
        isOpen={!!requestingService}
        onClose={() => setRequestingService(null)}
        service={requestingService}
        topicName={topic.topic}
      />
    </div>
  );
}

export default TopicServicesList;
