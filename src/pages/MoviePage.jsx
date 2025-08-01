import React, { useState } from "react";
import { Plus, Edit, Trash2, X, Upload, Image } from "lucide-react";
import moment from "moment/moment";
import PageHeader from "../components/PageHeader";
import CustomDropdown from "../components/CustomDropdown";

// Movie Page Component
const MoviePage = () => {
  const [movies, setMovies] = useState([
    {
      id: 1,
      title: "Avengers: Endgame",
      language: "English",
      certificate: "U/A",
      image:
        "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRDYUjYzDDjvKC_In8ZX8TNzs1akVNh4MXrZDEJo6gXEcpY1zkRB8WBio8lI9lUprEG_YihaEAlAxa_EYw-QmLFHUj2Y-DR4JYbbkEEpDA",
      status: "Active",
      createdDate: "2024-07-22",
    },
    {
      id: 2,
      title: "The Dark Knight",
      language: "English",
      certificate: "A",
      image:
        "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcTfE_qrYMBZ_JB8om-34WGaZARhpX26yWRttqIDvn4_7l--UzX8mxKcPrc59IcvTpEA_G8gPA",
      status: "Inactive",
      createdDate: "2024-07-15",
    },
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [formData, setFormData] = useState({
    title: "",
    language: "English",
    certificate: "U",
    image: "",
    status: "Active",
  });

  const languages = [
    { id: "English", title: "English" },
    { id: "Hindi", title: "Hindi" },
    { id: "Tamil", title: "Tamil" },
    { id: "Telugu", title: "Telugu" },
    { id: "Malayalam", title: "Malayalam" },
    { id: "Kannada", title: "Kannada" },
    { id: "Bengali", title: "Bengali" },
    { id: "Marathi", title: "Marathi" },
    { id: "Gujarati", title: "Gujarati" },
  ];

  const certificates = [
    { id: "U", title: "U - Universal" },
    { id: "U/A", title: "U/A - Parental Guidance" },
    { id: "A", title: "A - Adults Only" },
    { id: "S", title: "S - Special" },
  ];

  const statusOptions = [
    { id: "Active", title: "Active (Now Showing)" },
    { id: "Inactive", title: "Inactive (Coming Soon)" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMovie) {
      setMovies(
        movies.map((movie) =>
          movie.id === editingMovie.id ? { ...movie, ...formData } : movie
        )
      );
    } else {
      const newMovie = {
        id: Date.now(),
        ...formData,
        createdDate: new Date().toISOString().split("T")[0],
      };
      setMovies([...movies, newMovie]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      language: "English",
      certificate: "U",
      image: "",
      status: "Active",
    });
    setShowDialog(false);
    setEditingMovie(null);
    setShowImageUpload(false);
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      language: movie.language,
      certificate: movie.certificate,
      image: movie.image,
      status: movie.status,
    });
    setShowDialog(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this movie?")) {
      setMovies(movies.filter((movie) => movie.id !== id));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload to a server. For demo, we'll create a fake URL
      const fakeUrl = `https://images.unsplash.com/photo-${Date.now()}?w=400&h=300&fit=crop`;
      setFormData({ ...formData, image: fakeUrl });
      setShowImageUpload(false);
    }
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.language.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "All" || movie.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <PageHeader title="Movie Management" />

        <button
          onClick={() => setShowDialog(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-700"
        >
          <Plus size={20} />
          <span>Add Movie</span>
        </button>
      </div>

      {/* Movies Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poster
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovies.map((movie) => (
                <tr key={movie.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="w-16 h-12 rounded object-cover"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {movie.title}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-600">
                      {movie.language}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {movie.certificate}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${movie.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {movie.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {moment(movie.createdDate).calendar()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(movie)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(movie.id)}
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
      </div>

      {/* Add/Edit Dialog - Fixed positioning and sizing */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md mx-auto my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                  {editingMovie ? "Edit Movie" : "Add Movie"}
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
                    Movie Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter movie title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Language *
                  </label>
                  <CustomDropdown
                    value={formData.language}
                    onChange={(value) =>
                      setFormData({ ...formData, language: value })
                    }
                    options={languages}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Certificate *
                  </label>
                  <CustomDropdown
                    value={formData.certificate}
                    onChange={(value) =>
                      setFormData({ ...formData, certificate: value })
                    }
                    options={certificates}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Movie Poster
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
                        placeholder="Enter movie poster URL or upload"
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

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <CustomDropdown
                    value={formData.status}
                    onChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                    options={statusOptions}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 font-medium"
                  >
                    {editingMovie ? "Update Movie" : "Add Movie"}
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
                <h3 className="text-xl font-bold">Upload Movie Poster</h3>
                <button
                  onClick={() => setShowImageUpload(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Image className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 mb-4">
                    Drag & drop movie poster here
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

export default MoviePage;