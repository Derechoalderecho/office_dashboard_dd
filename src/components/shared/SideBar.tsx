"use client";

import { NavLinks } from "./nav-links";
import { PanelLeft } from "lucide-react";
import { Button } from "@heroui/react";

interface SideBarProps {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}

export function SideBar({ isExpanded, setIsExpanded }: SideBarProps) {
  return (
    <aside
      className={`sticky top-0 h-screen flex flex-col gap-7 px-3 py-6 bg-[#F9FAFB] border-r 
        transition-[width] duration-300 ease-in-out overflow-hidden
        ${isExpanded ? "w-[212px]" : "w-16"}`}
    >
      <div
        className={`transition-transform duration-300 ${
          isExpanded ? "scale-100" : "scale-90"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <img src="/images/logo.png" alt="brand" className="w-[23px] h-[32px]" />
          {isExpanded && (
            <Button
              variant="light"
              className="transition-opacity duration-300 px-1"
              onPress={() => setIsExpanded(false)}
              isIconOnly
            >
              <PanelLeft className="w-6 h-6 text-neutral-500" />
            </Button>
          )}
        </div>
      </div>
      <div className="border-t border-gray-300"></div>
      <nav className="flex flex-col gap-3 flex-1">
        <ul className="flex flex-col gap-3">
          <NavLinks isHovered={isExpanded} />
        </ul>
      </nav>
      <div className="border-t border-gray-300"></div>
    </aside>
  );
}
