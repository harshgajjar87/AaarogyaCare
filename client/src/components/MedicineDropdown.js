import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { getAllMedicines } from '../data/medicineDatabase';

const MedicineDropdown = ({ value, onChange, placeholder = "Select medicine..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const allMedicines = getAllMedicines();

  useEffect(() => {
    if (value) {
      const filtered = allMedicines.filter(medicine => 
        medicine.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMedicines(filtered.slice(0, 20));
    } else {
      setFilteredMedicines(allMedicines.slice(0, 20));
    }
  }, [value, allMedicines]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const handleSelectMedicine = (medicine) => {
    onChange(medicine);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (!value) {
      setFilteredMedicines(allMedicines.slice(0, 20));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full rounded-lg border-slate-300 pr-10"
          autoComplete="off"
        />
        <div 
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredMedicines.length > 0 ? (
            filteredMedicines.map((medicine, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectMedicine(medicine)}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none border-b border-slate-100 last:border-b-0"
              >
                <span className="text-sm font-medium text-slate-900">{medicine}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-slate-500 text-center">
              No medicines found. Continue typing to add manually.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicineDropdown;