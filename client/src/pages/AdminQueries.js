import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import { Eye, Mail, X } from 'lucide-react';

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
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-health-text-h">Contact Queries</h1>
        <span className="px-3 py-1 text-sm font-medium bg-teal-100 text-teal-700 rounded-full">{queries.length} queries</span>
      </div>

      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          {queries.length > 0 ? (
            <table className="w-full text-sm text-left text-health-text-p">
              <thead className="text-xs text-health-text-p uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">Subject</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((query) => (
                  <tr key={query._id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-health-text-h">{query.name}</td>
                    <td className="px-6 py-4">
                      <a href={`mailto:${query.email}`} className="text-health-primary hover:underline">{query.email}</a>
                    </td>
                    <td className="px-6 py-4">{query.subject}</td>
                    <td className="px-6 py-4">{formatDate(query.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${query.status === 'new' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {query.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => setSelectedQuery(query)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-12 text-health-text-p">No contact queries found.</p>
          )}
        </div>
      </div>

      {selectedQuery && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
            <div className="p-6 border-b flex justify-between items-center">
              <h5 className="text-xl font-bold">Query Details</h5>
              <button onClick={() => setSelectedQuery(null)} className="p-2 rounded-full hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div><strong>Name:</strong> {selectedQuery.name}</div>
              <div><strong>Email:</strong> <a href={`mailto:${selectedQuery.email}`} className="text-health-primary hover:underline">{selectedQuery.email}</a></div>
              <div><strong>Subject:</strong> {selectedQuery.subject}</div>
              <div><strong>Date:</strong> {formatDate(selectedQuery.createdAt)}</div>
              <div>
                <strong>Message:</strong>
                <div className="border p-3 mt-2 bg-slate-50 rounded-lg text-health-text-p">
                  {selectedQuery.message}
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-4">
              <button onClick={() => setSelectedQuery(null)} className="bg-slate-100 text-slate-700 px-6 py-2 rounded-full hover:bg-slate-200 transition-all font-medium">Close</button>
              <a href={`mailto:${selectedQuery.email}`} className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center gap-2">
                <Mail size={16} />
                <span>Reply</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQueries;
