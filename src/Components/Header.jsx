import React from "react";
import logo from "../assets/srjr_1.png";
import "./Header.css";
import LoginButton from "./LoginButton";
import LogoutButton from "./LogoutButton";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [user, setUser] = useState(null);
  const [Fletter, setFletter] = useState(null);
  const [isSenior, setIsSenior] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: userData, error } = await supabase.auth.getUser();

      console.log("USER:", userData.user);
      console.log("ERROR:", error);

      if (userData.user) {
        setUser(userData.user);
        setFletter(
          userData.user.user_metadata.full_name?.charAt(0).toUpperCase(),
        );

        const { error: profileError } = await supabase.from("profiles").upsert({
          id: userData.user.id,
          email: userData.user.email,
          full_name: userData.user.user_metadata.full_name,
          avatar_url: userData.user.user_metadata.avatar_url,
        });

        console.log("PROFILE ERROR:", profileError);

        const { data: seniorData } = await supabase
          .from("seniors")
          .select("*")
          .eq("email", userData.user.email)
          .maybeSingle();

        if (seniorData) {
          setIsSenior(true);
        }
      }

      const { data: sessionData } = await supabase.auth.getSession();
      console.log("SESSION:", sessionData.session);
    };

    checkUser();
  }, []);

  return (
    <header className="main-header">
      <div className="main-logo">
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
              <button className="btn" onClick={() => navigate("/my-sessions")}>
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
              <LoginButton />
            </div>
          )}
        </div>
      </div>

      {/* Hamburger — mobile only */}
      <button
        className="hamburger"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile dropdown */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {user ? (
          <>
            {isSenior ? (
              <button
                className="btn"
                onClick={() => {
                  navigate("/senior-dashboard");
                  setMenuOpen(false);
                }}
              >
                Senior Dashboard
              </button>
            ) : (
              <button
                className="btn btn-outline"
                onClick={() => {
                  navigate("/become-a-senior");
                  setMenuOpen(false);
                }}
              >
                Become a Senior
              </button>
            )}
            <button
              className="btn"
              onClick={() => {
                navigate("/my-sessions");
                setMenuOpen(false);
              }}
            >
              My Sessions
            </button>
            <LogoutButton />
          </>
        ) : (
          <>
            <button
              className="btn btn-outline"
              onClick={() => {
                navigate("/become-a-senior");
                setMenuOpen(false);
              }}
            >
              Become a Senior
            </button>
            <LoginButton />
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
