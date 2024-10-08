import { createBrowserRouter } from "react-router-dom";
import {
  Landing,
  Jobs,
  Search,
  History,
  JobDetails,
  SkillDetails,
} from "../pages";
import App from "../App";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "/jobs",
        element: <Jobs />,
      },
      {
        path: "/jobs/search",
        element: <Search />,
      },
      {
        path: "/job/:jobId",
        element: <JobDetails />,
      },
      {
        path: "/skill/:skillId",
        element: <SkillDetails />,
      },
      {
        path: "/history",
        element: <History />,
      },
    ],
  },
]);
