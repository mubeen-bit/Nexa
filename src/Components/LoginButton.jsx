import { supabase } from "../lib/supabase";
import "./LoginButton.css";

export default function LoginButton() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${import.meta.env.VITE_SITE_URL}/auth/callback`,
      },
    });
  };

  return (
    <button className="loginbtn" onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  );
}
