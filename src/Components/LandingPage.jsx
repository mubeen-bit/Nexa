import Header from "./Header";
import Maincontainer from "./Maincontainer";
import Feature from "./Feature";
import Footer from "./Footer";
import { useState } from "react";
import LoginButton from "./LoginButton"

import { createBrowserRouter } from "react-router-dom";

function LandingPage() {

    
  return (
    <>
      <Header />
      <Maincontainer />
      <Feature />
      <Footer />
    </>
  );
}

export default LandingPage;
