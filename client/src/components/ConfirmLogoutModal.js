import React from 'react';
import '../styles/components/ConfirmLogoutModal.css';

const ConfirmLogoutModal = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop show"></div>

      {/* Modal */}
      <div className="modal show d-block">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content logout-alert-popup">
            <div className="modal-header">
              <h5 className="modal-title">Confirm Logout</h5>
              <button type="button" className="btn-close" onClick={onCancel}></button>
            </div>
            
            <div className="modal-body">
              <p>Are you sure you want to logout?</p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                No, Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={onConfirm}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmLogoutModal;
