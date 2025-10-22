import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clock,
  Coffee,
  Film,
  FileText,
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

const menuStructure = [
  {
    type: "item",
    path: "/dashboard",
    icon: BarChart3,
    name: "Dashboard"
  },
  {
    type: "item",
    path: "/snacks",
    icon: Coffee,
    name: "Snacks"
  },
  {
    type: "item",
    path: "/seats",
    icon: GiOfficeChair,
    name: "Seat Allocation"
  },
  {
    type: "item",
    path: "/ads",
    icon: Megaphone,
    name: "Advertisement"
  },
  {
    type: "item",
    path: "/inventory",
    icon: Package,
    name: "Inventory"
  },
  {
    type: "item",
    path: "/movie",
    icon: Film,
    name: "Movie"
  },
  {
    type: "item",
    path: "/users",
    icon: Users,
    name: "Users"
  },
  {
    type: "item",
    path: "/show-time",
    icon: Clock,
    name: "Showtime Planner"
  },
  {
    type: "item",
    path: "/get-tickets",
    icon: Tickets,
    name: "Get Tickets"
  },
  {
    type: "group",
    title: "Reports",
    icon: FileText,
    items: [
      { path: "/report", icon: FileText, name: "Showtime Report" },
      { path: "/snacks-report", icon: Coffee, name: "Snacks Report" },
      { path: "/daily-report", icon: FileText, name: "Daily Report" },
      { path: "/company-report", icon: FileText, name: "Company Report" },
    ]
  }
];

// Fixed Sidebar Component
const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const menuRef = useRef(null);
  const sidebarRef = useRef(null);

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

  // Mobile viewport height handling
  useEffect(() => {
    if (isMobile && sidebarRef.current) {
      const setSidebarHeight = () => {
        // Use window.innerHeight for better mobile support
        const viewportHeight = window.innerHeight;
        sidebarRef.current.style.height = `${viewportHeight}px`;
      };

      setSidebarHeight();

      // Handle orientation change and viewport changes
      const handleResize = () => {
        setTimeout(setSidebarHeight, 100); // Small delay for orientation change
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("orientationchange", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("orientationchange", handleResize);
      };
    }
  }, [isMobile, isOpen]);

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
        ref={sidebarRef}
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
          bg-white text-orange-900 transition-all duration-300 ease-in-out z-50
          ${isMobile ? "lg:relative lg:translate-x-0" : ""}
          ${isMobile ? "h-screen" : "h-full"}
          flex flex-col
        `}
        style={{
          // Prevent scroll issues on mobile
          ...(isMobile && {
            touchAction: "pan-y",
            overscrollBehavior: "contain",
          }),
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 flex items-center justify-between border-b border-orange-700">
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

        {/* Sidebar Navigation - Scrollable */}
        <nav className="flex-1 min-h-0 mt-3 overflow-hidden">
          <ul className="sidebar-scroll h-full overflow-y-auto pr-2 pb-4">
            {menuStructure.map((menuItem, index) => {
              if (menuItem.type === "item") {
                return (
                  <li key={menuItem.path} className="mb-2">
                    <NavLink
                      to={menuItem.path}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-2 mx-2 rounded-lg transition-colors ${isActive
                          ? "bg-orange-600 text-white"
                          : "hover:bg-orange-300"
                        }`
                      }
                      onClick={() => isMobile && setIsOpen(false)}
                    >
                      <menuItem.icon size={18} />
                      {(isOpen || isMobile) && (
                        <span className="ml-3">{menuItem.name}</span>
                      )}
                    </NavLink>
                  </li>
                );
              }

              if (menuItem.type === "group") {
                const isExpanded = expandedGroups[menuItem.title];
                const toggleGroup = () => {
                  setExpandedGroups(prev => ({
                    ...prev,
                    [menuItem.title]: !prev[menuItem.title]
                  }));
                };

                return (
                  <li key={menuItem.title} className="mb-2">
                    <button
                      onClick={toggleGroup}
                      className={`flex items-center justify-between w-full px-4 py-2 mx-2 rounded-lg transition-colors hover:bg-orange-300 ${isExpanded ? "bg-orange-200" : ""
                        }`}
                    >
                      <div className="flex items-center">
                        <menuItem.icon size={18} />
                        {(isOpen || isMobile) && (
                          <span className="ml-3 font-medium">{menuItem.title}</span>
                        )}
                      </div>
                      {(isOpen || isMobile) && (
                        isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                      )}
                    </button>

                    {/* Group Submenu */}
                    {isExpanded && (isOpen || isMobile) && (
                      <ul className="ml-4 mt-2 space-y-1">
                        {menuItem.items.map((item) => (
                          <li key={item.path}>
                            <NavLink
                              to={item.path}
                              className={({ isActive }) =>
                                `flex items-center px-3 py-2 rounded-lg transition-colors text-sm ${isActive
                                  ? "bg-orange-600 text-white"
                                  : "hover:bg-orange-200 text-orange-800"
                                }`
                              }
                              onClick={() => isMobile && setIsOpen(false)}
                            >
                              <item.icon size={16} />
                              <span className="ml-2">{item.name}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              return null;
            })}
          </ul>
        </nav>

        {/* User profile at bottom - Fixed */}
        <div className="flex-shrink-0 px-4 py-2 border-t border-orange-700 bg-white">
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
