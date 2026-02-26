import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import DataContext from "../../../context/DataContext";
import { useFormik } from "formik";
import * as Yup from "yup";


function RequestServiceModal() {
  const { topicId, serviceId } = useParams();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  
  const topic = currentUser?.topics?.find((t) => String(t.id) === topicId);
  const service = topic?.tutor_services?.find((s) => String(s.id) === serviceId);


  


  const validationSchema = Yup.object().shape({
    description: Yup.string(),
  });

  const formik = useFormik({
    initialValues: { description: "" },
    validationSchema,
    onSubmit: (values) => {
      setError("");
      setIsLoading(true);
      fetch("/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tutor_service_id: service?.id,
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
        .then((newRequest) => {
          if (!currentUser || !topic || !service) {
            formik.resetForm();
            navigate(-1);
            return;
          }
          // Step-by-step update: add newRequest to the correct service in currentUser
          const updatedRequests = [...(service.requests || []), newRequest];
          const updatedService = { ...service, requests: updatedRequests };
          const updatedServices = (topic.tutor_services || []).map((s) =>
            s.id === service.id ? updatedService : s
          );
          const updatedTopic = { ...topic, tutor_services: updatedServices };
          const updatedTopics = (currentUser.topics || []).map((t) =>
            t.id === topic.id ? updatedTopic : t
          );
          const updatedUser = { ...currentUser, topics: updatedTopics };
          setCurrentUser(updatedUser);
          formik.resetForm();
          navigate(`/student/topic/${topic.id}/service/${service.id}/requests`);
        })
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    },
  });

  // Now do the early return after all hooks
  if (!topic || !service) {
    navigate(-1);
    return null;
  }

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
              onClick={() => navigate(-1)}
              disabled={isLoading}
            ></button>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <p><strong>Topic:</strong> {topic.topic}</p>
              <p><strong>Rate:</strong> ${service?.rate}/hr</p>
              <p><strong>Description:</strong> {service?.description}</p>

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
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={isLoading}>
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
