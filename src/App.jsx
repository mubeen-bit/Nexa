import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./Components/../lib/supabase";

import LandingPage from "./Components/LandingPage";
import SeniorProfile from "./Components/SeniorProfile";
import MySessions from "./Components/Mysessions";
import SeniorDashboard from "./Components/SeniorDashboard";
import SeniorApply from "./Components/SeniorApply";

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          const redirectPath =
            localStorage.getItem("redirectAfterLogin") || "/";
          localStorage.removeItem("redirectAfterLogin");
          navigate(redirectPath, { replace: true });
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontSize: "16px",
        color: "#666",
      }}
    >
      Logging you in...
    </div>
  );
}

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
      path: "/become-a-senior",
      element: <SeniorApply />,
    },
    {
      path: "/my-sessions",
      element: <MySessions />,
    },
    {
      path: "/senior-dashboard",
      element: <SeniorDashboard />,
    },
    {
      path: "/auth/callback", // ✅ new
      element: <AuthCallback />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
