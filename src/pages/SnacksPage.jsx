import React, { useEffect, useState } from "react";
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
import api from "../config/api";
import { useAuth } from "../context/AuthContext";

export default function SnacksPage() {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All");
  const [currentShow, setCurrentShow] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "",
  });
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [snacks, setSnacks] = useState([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState("Cash");

  const paymentOptions = [
    { id: "Cash", title: "Cash" },
    { id: "Gpay", title: "Gpay" },
  ];

  useEffect(() => {
    const fetchSnacks = async () => {
      try {
        setLoading(true);
        const data = await api.get('/inventory');
        const mapped = (Array.isArray(data) ? data : [])
          .filter(item => (item?.visibility ?? true) && (item?.active ?? true))
          .map(item => ({
            id: item.id,
            name: item.itemName || 'N/A',
            price: Number(item.unitPrice) || 0,
            image: item.image || '',
            stock: Number(item.quantity) || 0,
            category: item.category || 'Others',
            minimumStockLevel: Number(item.minimumStockLevel) || 0,
          }));
        setSnacks(mapped);
      } catch (err) {
        console.error('Failed to load snacks', err);
        notify.error(err?.message || 'Failed to load snacks');
        setSnacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSnacks();
  }, []);

  const categoryOptions = React.useMemo(() => {
    const unique = Array.from(
      new Set(snacks.map(s => s.category).filter(Boolean))
    ).sort();
    return [{ id: 'All', title: 'All Categories' }, ...unique.map(c => ({ id: c, title: c }))];
  }, [snacks]);

  const generateThermalPDFReceipt = () => {
    // Group items by category
    const categorizedItems = cart.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    // Generate receipt number
    const receiptNumber = `REC-${new Date().getTime().toString().slice(-6)}`;

    // Create thermal printer optimized HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          /* 3-inch thermal paper optimized styles */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Courier New', monospace;
            background: white;
            margin: 0;
            padding: 0;
          }
          
          .thermal-receipt {
            width: 100%;
            max-width: 100vw;
            margin: 0 2mm 2mm 0;
            padding: 2mm;
            background: white;
            border: 1px dashed #ccc;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .thermal-receipt:last-child {
            margin-bottom: 0;
          }
          
          .receipt-header {
            background: #000 !important;
            color: white !important;
            padding: 1mm;
            text-align: center;
            margin-bottom: 1mm;
          }
          
          .cinema-name {
            font-size: 1.25rem;
            font-weight: bold;
            line-height: calc(2/1.25);
            margin-bottom: 0.5mm;
          }
          
          .receipt-title {
            font-size: 1.5rem;
            font-weight: bold;
            line-height: calc(2/1.5);
            margin-bottom: 0.5mm;
            word-wrap: break-word;
          }
          
          .receipt-body {
            padding: 2mm;
            font-size: 1.3rem;
            font-weight: bold;
            line-height: calc(2/1.5);
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
            font-size: 1rem;
            font-weight: bold;
            line-height: calc(1.75/0.875);
          }
          
          .label {
            font-weight: bold;
          }
          
          .value {
            text-align: right;
            max-width: 35mm;
            word-wrap: break-word;
          }
          
          .divider {
            border-top: 1px dashed #000;
            margin: 1.5mm 0;
          }
          
          .center {
            text-align: center;
          }
          
          .category-header {
            font-size: 1.5rem;
            font-weight: bold;
            text-align: center;
            margin: 2mm 0;
            color: #000;
            border-bottom: 2px solid #000;
            padding-bottom: 1mm;
          }
          
          .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
            font-size: 1rem;
            font-weight: bold;
          }
          
          .item-name {
            flex: 1;
            margin-right: 2mm;
          }
          
          .item-details {
            text-align: right;
            min-width: 20mm;
          }
          
          .summary-section {
            margin-top: 3mm;
            padding-top: 2mm;
            border-top: 2px solid #000;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 1mm;
          }
          
          .grand-total {
            font-size: 1.5rem;
            font-weight: bold;
            color: #000;
          }
          
          @media print {
            body {
              margin: 2mm !important;
              padding: 0 !important;
              orphans: 3;
              widows: 3;
            }
            
            @page {
              size: 80mm auto;
              margin: 0;
            }
            
            .thermal-receipt {
              margin: 0 2mm 2mm 0 !important;
              border: 1px dashed #999 !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-before: auto;
              orphans: 1;
              widows: 1;
            }
            
            .thermal-receipt:last-child {
              margin-bottom: 0 !important;
            }
            
            .receipt-header, .receipt-body {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        </style>
      </head>
      <body>
        ${Object.entries(categorizedItems).map(([category, items]) => {
      const categoryTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const categoryItems = items.reduce((sum, item) => sum + item.quantity, 0);

      return `
            <div class="thermal-receipt">
              <div class="receipt-header">
                <div class="cinema-name">SENTHIL CINEMAS A/C</div>
                <div class="receipt-title">SNACKS ORDER</div>
              </div>
              
              <div class="receipt-body">
                <div class="info-row">
                  <span class="label">Receipt No:</span>
                  <span class="value">${receiptNumber}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Date:</span>
                  <span class="value">${getCurrentDate()}</span>
                </div>
                
                <div class="info-row">
                  <span class="label">Time:</span>
                  <span class="value">${new Date().toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' })}</span>
                </div>
                
                ${currentShow.time ? `
                  <div class="info-row">
                    <span class="label">Show Time:</span>
                    <span class="value">${currentShow.time}</span>
                  </div>
                ` : ''}
                
                <div class="divider"></div>
                
                <div class="category-header">${category.toUpperCase()}</div>
                
                ${items.map(item => `
                  <div class="item-row">
                    <div class="item-name">${item.name}</div>
                    <div class="item-details">
                      <div>Qty: ${item.quantity}</div>
                      <div>₹${item.price} × ${item.quantity}</div>
                      <div style="color: #000; font-weight: bold;">₹${(item.price * item.quantity).toFixed(0)}</div>
                    </div>
                  </div>
                `).join('')}
                
                <div class="summary-section">
                  <div class="total-row">
                    <span>Total:</span>
                    <span>₹${categoryTotal.toFixed(0)}</span>
                  </div>
                  <div class="total-row">
                    <span>Items:</span>
                    <span>${categoryItems}</span>
                  </div>
                </div>
                
                <div class="divider"></div>
                
                <div class="center" style="font-size: 0.875rem; margin-top: 1.5mm;">
                  <div>GST: 33CMMPP7822B1Z2</div>
                  <div style="margin-top: 0.5mm;">Premium Cinema Experience</div>
                  <div style="margin-top: 1mm;">Thank You!</div>
                  <div style="margin-top: 0.5mm; font-size: 0.75rem;">மது அருந்தியவர்களுக்கு அனுமதி இல்லை. 3 வயது மற்றும் அதற்கு மேற்பட்டவர்களுக்கு டிக்கெட் கட்டாயம்.</div>
                </div>
              </div>
            </div>
          `;
    }).join('')}
        
        <!-- Overall Summary Receipt -->
        <div class="thermal-receipt">
          <div class="receipt-header">
            <div class="cinema-name">SENTHIL CINEMAS A/C</div>
            <div class="receipt-title">ORDER SUMMARY</div>
          </div>
          
          <div class="receipt-body">
            <div class="info-row">
              <span class="label">Receipt No:</span>
              <span class="value">${receiptNumber}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${getCurrentDate()}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Time:</span>
              <span class="value">${new Date().toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' })}</span>
            </div>
            
            ${currentShow.time ? `
              <div class="info-row">
                <span class="label">Show Time:</span>
                <span class="value">${currentShow.time}</span>
              </div>
            ` : ''}
            
            <div class="divider"></div>
            
            <div class="category-header">ORDER BREAKDOWN</div>
            
            ${Object.entries(categorizedItems).map(([category, items]) => {
      const categoryTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const categoryItems = items.reduce((sum, item) => sum + item.quantity, 0);

      return `
                <div class="item-row">
                  <div class="item-name">${category}</div>
                  <div class="item-details">
                    <div>${categoryItems} items</div>
                    <div style="color: #000; font-weight: bold;">₹${categoryTotal.toFixed(0)}</div>
                  </div>
                </div>
              `;
    }).join('')}
            
            <div class="summary-section">
              <div class="total-row">
                <span>Total Items:</span>
                <span>${getTotalItems()}</span>
              </div>
              <div class="total-row grand-total">
                <span>GRAND TOTAL:</span>
                <span>₹${getTotalPrice().toFixed(0)}</span>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="center" style="font-size: 0.875rem; margin-top: 1.5mm;">
              <div>GST: 33CMMPP7822B1Z2</div>
              <div style="margin-top: 0.5mm;">Premium Cinema Experience</div>
              <div style="margin-top: 1mm;">Thank You!</div>
              <div style="margin-top: 0.5mm; font-size: 0.75rem;">மது அருந்தியவர்களுக்கு அனுமதி இல்லை. 3 வயது மற்றும் அதற்கு மேற்பட்டவர்களுக்கு டிக்கெட் கட்டாயம்.</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    document.write(printContent);
    document.close();

    // Wait for content to load before printing
    setTimeout(() => {
      window.print();
      window.location.reload(); // go back to your app
    }, 500);

  };

  const openPaymentModal = () => {
    if (!currentShow.time) {
      notify.error("Please select a show time before printing.");
      return;
    }
    if (cart.length === 0) {
      notify.error("Your cart is empty.");
      return;
    }
    setShowPaymentModal(true);
  };

  const confirmCheckout = async () => {
    const createdBy = user?.username || "System";
    const amount = Number(getTotalPrice());

    try {
      setCheckingOut(true);

      const orderPayload = {
        paymentMode: paymentMode || "Cash",
        amount,
        createdBy,
      };
      const createdOrder = await api.post('/inventory-orders', orderPayload);
      const orderId = createdOrder?.id ?? createdOrder?.orderId;
      if (!orderId) {
        throw new Error('Failed to create order: missing order id');
      }

      // Send all order details in a single request as an array
      const orderDetailsPayload = cart.map((item) => ({
        orderId,
        inventoryId: item.id,
        quantity: item.quantity,
      }));
      await api.post('/inventory-order-details', orderDetailsPayload);

      setShowPaymentModal(false);
      notify.success("Checkout Successfully !...");
      generateThermalPDFReceipt();
    } catch (err) {
      console.error('Checkout failed', err);
      const backendMessage = err?.response?.data?.error || err?.response?.data?.message;
      notify.error(backendMessage || err?.message || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
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
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileCartOpen(true);
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
              onTimeSelect={(time) => setCurrentShow({ ...currentShow, time })
              }
              context="snacks"
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
              context="snacks"
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
          <div className="grid grid-cols-1 grid-rows-2 sm:grid-cols-3 lg:grid-rows-1 gap-4 lg:gap-2">
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
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg mb-2"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded object-cover flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-3">
                          <h4 className="font-medium text-sm leading-snug break-words">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">₹{item.price} each</p>
                          <p className="text-sm font-semibold text-orange-600">₹{(item.price * item.quantity).toFixed(0)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-4 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
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
                      onClick={openPaymentModal}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                      disabled={checkingOut}
                    >
                      {checkingOut ? 'Processing...' : 'Proceed to Checkout'}
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
        <div className="grid grid-cols-1 grid-rows-2 sm:grid-cols-2 lg:grid-rows-1 gap-4 lg:gap-2">
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
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded object-cover flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-3">
                          <h4 className="font-medium text-sm leading-snug break-words">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <p className="text-xs text-gray-500">₹{item.price} each</p>
                          <p className="text-sm font-semibold text-orange-600 min-w-[56px] text-right">₹{(item.price * item.quantity).toFixed(0)}</p>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
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
                      onClick={openPaymentModal}
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm mx-auto my-8">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Complete Payment</h3>
              <button
                onClick={() => !checkingOut && setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={checkingOut}
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <CustomDropdown
                  value={paymentMode}
                  onChange={setPaymentMode}
                  options={paymentOptions}
                  disabled={checkingOut}
                  showDeselect={false}
                />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total Amount</span>
                <span className="text-base font-semibold text-orange-600">₹{getTotalPrice()}</span>
              </div>
            </div>

            <div className="p-5 pt-0 flex gap-3">
              <button
                onClick={() => !checkingOut && setShowPaymentModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                disabled={checkingOut}
              >
                Cancel
              </button>
              <button
                onClick={confirmCheckout}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={checkingOut}
              >
                {checkingOut ? 'Processing...' : 'Confirm & Print'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
