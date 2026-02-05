import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
  const { hasNew } = useNotification();

  return (
    <Link to="/notifications" className="relative text-slate-600 hover:text-health-primary">
      <Bell size={24} />
      {hasNew && (
        <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
