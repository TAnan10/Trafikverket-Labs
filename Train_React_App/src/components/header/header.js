import React from "react";
import "./header.css";
import logo from "../../assets/pexels-eessoo-5098043.jpg";

const Header = () => {
  return (
    <div className="image-container">
      <img src={logo} alt="Image with Blue Tint" className="tinted-image" />
      <div className="blue-tint-overlay"></div>
    </div>
  );
};

export default Header;
