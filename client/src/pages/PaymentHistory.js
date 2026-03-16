import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { getAppointmentsByPatientId, getDoctorAppointments } from '../api/appointmentAPI';
import { Download, CreditCard, Calendar, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

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
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header with brand color
    doc.setFillColor(20, 184, 166); // Teal color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Logo/Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('🩺 AarogyaCare', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('Payment Receipt', pageWidth / 2, 32, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Receipt details box
    let yPos = 55;
    doc.setFillColor(240, 253, 250);
    doc.roundedRect(15, yPos, pageWidth - 30, 35, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Receipt Number:', 20, yPos + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.paymentInfo.paymentId, 70, yPos + 10);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Order ID:', 20, yPos + 20);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.paymentInfo.orderId, 70, yPos + 20);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 20, yPos + 30);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(payment.createdAt).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }), 70, yPos + 30);
    
    // Amount section
    yPos += 50;
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount Paid:', 20, yPos + 12);
    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74); // Green color
    doc.text(`₹${payment.paymentInfo.amount}`, 70, yPos + 12);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('(Consultation Fee)', 70, yPos + 20);
    
    // Appointment Details
    yPos += 40;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 184, 166);
    doc.text('Appointment Details', 20, yPos);
    
    // Draw line
    doc.setDrawColor(203, 213, 225);
    doc.line(20, yPos + 3, pageWidth - 20, yPos + 3);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Patient info
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Name:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.name, 70, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Age:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.age?.toString() || 'N/A', 70, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Gender:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.gender || 'N/A', 70, yPos);
    
    // Doctor info
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Doctor Name:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.doctorId?.name || 'N/A', 70, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Specialization:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.doctorId?.doctorDetails?.specialization || 'N/A', 70, yPos);
    
    // Appointment date/time
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Appointment Date:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(payment.date).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), 70, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Appointment Time:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(payment.time, 70, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Status:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(22, 163, 74);
    doc.text(payment.status.toUpperCase(), 70, yPos);
    doc.setTextColor(0, 0, 0);
    
    // Payment method
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Method:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text('Razorpay (Online)', 70, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Status:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(22, 163, 74);
    doc.text(payment.paymentInfo.status.toUpperCase(), 70, yPos);
    doc.setTextColor(0, 0, 0);
    
    // Footer note
    yPos = pageHeight - 40;
    doc.setFillColor(249, 250, 251);
    doc.rect(0, yPos, pageWidth, 40, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('This is a computer-generated receipt and does not require a signature.', pageWidth / 2, yPos + 10, { align: 'center' });
    doc.text('For any queries, please contact support@aarogyacare.com', pageWidth / 2, yPos + 18, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 184, 166);
    doc.text('Thank you for choosing AarogyaCare!', pageWidth / 2, yPos + 28, { align: 'center' });
    
    // Save PDF
    const fileName = `AarogyaCare_Receipt_${payment.paymentInfo.paymentId.slice(-8)}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    toast.success('Receipt downloaded successfully!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <button
          onClick={() => navigate(user.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard')}
          className="p-1.5 sm:p-2 rounded-full bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-health-text-h">Payment History</h1>
      </div>

      <div className="bg-health-surface rounded-lg sm:rounded-xl shadow-sm border border-slate-100">
        <div className="p-3 sm:p-4 md:p-6 border-b">
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-health-text-h">
            {user.role === 'patient' ? 'Your Payments' : 'Received Payments'}
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          {payments.length > 0 ? (
            <table className="w-full text-xs sm:text-sm text-left text-health-text-p">
              <thead className="text-[10px] sm:text-xs text-health-text-p uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Payment ID</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">
                    {user.role === 'patient' ? 'Doctor' : 'Patient'}
                  </th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Amount</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Date</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3">Status</th>
                  <th scope="col" className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment._id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-medium text-health-text-h">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <CreditCard size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="font-mono text-[10px] sm:text-xs">
                          {payment.paymentInfo.paymentId.slice(-10)}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <User size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs md:text-sm">
                          {user.role === 'patient' 
                            ? payment.doctorId?.name || 'N/A'
                            : payment.name
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 font-semibold text-green-600 text-xs sm:text-sm">
                      ₹{user.role === 'doctor'
                        ? (payment.revenueBreakdown?.doctorPayout ?? payment.fees)
                        : payment.paymentInfo.amount}
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Calendar size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs md:text-sm">{new Date(payment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                      <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 font-semibold leading-tight rounded-full text-[10px] sm:text-xs bg-green-100 text-green-800">
                        {payment.paymentInfo.status}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-center">
                      <button
                        onClick={() => downloadReceipt(payment)}
                        className="bg-blue-600 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full hover:bg-blue-700 transition-all font-medium flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs mx-auto"
                      >
                        <Download size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 sm:py-12 md:py-16 text-health-text-p px-3">
              <CreditCard size={32} className="sm:w-10 sm:h-10 mx-auto mb-3 sm:mb-4 text-slate-400" />
              <h5 className="font-semibold text-sm sm:text-base">No Payment History</h5>
              <p className="text-xs sm:text-sm">No payments found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;