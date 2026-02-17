import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

function RequestServiceModal({ isOpen, onClose, service, topicName }) {
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
          tutor_service_id: service.id,
          description: values.description,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((data) => {
              throw new Error(data.error || "Failed to send request");
            });
          }
          return res.json();
        })
        .then(() => {
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
            <h5 className="modal-title">Request {service?.tutor?.name}</h5>
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

              <p><strong>Topic:</strong> {topicName}</p>
              <p><strong>Rate:</strong> ${service?.rate}/hr</p>

              <div className="mb-3">
                <label className="form-label" htmlFor="description">Description / Note</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows="3"
                  placeholder="What do you need help with?"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.description}
                  disabled={isLoading}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RequestServiceModal;
