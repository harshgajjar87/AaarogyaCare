import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import { Eye, Mail, X, ArrowLeft, Send } from 'lucide-react';

const AdminQueries = () => {
  const navigate = useNavigate();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

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

  const handleReply = async (e) => {
    e.preventDefault();
    
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setSendingReply(true);
    try {
      const response = await axios.post(`/admin/queries/${selectedQuery._id}/reply`, {
        replyMessage: replyMessage.trim()
      });

      if (response.data.success) {
        toast.success('Reply sent successfully! Patient will be notified.');
        setReplyMessage('');
        setSelectedQuery(null);
        fetchQueries(); // Refresh the list
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(error.response?.data?.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
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
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
          >
            <ArrowLeft size={16} className="sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Contact Queries</h1>
        </div>
        <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-teal-100 text-teal-700 rounded-full">{queries.length} queries</span>
      </div>

      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100">
        <div className="overflow-x-auto">
          {queries.length > 0 ? (
            <table className="w-full text-[10px] sm:text-xs md:text-sm text-left text-health-text-p">
              <thead className="text-[9px] sm:text-xs text-health-text-p uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Name</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Email</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Subject</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Date</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Status</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queries.map((query) => (
                  <tr key={query._id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 font-medium text-health-text-h">{query.name}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">
                      <a href={`mailto:${query.email}`} className="text-health-primary hover:underline break-all">{query.email}</a>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">{query.subject}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">{formatDate(query.createdAt)}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4">
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 font-semibold leading-tight rounded-full text-[9px] sm:text-xs ${query.status === 'new' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {query.status}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-center">
                      <button onClick={() => setSelectedQuery(query)} className="p-1 sm:p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <Eye size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-8 sm:py-12 text-health-text-p text-xs sm:text-sm">No contact queries found.</p>
          )}
        </div>
      </div>

      {selectedQuery && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h5 className="text-lg sm:text-xl font-bold">Query Details</h5>
              <button onClick={() => { setSelectedQuery(null); setReplyMessage(''); }} className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100">
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 text-xs sm:text-sm">
              <div><strong>Name:</strong> {selectedQuery.name}</div>
              <div><strong>Email:</strong> <a href={`mailto:${selectedQuery.email}`} className="text-health-primary hover:underline break-all">{selectedQuery.email}</a></div>
              <div><strong>Subject:</strong> {selectedQuery.subject}</div>
              <div><strong>Date:</strong> {formatDate(selectedQuery.createdAt)}</div>
              <div><strong>Status:</strong> <span className={`px-2 py-1 font-semibold leading-tight rounded-full text-xs ${selectedQuery.status === 'new' ? 'bg-yellow-100 text-yellow-800' : selectedQuery.status === 'replied' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{selectedQuery.status}</span></div>
              <div>
                <strong>Message:</strong>
                <div className="border p-2 sm:p-3 mt-2 bg-slate-50 rounded-lg text-health-text-p">
                  {selectedQuery.message}
                </div>
              </div>
              
              {selectedQuery.adminReply && (
                <div>
                  <strong>Previous Reply:</strong>
                  <div className="border p-2 sm:p-3 mt-2 bg-green-50 rounded-lg text-health-text-p border-green-200">
                    {selectedQuery.adminReply}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Replied on: {formatDate(selectedQuery.repliedAt)}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <strong className="block mb-2">Send Reply:</strong>
                <form onSubmit={handleReply} className="space-y-3">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply here..."
                    rows="5"
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                    <button 
                      type="button"
                      onClick={() => { setSelectedQuery(null); setReplyMessage(''); }} 
                      className="bg-slate-100 text-slate-700 px-4 sm:px-6 py-2 rounded-full hover:bg-slate-200 transition-all font-medium text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={sendingReply || !replyMessage.trim()}
                      className="bg-teal-600 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-teal-700 transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingReply ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send size={14} className="sm:w-4 sm:h-4" />
                          <span>Send Reply & Notify</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQueries;
