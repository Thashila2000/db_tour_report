import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const MainLayout = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-white flex">
      
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} closeSidebar={() => setIsOpen(false)} />

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        <Navbar toggleSidebar={toggleSidebar} />

        <main className="pt-16 md:ml-56 p-6 transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;