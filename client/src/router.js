// client/src/router.js

import Layout from "./features/shared/components/Layout";
import Home from "./features/shared/pages/Home";
import ErrorPage from "./features/shared/pages/ErrorPage";
import Login from "./features/auth/pages/Login";
import Signup from "./features/auth/pages/Signup";
import RequireAuth from "./features/shared/components/RequireAuth";
import TutorTopics from "./features/tutor/pages/TutorTopics";
import TutorServiceRequests from "./features/tutor/pages/TutorServiceRequests";
import StudentTopics from "./features/student/pages/StudentTopics";
import StudentServiceRequests from "./features/student/pages/StudentServiceRequests";
import RequestServiceModal from "./features/shared/pages/RequestServiceModal";


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
      { path: "tutor_topics", element: <RequireAuth><TutorTopics /></RequireAuth> },
      { path: "student_topics", element: <RequireAuth><StudentTopics /></RequireAuth> },
      { path: "student/topic/:topicId/service/:serviceId/requests", element: <RequireAuth><StudentServiceRequests /></RequireAuth> },
      { path: "tutor/topic/:topicId/service/:serviceId/requests", element: <RequireAuth><TutorServiceRequests /></RequireAuth> },
      { path: "topic/:topicId/service/:serviceId/request", element: <RequireAuth><RequestServiceModal /></RequireAuth> },
    ],
  },
];

export default routes;