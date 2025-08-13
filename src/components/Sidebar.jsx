import {
  BarChart3,
  ChevronLeft,
  Clock,
  Coffee,
  Film,
  Megaphone,
  Menu,
  Package,
  Tickets,
  User,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { GiOfficeChair } from "react-icons/gi";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/dashboard", icon: BarChart3, name: "Dashboard" },
  { path: "/snacks", icon: Coffee, name: "Snacks" },
  { path: "/seats", icon: GiOfficeChair, name: "Seat Allocation" },
  { path: "/ads", icon: Megaphone, name: "Advertisement" },
  { path: "/inventory", icon: Package, name: "Inventory" },
  { path: "/movie", icon: Film, name: "Movie" },
  { path: "/users", icon: Users, name: "Users" },
  { path: "/show-time", icon: Clock, name: "Showtime Planner" },
  { path: "/get-tickets", icon: Tickets, name: "Get Tickets" },
];

// Fixed Sidebar Component
const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Detect click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? "fixed" : "relative"} 
          ${
            isOpen
              ? isMobile
                ? "translate-x-0"
                : "w-64"
              : isMobile
              ? "-translate-x-full"
              : "w-20"
          }
          ${isMobile ? "w-64" : ""}
          bg-white text-orange-900 h-full transition-all duration-300 ease-in-out z-50
          ${isMobile ? "lg:relative lg:translate-x-0" : ""}
        `}
      >
        <div className="p-4 flex items-center justify-between border-b border-orange-700">
          {(isOpen || isMobile) && (
            <h1 className="text-xl font-bold">Theatre Admin</h1>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="mt-3 flex-1 overflow-hidden">
          <ul
            className="sidebar-scroll overflow-y-auto pr-2"
            style={{
              maxHeight: "calc(100vh - 160px)", // Adjust for header + user profile
            }}
          >
            {navItems.map((item) => (
              <li key={item.path} className="mb-2">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center p-3 mx-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-orange-600 text-white"
                        : "hover:bg-orange-300"
                    }`
                  }
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <item.icon size={20} />
                  {(isOpen || isMobile) && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User profile at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-orange-700 bg-white">
          <div
            ref={menuRef}
            className={`flex items-center cursor-pointer relative group transition-all duration-200 
      ${!isOpen && !isMobile ? "justify-center" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <div
              className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center 
      transition-transform duration-200 group-hover:scale-105 group-hover:shadow-lg"
            >
              <User className="text-white" />
            </div>
            {(isOpen || isMobile) && (
              <div className="ml-3 transition-colors duration-200 group-hover:text-orange-700">
                <p className="font-medium">{user?.username || "Admin User"}</p>
                <p className="text-xs font-medium text-orange-900">
                  {user?.email || "admin@theatre.com"}
                </p>
              </div>
            )}

            {/* Dropdown menu */}
            {menuOpen && (
              <div
                className="absolute bottom-14 left-0 w-56 bg-white shadow-xl rounded-xl border border-gray-200
          animate-[fadeIn_0.2s_ease-out] overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100 bg-orange-50">
                  <p className="text-sm font-semibold text-orange-800">
                    {user?.username || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || "admin@theatre.com"}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600
            hover:bg-red-50 transition-colors duration-150"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
