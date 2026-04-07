import { useParams, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import DataContext from "../../../context/DataContext";
import { useFormik } from "formik";
import * as Yup from "yup";


function RequestServiceModal() {
  const { topicId, serviceId } = useParams();
  const navigate = useNavigate();
  const { topics, currentUser, setCurrentUser } = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  
  const topic = topics?.find((t) => String(t.id) === topicId);
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
      fetch("/api/requests", {
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
          
          const updatedUser = {
            ...currentUser,
            topics: (() => {
              const userTopics = currentUser.topics || [];

              // 1. Найти topic
              const existingTopic = userTopics.find(t => t.id === topic.id);

              // ❗ ЕСЛИ topic НЕ существует → создаём полностью
              if (!existingTopic) {
                return [
                  ...userTopics,
                  {
                    id: topic.id,
                    topic: topic.topic,
                    description: topic.description,
                    tutor_services: [
                      {
                        id: service.id,
                        rate: service.rate,
                        description: service.description,
                        tutor_id: service.tutor_id,
                        topic_id: service.topic_id,
                        tutor: service.tutor,
                        requests: [newRequest],
                      },
                    ],
                  },
                ];
              }

              // 2. Topic есть → проверяем service
              const existingService = existingTopic.tutor_services?.find(
                s => s.id === service.id
              );

              return userTopics.map(t => {
                if (t.id !== topic.id) return t;

                // ❗ ЕСЛИ service НЕ существует → добавляем
                if (!existingService) {
                  return {
                    ...t,
                    tutor_services: [
                      ...(t.tutor_services || []),
                      {
                        id: service.id,
                        rate: service.rate,
                        description: service.description,
                        tutor_id: service.tutor_id,
                        topic_id: service.topic_id,
                        tutor: service.tutor,
                        requests: [newRequest],
                      },
                    ],
                  };
                }

                // 3. Всё есть → просто добавляем request
                return {
                  ...t,
                  tutor_services: t.tutor_services.map(s => {
                    if (s.id !== service.id) return s;

                    return {
                      ...s,
                      requests: [...(s.requests || []), newRequest],
                    };
                  }),
                };
              });
            })(),
          };

          setCurrentUser(updatedUser);
          formik.resetForm();
          navigate(`/student/topic/${topic.id}/service/${service.id}/requests`);
        })
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    },
  });

  if (!topic || !service) {
  return <div>Loading...</div>;
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
