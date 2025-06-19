// src/pages/AddEmployee.jsx
import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useLocation } from "react-router-dom";

const AddEmployee = () => {
  const { API_URL, navigate } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);

  // Initialize form data structure
  const [formData, setFormData] = useState({
    employee_id: "",
    name: "",
    profile_image: null,
    password: "",
    contact1: "",
    contact2: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    aadhar_number: "",
    aadhar_document: null,
    pan_number: "",
    pan_document: null,
    work_start_date: "",
    tenure: "",
    employment_type: "Full Time",
    is_current_employee: true,
    work_experience: [],
    designation: "",
    department: "",
    reporting_manager: "",
    employee_status: "Active",
    salary_details: {
      monthly_salary: "",
      bank_account_number: "",
      ifsc_code: "",
      bank_name: "",
      pf_account_number: "",
    },
    documents: {
      resume: null,
      offer_letter: null,
      joining_letter: null,
      other_docs: [],
    },
    notes: "",
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");

    if (id) {
      setIsEditMode(true);
      setEmployeeId(id);
      fetchEmployeeData(id);
    }
  }, [location]);

  const fetchEmployeeData = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/employees/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch employee data");
      }

      // Format dates for form inputs
      const formattedData = {
        ...data,
        work_start_date: data.work_start_date
          ? new Date(data.work_start_date).toISOString().split("T")[0]
          : "",
      };

      setFormData(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      // Handle file uploadsx
      if (files.length > 0) {
        setFormData((prev) => ({
          ...prev,
          [name]: files[0],
        }));
      }
    } else if (name.includes(".")) {
      // Handle nested objects (e.g., salary_details.monthly_salary)
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleExperienceChange = (index, e) => {
    const { name, value, files } = e.target;
    const updatedExperiences = [...formData.work_experience];

    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [name]: files ? files[0] : value,
    };

    setFormData((prev) => ({
      ...prev,
      work_experience: updatedExperiences,
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      work_experience: [
        ...prev.work_experience,
        { company_name: "", role: "", duration: "", experience_letter: "" },
      ],
    }));
  };

  const removeExperience = (index) => {
    const updatedExperiences = formData.work_experience.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({
      ...prev,
      work_experience: updatedExperiences,
    }));
  };

  const handleDocumentChange = (docType, e) => {
    if (e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docType]: e.target.files[0],
        },
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const url = isEditMode
        ? `${API_URL}/api/employees/${employeeId}`
        : `${API_URL}/api/employees`;
      const method = isEditMode ? "PUT" : "POST";
  
      const formPayload = new FormData();
      
      // Create a clean data object without files
      const dataToSend = {
        ...formData,
        // Remove file objects from nested structures
        work_experience: formData.work_experience.map(exp => ({
          company_name: exp.company_name,
          role: exp.role,
          duration: exp.duration
        })),
        salary_details: { ...formData.salary_details },
        documents: {
          resume: null,
          offer_letter: null,
          joining_letter: null,
          other_docs: []
        }
      };
  
      // Append JSON data
      formPayload.append('employeeData', JSON.stringify(dataToSend));
      
      // Helper function to append files safely
      const appendFile = (fieldName, file) => {
        if (file instanceof File) {
          formPayload.append(fieldName, file);
        }
      };
  
      // Append single files
      appendFile('profile_image', formData.profile_image);
      appendFile('aadhar_document', formData.aadhar_document);
      appendFile('pan_document', formData.pan_document);
      
      // Append document files
      appendFile('resume', formData.documents?.resume);
      appendFile('offer_letter', formData.documents?.offer_letter);
      appendFile('joining_letter', formData.documents?.joining_letter);
      
      // Append other docs - handle array safely
      if (Array.isArray(formData.documents?.other_docs)) {
        formData.documents.other_docs.forEach(file => {
          if (file instanceof File) {
            formPayload.append('other_docs', file);
          }
        });
      }
      
      // Append work experience files
      if (Array.isArray(formData.work_experience)) {
        formData.work_experience.forEach((exp) => {
          if (exp.experience_letter instanceof File) {
            formPayload.append('experience_letter', exp.experience_letter);
          }
        });
      }
  
      const response = await fetch(url, {
        method,
        body: formPayload,
      });
  
      // Handle response
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText.substring(0, 100)}`);
      }
  
      const data = await response.json();
      
      if (data.success) {
        navigate("/employees");
      } else {
        throw new Error(data.message || "Employee creation failed");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/employees")}
          className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-bold">
          {isEditMode ? "Edit Employee" : "Add New Employee"}
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        encType="multipart/form-data"
      >
        <div className="space-y-8">
          {/* Personal Information Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Profile Image
                </label>
                <input
                  type="file"
                  name="profile_image"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  accept="image/*"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Primary Contact
                </label>
                <input
                  type="text"
                  name="contact1"
                  value={formData.contact1}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alternate Contact
                </label>
                <input
                  type="text"
                  name="contact2"
                  value={formData.contact2}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Government IDs Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
              Government Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Aadhar Number
                </label>
                <input
                  type="text"
                  name="aadhar_number"
                  value={formData.aadhar_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Aadhar Document
                </label>
                <input
                  type="file"
                  name="aadhar_document"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  name="pan_number"
                  value={formData.pan_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PAN Document (Optional)
                </label>
                <input
                  type="file"
                  name="pan_document"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            </div>
          </div>

          {/* Employment Details Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
              Employment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Work Start Date
                </label>
                <input
                  type="date"
                  name="work_start_date"
                  value={formData.work_start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tenure
                </label>
                <input
                  type="text"
                  name="tenure"
                  value={formData.tenure}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employment Type
                </label>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Intern">Intern</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_current_employee"
                    name="is_current_employee"
                    checked={formData.is_current_employee}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_current_employee"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Current Employee
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reporting Manager
                </label>
                <input
                  type="text"
                  name="reporting_manager"
                  value={formData.reporting_manager}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employee Status
                </label>
                <select
                  name="employee_status"
                  value={formData.employee_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Work Experience Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
              Work Experience
            </h3>
            {formData.work_experience.map((exp, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 p-4 border rounded-md"
              >
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={exp.company_name || ""}
                    onChange={(e) => handleExperienceChange(index, e)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={exp.role || ""}
                    onChange={(e) => handleExperienceChange(index, e)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={exp.duration || ""}
                    onChange={(e) => handleExperienceChange(index, e)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Experience Letter
                  </label>
                  <input
                    type="file"
                    name="experience_letter"
                    onChange={(e) => handleExperienceChange(index, e)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="md:col-span-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addExperience}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
            >
              + Add Experience
            </button>
          </div>

          {/* Salary Details Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
              Salary Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monthly Salary (₹)
                </label>
                <input
                  type="number"
                  name="salary_details.monthly_salary"
                  value={formData.salary_details.monthly_salary}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  name="salary_details.bank_account_number"
                  value={formData.salary_details.bank_account_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="salary_details.ifsc_code"
                  value={formData.salary_details.ifsc_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="salary_details.bank_name"
                  value={formData.salary_details.bank_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PF Account Number (Optional)
                </label>
                <input
                  type="text"
                  name="salary_details.pf_account_number"
                  value={formData.salary_details.pf_account_number || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
              Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Resume
                </label>
                <input
                  type="file"
                  onChange={(e) => handleDocumentChange("resume", e)}
                  className="w-full px-3 py-2 border rounded-md"
                  accept=".pdf"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Offer Letter
                </label>
                <input
                  type="file"
                  onChange={(e) => handleDocumentChange("offer_letter", e)}
                  className="w-full px-3 py-2 border rounded-md"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Joining Letter
                </label>
                <input
                  type="file"
                  onChange={(e) => handleDocumentChange("joining_letter", e)}
                  className="w-full px-3 py-2 border rounded-md"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Other Documents
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setFormData((prev) => ({
                      ...prev,
                      documents: {
                        ...prev.documents,
                        other_docs: [...prev.documents.other_docs, ...files],
                      },
                    }));
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4 pb-2 border-b">
              Additional Notes
            </h3>
            <div>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                rows="4"
                placeholder="Any additional remarks or notes about the employee..."
              ></textarea>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : isEditMode
              ? "Update Employee"
              : "Add Employee"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
