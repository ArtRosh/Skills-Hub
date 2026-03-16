import { useContext } from "react";
import { Navigate } from "react-router-dom";
import DataContext from "../../../context/DataContext";

function RequireAuth({ children }) {
  const { currentUser } = useContext(DataContext);

  // Redirect unauthenticated users to the login page
  if (!currentUser) return <Navigate to="/login" replace />;

  return children;
}

export default RequireAuth;