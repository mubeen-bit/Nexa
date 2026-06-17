import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "./LogoutButton.css";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    window.location.reload();
  };

  return (
    <button className="logout-btn" onClick={handleLogout}>
      Logout
    </button>
  );
}
