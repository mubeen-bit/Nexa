import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LandingPage from "./Components/LandingPage";
import SeniorProfile from "./Components/SeniorProfile";
import MySessions from "./Components/Mysessions";
import SeniorDashboard from "./Components/SeniorDashboard";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/senior/:id",
      element: <SeniorProfile />,
    },
    {
      path: "/my-sessions",
      element: <MySessions />,
    },
    {
      path: "/senior-dashboard",
      element: <SeniorDashboard />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
