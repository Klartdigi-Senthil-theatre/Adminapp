import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const CustomDropdown = ({ value, onChange, options, disabled = false, showDeselect = true, deselectLabel = "None" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-50">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        className={`w-full flex items-center justify-between border px-3 py-2 rounded-lg 
          text-sm md:text-base transition-all duration-200
          ${disabled 
            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed" 
            : isOpen
              ? "ring-1 ring-orange-500 border-orange-500"
              : "border-gray-300 hover:border-gray-400"
          }`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        <span className="truncate">
          {selectedOption?.title || "Select"}
        </span>
        <span className={`ml-2 transition-transform duration-200 ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {/* Dropdown Options */}
      {isOpen && !disabled && (
        <div
          className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg 
          max-h-60 overflow-y-auto"
        >
          {/* Deselect Option */}
          {showDeselect && (
            <div
              className={`px-3 py-2 cursor-pointer transition-colors duration-150 border-b border-gray-100
                ${
                  !value || value === ""
                    ? "bg-red-50 text-red-600"
                    : "hover:bg-red-50 hover:text-red-600"
                }
                text-sm md:text-base font-medium`}
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
            >
              {deselectLabel}
            </div>
          )}
          {/* Regular Options */}
          {options.map((option) => (
            <div
              key={option.id}
              className={`px-3 py-2 cursor-pointer transition-colors duration-150
                ${
                  option.id === value
                    ? "bg-orange-50 text-orange-600"
                    : "hover:bg-gray-50"
                }
                text-sm md:text-base`}
              onClick={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
            >
              {option.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
