import React, { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Trash2, Clock, ArrowLeft } from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const { notifications, markSeen, clearNotifications } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) {
      markSeen();
    }
  }, [user, markSeen]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(user?.role === 'doctor' ? '/doctor/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard')}
            className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold text-health-text-h flex items-center gap-2">
            <Bell size={28} />
            Your Notifications
          </h1>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={clearNotifications}
            className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all font-medium flex items-center gap-2 text-sm"
          >
            <Trash2 size={16} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100">
        {notifications.length === 0 ? (
          <div className="text-center p-16 text-health-text-p">
            <BellOff size={48} className="mx-auto text-slate-400 mb-4" />
            <h5 className="font-semibold text-lg">No Notifications</h5>
            <p>You're all caught up!</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((n, idx) => (
              <li key={idx} className={`p-4 hover:bg-slate-50 transition-colors ${!n.seen ? 'bg-teal-50' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${!n.seen ? 'bg-teal-500' : 'bg-slate-300'}`}></div>
                  <div className="flex-grow">
                    <p className="font-medium text-health-text-h">{n.message}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
