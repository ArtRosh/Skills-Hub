import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

function RequestModal({ isOpen, onClose, tutorService, currentUser, setCurrentUser }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validationSchema = Yup.object().shape({
    description: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      description: "",
    },
    validationSchema,
    onSubmit: (values) => {
      setError("");
      setIsLoading(true);

      fetch("/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tutor_service_id: tutorService.id,
          description: values.description,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to create request");
          return res.json();
        })
        .then((newRequest) => {
          const updatedTopics = currentUser.topics.map((topic) => {
            if (topic.id === tutorService.topic.id) {
              return {
                ...topic,
                tutor_services: topic.tutor_services.map((ts) => {
                  if (ts.id === tutorService.id) {
                    return {
                      ...ts,
                      requests: [...ts.requests, newRequest],
                    };
                  }
                  return ts;
                }),
              };
            }
            return topic;
          });
          setCurrentUser({ ...currentUser, topics: updatedTopics });
          formik.resetForm();
          onClose();
        })
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    },
  });

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Request Help</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              disabled={isLoading}
            ></button>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Tutor</label>
                <p className="form-control-plaintext">
                  <strong>{tutorService.tutor?.name}</strong>
                </p>
              </div>

              <div className="mb-3">
                <label className="form-label">Topic</label>
                <p className="form-control-plaintext">
                  <strong>{tutorService.topic?.topic}</strong>
                </p>
              </div>

              <div className="mb-3">
                <label className="form-label">Rate</label>
                <p className="form-control-plaintext">
                  <strong>${tutorService.rate}/hour</strong>
                </p>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="description">
                  What do you need help with?
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows="3"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.description}
                  disabled={isLoading}
                  placeholder="Describe what you need help with..."
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? "Requesting..." : "Request Help"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RequestModal;
