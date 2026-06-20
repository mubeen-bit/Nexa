import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "./LogoutButton.css";

export default function LogoutButton() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    window.location.reload();
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  if (!user) return null;

  return (
    <div className="profile-menu-wrap">
      <button
        className="profile-trigger"
        onClick={() => setOpen((prev) => !prev)}
      >
        {user.user_metadata.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="profile"
            className="profile-pic"
          />
        ) : (
          <div className="profile-initials">
            {getInitials(user.user_metadata.full_name)}
          </div>
        )}
      </button>

      {open && (
        <>
          {/* backdrop to close on outside click */}
          <div className="profile-backdrop" onClick={() => setOpen(false)} />
          <div className="profile-dropdown">
            <div className="profile-dropdown-header">
              <p className="profile-dropdown-name">
                {user.user_metadata.full_name}
              </p>
              <p className="profile-dropdown-email">{user.email}</p>
            </div>
            <hr className="profile-dropdown-divider" />
            <button className="profile-dropdown-logout" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
