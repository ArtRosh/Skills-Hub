import { useContext } from "react";
import DataContext from "../../../context/DataContext";
import TopicServices from "../components/TopicServices";

function StudentTopics() {
  const { currentUser } = useContext(DataContext);

  if (!currentUser || currentUser.role !== "student") {
    return <p>You must be logged in as a student to view this page.</p>;
  }

  const topics = currentUser.topics || [];

  return (
    <div className="py-4">
      <h2 className="mb-3">My Topics</h2>

      {topics.length === 0 ? (
        <p className="text-muted">No topics with requests yet.</p>
      ) : (
        <div className="d-grid gap-3">
          {topics.map((topic) => (
            <TopicServices key={topic.id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentTopics;
