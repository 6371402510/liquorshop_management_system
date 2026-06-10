import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  Loader2,
  ShieldCheck,
  UserCheck,
  AlertCircle,
} from "lucide-react";

// Import API functions
import { getCompanies } from "../apiservices/companyApi";
import { getUsers, createUser } from "../apiservices/staffApi";

export default function StaffManagement() {
  const navigate = useNavigate();

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "MANAGER",
    company_id: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // List States
  const [staffList, setStaffList] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  // Fetch companies for dropdown & Staff list on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const compData = await getCompanies();
        setCompanies(compData);

        const userData = await getUsers();
        setStaffList(userData);
      } catch (err) {
        console.error(err.message || "Failed to fetch data");
      } finally {
        setListLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");

    try {
      const data = await createUser(formData);

      setFormSuccess(`${formData.role} account created successfully!`);
      
      // Add the actual user returned from the backend to the list
      setStaffList((prev) => [...prev, data]);

      // Reset form
      setFormData({ name: "", email: "", password: "", role: "MANAGER", company_id: "" });
      
      setTimeout(() => setFormSuccess(""), 3000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // ─── FIX: Use camelCase field name from API ───
  const getCompanyName = (compId) => {
    if (!compId) return "N/A";
    const company = companies.find((c) => c.id === compId);
    // API returns companyName (camelCase) because of Pydantic alias_generator
    return company ? (company.companyName || company.company_name) : "N/A";
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Staff Management
          </h1>
        </div>
      </div>

      <div className="p-4 grid lg:grid-cols-3 gap-6">
        {/* ─── LEFT: Create Form ─── */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 sticky top-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserPlus size={20} /> Create New Staff
            </h2>

            {formError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 mb-4">
                <AlertCircle size={14} /> {formError}
              </div>
            )}
            {formSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm text-emerald-600 dark:text-emerald-400 mb-4">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Rahul Sharma"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. manager@store.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="text"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min 6 characters"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="MANAGER">Manager</option>
                    <option value="SALESMAN">Salesman</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store</label>
                  <select
                    name="company_id"
                    required
                    value={formData.company_id}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select</option>
                    {/* ─── FIX: Use camelCase field name from API ─── */}
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName || c.company_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="btn-primary w-full justify-center py-2.5 mt-2"
              >
                {formLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Create Account
              </button>
            </form>
          </div>
        </div>

        {/* ─── RIGHT: Staff List Table ─── */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Existing Staff Members
            </h2>

            {listLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : staffList.length === 0 ? (
              <p className="text-gray-400 text-center py-10">No staff members found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700 text-gray-500 dark:text-gray-400">
                      <th className="text-left py-3 px-2">Name</th>
                      <th className="text-left py-3 px-2">Email</th>
                      <th className="text-left py-3 px-2">Role</th>
                      <th className="text-left py-3 px-2">Assigned Store</th>
                      <th className="text-center py-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffList.map((staff) => (
                      <tr
                        key={staff.id}
                        className="border-b dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-3 px-2 font-medium">{staff.name}</td>
                        <td className="py-3 px-2 text-gray-500 dark:text-gray-400">{staff.email}</td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                            staff.role === "MANAGER" 
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" 
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}>
                            {staff.role === "MANAGER" ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                            {staff.role}
                          </span>
                        </td>
                        <td className="py-3 px-2">{getCompanyName(staff.company_id)}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            staff.is_active 
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            {staff.is_active ? "Active" : "Disabled"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}