import { supabase } from "../lib/supabase";
import "./LoginButton.css";

export default function LoginButton() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  };

  return (
    <button className="loginbtn" onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  );
}
