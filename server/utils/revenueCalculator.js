/**
 * Revenue Calculator Utility
 * Commission + Service Fee Hybrid Model:
 *   - Patient pays: doctorFees + platformServiceFee (flat)
 *   - Doctor receives: doctorFees - platformCommission (% deducted from doctor)
 *   - Platform earns: platformCommission + platformServiceFee - gatewayCharges
 */

const calculateRevenueBreakdown = (doctorFees, settings) => {
  const commissionRate = settings?.platformCommissionPercentage || 10;
  const platformServiceFee = settings?.platformServiceFee ?? 20;
  const gatewayPercentage = settings?.paymentGatewayPercentage || 2;
  const gatewayFixed = settings?.paymentGatewayFixedCharge || 0;

  // Patient pays doctor fee + flat service fee
  const totalAmount = doctorFees + platformServiceFee;

  // Commission is deducted from doctor payout
  const platformCommission = (doctorFees * commissionRate) / 100;
  const doctorPayout = doctorFees - platformCommission;

  // Gateway charges on total collected from patient
  const paymentGatewayCharges = (totalAmount * gatewayPercentage) / 100 + gatewayFixed;

  // Platform net = commission from doctor + service fee from patient - gateway charges
  const platformRevenue = platformCommission + platformServiceFee - paymentGatewayCharges;

  return {
    doctorFees: parseFloat(doctorFees.toFixed(2)),
    platformServiceFee: parseFloat(platformServiceFee.toFixed(2)),
    platformCommission: parseFloat(platformCommission.toFixed(2)),
    platformCommissionPercentage: commissionRate,
    doctorPayout: parseFloat(doctorPayout.toFixed(2)),
    paymentGatewayCharges: parseFloat(paymentGatewayCharges.toFixed(2)),
    platformRevenue: parseFloat(platformRevenue.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    // Keep for backward compat (old transactions may have these)
    gstAmount: 0,
    gstPercentage: 0
  };
};

const formatCurrency = (amount) => `₹${Number(amount).toFixed(2)}`;

const generateBreakdownText = (b) => `
Doctor Fee: ${formatCurrency(b.doctorFees)}
Platform Service Fee: ${formatCurrency(b.platformServiceFee)}
─────────────────────────────
Total Paid by Patient: ${formatCurrency(b.totalAmount)}

Commission Deducted from Doctor (${b.platformCommissionPercentage}%): ${formatCurrency(b.platformCommission)}
Doctor Payout: ${formatCurrency(b.doctorPayout)}
Gateway Charges: ${formatCurrency(b.paymentGatewayCharges)}
Platform Net Revenue: ${formatCurrency(b.platformRevenue)}
`.trim();

module.exports = { calculateRevenueBreakdown, formatCurrency, generateBreakdownText };
