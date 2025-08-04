import React, { useState } from "react";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  Calendar,
  Search,
} from "lucide-react";
import { notify } from "../components/Notification";
import CustomDropdown from "../components/CustomDropdown";
import TimingDropdown from "../components/TimingDropDown";
import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";

export default function SnacksPage() {
  const [cart, setCart] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [currentShow, setCurrentShow] = useState({ time: "" });
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const snacks = [
    {
      id: 1,
      name: "Popcorn Large",
      price: 299,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      stock: 50,
      category: "Snacks",
    },
    {
      id: 2,
      name: "Coca Cola",
      price: 149,
      image:
        "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
      stock: 100,
      category: "Beverages",
    },
    {
      id: 3,
      name: "Nachos",
      price: 199,
      image:
        "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop",
      stock: 30,
      category: "Snacks",
    },
    {
      id: 4,
      name: "Ice Cream",
      price: 129,
      image:
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
      stock: 40,
      category: "Desserts",
    },
    {
      id: 5,
      name: "Hot Dog",
      price: 179,
      image:
        "https://images.unsplash.com/photo-1612392062798-2570bc02fdd3?w=400&h=300&fit=crop",
      stock: 25,
      category: "Meals",
    },
    {
      id: 6,
      name: "Pizza Slice",
      price: 249,
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      stock: 20,
      category: "Meals",
    },
  ];

  const categoryOptions = [
    { id: "All", title: "All Categories" },
    { id: "Snacks", title: "Snacks" },
    { id: "Beverages", title: "Beverages" },
    { id: "Desserts", title: "Desserts" },
    { id: "Meals", title: "Meals" },
  ];

  const generatePDFReceipt = () => {
    const categorizedItems = cart.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Order Receipt", 15, 15);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 180, 15, {
      align: "right",
    });

    doc.setFontSize(12);
    doc.text("Movie Snacks & Concessions", 105, 25, { align: "center" });

    doc.line(15, 30, 195, 30);

    let yPosition = 38;

    Object.entries(categorizedItems).forEach(([category, items]) => {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`${category}`, 15, yPosition);
      yPosition += 5;

      const tableData = items.map((item) => [
        item.name,
        item.quantity,
        `₹${item.price.toLocaleString("en-IN")}`,
        `₹${(item.price * item.quantity).toLocaleString("en-IN")}`,
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [["Item", "Qty", "Unit Price", "Total"]],
        body: tableData,
        headStyles: {
          fillColor: [255, 165, 0],
          textColor: [255, 255, 255],
          fontSize: 10,
        },
        bodyStyles: {
          fontSize: 9,
        },
        margin: { left: 15, right: 15 },
        styles: {
          cellPadding: 2,
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { cellWidth: 15 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
        },
      });

      yPosition = doc.lastAutoTable.finalY + 5;
    });

    doc.setFontSize(12);
    doc.text("Order Summary", 15, yPosition);
    yPosition += 5;

    autoTable(doc, {
      startY: yPosition,
      body: [
        ["Subtotal:", `₹${getTotalPrice().toLocaleString("en-IN")}`],
        ["Total:", `₹${(getTotalPrice() * 1.1).toFixed(2)}`],
      ],
      margin: { left: 15, right: 15 },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: "right",
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: "bold", halign: "left" },
        1: { cellWidth: 30, halign: "right" },
      },
    });

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      "Thank you for your purchase!",
      105,
      doc.internal.pageSize.height - 15,
      { align: "center" }
    );

    doc.save(`snack_order_${new Date().getTime()}.pdf`);
  };

  const handleSave = () => {
    notify.success("Checkout Successfully !...");
    generatePDFReceipt();
  };

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
    notify.error("Removed Items..");
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(
        cart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const filteredSnacks = snacks.filter((snack) => {
    const matchesCategory =
      filterCategory === "All" || snack.category === filterCategory;
    const matchesSearch = snack.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-2 lg:p-4 relative">
      {/* Header - Responsive Layout */}
      <div className="mb-4 bg-white sticky top-0 z-10 pt-2 pb-1 border border-white rounded-2xl">
        {/* Desktop Layout */}
        <div className="hidden sm:flex flex-row justify-between items-center gap-4">
          {/* Date */}
          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg">
            <Calendar className="text-orange-600" size={20} />
            <div>
              <p className="font-semibold">{getCurrentDate()}</p>
            </div>
          </div>

          {/* Timing Dropdown */}
          <div className="flex-1 flex justify-start">
            <TimingDropdown
              currentShow={currentShow}
              onTimeSelect={(time) => setCurrentShow({ ...currentShow, time })}
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-4">
            {/* Search Box */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search snacks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <CustomDropdown
              value={filterCategory}
              onChange={setFilterCategory}
              options={categoryOptions}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden flex flex-col gap-4">
          {/* Top Row - Date + Time */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg">
              <Calendar className="text-orange-600" size={20} />
              <div>
                <p className="font-light">{getCurrentDate()}</p>
              </div>
            </div>

            <TimingDropdown
              currentShow={currentShow}
              onTimeSelect={(time) => setCurrentShow({ ...currentShow, time })}
            />
          </div>

          {/* Bottom Row - Search + Category Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <CustomDropdown
              value={filterCategory}
              onChange={setFilterCategory}
              options={categoryOptions}
            />
          </div>
        </div>
      </div>

      {/* Split View for Desktop */}
      <div className="hidden lg:flex gap-6 h-[calc(110vh-180px)]">
        {/* Left Side - Snacks Grid */}
        <div className="w-2/3 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {filteredSnacks.map((snack) => (
              <div
                key={snack.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={snack.image}
                    alt={snack.name}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                  {snack.stock < 10 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Low Stock
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 truncate">
                    {snack.name}
                  </h3>

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-medium text-orange-600">
                      ₹{snack.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {snack.stock}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(snack)}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={snack.stock === 0}
                  >
                    <ShoppingCart size={16} />
                    <span>
                      {snack.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Cart Panel */}
        <div className="w-1/3">
          <div className="bg-white rounded-lg shadow-md p-4 h-full max-h-[70vh] sticky top-24 flex flex-col">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold">Your Cart</h2>
            </div>
            {cart.length === 0 ? (
              <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
                <ShoppingCart
                  size={48}
                  className="mx-auto text-gray-400 mb-4"
                />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-2"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded object-cover"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          ₹{item.price} each
                        </p>
                        <p className="text-sm font-medium text-orange-600">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                        >
                          <Plus size={16} />
                        </button>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-md font-semibold">
                      <span>Total ({getTotalItems()} items):</span>
                      <span className="text-orange-600">
                        ₹{getTotalPrice()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleSave}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium"
                    >
                      Proceed to Checkout
                    </button>
                    <button
                      onClick={() => setCart([])}
                      className="w-full text-orange-600 py-2 px-4 rounded-lg hover:bg-orange-600 hover:text-white border-1 border-orange-600"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View - Single Column */}
      <div className="lg:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          {filteredSnacks.map((snack) => (
            <div
              key={snack.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={snack.image}
                  alt={snack.name}
                  className="w-full h-40 sm:h-48 object-cover"
                />
                {snack.stock < 10 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Low Stock
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 truncate">
                  {snack.name}
                </h3>

                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-medium text-orange-600">
                    ₹{snack.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {snack.stock}
                  </span>
                </div>

                <button
                  onClick={() => addToCart(snack)}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={snack.stock === 0}
                >
                  <ShoppingCart size={16} />
                  <span>
                    {snack.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Button (Mobile only) */}
      <button
        onClick={() => setIsMobileCartOpen(true)}
        className="fixed bottom-6 right-6 lg:hidden bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 z-30"
      >
        <ShoppingCart size={24} />
        {getTotalItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {getTotalItems()}
          </span>
        )}
      </button>

      {/* Mobile Cart Panel */}
      {isMobileCartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileCartOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg z-50 p-4 max-h-[70vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Cart</h2>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart
                  size={48}
                  className="mx-auto text-gray-400 mb-4"
                />
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded object-cover"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          ₹{item.price} each
                        </p>
                        <p className="text-sm font-medium text-orange-600">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                        >
                          <Plus size={16} />
                        </button>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-md font-semibold">
                      <span>Total ({getTotalItems()} items):</span>
                      <span className="text-orange-600">
                        ₹{getTotalPrice()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleSave}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium"
                    >
                      Proceed to Checkout
                    </button>
                    <button
                      onClick={() => setCart([])}
                      className="w-full text-orange-600 py-2 px-4 rounded-lg hover:bg-orange-600 hover:text-white border-1 border-orange-600"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
