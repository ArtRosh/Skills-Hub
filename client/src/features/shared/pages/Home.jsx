// client/src/pages/Home.jsx
import { useContext, useState } from "react";
import DataContext from "../../../context/DataContext";
import { Link } from "react-router-dom";

function Home() {
  const { topics, topicsLoading, currentUser } = useContext(DataContext);
  
  // State for request modal
  const [selectedService, setSelectedService] = useState(null);
  const [requestDesc, setRequestDesc] = useState("");
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");

  const handleRequestClick = (service) => {
    setSelectedService(service);
    setRequestDesc("");
    setRequestError("");
    setRequestSuccess("");
  };

  const closeRequestModal = () => {
    setSelectedService(null);
  };

  const submitRequest = (e) => {
    e.preventDefault();
    if (!currentUser) return; // Should be logged in

    fetch("/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tutor_service_id: selectedService.id,
        description: requestDesc,
      }),
    })
      .then((r) => {
        if (r.ok) {
          setRequestSuccess("Request sent successfully!");
          setTimeout(() => {
            closeRequestModal();
          }, 1500);
        } else {
          r.json().then((err) => setRequestError(err.error || "Failed to send request"));
        }
      })
      .catch((err) => setRequestError("Network error"));
  };

  if (topicsLoading) {
    return (
      <div className="py-4">
        <h1 className="mb-2">Marketplace</h1>
        <p className="text-muted">Loading topics...</p>
      </div>
    );
  }

  // Helper to check if user is a student
  const isStudent = currentUser?.role === "student";

  return (
    <div className="py-4 position-relative">
      <h1 className="mb-3">Marketplace</h1>
      <p className="text-muted">Browse topics and find a tutor to help you learn!</p>

      {topics.length === 0 ? (
        <p className="text-muted">No topics available yet.</p>
      ) : (
        <div className="d-grid gap-4">
          {topics.map((t) => (
            <div key={t.id} className="card shadow-sm">
              <div className="card-header bg-light">
                <h4 className="mb-0">{t.topic}</h4>
                {t.description && <small className="text-muted">{t.description}</small>}
              </div>
              <div className="card-body">
                {t.tutor_services && t.tutor_services.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {t.tutor_services.map((service) => (
                      <div key={service.id} className="list-group-item d-flex justify-content-between align-items-start p-3">
                        <div className="me-auto">
                          <div className="fw-bold">{service.tutor?.name || "Tutor"}</div>
                          <div className="text-muted small mb-1">{service.description}</div>
                          <span className="badge bg-secondary">${service.rate}/hr</span>
                        </div>
                        
                        {isStudent ? (
                          <button 
                            className="btn btn-primary btn-sm align-self-center"
                            onClick={() => handleRequestClick(service)}
                          >
                            Request
                          </button>
                        ) : (
                          currentUser ? (
                             // Tutors see nothing or maybe "View" if they want
                             <span className="text-muted small align-self-center fst-italic">Tutor View</span>
                          ) : (
                            <Link to="/login" className="btn btn-outline-primary btn-sm align-self-center">
                              Login to Request
                            </Link>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0 p-2">No tutors available for this topic yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple Modal Overlay */}
      {selectedService && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Request {selectedService.tutor?.name}</h5>
                  <button type="button" className="btn-close" onClick={closeRequestModal}></button>
                </div>
                <div className="modal-body">
                  <p><strong>Topic:</strong> {topics.find(t => t.tutor_services.some(s => s.id === selectedService.id))?.topic}</p>
                  <p><strong>Rate:</strong> ${selectedService.rate}/hr</p>
                  
                  {requestSuccess && <div className="alert alert-success">{requestSuccess}</div>}
                  {requestError && <div className="alert alert-danger">{requestError}</div>}
                  
                  {!requestSuccess && (
                      <form onSubmit={submitRequest}>
                        <div className="mb-3">
                            <label htmlFor="req-desc" className="form-label">Description / Note</label>
                            <textarea 
                                id="req-desc"
                                className="form-control" 
                                rows="3" 
                                placeholder="What do you need help with?"
                                value={requestDesc}
                                onChange={e => setRequestDesc(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="text-end">
                            <button type="button" className="btn btn-secondary me-2" onClick={closeRequestModal}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Send Request</button>
                        </div>
                      </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;