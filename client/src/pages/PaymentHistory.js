import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getAppointmentsByPatientId, getDoctorAppointments } from '../api/appointmentAPI';
import { Download, CreditCard, Calendar, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentHistory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let appointments = [];
      
      if (user.role === 'patient') {
        appointments = await getAppointmentsByPatientId(user._id);
      } else if (user.role === 'doctor') {
        appointments = await getDoctorAppointments();
      }
      
      // Filter appointments with payment info
      const paidAppointments = appointments.filter(app => 
        app.paymentInfo && app.paymentInfo.status === 'completed'
      );
      
      setPayments(paidAppointments);
    } catch (err) {
      toast.error('Error fetching payment history');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = (payment) => {
    const receiptData = {
      paymentId: payment.paymentInfo.paymentId,
      orderId: payment.paymentInfo.orderId,
      amount: payment.paymentInfo.amount,
      date: new Date(payment.createdAt).toLocaleDateString(),
      patientName: payment.name,
      doctorName: payment.doctorId?.name || 'N/A',
      appointmentDate: new Date(payment.date).toLocaleDateString(),
      appointmentTime: payment.time
    };

    const receiptContent = `
AAROGYACARE PAYMENT RECEIPT
============================

Payment ID: ${receiptData.paymentId}
Order ID: ${receiptData.orderId}
Amount: ₹${receiptData.amount}
Payment Date: ${receiptData.date}

APPOINTMENT DETAILS
==================
Patient: ${receiptData.patientName}
Doctor: ${receiptData.doctorName}
Date: ${receiptData.appointmentDate}
Time: ${receiptData.appointmentTime}

Thank you for choosing AarogyaCare!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${receiptData.paymentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(user.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard')}
          className="p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-health-text-h">Payment History</h1>
      </div>

      <div className="bg-health-surface rounded-xl shadow-sm border border-slate-100">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-health-text-h">
            {user.role === 'patient' ? 'Your Payments' : 'Received Payments'}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          {payments.length > 0 ? (
            <table className="w-full text-sm text-left text-health-text-p">
              <thead className="text-xs text-health-text-p uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Payment ID</th>
                  <th scope="col" className="px-6 py-3">
                    {user.role === 'patient' ? 'Doctor' : 'Patient'}
                  </th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment._id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-health-text-h flex items-center gap-2">
                      <CreditCard size={16} />
                      <span className="font-mono text-xs">
                        {payment.paymentInfo.paymentId.slice(-10)}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <User size={16} />
                      <span>
                        {user.role === 'patient' 
                          ? payment.doctorId?.name || 'N/A'
                          : payment.name
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      ₹{payment.paymentInfo.amount}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 font-semibold leading-tight rounded-full text-xs bg-green-100 text-green-800">
                        {payment.paymentInfo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => downloadReceipt(payment)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all font-medium flex items-center gap-2 text-xs mx-auto"
                      >
                        <Download size={14} />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 text-health-text-p">
              <CreditCard size={40} className="mx-auto mb-4 text-slate-400" />
              <h5 className="font-semibold">No Payment History</h5>
              <p>No payments found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;