// client/src/router.js
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ErrorPage from "./pages/ErrorPage";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RequireAuth from "./components/RequireAuth";

import Topics from "./pages/Topics";
import TutorServiceRequests from "./pages/TutorServiceRequests";
import StudentRequests from "./pages/StudentRequests";


const routes = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "", element: <Home /> },

      // public
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },

      // protected
      { path: "topics", element: <RequireAuth><Topics /></RequireAuth> },
      { path: "requests", element: <RequireAuth><StudentRequests /></RequireAuth> },
      { path: "tutor/:serviceId/requests", element: <RequireAuth><TutorServiceRequests /></RequireAuth> },
      
    ],
  },
];

export default routes;