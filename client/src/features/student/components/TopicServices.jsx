import { useNavigate } from "react-router-dom";

function TopicServices({ topic }) {
  const navigate = useNavigate();
  const services = topic.tutor_services || [];

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-2">{topic.topic}</h5>
        <p className="card-text text-muted mb-4">{topic.description}</p>

        {services.length === 0 ? (
          <p className="text-muted small">No services in this topic</p>
        ) : (
          <div className="d-grid gap-2">
            {services.map((service) => (
              <div key={service.id}>
                <div className="card">
                  <div className="card-body bg-light d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <p className="mb-2">
                        <strong>Tutor:</strong> {service.tutor?.name}
                      </p>
                      <p className="mb-2">
                        <strong>Rate:</strong> ${service.rate}/hour
                      </p>
                      <p className="mb-0 text-muted small">
                        <strong>Service:</strong> {service.description || "No description"}
                      </p>
                    </div>
                    {service.requests.length > 0 && (
                      <div className="ms-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/student/topic/${topic.id}/service/${service.id}/requests`)}
                        >
                          View Requests ({service.requests.length})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TopicServices;
