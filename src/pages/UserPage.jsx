import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Filter,
  User,
  Mail,
  Phone,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import api from "../config/api";
import moment from "moment";

// User Page Component
const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    emailId: "",
    phoneNumber: "",
  });

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.get('/users');
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.emailId || !formData.phoneNumber) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      if (editingUser) {
        const updatedUser = await api.put(`/users/${editingUser.id}`, formData);
        setUsers(users.map((user) => (user.id === editingUser.id ? updatedUser : user)));
      } else {
        const newUser = await api.post('/users', formData);
        setUsers([...users, newUser]);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Failed to save user. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      emailId: "",
      phoneNumber: "",
    });
    setShowDialog(false);
    setEditingUser(null);
  };

  const handleEdit = async (user) => {
    try {
      const userData = await api.get(`/users/${user.id}`);
      setEditingUser(userData);
      setFormData({
        name: userData.name || userData.fullName, // Handle both field names
        emailId: userData.emailId,
        phoneNumber: userData.phoneNumber,
      });
      setShowDialog(true);
    } catch (error) {
      console.error("Error fetching user:", error);
      alert("Failed to load user for editing.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter((user) => user.id !== id));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(searchTermLower)) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchTermLower)) ||
      (user.emailId && user.emailId.toLowerCase().includes(searchTermLower)) ||
      (user.phoneNumber && user.phoneNumber.toString().includes(searchTerm))
    );
  });

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4 lg:p-6">    
      {/* Loading indicator */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              <span>Loading...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
        <PageHeader title="User Management" />

        <button
          onClick={() => setShowDialog(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-700"
        >
          <Plus size={20} />
          <span>Add User</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="rounded-lg w-xs mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || user.fullName}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-600 flex items-center">
                      <Mail size={14} className="mr-2 text-gray-400" />
                      {user.emailId}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 flex items-center">
                      <Phone size={14} className="mr-2 text-gray-400" />
                      {user.phoneNumber}
                    </div>
                  </td>                  
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {moment(user.createdAt).format("MMM D, YYYY")}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <User className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No users found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md mx-auto my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingUser ? "Edit User" : "Add User"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.emailId}
                    onChange={(e) =>
                      setFormData({ ...formData, emailId: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="number"
                    value={formData.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow up to 10 digits
                      if (value.length <= 10) {
                        setFormData({ ...formData, phoneNumber: value });
                      }
                    }}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter 10-digit phone number"
                    required
                    min="0"
                    max="9999999999"
                    onInput={(e) => {
                      // Remove any non-numeric characters and limit to 10 digits
                      e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                    }}
                  />
                  {formData.phoneNumber && formData.phoneNumber.length < 10 && (
                    <p className="text-xs text-red-500 mt-1">
                      Phone number must be exactly 10 digits
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 font-medium"
                  >
                    {editingUser ? "Update User" : "Add User"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 hover:text-white font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;