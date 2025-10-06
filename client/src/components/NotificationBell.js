import { useNotification } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const { hasNew } = useNotification(); // ✅ Clean and safe

  return (
    <Link to="/notifications" className="position-relative">
      <i className="bi bi-bell fs-4 text-white"></i>
      {hasNew && (
        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
      )}
    </Link>
  );
};

export default NotificationBell;
