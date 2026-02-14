// client/src/pages/TutorTopics.jsx
import { useContext, useState } from "react";
import DataContext from "../../../context/DataContext";
import TopicServices from "../components/TopicServices";
import AddServiceModal from "../components/AddServiceModal";

function TutorTopics() {
  const { currentUser, setCurrentUser, topics } = useContext(DataContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userTopics = currentUser?.topics || [];

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="mb-2">Topics</h1>
          <p className="text-muted">Your topics</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Service
        </button>
      </div>

      <div className="d-grid gap-3">
        {userTopics.map((t) => (
          <TopicServices key={t.id} topic={t} />
        ))}
      </div>

      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        allTopics={topics}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
    </div>
  );
}

export default TutorTopics;