import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center mt-8 py-2">
      <p>
        © {new Date().getFullYear()} CoffeeRun. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;