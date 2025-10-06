import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { getSpecializations } from '../api/doctorAPI';
import '../styles/components/DoctorSearchFilter.css';

const DoctorSearchFilter = ({ onFilterChange, loading }) => {
  const [specializations, setSpecializations] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    minRating: '',
    maxFee: '',
    location: ''
  });

  useEffect(() => {
    loadSpecializations();
  }, []);

  const loadSpecializations = async () => {
    try {
      const specs = await getSpecializations();
      setSpecializations(specs);
    } catch (error) {
      console.error('Failed to load specializations:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      specialization: '',
      minRating: '',
      maxFee: '',
      location: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className={`card mb-4 doctor-search-filter ${loading ? 'loading' : ''}`}>
      <div className="card-header">
        <h5 className="mb-0">
          <FaFilter className="me-2" />
          Search & Filter Doctors
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Search</label>
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                name="search"
                value={filters.search}
                onChange={handleInputChange}
                placeholder="Search by name, clinic, or specialization"
              />
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Specialization</label>
            <select
              className="form-select"
              name="specialization"
              value={filters.specialization}
              onChange={handleInputChange}
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Min Rating</label>
            <select
              className="form-select"
              name="minRating"
              value={filters.minRating}
              onChange={handleInputChange}
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">Max Fee (₹)</label>
            <input
              type="number"
              className="form-control"
              name="maxFee"
              value={filters.maxFee}
              onChange={handleInputChange}
              placeholder="Max fee"
              min="0"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-control"
              name="location"
              value={filters.location}
              onChange={handleInputChange}
              placeholder="Enter location"
            />
          </div>

          <div className="col-md-3 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
              disabled={loading}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSearchFilter;
