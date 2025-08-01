import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Package,
  AlertTriangle
} from "lucide-react";
import moment from "moment";
import PageHeader from "../components/PageHeader";
import CustomDropdown from "../components/CustomDropdown";

// Inventory Page Component
const InventoryPage = () => {
  const [inventory, setInventory] = useState([
    {
      id: 1,
      itemName: "Popcorn - Large",
      category: "Snacks",
      quantity: 150,
      unitPrice: 8.99,
      minStock: 20,
      supplier: "Snack Co.",
      status: "In Stock",
      lastUpdated: "2024-07-25",
    },
    {
      id: 2,
      itemName: "Coca Cola - 500ml",
      category: "Beverages",
      quantity: 12,
      unitPrice: 3.5,
      minStock: 50,
      supplier: "Beverage Corp",
      status: "Low Stock",
      lastUpdated: "2024-07-24",
    },
    {
      id: 3,
      itemName: "Nachos with Cheese",
      category: "Snacks",
      quantity: 0,
      unitPrice: 12.99,
      minStock: 15,
      supplier: "Snack Co.",
      status: "Out of Stock",
      lastUpdated: "2024-07-23",
    },
    {
      id: 4,
      itemName: "Movie Theater Butter",
      category: "Supplies",
      quantity: 75,
      unitPrice: 15.5,
      minStock: 10,
      supplier: "Supply World",
      status: "In Stock",
      lastUpdated: "2024-07-25",
    },
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    quantity: "",
    unitPrice: "",
    minStock: "",
    supplier: "",
    status: "In Stock",
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
    { id: "Equipment", title: "Equipment" }
  ];

  const statusOptions = [
    { id: "All", title: "All Status" },
    { id: "In Stock", title: "In Stock" },
    { id: "Low Stock", title: "Low Stock" },
    { id: "Out of Stock", title: "Out of Stock" }
  ];

  const handleSubmit = () => {
    if (
      !formData.itemName ||
      !formData.category ||
      !formData.quantity ||
      !formData.unitPrice
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const itemData = {
      ...formData,
      quantity: parseInt(formData.quantity),
      unitPrice: parseFloat(formData.unitPrice),
      minStock: parseInt(formData.minStock) || 0,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    if (editingItem) {
      setInventory(
        inventory.map((item) =>
          item.id === editingItem.id ? { ...item, ...itemData } : item
        )
      );
    } else {
      const newItem = {
        id: Date.now(),
        ...itemData,
      };
      setInventory([...inventory, newItem]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      itemName: "",
      category: "",
      quantity: "",
      unitPrice: "",
      minStock: "",
      supplier: "",
      status: "In Stock",
    });
    setShowDialog(false);
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      minStock: item.minStock.toString(),
      supplier: item.supplier,
      status: item.status,
    });
    setShowDialog(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this inventory item?")) {
      setInventory(inventory.filter((item) => item.id !== id));
    }
  };

  const getStatusColor = (status, quantity, minStock) => {
    if (quantity === 0) return "bg-red-100 text-red-800";
    if (quantity <= minStock) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getActualStatus = (quantity, minStock) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= minStock) return "Low Stock";
    return "In Stock";
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || item.category === filterCategory;
    const actualStatus = getActualStatus(item.quantity, item.minStock);
    const matchesStatus =
      filterStatus === "All" || actualStatus === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <PageHeader title="Inventory Management" />

        <button
          onClick={() => setShowDialog(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-700"
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
                className="w-xs text-sm pl-10 pr-4 py-2 border rounded-lg focus:border-orange-500"
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
                  className="pl-10" // Add padding for the filter icon
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
                  className="pl-10" // Add padding for the package icon
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
                  inventory.filter((item) => item.quantity > item.minStock)
                    .length
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
                      item.quantity > 0 && item.quantity <= item.minStock
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
                {inventory.filter((item) => item.quantity === 0).length}
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
                      {item.itemName}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{item.category}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.quantity}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      ${item.unitPrice.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{item.minStock}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {item.supplier}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        item.status,
                        item.quantity,
                        item.minStock
                      )}`}
                    >
                      {getActualStatus(item.quantity, item.minStock)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                    {moment(item.lastUpdated).calendar()}
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
            <p className="text-gray-600">No inventory items found</p>
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category *
                  </label>
                  <CustomDropdown
                    value={formData.category}
                    onChange={(value) => setFormData({ ...formData, category: value })}
                    options={categories.map(cat => ({ id: cat, title: cat }))}
                    placeholder="Select Category"
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
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Minimum Stock Level
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData({ ...formData, minStock: e.target.value })
                    }
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0"
                    min="0"
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
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 font-medium"
                  >
                    {editingItem ? "Update Item" : "Add Item"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 font-medium"
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