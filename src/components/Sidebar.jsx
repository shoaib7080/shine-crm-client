import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";

function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppContext();

  return (
    <div
      className={`bg-gray-800 text-white h-screen fixed top-0 left-0 z-10 w-64 transition-transform duration-300 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="p-4 relative">
        {/* Close button - only visible on mobile when sidebar is open */}
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-700 md:hidden"
          aria-label="Close sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6">Shine CRM</h2>

        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/leads"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                Lead Management
              </Link>
            </li>
            <li>
              <Link
                to="/projects"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                Project Management
              </Link>
            </li>
            <li>
              <Link
                to="/employees"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                Employee Management
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
