import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

function EditServiceModal({ isOpen, onClose, service, currentUser, setCurrentUser }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = () => {
    if (window.confirm("Delete this service?")) {
      setError("");
      setIsLoading(true);

      fetch(`/api/tutor_services/${service.id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then(() => {
          const updatedTopics = currentUser.topics
            .map((t) => ({
              ...t,
              tutor_services: t.tutor_services.filter((s) => s.id !== service.id),
            }))
            .filter((t) => t.tutor_services.length > 0);
          const updatedUser = { ...currentUser, topics: updatedTopics };
          setCurrentUser(updatedUser);
          onClose();
        })
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  };

  const validationSchema = Yup.object().shape({
    rate: Yup.number()
      .required("Rate is required")
      .positive("Rate must be positive")
      .typeError("Rate must be a number"),
    description: Yup.string(),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      rate: service?.rate || "",
      description: service?.description || "",
    },
    validationSchema,
    onSubmit: (values) => {
      setError("");
      setIsLoading(true);

      fetch(`/api/tutor_services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          rate: Number(values.rate),
          description: values.description,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to update service");
          return res.json();
        })
        .then((updatedService) => {
          const updatedTopics = currentUser.topics.map((t) => ({
            ...t,
            tutor_services: t.tutor_services.map((s) =>
              s.id === service.id ? updatedService : s
            ),
          }));
          const updatedUser = { ...currentUser, topics: updatedTopics };
          setCurrentUser(updatedUser);
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
            <h5 className="modal-title">Edit Service</h5>
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
                <label className="form-label" htmlFor="rate">Rate ($/hour)</label>
                <input
                  id="rate"
                  name="rate"
                  type="number"
                  className="form-control"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.rate}
                  disabled={isLoading}
                />
                {formik.touched.rate && formik.errors.rate && (
                  <p className="text-danger small">{formik.errors.rate}</p>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows="3"
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
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={isLoading}>
                Delete Service
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditServiceModal;
