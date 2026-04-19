import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import DataContext from "../../../context/DataContext";

function NavBar() {
  const { currentUser, logout } = useContext(DataContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout().then(() => navigate("/login", { replace: true }));
  }

  return (
    <nav className="navbar navbar-expand navbar-light bg-light rounded px-3 mb-4">
      <div className="d-flex align-items-center w-100">
        <div className="d-flex align-items-center gap-3 flex-fill">
          <NavLink className="nav-link" to="/">Topics</NavLink>

          {currentUser ? (
            <>
              {currentUser.role === "tutor" ? (
                <NavLink className="nav-link" to="/tutor_topics">
                  My Topics
                </NavLink>
              ) : currentUser.role === "student" ? (
                <NavLink className="nav-link" to="/student_topics">
                  My Topics
                </NavLink>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="d-flex justify-content-center flex-fill">
          <NavLink className="nav-link fw-bold" to="/home">Skills-Hub</NavLink>
        </div>

        <div className="d-flex align-items-center justify-content-end gap-3 flex-fill">
        {!currentUser ? (
          <>
            <NavLink className="nav-link" to="/login">Login</NavLink>
            <NavLink className="nav-link" to="/signup">Signup</NavLink>
          </>
        ) : (
          <>
            <span className="text-muted">
              {currentUser.name} ({currentUser.role})
            </span>
            <button className="btn btn-outline-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;