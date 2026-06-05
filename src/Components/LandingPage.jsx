import Header from "./Header";
import Maincontainer from "./Maincontainer";
import Feature from "./Feature";
import Footer from "./Footer";
import { useState } from "react";
import LoginButton from "./LoginButton";
import HowItWorks from "./HowItWorks";
import WhyUs from "./WhyUs";
import SocialProof from "./SocialProof";
import CallToAction from "./CallToAction";

function LandingPage() {
  const [search, setSearch] = useState("");

  return (
    <>
      <Header />
      <Maincontainer search={search} setSearch={setSearch} />
      <Feature search={search} />
      <HowItWorks />
      <WhyUs />
      <SocialProof />
      <CallToAction />
      <Footer />
    </>
  );
}

export default LandingPage;
