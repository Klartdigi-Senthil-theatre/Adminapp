import React, { useState,useEffect } from "react";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import {notify} from "../components/Notification";

export default function SnacksPage() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const snacks = [
    {
      id: 1,
      name: "Popcorn Large",
      price: 299,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      stock: 50,
    },
    {
      id: 2,
      name: "Coca Cola",
      price: 149,
      image:
        "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop",
      stock: 100,
    },
    {
      id: 3,
      name: "Nachos",
      price: 199,
      image:
        "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&h=300&fit=crop",
      stock: 30,
    },
    {
      id: 4,
      name: "Ice Cream",
      price: 129,
      image:
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop",
      stock: 40,
    },
    {
      id: 5,
      name: "Hot Dog",
      price: 179,
      image:
        "https://images.unsplash.com/photo-1612392062798-2570bc02fdd3?w=400&h=300&fit=crop",
      stock: 25,
    },
    {
      id: 6,
      name: "Pizza Slice",
      price: 249,
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      stock: 20,
    },
  ];

  const handleSave =() => {
    notify.success("Checkout Successfully !...")
  }

  // Add to cart functionality with quantity handling
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

  // Remove from cart
  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
    notify.error("Removed Items..")
  };

  // Update quantity
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

  // Calculate total price
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Get total items count
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="p-4 lg:p-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl lg:text-2xl font-semibold">Snack Items</h1>

        {/* Cart Button - Desktop Only */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="hidden sm:flex bg-orange-600 text-white px-4 py-2 rounded-lg items-center space-x-2 hover:bg-orange-700 relative"
        >
          <ShoppingCart size={20} />
          <span>Cart</span>
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </button>
      </div>

      {/* Snacks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {snacks.map((snack) => (
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
                <span className="text-xl font-bold text-green-600">
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

      {/* Cart Sidebar/Modal */}
      {isCartOpen && (
        <>
          {/* Mobile Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Cart Panel */}
          <div
            className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-lg transform ${
              isCartOpen ? "translate-x-0" : "translate-x-full"
            } transition-transform duration-300 ease-in-out z-50 flex flex-col`}
          >
            {/* Cart Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart
                    size={48}
                    className="mx-auto text-gray-400 mb-4"
                  />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
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
                        <p className="text-sm font-medium text-green-600">
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
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t p-4 bg-gray-50">
                <div className="mb-4">
                  <div className="flex justify-between items-center text-md font-semibold">
                    <span>Total ({getTotalItems()} items):</span>
                    <span className="text-green-600">₹{getTotalPrice()}</span>
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
                    className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating Cart Button (Mobile only, when cart is closed) */}
      {!isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 lg:hidden bg-orange-600 text-white p-4 rounded-full shadow-lg hover:bg-orange-700 z-30"
        >
          <ShoppingCart size={24} />
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
