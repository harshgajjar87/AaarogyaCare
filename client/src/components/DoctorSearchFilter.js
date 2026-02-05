import React, { useState, useEffect } from 'react';
import { getSpecializations } from '../api/doctorAPI';
import { Search, RefreshCw } from 'lucide-react';

const DoctorSearchFilter = ({ onFilterChange, loading }) => {
  const [specializations, setSpecializations] = useState([]);
  const [filters, setFilters] = useState({
    search: '', specialization: '', minRating: '', maxFee: '', location: ''
  });

  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        const specs = await getSpecializations();
        setSpecializations(specs);
      } catch (error) {
        // console.error('Failed to load specializations:', error);
      }
    };
    loadSpecializations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { search: '', specialization: '', minRating: '', maxFee: '', location: '' };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const Input = ({ name, value, placeholder, ...props }) => (
    <input
      name={name}
      value={value}
      onChange={handleInputChange}
      placeholder={placeholder}
      className="w-full rounded-lg border-slate-300 py-2 px-4"
      {...props}
    />
  );
  
  const Select = ({ name, value, children, ...props }) => (
    <select
      name={name}
      value={value}
      onChange={handleInputChange}
      className="w-full rounded-lg border-slate-300 py-2 px-4"
      {...props}
    >
      {children}
    </select>
  );

  return (
    <div className={`p-4 rounded-xl border bg-slate-50/50 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="md:col-span-2 lg:col-span-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <Input name="search" value={filters.search} placeholder="Search by name, clinic..." className="pl-10"/>
            </div>
        </div>
        <Select name="specialization" value={filters.specialization}>
          <option value="">All Specializations</option>
          {specializations.map(spec => <option key={spec} value={spec}>{spec}</option>)}
        </Select>
        <Select name="minRating" value={filters.minRating}>
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
        </Select>
        <div className="flex gap-2">
            <Input name="maxFee" type="number" value={filters.maxFee} placeholder="Max Fee" min="0" />
            <button onClick={clearFilters} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-all font-medium flex items-center gap-2">
              <RefreshCw size={16} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorSearchFilter;
