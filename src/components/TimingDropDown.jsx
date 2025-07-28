import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const TimingDropdown = ({ currentShow, onTimeSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Sample show timings - replace with your actual data
    const availableTimings = [
        '10:00 AM',
        '1:30 PM',
        '4:00 PM',
        '6:30 PM',
        '9:00 PM'
    ];

    const handleTimeSelect = (time) => {
        onTimeSelect(time);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold">{currentShow.time || 'Select Time'}</p>
                </div>

                <ChevronDown className="text-orange-600" size={20} />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200"
                >
                    <div className="py-1">
                        {availableTimings.map((time) => (
                            <button
                                key={time}
                                onClick={() => handleTimeSelect(time)}
                                className={`block w-full text-left px-4 py-2 text-sm ${currentShow.time === time
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimingDropdown;