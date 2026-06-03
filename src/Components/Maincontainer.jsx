import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./Maincontainer.css";
const Maincontainer = () => {
  return (
    <container id="main-container">
      <div className="heading">
        <h1>
          Get Ahead with the right information and guidance from the right
          senior.
        </h1>
      </div>

      <div className="para">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas,
          voluptate.
        </p>
      </div>
      <div className="s-btn">
        <input
          type="text"
          name="college"
          placeholder="Search for college.."
        ></input>
        <i className="s-icon">
          <FaSearch />
        </i>
      </div>
    </container>
  );
};

export default Maincontainer;
