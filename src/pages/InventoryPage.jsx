import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Package,
  AlertTriangle,
} from "lucide-react";
import moment from "moment";
import PageHeader from "../components/PageHeader";
import CustomDropdown from "../components/CustomDropdown";
import api from "../config/api"; // Import the global API file

// Inventory Page Component
const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    image: "",
    category: "",
    quantity: "",
    unitPrice: "",
    minimumStockLevel: "",
    supplier: "",
    visibility: true,
  });

  const categories = [
    "Snacks",
    "Beverages",
    "Supplies",
    "Cleaning",
    "Equipment",
  ];

  const categoryOptions = [
    { id: "All", title: "All Categories" },
    { id: "Snacks", title: "Snacks" },
    { id: "Beverages", title: "Beverages" },
    { id: "Supplies", title: "Supplies" },
    { id: "Cleaning", title: "Cleaning" },
    { id: "Equipment", title: "Equipment" },
  ];

  const statusOptions = [
    { id: "All", title: "All Status" },
    { id: "In Stock", title: "In Stock" },
    { id: "Low Stock", title: "Low Stock" },
    { id: "Out of Stock", title: "Out of Stock" },
  ];

  // Fetch inventory data using the global API
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/inventory');
      setInventory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err.message || 'Failed to fetch inventory data');
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSubmit = async () => {
    // Validate required fields
    if (
      !formData.itemName.trim() ||
      !formData.category ||
      !formData.quantity ||
      !formData.unitPrice
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate numeric fields
    const quantity = parseInt(formData.quantity);
    const unitPrice = parseFloat(formData.unitPrice);
    const minimumStockLevel = parseInt(formData.minimumStockLevel) || 0;

    if (isNaN(quantity) || quantity < 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      alert("Please enter a valid unit price");
      return;
    }

    const itemData = {
      itemName: formData.itemName.trim(),
      image: formData.image.trim(),
      category: formData.category,
      quantity: quantity,
      unitPrice: unitPrice,
      minimumStockLevel: minimumStockLevel,
      supplier: formData.supplier.trim(),
      visibility: formData.visibility,
      updatedAt: new Date().toISOString(), // Add timestamp
    };

    try {
      setSubmitting(true);
      
      if (editingItem) {
        // Update existing item
        const updatedItem = await api.put(`/inventory/${editingItem.id}`, itemData);
        
        // Update local state with the response data or merge with existing data
        const finalUpdatedItem = {
          ...editingItem,
          ...itemData,
          ...updatedItem,
          id: editingItem.id, // Ensure ID is preserved
        };
        
        setInventory(prevInventory =>
          prevInventory.map(item =>
            item.id === editingItem.id ? finalUpdatedItem : item
          )
        );
      } else {
        // Create new item
        const newItem = await api.post('/inventory', itemData);
        
        // Create a complete item object
        const finalNewItem = {
          ...itemData,
          ...newItem,
          id: newItem.id || Date.now(), // Use API response ID or generate one
          createdAt: newItem.createdAt || new Date().toISOString(),
          updatedAt: newItem.updatedAt || new Date().toISOString(),
        };
        
        setInventory(prevInventory => [...prevInventory, finalNewItem]);
      }
      
      resetForm();
      
      // Optional: Show success message
      alert(editingItem ? 'Item updated successfully!' : 'Item added successfully!');
      
    } catch (err) {
      console.error('Error saving item:', err);
      alert(`Error: ${err.message || 'Failed to save item'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: "",
      image: "",
      category: "",
      quantity: "",
      unitPrice: "",
      minimumStockLevel: "",
      supplier: "",
      visibility: true,
    });
    setShowDialog(false);
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    if (!item) {
      console.error('Item is null or undefined');
      return;
    }

    try {
      setEditingItem(item);
      setFormData({
        itemName: item.itemName || "",
        image: item.image || "",
        category: item.category || "",
        quantity: (item.quantity || 0).toString(),
        unitPrice: (item.unitPrice || 0).toString(),
        minimumStockLevel: (item.minimumStockLevel || 0).toString(),
        supplier: item.supplier || "",
        visibility: item.visibility !== undefined ? item.visibility : true,
      });
      setShowDialog(true);
    } catch (err) {
      console.error('Error editing item:', err);
      alert('Error opening item for editing');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this inventory item?")) {
      return;
    }

    try {
      await api.delete(`/inventory/${id}`);
      setInventory(prevInventory => 
        prevInventory.filter(item => item.id !== id)
      );
      alert('Item deleted successfully!');
    } catch (err) {
      console.error('Error deleting item:', err);
      alert(`Error: ${err.message || 'Failed to delete item'}`);
    }
  };

  const getStatusColor = (quantity, minimumStockLevel) => {
    if (quantity === 0) return "bg-red-100 text-red-800";
    if (quantity <= minimumStockLevel) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getActualStatus = (quantity, minimumStockLevel) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= minimumStockLevel) return "Low Stock";
    return "In Stock";
  };

  const filteredInventory = inventory.filter((item) => {
    if (!item) return false;
    
    const itemName = item.itemName || "";
    const supplier = item.supplier || "";
    const category = item.category || "";
    
    const matchesSearch =
      itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || category === filterCategory;
    const actualStatus = getActualStatus(item.quantity || 0, item.minimumStockLevel || 0);
    const matchesStatus =
      filterStatus === "All" || actualStatus === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

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
        <PageHeader title="Inventory Management" />

        <button
          onClick={() => setShowDialog(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-700"
          disabled={submitting}
        >
          <Plus size={20} />
          <span>Add Item</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input - Full width on mobile, flex-1 on desktop */}
          <div className="w-full lg:flex-1 relative">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={15}
              />
              <input
                type="text"
                placeholder="Search items or suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-2 border rounded-lg focus:border-orange-500"
              />
            </div>
          </div>

          {/* Filters - Flex row on desktop, column on mobile */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Category Filter */}
            <div className="relative flex-1">
              <div className="relative">
                <CustomDropdown
                  value={filterCategory}
                  onChange={setFilterCategory}
                  options={categoryOptions}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="relative flex-1">
              <div className="relative">
                <CustomDropdown
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={statusOptions}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-800">
                {inventory.length}
              </p>
            </div>
            <Package className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  inventory.filter(
                    (item) => (item?.quantity || 0) > (item?.minimumStockLevel || 0)
                  ).length
                }
              </p>
            </div>
            <Package className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  inventory.filter(
                    (item) =>
                      (item?.quantity || 0) > 0 &&
                      (item?.quantity || 0) <= (item?.minimumStockLevel || 0)
                  ).length
                }
              </p>
            </div>
            <AlertTriangle className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {inventory.filter((item) => (item?.quantity || 0) === 0).length}
              </p>
            </div>
            <AlertTriangle className="text-red-500" size={32} />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Stock
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.itemName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{item.category || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.quantity || 0}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      ₹{(item.unitPrice || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {item.minimumStockLevel || 0}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {item.supplier || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        item.quantity || 0,
                        item.minimumStockLevel || 0
                      )}`}
                    >
                      {getActualStatus(item.quantity || 0, item.minimumStockLevel || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.updatedAt ? moment(item.updatedAt).calendar() : 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Item"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Item"
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

        {filteredInventory.length === 0 && (
          <div className="text-center py-8">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">
              {inventory.length === 0 ? 'No inventory items found' : 'No items match your search criteria'}
            </p>
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
                  {editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={submitting}
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) =>
                      setFormData({ ...formData, itemName: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter item name"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Image URL
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter image URL"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category *
                  </label>
                  <CustomDropdown
                    value={formData.category}
                    onChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                    options={categories.map((cat) => ({ id: cat, title: cat }))}
                    placeholder="Select category"
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0"
                      min="0"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, unitPrice: e.target.value })
                      }
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0.00"
                      min="0"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Minimum Stock Level
                  </label>
                  <input
                    type="number"
                    value={formData.minimumStockLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimumStockLevel: e.target.value,
                      })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0"
                    min="0"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter supplier name"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Visibility
                  </label>
                  <CustomDropdown
                    value={formData.visibility ? "true" : "false"}
                    onChange={(value) =>
                      setFormData({ ...formData, visibility: value === "true" })
                    }
                    options={[
                      { id: "true", title: "Visible" },
                      { id: "false", title: "Hidden" },
                    ]}
                    disabled={submitting}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 font-medium disabled:bg-gray-400"
                    disabled={submitting}
                  >
                    {submitting 
                      ? (editingItem ? "Updating..." : "Adding...") 
                      : (editingItem ? "Update Item" : "Add Item")
                    }
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 font-medium disabled:bg-gray-200"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;