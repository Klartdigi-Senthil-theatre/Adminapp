import React, { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(true);  
  const [cart, setCart] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");  
  const [currentShow, setCurrentShow] = useState({ time: "" });
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
  // Simulate loading for 1 second
  const timer = setTimeout(() => setLoading(false), 1000);
  return () => clearTimeout(timer);
  }, []);

  // Fetch booked seats when date, time, or movie changes
  useEffect(() => {
    if (currentShow.date && currentShow.time) {
      fetchBookedSeats();
    }
  }, [currentShow.date, currentShow.time]);

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
      name: "Chocolate Bar",
      price: 119,
      image:
        "https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=400&h=300&fit=crop",
      stock: 45,
      category: "Desserts",
    },
    {
      id: 6,
      name: "Burger",
      price: 229,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
      stock: 15,
      category: "Meals",
    },
    {
      id: 7,
      name: "French Fries",
      price: 169,
      image:
        "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&h=300&fit=crop",
      stock: 30,
      category: "Snacks",
    },
    {
      id: 8,
      name: "Mineral Water",
      price: 99,
      image:
        "https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400&h=300&fit=crop",
      stock: 80,
      category: "Beverages",
    },
    {
      id: 9,
      name: "Pizza Slice",
      price: 249,
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      stock: 20,
      category: "Meals",
    },
    {
      id: 10,
      name: "Pretzel",
      price: 159,
      image:
        "https://images.unsplash.com/photo-1580837418631-9dd55f1c3a1a?w=400&h=300&fit=crop",
      stock: 35,
      category: "Snacks",
    },
    {
      id: 11,
      name: "Hot Dog",
      price: 179,
      image:
        "https://images.unsplash.com/photo-1612392062798-2570bc02fdd3?w=400&h=300&fit=crop",
      stock: 25,
      category: "Meals",
    },
    {
      id: 12,
      name: "Iced Tea",
      price: 139,
      image:
        "https://images.unsplash.com/photo-1567095761054-7a60e326e576?w=400&h=300&fit=crop",
      stock: 60,
      category: "Beverages",
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
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(255, 165, 0); // Orange color
    doc.text("Movie Snacks & Concessions", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Order Receipt", 15, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 195, 35, {
      align: "right",
    });
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 195, 45, {
      align: "right",
    });

    // Decorative line
    doc.setDrawColor(255, 165, 0);
    doc.setLineWidth(1);
    doc.line(15, 50, 195, 50);

    let yPosition = 65;

    // Group items by category
    const categorizedItems = cart.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    // Draw each category and its items as cards
    Object.entries(categorizedItems).forEach(([category, items]) => {
      // Category header
      doc.setFontSize(14);
      doc.setTextColor(255, 165, 0);
      doc.text(`${category}`, 15, yPosition);
      yPosition += 10;

      // Draw items as cards
      items.forEach((item, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Card background (light gray rectangle)
        doc.setFillColor(248, 249, 250); // Light gray
        doc.setDrawColor(200, 200, 200); // Border color
        doc.setLineWidth(0.5);
        doc.roundedRect(15, yPosition - 5, 180, 35, 3, 3, "FD"); // Rounded rectangle with fill and border

        // Item details
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(item.name, 20, yPosition + 5);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Category: ${item.category}`, 20, yPosition + 15);

        // Quantity and price info (right side of card)
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Qty: ${item.quantity}`, 130, yPosition + 5);
        doc.text(
          `Unit Price: ₹${item.price.toLocaleString("en-IN")}`,
          130,
          yPosition + 15
        );

        // Total price (highlighted)
        doc.setFontSize(12);
        doc.setTextColor(255, 165, 0); // Orange color
        doc.text(
          `Total: ₹${(item.price * item.quantity).toLocaleString("en-IN")}`,
          130,
          yPosition + 25
        );

        yPosition += 45; // Space between cards
      });

      yPosition += 5; // Extra space between categories
    });

    // Summary section - ensure it fits on current page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    // Add some space before summary
    yPosition += 5;

    // Summary card
    doc.setFillColor(255, 245, 235); // Light orange background
    doc.setDrawColor(255, 165, 0); // Orange border
    doc.setLineWidth(1);
    doc.roundedRect(15, yPosition, 180, 60, 5, 5, "FD");

    doc.setFontSize(16);
    doc.setTextColor(255, 165, 0);
    doc.text("Order Summary", 105, yPosition + 18, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Items: ${getTotalItems()}`, 25, yPosition + 35);
    doc.text(
      `Subtotal: ₹${getTotalPrice().toLocaleString("en-IN")}`,
      25,
      yPosition + 45
    );

    // Final total (properly aligned)
    doc.setFontSize(14);
    doc.setTextColor(255, 165, 0);
    doc.text(
      `Grand Total: ₹${getTotalPrice().toLocaleString("en-IN")}`,
      170,
      yPosition + 45,
      { align: "right" }
    );

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Thank you for your purchase! Enjoy your movie!",
      105,
      doc.internal.pageSize.height - 20,
      { align: "center" }
    );
    doc.text(
      "Visit us again for more delicious snacks!",
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );

    // Save the PDF
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
          <div className="grid grid-cols-4 gap-4 lg:gap-6">
            {filteredSnacks.map((snack) => (
              <div
                key={snack.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={snack.image}
                    alt={snack.name}
                    className="w-full h-36 sm:h-40 object-cover"
                  />
                  {snack.stock < 10 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Low Stock
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-md font-semibold truncate">
                    {snack.name}
                  </h3>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-medium text-orange-600">
                      ₹{snack.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {snack.stock}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(snack)}
                    className="w-full bg-orange-600 sm:w-[xs] sm:h-[50px] sm:text-xs text-white py-2 px-4 rounded-lg hover:bg-orange-700 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-white rounded-lg shadow-md p-4 h-full max-h-full sticky top-24 flex flex-col">
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
                          className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
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
                          className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
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

                  <div className="grid grid-cols-2 gap-2 text-sm">
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
        <div className="grid grid-cols-2 gap-4 lg:gap-6">
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
