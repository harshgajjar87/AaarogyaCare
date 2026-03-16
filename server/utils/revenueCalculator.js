/**
 * Revenue Calculator Utility
 * Calculates platform commission, GST, payment gateway charges, and doctor payout
 */

/**
 * Calculate revenue breakdown for an appointment
 * @param {Number} doctorFees - Original doctor consultation fees
 * @param {Object} settings - Revenue settings object
 * @returns {Object} Revenue breakdown
 */
const calculateRevenueBreakdown = (doctorFees, settings) => {
  // Default settings if not provided
  const platformCommissionPercentage = settings?.platformCommissionPercentage || 10;
  const gstPercentage = settings?.gstPercentage || 18;
  const gstAppliedOn = settings?.gstAppliedOn || 'commission';
  const paymentGatewayPercentage = settings?.paymentGatewayPercentage || 2;
  const paymentGatewayFixedCharge = settings?.paymentGatewayFixedCharge || 0;

  // Step 1: Calculate platform commission
  const platformCommission = (doctorFees * platformCommissionPercentage) / 100;

  // Step 2: Calculate GST
  let gstAmount = 0;
  if (gstAppliedOn === 'commission') {
    // GST on platform commission only
    gstAmount = (platformCommission * gstPercentage) / 100;
  } else if (gstAppliedOn === 'total') {
    // GST on total amount (doctor fees + commission)
    gstAmount = ((doctorFees + platformCommission) * gstPercentage) / 100;
  }
  // If gstAppliedOn === 'none', gstAmount remains 0

  // Step 3: Total amount patient pays = doctor fees + platform commission + GST
  // Patient pays everything: doctor fee + platform fee + GST on platform fee
  const totalAmount = doctorFees + platformCommission + gstAmount;

  // Step 4: Calculate payment gateway charges (on total amount)
  const paymentGatewayCharges = 
    (totalAmount * paymentGatewayPercentage) / 100 + paymentGatewayFixedCharge;

  // Step 5: Doctor payout = doctor fees - payment gateway charges proportional share
  // Doctor gets their full fee; platform keeps commission + GST - gateway charges
  const doctorPayout = doctorFees;

  // Step 6: Net platform revenue = commission + GST - gateway charges
  const platformRevenue = platformCommission + gstAmount - paymentGatewayCharges;

  return {
    doctorFees: parseFloat(doctorFees.toFixed(2)),
    platformCommission: parseFloat(platformCommission.toFixed(2)),
    platformCommissionPercentage,
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    gstPercentage,
    paymentGatewayCharges: parseFloat(paymentGatewayCharges.toFixed(2)),
    doctorPayout: parseFloat(doctorPayout.toFixed(2)),
    platformRevenue: parseFloat(platformRevenue.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2))
  };
};

/**
 * Format currency for display
 * @param {Number} amount - Amount to format
 * @returns {String} Formatted currency string
 */
const formatCurrency = (amount) => {
  return `₹${amount.toFixed(2)}`;
};

/**
 * Generate revenue breakdown text for display
 * @param {Object} breakdown - Revenue breakdown object
 * @returns {String} Formatted breakdown text
 */
const generateBreakdownText = (breakdown) => {
  return `
Doctor Consultation Fees: ${formatCurrency(breakdown.doctorFees)}
Platform Commission (${breakdown.platformCommissionPercentage}%): ${formatCurrency(breakdown.platformCommission)}
GST (${breakdown.gstPercentage}%): ${formatCurrency(breakdown.gstAmount)}
─────────────────────────────────
Total Amount: ${formatCurrency(breakdown.totalAmount)}

Payment Gateway Charges: ${formatCurrency(breakdown.paymentGatewayCharges)}
Doctor Payout: ${formatCurrency(breakdown.doctorPayout)}
Platform Revenue: ${formatCurrency(breakdown.platformRevenue)}
  `.trim();
};

module.exports = {
  calculateRevenueBreakdown,
  formatCurrency,
  generateBreakdownText
};
