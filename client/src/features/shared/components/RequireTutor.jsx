import React from "react";
import { useContext } from "react";
import DataContext from "../../../context/DataContext";
import { Navigate } from "react-router-dom";

const RequireTutor = ({ children }) => {
  const { currentUser } = useContext(DataContext);
  if (!currentUser || currentUser.role !== "tutor") {

    // Redirect non-tutor users to the "not authorized" page
    return <Navigate to="/not-authorized" replace />;
  }
  return children;
};

export default RequireTutor;
