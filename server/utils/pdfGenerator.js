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
        doc.fontSize(12).fillColor('#14b8a6').text('Instructions', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#000').text(prescription.instructions);
        doc.moveDown(1);
      }

      if (prescription.notes) {
        doc.fontSize(12).fillColor('#14b8a6').text('Notes', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#000').text(prescription.notes);
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

module.exports = { generatePrescriptionPDF };
