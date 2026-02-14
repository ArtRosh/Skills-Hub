import { useState } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import DataContext from "../../../context/DataContext";
import EditServiceModal from "./EditServiceModal";

function TopicServices({ topic }) {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(DataContext);
  const [editingService, setEditingService] = useState(null);
  const services = topic.tutor_services || [];

  return (
    <div className="card">
      <div className="card-body">
        {/* Topic Header */}
        <h5 className="card-title mb-2">{topic.topic}</h5>
        <p className="card-text text-muted mb-4">{topic.description}</p>

        {/* Services */}
        {services.length === 0 ? (
          <p className="text-muted small">No services listed</p>
        ) : (
          <div className="d-grid gap-2">
            {services.map((service) => (
              <div key={service.id} className="border rounded p-3 bg-light">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <p className="mb-2">
                      <strong>Rate:</strong> ${service.rate}/hour
                    </p>
                    <p className="mb-0 text-muted small">
                      <strong>Service:</strong> {service.description || "No description"}
                    </p>
                  </div>
                  <div className="ms-2 d-flex gap-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/tutor/topic/${topic.id}/service/${service.id}/requests`)}
                    >
                      View Requests ({service.requests.length})
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEditingService(service)}
                    >
                      Manage Service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditServiceModal
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        service={editingService}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
    </div>
  );
}

export default TopicServices;