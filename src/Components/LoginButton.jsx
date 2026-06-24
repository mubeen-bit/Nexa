import { supabase } from "../lib/supabase";
import "./LoginButton.css";

export default function LoginButton() {
  const signInWithGoogle = async () => {
    const redirectPath = localStorage.getItem("redirectAfterLogin") || "/";

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${import.meta.env.VITE_SITE_URL}${redirectPath}`,
      },
    });
  };

  return (
    <button className="loginbtn" onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  );
}
