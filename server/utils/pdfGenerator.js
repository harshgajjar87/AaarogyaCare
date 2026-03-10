const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePrescriptionPDF = (prescription, patient, doctor) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const fileName = `prescription_${prescription._id}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../uploads', fileName);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(24).fillColor('#14b8a6').text('AarogyaCare', { align: 'center' });
      doc.fontSize(10).fillColor('#666').text('Quality Healthcare Services', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(9).text('Ahmedabad, Gujarat | Phone: +91 999 888 7777', { align: 'center' });
      doc.fontSize(9).text('Email: aarogyacare55@gmail.com', { align: 'center' });
      doc.moveDown(1);
      doc.strokeColor('#14b8a6').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      // Title
      doc.fontSize(18).fillColor('#000').text('PRESCRIPTION', { align: 'center', underline: true });
      doc.moveDown(1.5);

      // Doctor Info
      doc.fontSize(12).fillColor('#14b8a6').text('Doctor Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#000');
      doc.text(`Name: Dr. ${doctor.name}`);
      doc.text(`Specialization: ${doctor.doctorDetails?.specialization || 'General Physician'}`);
      doc.text(`Qualification: ${doctor.doctorDetails?.qualifications?.join(', ') || 'MBBS'}`);
      doc.text(`Clinic: ${doctor.doctorDetails?.clinicName || 'AarogyaCare Clinic'}`);
      doc.moveDown(1);

      // Patient Info
      doc.fontSize(12).fillColor('#14b8a6').text('Patient Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#000');
      doc.text(`Name: ${patient.name}`);
      doc.text(`Age: ${patient.profile?.age || 'N/A'} | Gender: ${patient.profile?.gender || 'N/A'} | Blood Group: ${patient.profile?.bloodGroup || 'N/A'}`);
      doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString('en-IN')}`);
      doc.moveDown(1);

      // Diagnosis
      if (prescription.diagnosis) {
        doc.fontSize(12).fillColor('#14b8a6').text('Diagnosis', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#000').text(prescription.diagnosis);
        doc.moveDown(1);
      }

      // Medicines
      if (prescription.medicines?.length > 0) {
        doc.fontSize(12).fillColor('#14b8a6').text('Prescribed Medicines', { underline: true });
        doc.moveDown(0.5);

        const tableTop = doc.y;
        const col1 = 50, col2 = 200, col3 = 300, col4 = 400, col5 = 480;
        
        doc.fontSize(9).fillColor('#fff');
        doc.rect(col1, tableTop, 495, 20).fill('#14b8a6');
        doc.fillColor('#fff').text('Medicine', col1 + 5, tableTop + 5);
        doc.text('Dosage', col2 + 5, tableTop + 5);
        doc.text('Timing', col3 + 5, tableTop + 5);
        doc.text('Frequency', col4 + 5, tableTop + 5);
        doc.text('Days', col5 + 5, tableTop + 5);

        let currentY = tableTop + 25;
        doc.fillColor('#000');

        prescription.medicines.forEach((med, i) => {
          doc.rect(col1, currentY - 5, 495, 25).fill(i % 2 === 0 ? '#f9f9f9' : '#fff');
          doc.fillColor('#000').fontSize(9);
          doc.text(med.name, col1 + 5, currentY, { width: 140 });
          doc.text(med.dosage, col2 + 5, currentY, { width: 90 });
          doc.text(med.timing.replace('_', ' '), col3 + 5, currentY, { width: 90 });
          const freq = [];
          if (med.frequency.morning) freq.push('M');
          if (med.frequency.evening) freq.push('E');
          if (med.frequency.night) freq.push('N');
          doc.text(freq.join('-'), col4 + 5, currentY);
          doc.text(med.days.toString(), col5 + 5, currentY);
          currentY += 25;
        });
        doc.moveDown(2);
      }

      // Instructions & Notes
      if (prescription.instructions) {
        doc.fontSize(12).fillColor('#14b8a6').text('Instructions', { underline: true, align: 'left' });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#000').text(prescription.instructions, { align: 'left', width: 495 });
        doc.moveDown(1);
      }

      if (prescription.notes) {
        doc.fontSize(12).fillColor('#14b8a6').text('Notes', { underline: true, align: 'left' });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#000').text(prescription.notes, { align: 'left', width: 495 });
        doc.moveDown(1);
      }

      if (prescription.followUpDate) {
        doc.fontSize(11).fillColor('#14b8a6').text(`Follow-up: ${new Date(prescription.followUpDate).toLocaleDateString('en-IN')}`);
        doc.moveDown(1);
      }

      // Signature
      doc.moveDown(2);
      doc.fontSize(10).text('_______________________', 450);
      doc.fontSize(9).text(`Dr. ${doctor.name}`, 450);
      doc.fontSize(8).fillColor('#666').text(doctor.doctorDetails?.specialization || '', 450);

      doc.end();
      stream.on('finish', () => resolve(fileName));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

const generatePaymentReceiptPDF = (appointment, patient, doctor) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const fileName = `receipt_${appointment._id}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../uploads', fileName);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header with background
      doc.rect(0, 0, 595, 100).fill('#14b8a6');
      doc.fontSize(28).fillColor('#ffffff').text('PAYMENT RECEIPT', 50, 30, { align: 'center' });
      doc.fontSize(11).fillColor('#ffffff').text('AarogyaCare - Quality Healthcare Services', 50, 65, { align: 'center' });
      doc.fontSize(9).fillColor('#ffffff').text('Ahmedabad, Gujarat | Phone: +91 999 888 7777 | Email: aarogyacare55@gmail.com', 50, 82, { align: 'center' });
      
      doc.moveDown(3);
      
      // Receipt Info Box
      const boxTop = 120;
      doc.rect(50, boxTop, 495, 60).fillAndStroke('#f0fdfa', '#14b8a6');
      doc.fontSize(10).fillColor('#000000');
      doc.text('Receipt No: ' + appointment.paymentInfo.orderId, 60, boxTop + 10);
      doc.text('Payment ID: ' + appointment.paymentInfo.paymentId, 60, boxTop + 25);
      doc.text('Date: ' + new Date(appointment.createdAt).toLocaleDateString('en-IN', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      }), 60, boxTop + 40);
      doc.text('Time: ' + new Date(appointment.createdAt).toLocaleTimeString('en-IN'), 350, boxTop + 40);
      doc.text('Status: PAID', 350, boxTop + 10, { underline: true });
      
      doc.moveDown(5);

      // Patient Details
      doc.fontSize(14).fillColor('#14b8a6').text('Patient Details', 50, 200, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#000000');
      doc.text('Name: ' + patient.name, 50);
      doc.text('Email: ' + patient.email, 50);
      doc.text('Phone: ' + (patient.phone || 'N/A'), 50);
      doc.text('Age: ' + appointment.age + ' | Gender: ' + appointment.gender, 50);
      
      doc.moveDown(1.5);

      // Doctor Details
      doc.fontSize(14).fillColor('#14b8a6').text('Doctor Details', 50, doc.y, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#000000');
      doc.text('Name: Dr. ' + doctor.name, 50);
      doc.text('Specialization: ' + (doctor.doctorDetails?.specialization || 'General Physician'), 50);
      doc.text('Qualification: ' + (doctor.doctorDetails?.qualifications?.join(', ') || 'MBBS'), 50);
      doc.text('Clinic: ' + (doctor.doctorDetails?.clinicName || 'AarogyaCare Clinic'), 50);
      
      doc.moveDown(1.5);

      // Appointment Details
      doc.fontSize(14).fillColor('#14b8a6').text('Appointment Details', 50, doc.y, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#000000');
      doc.text('Date: ' + new Date(appointment.date).toLocaleDateString('en-IN', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      }), 50);
      doc.text('Time: ' + appointment.time, 50);
      doc.text('Reason: ' + appointment.reason, 50, doc.y, { width: 495 });
      
      doc.moveDown(2);

      // Payment Summary Table
      const tableTop = doc.y;
      doc.fontSize(14).fillColor('#14b8a6').text('Payment Summary', 50, tableTop, { underline: true });
      doc.moveDown(1);

      const summaryTop = doc.y;
      doc.rect(50, summaryTop, 495, 30).fillAndStroke('#f9fafb', '#e5e7eb');
      doc.fontSize(11).fillColor('#000000');
      doc.text('Consultation Fee', 60, summaryTop + 10);
      doc.text('Rs. ' + appointment.fees.toFixed(2), 450, summaryTop + 10, { width: 85, align: 'right' });

      doc.rect(50, summaryTop + 30, 495, 30).fill('#14b8a6');
      doc.fontSize(12).fillColor('#ffffff').font('Helvetica-Bold');
      doc.text('Total Amount Paid', 60, summaryTop + 40);
      doc.text('Rs. ' + appointment.fees.toFixed(2), 450, summaryTop + 40, { width: 85, align: 'right' });
      
      doc.font('Helvetica');
      doc.moveDown(3);

      // Payment Method
      doc.fontSize(10).fillColor('#666666');
      doc.text('Payment Method: Online Payment (Razorpay)', 50, doc.y);
      doc.text('Transaction Status: ' + appointment.paymentInfo.status.toUpperCase(), 50);
      
      doc.moveDown(2);

      // Footer Note
      const noteY = doc.y;
      doc.rect(50, noteY, 495, 70).fillAndStroke('#eff6ff', '#3b82f6');
      doc.fontSize(10).fillColor('#1e40af');
      doc.text('Important Notes:', 60, noteY + 10, { underline: true });
      doc.fontSize(9).fillColor('#1e3a8a');
      doc.text('- Please arrive 10 minutes before your scheduled appointment time.', 60, noteY + 25);
      doc.text('- Bring this receipt and a valid ID for verification.', 60, noteY + 38);
      doc.text('- For any queries, contact us at aarogyacare55@gmail.com', 60, noteY + 51);
      
      // Footer
      doc.fontSize(8).fillColor('#999999');
      doc.text('This is a computer-generated receipt and does not require a signature.', 50, 750, { align: 'center' });
      doc.text('Thank you for choosing AarogyaCare!', 50, 765, { align: 'center' });

      doc.end();
      stream.on('finish', () => resolve(fileName));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generatePrescriptionPDF, generatePaymentReceiptPDF };


// Generate Appointment Receipt PDF
const generateReceiptPDF = (appointment, patient, doctor) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const fileName = `receipt_${appointment._id}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../uploads', fileName);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header with Logo/Brand
      doc.fontSize(28).fillColor('#14b8a6').text('AarogyaCare', { align: 'center' });
      doc.fontSize(12).fillColor('#666').text('Quality Healthcare Services', { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(10).text('Ahmedabad, Gujarat | Phone: +91 999 888 7777', { align: 'center' });
      doc.fontSize(10).text('Email: aarogyacare55@gmail.com', { align: 'center' });
      doc.moveDown(1);
      doc.strokeColor('#14b8a6').lineWidth(3).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1.5);

      // Receipt Title
      doc.fontSize(22).fillColor('#000').text('APPOINTMENT RECEIPT', { align: 'center', underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#666').text(`Receipt No: ${appointment._id}`, { align: 'center' });
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, { align: 'center' });
      doc.moveDown(2);

      // Patient Information Box
      doc.rect(50, doc.y, 495, 100).fillAndStroke('#f0fdfa', '#14b8a6');
      const patientBoxY = doc.y + 10;
      doc.fontSize(14).fillColor('#14b8a6').text('Patient Information', 60, patientBoxY, { underline: true });
      doc.fontSize(11).fillColor('#000');
      doc.text(`Name: ${patient.name}`, 60, patientBoxY + 25);
      doc.text(`Email: ${patient.email}`, 60, patientBoxY + 42);
      doc.text(`Phone: ${patient.profile?.phone || 'N/A'}`, 60, patientBoxY + 59);
      doc.text(`Age: ${appointment.age} | Gender: ${appointment.gender}`, 60, patientBoxY + 76);
      doc.moveDown(7);

      // Doctor Information Box
      doc.rect(50, doc.y, 495, 100).fillAndStroke('#f0f9ff', '#0ea5e9');
      const doctorBoxY = doc.y + 10;
      doc.fontSize(14).fillColor('#0ea5e9').text('Doctor Information', 60, doctorBoxY, { underline: true });
      doc.fontSize(11).fillColor('#000');
      doc.text(`Name: Dr. ${doctor.name}`, 60, doctorBoxY + 25);
      doc.text(`Specialization: ${doctor.doctorDetails?.specialization || 'General Physician'}`, 60, doctorBoxY + 42);
      doc.text(`Qualification: ${doctor.doctorDetails?.qualifications?.join(', ') || 'MBBS'}`, 60, doctorBoxY + 59);
      doc.text(`Clinic: ${doctor.doctorDetails?.clinicName || 'AarogyaCare Clinic'}`, 60, doctorBoxY + 76);
      doc.moveDown(7);

      // Appointment Details Box
      doc.rect(50, doc.y, 495, 120).fillAndStroke('#fef3c7', '#f59e0b');
      const appointmentBoxY = doc.y + 10;
      doc.fontSize(14).fillColor('#f59e0b').text('Appointment Details', 60, appointmentBoxY, { underline: true });
      doc.fontSize(11).fillColor('#000');
      doc.text(`Appointment Date: ${new Date(appointment.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, 60, appointmentBoxY + 25);
      doc.text(`Appointment Time: ${appointment.time}`, 60, appointmentBoxY + 42);
      doc.text(`Status: ${appointment.status.toUpperCase()}`, 60, appointmentBoxY + 59);
      if (appointment.reason) {
        doc.text(`Reason: ${appointment.reason}`, 60, appointmentBoxY + 76, { width: 475 });
      }
      doc.moveDown(8);

      // Payment Details Box
      doc.rect(50, doc.y, 495, 80).fillAndStroke('#dcfce7', '#16a34a');
      const paymentBoxY = doc.y + 10;
      doc.fontSize(14).fillColor('#16a34a').text('Payment Details', 60, paymentBoxY, { underline: true });
      doc.fontSize(11).fillColor('#000');
      doc.text(`Consultation Fee: ₹${appointment.fees || 0}`, 60, paymentBoxY + 25);
      doc.text(`Payment Status: ${appointment.paymentStatus || 'Paid'}`, 60, paymentBoxY + 42);
      if (appointment.razorpayPaymentId) {
        doc.text(`Transaction ID: ${appointment.razorpayPaymentId}`, 60, paymentBoxY + 59);
      }
      doc.moveDown(6);

      // Total Amount (Highlighted)
      doc.rect(50, doc.y, 495, 40).fillAndStroke('#14b8a6', '#14b8a6');
      doc.fontSize(16).fillColor('#fff').text(`Total Amount Paid: ₹${appointment.fees || 0}`, 60, doc.y + 12, { align: 'center' });
      doc.moveDown(3);

      // Footer
      doc.moveDown(2);
      doc.strokeColor('#14b8a6').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(9).fillColor('#666').text('Thank you for choosing AarogyaCare!', { align: 'center' });
      doc.text('For any queries, please contact us at aarogyacare55@gmail.com', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(8).fillColor('#999').text('This is a computer-generated receipt and does not require a signature.', { align: 'center', italics: true });

      doc.end();

      stream.on('finish', () => {
        resolve(fileName);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generatePrescriptionPDF, generateReceiptPDF };
