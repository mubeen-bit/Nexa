import Header from "./Header";
import Maincontainer from "./Maincontainer";
import Feature from "./Feature";
import Footer from "./Footer";
import { useState } from "react";
import LoginButton from "./LoginButton";

function LandingPage() {
  const [search, setSearch] = useState("");

  return (
    <>
      <Header />
      <Maincontainer search={search} setSearch={setSearch} />
      <Feature search={search} />
      <Footer />
    </>
  );
}

export default LandingPage;
