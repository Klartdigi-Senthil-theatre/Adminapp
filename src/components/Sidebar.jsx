import { React } from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Coffee,
  Users,
  Megaphone,
  Package,
  Menu,
  User,
  ChevronLeft,
  Film,
  Clock,
  Tickets,
} from "lucide-react";
import { GiOfficeChair } from "react-icons/gi";

// Fixed Sidebar Component
const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
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
          ${isOpen
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
                    `flex items-center p-3 mx-2 rounded-lg transition-colors ${isActive
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
            className={`flex items-center ${!isOpen && !isMobile ? "justify-center" : ""
              }`}
          >
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center">
              <User className="text-white" />
            </div>
            {(isOpen || isMobile) && (
              <div className="ml-3">
                <p className="font-medium">Admin User</p>
                <p className="text-xs font-medium text-orange-900">
                  admin@theatre.com
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default Sidebar;
