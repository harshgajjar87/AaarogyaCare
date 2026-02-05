import React from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X } from 'lucide-react';

const ConfirmLogoutModal = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[100] animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-lg font-bold text-health-text-h flex items-center gap-2">
            <LogOut size={20} className="text-red-500" />
            Confirm Logout
          </h5>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-health-text-p">Are you sure you want to logout?</p>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            type="button" 
            className="bg-slate-200 text-slate-800 px-6 py-2 rounded-full hover:bg-slate-300 transition-all font-medium" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-all font-medium" 
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmLogoutModal;
