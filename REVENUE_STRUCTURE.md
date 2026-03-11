# Revenue Structure Documentation

## Overview
AarogyaCare implements a comprehensive revenue management system with platform commission, GST compliance, and automated financial tracking.

## Revenue Flow

### 1. Payment Breakdown

When a patient books an appointment:

```
Doctor Consultation Fees: ₹500
Platform Commission (10%): ₹50
GST on Commission (18%): ₹9
─────────────────────────────────
Total Amount Paid by Patient: ₹559

Payment Gateway Charges (2%): ₹11.18
Doctor Payout: ₹500
Platform Net Revenue: ₹47.82
```

### 2. Calculation Formula

```javascript
// Step 1: Platform Commission
platformCommission = doctorFees × (platformCommissionPercentage / 100)

// Step 2: GST Calculation
if (gstAppliedOn === 'commission') {
  gstAmount = platformCommission × (gstPercentage / 100)
} else if (gstAppliedOn === 'total') {
  gstAmount = (doctorFees + platformCommission) × (gstPercentage / 100)
}

// Step 3: Total Amount
totalAmount = doctorFees + platformCommission + gstAmount

// Step 4: Payment Gateway Charges
paymentGatewayCharges = (totalAmount × gatewayPercentage / 100) + fixedCharge

// Step 5: Doctor Payout (unchanged)
doctorPayout = doctorFees

// Step 6: Platform Net Revenue
platformRevenue = platformCommission + gstAmount - paymentGatewayCharges
```

## Database Models

### 1. RevenueSettings Model
Stores configurable revenue parameters:
- `platformCommissionPercentage`: Platform commission (default: 10%)
- `gstPercentage`: GST rate (default: 18%)
- `gstAppliedOn`: Where GST applies ('commission', 'total', 'none')
- `paymentGatewayPercentage`: Gateway charges (default: 2%)
- `paymentGatewayFixedCharge`: Fixed charge per transaction
- `minimumTransactionAmount`: Minimum booking amount
- `isActive`: Active status
- `effectiveFrom`: When settings become effective

### 2. Transaction Model
Tracks every financial transaction:
- **References**: appointmentId, patientId, doctorId
- **Payment Details**: Razorpay payment ID, order ID, signature
- **Amount Breakdown**:
  - totalAmount: Total paid by patient
  - doctorFees: Original consultation fees
  - platformCommission: Commission amount
  - gstAmount: GST collected
  - paymentGatewayCharges: Gateway fees
  - doctorPayout: Amount owed to doctor
  - platformRevenue: Net platform earnings
- **Status Tracking**:
  - status: Transaction status
  - doctorPayoutStatus: Payout status (pending/completed)
  - doctorPayoutDate: When doctor was paid
  - doctorPayoutReference: Payment reference number

### 3. Updated Appointment Model
Now includes `revenueBreakdown` field with complete financial details.

## API Endpoints

### Admin Endpoints

#### GET /api/revenue/settings
Get current revenue settings
```json
{
  "platformCommissionPercentage": 10,
  "gstPercentage": 18,
  "gstAppliedOn": "commission",
  "paymentGatewayPercentage": 2,
  "paymentGatewayFixedCharge": 0
}
```

#### PUT /api/revenue/settings
Update revenue settings (Admin only)

#### GET /api/revenue/analytics?period=month
Get revenue analytics
```json
{
  "analytics": {
    "totalTransactions": 150,
    "totalRevenue": 83850,
    "platformRevenue": 7171.50,
    "platformCommission": 7500,
    "gstCollected": 1350,
    "paymentGatewayCharges": 1678.50,
    "doctorPayouts": 75000,
    "pendingPayouts": 25,
    "completedPayouts": 125
  },
  "topDoctors": [...]
}
```

#### GET /api/revenue/transactions
Get all transactions with filters

#### PUT /api/revenue/payout/:transactionId
Mark doctor payout as completed

### Doctor Endpoints

#### GET /api/revenue/doctor-earnings
Get doctor's earnings and payout status
```json
{
  "totalEarnings": 25000,
  "pendingPayout": 5000,
  "completedPayout": 20000,
  "totalAppointments": 50,
  "transactions": [...]
}
```

## Features

### 1. Configurable Settings
- Admin can adjust commission rates
- GST configuration (on commission or total)
- Payment gateway charges
- All changes tracked with effective dates

### 2. Automated Calculations
- Revenue breakdown calculated automatically on booking
- Transaction records created for every payment
- Real-time analytics and reporting

