"use client"
import React, { useState } from 'react';
import Sidebar from './_components/Sidebar';
import Header from './_components/Header';

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transition-transform duration-300 transform bg-white ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:w-64`}>
        <Sidebar />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header with menu button */}
        <div className="flex items-center justify-between shadow-md p-5">
          <button
            className="p-2 text-gray-500 focus:outline-none focus:ring md:hidden"
            onClick={toggleSidebar}
          >
            {/* Menu icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <Header /> {/* Includes the UserButton */}
        </div>

        {/* Children content */}
        <div className="flex-grow p-10 overflow-y-auto max-h-[600px] hide-scrollbar" onClick={closeSidebar}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
