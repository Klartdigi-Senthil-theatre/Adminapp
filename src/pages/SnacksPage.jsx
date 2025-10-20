import jsPDF from "jspdf";
import {
  Calendar,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import SnacksReceiptPreviewPopup from "../dialog/SnacksReceiptPreviewPopup";
import CustomDropdown from "../components/CustomDropdown";
import { notify } from "../components/Notification";
import TimingDropdown from "../components/TimingDropDown";
import api from "../config/api";

export default function SnacksPage() {
  const [cart, setCart] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [snacks, setSnacks] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  // Initialize date to today in local timezone so TimingDropdown can fetch
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const todayStr = today.toISOString().split("T")[0];
  const [currentShow, setCurrentShow] = useState({ date: todayStr, time: "" });
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('cash'); // 'cash' | 'gpay'
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [lastOrderMeta, setLastOrderMeta] = useState({ orderId: null, paymentMode: "cash" });

   useEffect(() => {
      const fetchSnacks = async () => {
        try {
        setLoading(true);
        const inventory = await api.get('/inventory');
        const mapped = (Array.isArray(inventory) ? inventory : []).filter((it) => it.visibility !== false && it.active !== false).map((it) => ({
          id: it.id,
          name: it.itemName,
          price: typeof it.unitPrice === 'number' ? it.unitPrice : Number(it.unitPrice || 0),
          image: it.image,
          stock: typeof it.quantity === 'number' ? it.quantity : Number(it.quantity || 0),
          category: it.category || 'Others',
        }));
        setSnacks(mapped);
        } catch (err) {
        setSnacks([]);
      } finally {
          setLoading(false);
        }
      };
      fetchSnacks();
    }, []);

  // snacks are loaded dynamically from API

  const categoryOptions = [{ id: "All", title: "All Categories" }, ...Array.from(new Set(snacks.map((s) => s.category))).map((c) => ({ id: c, title: c }))];

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

  const handleSave = async () => {
    if (!currentShow.time) {
      notify.error("Please select a showtime before proceeding to checkout.");
      return;
    }
    if (cart.length === 0) {
      notify.error("Your cart is empty.");
      return;
    }
    // Open modal to select payment method before proceeding
    setSelectedPayment('cash'); // Default to Cash
    setShowPaymentModal(true);
  };

  const proceedCheckoutWithPayment = async (payment) => {
    try {
      setLoading(true);
      const totalAmount = getTotalPrice();
      // Ensure we have showTimePlannerId provided by TimingDropdown selection
      const showTimePlannerId = currentShow.showTimePlannerId || null;
      if (!showTimePlannerId) {
        notify.error("Unable to resolve show time. Please select a time again.");
        setLoading(false);
        return;
      }
      const payloadOrder = {
        showTimePlannerId,
        phoneNumber: null,
        paymentMode: payment === "gpay" ? "Gpay" : "Cash",
        amount: totalAmount,
        createdBy: "Admin",
      };

      const orderRes = await api.post("/inventory-orders", payloadOrder);
      const orderId = orderRes?.id;
      if (!orderId) {
        throw new Error("Invalid order response");
      }

      const details = cart.map((item) => ({
        orderId,
        inventoryId: item.id,
        quantity: item.quantity,
      }));

      await api.post("/inventory-order-details", details);

      notify.success("Checkout successful. Preparing receipt preview...");
      setLastOrderMeta({ orderId, paymentMode: payment });
      setShowReceiptPreview(true);
    } catch (err) {
      console.error("Checkout failed:", err);
      const msg = err?.response?.data?.error || err?.message || "Checkout failed. Please try again.";
      notify.error(msg);
    } finally {
      setLoading(false);
      setShowPaymentModal(false);
    }
  };

  const generateThermalReceipts = (cartItems, show, orderId, grandTotal, payment) => {
    // Group by category
    const grouped = cartItems.reduce((acc, item) => {
      const key = item.category || "Others";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    const categories = Object.keys(grouped);
    if (categories.length === 0) return;

    const receiptNo = `REC-${String(orderId || Date.now()).slice(-6)}`;
    const nowTime = new Date().toLocaleTimeString();
    const showTime = show.time || "--";
    const showDate = show.date || new Date().toISOString().split("T")[0];
    const paymentMode = payment === "gpay" ? "Gpay" : "Cash";

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Snacks Receipt</title>
          <style>
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: 80mm auto;
              margin: 0;
            }
            
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              margin: 0;
              padding: 2mm;
              width: 76mm;
              color: #000;
              background: white;
            }
            
            .receipt {
              width: 100%;
              text-align: center;
              page-break-inside: avoid;
              page-break-after: always;
              margin-bottom: 0;
            }
            
            .receipt:last-child {
              page-break-after: auto;
            }
            
            .header-banner {
              background-color: #000 !important;
              color: #fff !important;
              padding: 3mm 0;
              margin-bottom: 2mm;
            }
            
            .cinema-name {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 1mm;
            }
            
            .order-type {
              font-size: 12px;
            }
            
            .dotted-line {
              border-top: 1px dotted #000;
              margin: 2mm 0;
            }
            
            .solid-line {
              border-top: 1px solid #000;
              margin: 2mm 0;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 1mm 0;
              font-size: 11px;
            }
            
            .label {
              font-weight: bold;
            }
            
            .value {
              text-align: right;
            }
            
            .category-header {
              margin: 3mm 0 2mm 0;
            }
            
            .category-title {
              color: #FF6C38 !important;
              font-size: 13px;
              font-weight: bold;
              margin-bottom: 1mm;
            }
            
            .category-line {
              border-top: 2px solid #FF6C38 !important;
              margin: 1mm 0;
            }
            
            .item-row {
              margin: 2mm 0;
              text-align: left;
            }
            
            .item-name {
              font-weight: bold;
              margin-bottom: 1mm;
            }
            
            .item-details {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              margin-bottom: 1mm;
            }
            
            .item-price {
              font-size: 10px;
              margin-bottom: 1mm;
              text-align: right;
            }
            
            .item-total {
              color: #FF6C38 !important;
              font-size: 12px;
              font-weight: bold;
              text-align: right;
            }
            
            .totals {
              margin: 3mm 0;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 1mm 0;
            }
            
            .total-label {
              font-weight: bold;
            }
            
            .total-value {
              font-weight: bold;
            }
            
            .footer {
              text-align: center;
              margin-top: 3mm;
              font-size: 10px;
            }
            
            .gst {
              margin-bottom: 1mm;
            }
            
            .tagline {
              margin-bottom: 1mm;
            }
            
            .thank-you {
              font-weight: bold;
              margin-bottom: 2mm;
            }
            
            .tamil-text {
              font-size: 9px;
              line-height: 1.3;
            }
            
            @media print {
              body {
                margin: 2mm !important;
                padding: 0 !important;
              }
              
              .receipt {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                page-break-after: always !important;
                margin-bottom: 0 !important;
              }
              
              .receipt:last-child {
                page-break-after: auto !important;
              }
            }
          </style>
        </head>
        <body>
          ${categories.map(cat => `
            <div class="receipt">
              <div class="header-banner">
                <div class="cinema-name">SENTHIL CINEMAS A/C</div>
                <div class="order-type">SNACKS ORDER</div>
              </div>
              
              <div class="dotted-line"></div>
              
              <div class="info-row">
                <span class="label">Receipt No:</span>
                <span class="value">${receiptNo}</span>
              </div>
              <div class="info-row">
                <span class="label">Date:</span>
                <span class="value">${new Date().toLocaleDateString('en-GB')}</span>
              </div>
              <div class="info-row">
                <span class="label">Time:</span>
                <span class="value">${nowTime}</span>
              </div>
              <div class="info-row">
                <span class="label">Show Time:</span>
                <span class="value">${showTime}</span>
              </div>
              
              <div class="dotted-line"></div>
              
              <div class="category-header">
                <div class="category-title">${cat.toUpperCase()}</div>
                <div class="category-line"></div>
              </div>
              
              ${grouped[cat].map(item => {
      const lineTotal = (item.price || 0) * (item.quantity || 0);
      return `
                  <div class="item-row">
                    <div class="item-name">${item.name || "Item"}</div>
                    <div class="item-details">
                      <span>Qty: ${item.quantity || 0}</span>
                    </div>
                    <div class="item-price">
                      ₹${Number(item.price || 0).toLocaleString("en-IN")} × ${item.quantity || 0}
                    </div>
                    <div class="item-total">₹${Number(lineTotal).toLocaleString("en-IN")}</div>
                  </div>
                `;
    }).join('')}
              
              <div class="solid-line"></div>
              
              <div class="totals">
                <div class="total-row">
                  <span class="total-label">Total:</span>
                  <span class="total-value">₹${grouped[cat].reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0).toLocaleString("en-IN")}</span>
                </div>
                <div class="total-row">
                  <span class="total-label">Items:</span>
                  <span class="total-value">${grouped[cat].reduce((sum, item) => sum + (item.quantity || 0), 0)}</span>
                </div>
              </div>
              
              <div class="dotted-line"></div>
              
              <div class="footer">
                <div class="gst">GST: 33CMMPP7822B1Z2</div>
                <div class="tagline">Premium Cinema Experience</div>
                <div class="thank-you">Thank You!</div>
                <div class="tamil-text">மது அருந்தியவர்களுக்கு அனுமதி இல்லை. 3 வயது மற்றும் அதற்கு மேற்பட்டவர்களுக்கு டிக்கெட் கட்டாயம்.</div>
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
              onTimeSelect={(time, selectedShowTime) =>
                setCurrentShow((prev) => ({
                  ...prev,
                  time,
                  price: selectedShowTime?.price || null,
                  showTimePlannerId:
                    selectedShowTime && selectedShowTime.showTimePlannerId
                      ? selectedShowTime.showTimePlannerId
                      : null,
                }))
              }
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
              onTimeSelect={(time, selectedShowTime) =>
                setCurrentShow((prev) => ({
                  ...prev,
                  time,
                  price: selectedShowTime?.price || null,
                  showTimePlannerId:
                    selectedShowTime && selectedShowTime.showTimePlannerId
                      ? selectedShowTime.showTimePlannerId
                      : null,
                }))
              }
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
      <div className="hidden lg:flex gap-2 h-[calc(110vh-180px)]">
        {/* Left Side - Snacks Grid */}
        <div className="w-2/3 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-2">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-2">
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

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-lg w-full max-w-sm mx-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Select Payment Method</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${selectedPayment === 'cash' ? 'border-green-600' : 'border-gray-300'}`}>
                <span>Cash</span>
                <input type="radio" name="payment" value="cash" checked={selectedPayment === 'cash'} onChange={() => setSelectedPayment('cash')} />
              </label>
              <label className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${selectedPayment === 'gpay' ? 'border-green-600' : 'border-gray-300'}`}>
                <span>Gpay</span>
                <input type="radio" name="payment" value="gpay" checked={selectedPayment === 'gpay'} onChange={() => setSelectedPayment('gpay')} />
              </label>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-700">Cancel</button>
              <button onClick={() => selectedPayment ? proceedCheckoutWithPayment(selectedPayment) : notify.error('Please select a payment method')} className="px-4 py-2 rounded bg-green-600 text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showReceiptPreview && (
        <SnacksReceiptPreviewPopup
          cartItems={cart}
          currentShow={currentShow}
          orderId={lastOrderMeta.orderId}
          paymentMode={lastOrderMeta.paymentMode}
          onClose={() => {
            setShowReceiptPreview(false);
            setCart([]);
          }}
        />
      )}
    </div>
  );
}
