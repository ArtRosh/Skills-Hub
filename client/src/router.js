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
import RequestChat from "./features/shared/pages/RequestChat";
import RequireStudent from "./features/shared/components/RequireStudent";
import RequireTutor from "./features/shared/components/RequireTutor";
import NotAuthorized from "./features/shared/pages/NotAuthorized";


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
      { path: "tutor_topics", element: <RequireAuth><RequireTutor><TutorTopics /></RequireTutor></RequireAuth> },
      { path: "student_topics", element: <RequireAuth><RequireStudent><StudentTopics /></RequireStudent></RequireAuth> },
      { path: "student/topic/:topicId/service/:serviceId/requests", element: <RequireAuth><RequireStudent><StudentServiceRequests /></RequireStudent></RequireAuth> },
      { path: "tutor/topic/:topicId/service/:serviceId/requests", element: <RequireAuth><RequireTutor><TutorServiceRequests /></RequireTutor></RequireAuth> },
      { path: "requests/:requestId/chat", element: <RequireAuth><RequestChat /></RequireAuth> },
      { path: "topic/:topicId/service/:serviceId/request", element: <RequireAuth><RequireStudent><RequestServiceModal /></RequireStudent></RequireAuth> },
      { path: "not-authorized", element: <NotAuthorized /> },
    ],
  },
];

export default routes;