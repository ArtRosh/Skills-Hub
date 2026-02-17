// client/src/pages/Home.jsx
import { useContext } from "react";
import DataContext from "../../../context/DataContext";
import TopicServicesList from "../components/TopicServicesList";

function Home() {
  const { topics, topicsLoading } = useContext(DataContext);

  if (topicsLoading) {
    return (
      <div className="py-4">
        <h1 className="mb-2">Marketplace</h1>
        <p className="text-muted">Loading topics...</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <h1 className="mb-3">Marketplace</h1>
      <p className="text-muted">Browse topics and find a tutor to help you learn!</p>

      {topics.length === 0 ? (
        <p className="text-muted">No topics available yet.</p>
      ) : (
        <div className="d-grid gap-3">
          {topics.map((t) => (
            <TopicServicesList key={t.id} topic={t} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;