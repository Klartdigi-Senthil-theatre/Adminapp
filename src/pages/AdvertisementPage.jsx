import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Search,
  Package,
} from "lucide-react";
import moment from "moment/moment";
import PageHeader from "../components/PageHeader";
import api from "../config/api";

const AdvertisementPage = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
  });

  // Fetch advertisements on component mount
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const data = await api.get('/advertisements');
        setAds(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

   const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // No need to convert active status since we're using boolean directly
      if (editingAd) {
        const updatedAd = await api.put(`/advertisements/${editingAd.id}`, formData);
        setAds(ads.map((ad) => (ad.id === editingAd.id ? updatedAd : ad)));
      } else {
        const newAd = await api.post('/advertisements', formData);
        setAds([...ads, newAd]);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving advertisement:", error);
      alert("Failed to save advertisement. Please try again.");
    }
  };

  const handleEdit = async (ad) => {
    try {
      const fullAd = await api.get(`/advertisements/${ad.id}`);
      setEditingAd(fullAd);
      setFormData({
        title: fullAd.title,
        content: fullAd.content,
        image: fullAd.image,
      });
      setShowDialog(true);
    } catch (error) {
      console.error("Error fetching advertisement:", error);
      alert("Failed to load advertisement for editing.");
    }
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", image: ""});
    setShowDialog(false);
    setEditingAd(null);
    setShowImageUpload(false);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this advertisement?")) {
      try {
        await api.delete(`/advertisements/${id}`);
        setAds(ads.filter((ad) => ad.id !== id));
      } catch (error) {
        console.error("Error deleting advertisement:", error);
        alert("Failed to delete advertisement. Please try again.");
      }
    }
  };

  const IMAGE_URL = 'https://theatre-app-backend-api-fuarhje3aceffkcu.centralindia-01.azurewebsites.net/uploads';

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to a server
      // For demo, we'll create a fake URL
      const fakeUrl = `${IMAGE_URL}/uploads/${file.name}`;
      setFormData({ ...formData, image: fakeUrl });
      setShowImageUpload(false);
    }
  };

  // Filter users based on search term
  const filteredAds = ads.filter((ad) => {
  const searchTermLower = searchTerm.toLowerCase();
  return (
    (ad.title && ad.title.toLowerCase().includes(searchTermLower)) ||
    (ad.content && ad.content.toLowerCase().includes(searchTermLower))
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <PageHeader title="Advertisement Management" />

        <button
          onClick={() => setShowDialog(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-700"
        >
          <Plus size={20} />
          <span>Add Advertisement</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search advertisements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-xs pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Advertisements Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredAds.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="mx-auto mb-4" size={48} />
            <p>No advertisements found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
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
                {filteredAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <img
                        src={ad.image}
                        alt={ad.title}
                        className="w-16 h-12 rounded object-cover"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {ad.title}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-600 max-w-sm truncate">
                        {ad.content}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {moment(ad.createdAt).format("MMM D, YYYY")}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(ad)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="text-red-600 hover:text-red-800"
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
        )}
      </div>

      {/* Add/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md mx-auto my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingAd ? "Edit Advertisement" : "Add Advertisement"}
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
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Image
                  </label>
                  <div className="space-y-3">
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                        placeholder="Enter image URL or upload"
                        className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowImageUpload(true)}
                        className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 flex items-center"
                      >
                        <Upload size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 font-medium"
                  >
                    {editingAd ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Dialog */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg w-full max-w-sm mx-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Upload Image</h3>
                <button
                  onClick={() => setShowImageUpload(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 mb-4">
                    Drag & drop your image here
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 cursor-pointer inline-block"
                  >
                    Choose File
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvertisementPage;