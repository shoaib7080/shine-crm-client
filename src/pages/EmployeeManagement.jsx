// src/pages/EmployeeManagement.jsx
import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import axios from "axios";

function EmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const { navigate, API_URL } = useAppContext();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/employees`);
  
        // Log the shape to debug (optional)
        console.log("Employee API response:", response.data);
  
        // Backend returns { success: true, data: [...] }
        if (response.data?.success && Array.isArray(response.data.data)) {
          setEmployees(response.data.data);
        } else {
          throw new Error("Invalid employee data format");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError("Failed to load employees");
      } finally {
        setLoading(false);
      }
    };
  
    fetchEmployees();
  }, []);
  
  // Filter employees only if it's an array
  const filteredEmployees = Array.isArray(employees)
    ? employees.filter(
        (employee) =>
          (employee.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (employee.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (employee.contact1 || "").includes(searchTerm) ||
          (employee.employee_id || "").includes(searchTerm)
      )
    : [];

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-xl">Loading employees...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error} - <button onClick={() => window.location.reload()} className="text-blue-600">Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Employee Management</h2>

      {/* Search Bar and Add Button */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search employees by name, ID, email or phone..."
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>

        <button
          onClick={() => navigate("/employees/add")}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 whitespace-nowrap"
        >
          Add New Employee
        </button>
      </div>

      {/* Employee Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md w-full">
        {filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employment Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Work Start
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aadhar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    PAN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Manager
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => navigate(`/employees/add?id=${employee._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.employee_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{employee.contact1}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {employee.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.employment_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          employee.employee_status === "Active"
                            ? "bg-green-100 text-green-800"
                            : employee.employee_status === "On Leave"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {employee.employee_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.work_start_date
                        ? new Date(employee.work_start_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.aadhar_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.pan_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.reporting_manager || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No employees found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeManagement;