# Analytics Feature Documentation

## Overview
Comprehensive analytics dashboards for both Doctor and Admin panels with interactive charts and graphical representations.

## Features Implemented

### Doctor Analytics Dashboard (`/doctor/analytics`)
**Metrics Displayed:**
- Total Appointments
- Total Revenue (₹)
- Total Patients
- Average Rating with Review Count

**Charts & Visualizations:**
1. **Monthly Appointments** (Bar Chart)
   - Shows appointment trends over the last 6 months
   - Helps identify busy periods

2. **Monthly Revenue** (Line Chart)
   - Tracks revenue generation over time
   - Shows financial performance trends

3. **Appointment Status Distribution** (Doughnut Chart)
   - Visual breakdown of appointments by status
   - Categories: Pending, Approved, Rejected, Completed, etc.

4. **Peak Hours** (Horizontal Bar Chart)
   - Identifies busiest consultation hours
   - Helps optimize scheduling

### Admin Analytics Dashboard (`/admin-analytics`)
**Metrics Displayed:**
- Total Appointments
- Total Revenue (₹)
- Total Doctors
- Total Patients

**Charts & Visualizations:**
1. **Monthly Appointments** (Bar Chart)
   - Platform-wide appointment trends
   - Last 6 months data

2. **Monthly Revenue** (Line Chart)
   - Total platform revenue over time
   - Financial performance tracking

3. **User Growth** (Multi-line Chart)
   - Tracks doctor and patient registration trends
   - Shows platform growth over 6 months

4. **Top Doctors by Appointments** (Horizontal Bar Chart)
   - Top 5 doctors with most appointments
   - Performance comparison

5. **Doctors by Specialization** (Pie Chart)
   - Distribution of doctors across specializations
   - Helps identify coverage gaps

6. **Appointment Status Distribution** (Doughnut Chart)
   - Platform-wide appointment status breakdown
   - Operational insights

## Technical Stack

### Backend
- **Controller:** `server/controllers/analyticsController.js`
- **Routes:** `server/routes/analyticsRoutes.js`
- **Database:** MongoDB aggregation queries
- **Authentication:** JWT-based with role authorization

### Frontend
- **Pages:** 
  - `client/src/pages/DoctorAnalytics.js`
  - `client/src/pages/AdminAnalytics.js`
- **Charts:** Chart.js with react-chartjs-2
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## API Endpoints

### Doctor Analytics
```
GET /api/analytics/doctor
Authorization: Bearer <token>
Role: doctor
```

**Response:**
```json
{
  "totalAppointments": 150,
  "statusCounts": { "pending": 10, "approved": 50, "completed": 80 },
  "monthlyAppointments": { "Jan 2024": 20, "Feb 2024": 25 },
  "totalRevenue": 75000,
  "monthlyRevenue": { "Jan 2024": 10000, "Feb 2024": 12500 },
  "avgConsultationTime": 30,
  "totalPatients": 85,
  "avgRating": 4.5,
  "totalReviews": 42,
  "peakHours": { "9": 15, "10": 20, "11": 18 }
}
```

### Admin Analytics
```
GET /api/analytics/admin
Authorization: Bearer <token>
Role: admin
```

**Response:**
```json
{
  "totalAppointments": 1500,
  "totalDoctors": 50,
  "totalPatients": 800,
  "totalRevenue": 750000,
  "monthlyAppointments": { "Jan 2024": 200, "Feb 2024": 250 },
  "monthlyRevenue": { "Jan 2024": 100000, "Feb 2024": 125000 },
  "specializationCounts": { "Cardiology": 10, "Dermatology": 8 },
  "topDoctors": { "Dr. Smith": 120, "Dr. Jones": 95 },
  "statusCounts": { "pending": 100, "approved": 500, "completed": 800 },
  "userGrowth": { "Jan 2024": { "doctors": 5, "patients": 50 } }
}
```

## Installation & Setup

1. **Backend Setup:**
   - Analytics routes are automatically registered in `server.js`
   - No additional dependencies required

2. **Frontend Setup:**
   - Chart.js is already included in package.json
   - Routes are configured in App.js

3. **Access:**
   - Doctor: Navigate to `/doctor/analytics` or click "Analytics" in sidebar
   - Admin: Navigate to `/admin-analytics` or click "Analytics" in sidebar

## Features by Role

### Doctor Can:
- View personal appointment statistics
- Track revenue and earnings
- Analyze patient demographics
- Identify peak consultation hours
- Monitor appointment status distribution
- Track performance over time

### Admin Can:
- View platform-wide statistics
- Monitor total revenue
- Track user growth (doctors & patients)
- Identify top-performing doctors
- Analyze specialization distribution
- Monitor appointment trends
- View operational metrics

## Future Enhancements
- Export analytics as PDF/Excel
- Custom date range selection
- Real-time data updates
- Comparative analytics (month-over-month, year-over-year)
- Patient satisfaction metrics
- Appointment cancellation analysis
- Revenue forecasting
- Doctor performance benchmarking
