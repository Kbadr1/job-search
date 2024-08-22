import { createBrowserRouter } from "react-router-dom";
import { Landing, Job, Jobs, Search, Skill } from "../pages";
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
        path: "/job/:id",
        element: <Job />,
      },
      {
        path: "/jobs/search",
        element: <Search />,
      },
      {
        path: "/skill/:id",
        element: <Skill />,
      },
    ],
  },
]);