### 3. Payout Management
- Track pending doctor payouts
- Mark payouts as completed with reference numbers
- Settlement batch tracking

### 4. Financial Reporting
- Period-based analytics (today, week, month, year, all)
- Top earning doctors
- Platform revenue vs doctor payouts
- GST collection tracking
- Payment gateway cost analysis

### 5. Transparency
- Complete breakdown shown to patients
- Doctors can see their earnings
- Admin has full financial visibility

## GST Compliance

### GST on Platform Commission (Default)
```
Doctor Fees: ₹500
Commission: ₹50 (10%)
GST on Commission: ₹9 (18% of ₹50)
Total: ₹559
```

### GST on Total Amount (Alternative)
```
Doctor Fees: ₹500
Commission: ₹50 (10%)
Subtotal: ₹550
GST on Total: ₹99 (18% of ₹550)
Total: ₹649
```

### No GST (If applicable)
```
Doctor Fees: ₹500
Commission: ₹50 (10%)
Total: ₹550
```

## Payment Gateway Integration

### Razorpay Charges
- Percentage: 2% (configurable)
- Fixed charge: ₹0 (configurable)
- Deducted from platform revenue
- Not charged to doctor

## Admin Dashboard Features

### Revenue Management Page
- Real-time revenue statistics
- Period-based filtering
- Revenue settings configuration
- Transaction history
- Payout management
- Top earning doctors
- Export capabilities

### Key Metrics Displayed
1. **Platform Revenue**: Net earnings after gateway charges
2. **Total Revenue**: All money collected
3. **Commission Earned**: Platform commission before costs
4. **Doctor Payouts**: Total owed to doctors
5. **Pending Payouts**: Unpaid doctor earnings
6. **GST Collected**: Total GST amount
7. **Gateway Charges**: Total payment processing costs

## Doctor Dashboard Integration

Doctors can view:
- Total earnings
- Pending payouts
- Completed payouts
- Transaction history
- Appointment-wise breakdown

## Security & Compliance

1. **Admin-Only Access**: Revenue settings and analytics restricted to admins
2. **Audit Trail**: All transactions logged with timestamps
3. **GST Compliance**: Proper GST calculation and tracking
4. **Payment Security**: Razorpay signature verification
5. **Data Integrity**: Transaction records immutable after creation

## Future Enhancements

1. **Automated Payouts**: Integration with bank APIs for automatic transfers
2. **Invoice Generation**: Automatic GST invoices for platform services
3. **Tax Reports**: Quarterly and annual tax reports
4. **Multi-Currency**: Support for international payments
5. **Refund Management**: Automated refund processing
6. **Settlement Batches**: Bulk payout processing
7. **Revenue Forecasting**: Predictive analytics
8. **Commission Tiers**: Variable commission based on doctor performance

## Usage Example

### For Admin:
1. Navigate to Admin Dashboard → Revenue Management
2. View real-time revenue statistics
3. Adjust commission/GST settings if needed
4. Review pending payouts
5. Mark payouts as completed with reference numbers
6. Export financial reports

### For Doctors:
1. Navigate to Doctor Dashboard → Earnings
2. View total earnings and pending payouts
3. See transaction history
4. Track appointment-wise revenue

### For Patients:
- Transparent pricing shown during booking
- Complete breakdown in payment receipt
- GST details included in invoice

## Technical Implementation

### Files Created:
1. `server/models/Transaction.js` - Transaction tracking
2. `server/models/RevenueSettings.js` - Revenue configuration
3. `server/utils/revenueCalculator.js` - Calculation logic
4. `server/routes/revenueRoutes.js` - API endpoints
5. `client/src/pages/AdminRevenue.js` - Admin dashboard
6. `client/src/api/revenueAPI.js` - Frontend API calls

### Files Modified:
1. `server/models/Appointment.js` - Added revenueBreakdown field
2. `server/routes/paymentRoutes.js` - Integrated revenue calculation
3. `server/server.js` - Added revenue routes

## Testing

### Test Scenarios:
1. Book appointment with default settings
2. Change commission percentage and verify calculation
3. Switch GST application mode
4. Mark payout as completed
5. View analytics for different periods
6. Export transaction reports

## Support

For questions or issues related to revenue management:
- Check transaction logs in database
- Review revenue settings configuration
- Verify Razorpay webhook integration
- Contact system administrator

---

**Last Updated**: 2024
**Version**: 1.0.0
