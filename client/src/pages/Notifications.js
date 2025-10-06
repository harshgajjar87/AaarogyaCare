import React, { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PatientNavbar from '../components/PaitentNavbar';
import AdminNavbar from '../components/AdminNavbar';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const { notifications, markSeen, clearNotifications } = useNotification();

  useEffect(() => {
    if (!user || !user._id) return; // ✅ Guard clause
    markSeen();
  }, [user]);

  return (
    <>
    <div className="container mt-4">
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h4 className='welcome-title'>Your Notifications</h4>
        {notifications.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={clearNotifications}>
            Clear All
          </button>
        )}
      </div>

      <div className='card shadow-sm enhanced-card'>
        <div className='card-header enhanced-header'>
          <h5 className='mb-0'>
            <i className="fas fa-bell me-2"></i>
            Recent Notifications
          </h5>
        </div>
        <div className='card-body'>
          {notifications.length === 0 ? (
            <div className='text-center py-5'>
              <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
              <h5 className='text-muted'>No Notifications</h5>
              <p className='text-muted'>You don't have any notifications at the moment.</p>
            </div>
          ) : (
            <div className='notification-list'>
              {notifications.map((n, idx) => (
                <div key={idx} className={`notification-item ${n.seen ? 'seen' : 'unseen'} p-3 mb-3 rounded enhanced-notification`}>
                  <div className='d-flex justify-content-between align-items-start'>
                    <div className='flex-grow-1'>
                      <p className='mb-1 fw-medium'>{n.message}</p>
                      <small className='text-muted'>
                        <i className="fas fa-clock me-1"></i>
                        {new Date(n.createdAt).toLocaleString()}
                      </small>
                    </div>
                    {!n.seen && (
                      <span className='badge bg-primary ms-2'>
                        <i className="fas fa-circle"></i>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Notifications;
