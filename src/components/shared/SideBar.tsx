"use client";

import { useState } from "react";
import { NavLinks, NavLinks2 } from "./nav-links";

export function SideBar() {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <nav
      className={`fixed z-50 top-0 left-0 h-full flex flex-col gap-7 px-2 py-4 bg-[#F9FAFB] border-r transition-all duration-300 ${
        isHovered ? "w-60" : "w-16"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="mx-auto">
        <img src="/images/logo.png" alt="brand" />
      </div>
      <div className="border-t border-gray-300"></div>
      <nav className="flex flex-col gap-3">
        <ul className="flex flex-col gap-3">
          <NavLinks handleMouseEnter={handleMouseEnter} isHovered={isHovered} />
        </ul>
      </nav>
      <div className="border-t border-gray-300"></div>
      <nav className="flex flex-col gap-3">
        <ul className="flex flex-col gap-3">
          <NavLinks2
            handleMouseEnter={handleMouseEnter}
            isHovered={isHovered}
          />
        </ul>
      </nav>
    </nav>
  );
}
