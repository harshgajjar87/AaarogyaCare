import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../utils/axios';

const AdminQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const response = await axios.get('/admin/queries');
      setQueries(response.data);
    } catch (error) {
      console.error('Error fetching queries:', error);
      toast.error('Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleViewQuery = (query) => {
    setSelectedQuery(query);
  };

  const handleCloseModal = () => {
    setSelectedQuery(null);
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">Loading queries...</div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Contact Queries</h2>
        <span className="badge bg-primary">{queries.length} queries</span>
      </div>

      {queries.length === 0 ? (
        <div className="alert alert-info">
          No contact queries found.
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queries.map((query) => (
                    <tr key={query._id}>
                      <td>{query.name}</td>
                      <td>
                        <a href={`mailto:${query.email}`} className="text-decoration-none">
                          {query.email}
                        </a>
                      </td>
                      <td>{query.subject}</td>
                      <td>{formatDate(query.createdAt)}</td>
                      <td>
                        <span className={`badge ${query.status === 'new' ? 'bg-warning' : 'bg-success'}`}>
                          {query.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleViewQuery(query)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Query Detail Modal */}
      {selectedQuery && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Query Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Name:</strong> {selectedQuery.name}
                  </div>
                  <div className="col-md-6">
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${selectedQuery.email}`} className="text-decoration-none">
                      {selectedQuery.email}
                    </a>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <strong>Subject:</strong> {selectedQuery.subject}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <strong>Date:</strong> {formatDate(selectedQuery.createdAt)}
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <strong>Message:</strong>
                    <div className="border p-3 mt-2 bg-light rounded">
                      {selectedQuery.message}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedQuery.email}`}
                  className="btn btn-primary"
                >
                  Reply
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQueries;
