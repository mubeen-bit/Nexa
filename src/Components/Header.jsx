import React from "react";
import logo from "../assets/srjr_1.png";
import "./Header.css";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const [user, setUser] = useState(null);
  const [isSenior, setIsSenior] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (userData.user) {
        setUser(userData.user);

        await supabase.from("profiles").upsert({
          id: userData.user.id,
          email: userData.user.email,
          full_name: userData.user.user_metadata.full_name,
          avatar_url: userData.user.user_metadata.avatar_url,
        });

        const { data: seniorData } = await supabase
          .from("seniors")
          .select("*")
          .eq("email", userData.user.email)
          .maybeSingle();

        if (seniorData) setIsSenior(true);
      }
    };

    checkUser();
  }, []);

  const isActive = (path) => location.pathname === path;
  const avatar = user?.user_metadata?.avatar_url;
  const initials = user?.user_metadata?.full_name?.charAt(0).toUpperCase();

  const studentNav = [
    { path: "/", label: "Home", icon: "⊞" },
    { path: "/become-a-senior", label: "Become", icon: "✦" },
    { path: "/my-sessions", label: "Sessions", icon: "◷" },
  ];

  const seniorNav = [
    { path: "/", label: "Home", icon: "⊞" },
    { path: "/my-sessions", label: "Sessions", icon: "◷" },
    { path: "/senior-dashboard", label: "Dashboard", icon: "⊡" },
  ];

  const navItems = isSenior ? seniorNav : studentNav;

  return (
    <>
      {/* ===== DESKTOP HEADER ===== */}
      <header className="main-header">
        <div className="main-logo" onClick={() => navigate("/")}>
          <img src={logo} alt="Agency logo" />
          <span className="logo-name">SeniorJRTalks</span>
        </div>

        <nav className="main-nav">
          <ul></ul>
        </nav>

        <div className="main-btn">
          <div>
            {user ? (
              <>
                {isSenior ? (
                  <button
                    className="btn"
                    onClick={() => navigate("/senior-dashboard")}
                  >
                    Senior Dashboard
                  </button>
                ) : (
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate("/become-a-senior")}
                  >
                    Become a Senior
                  </button>
                )}
                <button
                  className="btn"
                  onClick={() => navigate("/my-sessions")}
                >
                  My Sessions
                </button>
                <LogoutButton />
              </>
            ) : (
              <div>
                <button
                  className="btn btn-outline"
                  onClick={() => navigate("/become-a-senior")}
                >
                  Become a Senior
                </button>
                <LoginButton redirectTo={window.location.pathname} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="bottom-nav">
        {user ? (
          <>
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`bnav-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <span className="bnav-icon">{item.icon}</span>
                <span className="bnav-label">{item.label}</span>
              </button>
            ))}

            {/* Profile */}
            <button className="bnav-item" onClick={() => navigate("/")}>
              {avatar ? (
                <img src={avatar} alt="profile" className="bnav-avatar" />
              ) : (
                <div className="bnav-initials">{initials}</div>
              )}
              <span className="bnav-label">Profile</span>
            </button>
          </>
        ) : (
          <>
            <button
              className={`bnav-item ${isActive("/") ? "active" : ""}`}
              onClick={() => navigate("/")}
            >
              <span className="bnav-icon">⊞</span>
              <span className="bnav-label">Home</span>
            </button>

            <button
              className={`bnav-item ${isActive("/become-a-senior") ? "active" : ""}`}
              onClick={() => navigate("/become-a-senior")}
            >
              <span className="bnav-icon">✦</span>
              <span className="bnav-label">Become</span>
            </button>

            <div className="bnav-item bnav-login">
              <LoginButton redirectTo={window.location.pathname} />
            </div>
          </>
        )}
      </nav>
    </>
  );
};

export default Header;
