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
    <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={() => navigate(user?.role === 'doctor' ? '/doctor/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/patient/dashboard')}
            className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h flex items-center gap-2">
            <Bell size={22} className="sm:w-7 sm:h-7" />
            Your Notifications
          </h1>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={clearNotifications}
            className="bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-red-600 transition-all font-medium flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto justify-center"
          >
            <Trash2 size={14} className="sm:w-4 sm:h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100">
        {notifications.length === 0 ? (
          <div className="text-center p-8 sm:p-12 md:p-16 text-health-text-p">
            <BellOff size={40} className="sm:w-12 sm:h-12 mx-auto text-slate-400 mb-3 sm:mb-4" />
            <h5 className="font-semibold text-base sm:text-lg">No Notifications</h5>
            <p className="text-xs sm:text-sm">You're all caught up!</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((n, idx) => (
              <li key={idx} className={`p-3 sm:p-4 hover:bg-slate-50 transition-colors ${!n.seen ? 'bg-teal-50' : ''}`}>
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                  <div className={`mt-1 flex-shrink-0 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${!n.seen ? 'bg-teal-500' : 'bg-slate-300'}`}></div>
                  <div className="flex-grow min-w-0">
                    <p className="font-medium text-health-text-h text-xs sm:text-sm break-words">{n.message}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock size={10} className="sm:w-3 sm:h-3" />
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
