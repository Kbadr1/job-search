import { createBrowserRouter } from "react-router-dom";
import { Landing, Jobs, Search, History } from "../pages";
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
        path: "/history",
        element: <History />,
      },
    ],
  },
]);
