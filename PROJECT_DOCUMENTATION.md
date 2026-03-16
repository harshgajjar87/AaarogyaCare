# AarogyaCare — Project Documentation

## Overview

AarogyaCare is a full-stack telemedicine platform connecting patients with doctors. It supports appointment booking with online payment, real-time chat, AI-powered triage and voice consultation, health predictions, prescription management, medical report analysis, and detailed analytics for doctors and admins.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Bootstrap 5, Chart.js, Framer Motion, Lucide React |
| Backend | Node.js, Express 5, MongoDB (Mongoose) |
| Auth | JWT, Google OAuth2 |
| Payments | Razorpay |
| Email | Mailjet (SMTP + REST API) |
| AI / LLM | OpenAI GPT, Groq (llama-3.1), Google Gemini |
| Speech | Web Speech API (STT), Google Cloud TTS / browser TTS |
| File Storage | Local (`server/uploads/`) |
| Deployment | Render (server), Vercel (client) |

---

## Project Structure

```
AarogyaCare/
├── client/                        # React frontend (CRA)
│   ├── public/
│   │   └── images/                # Doctor/hero images, notification sound
│   └── src/
│       ├── api/                   # Axios API call modules per domain
│       ├── components/            # Reusable UI components
│       ├── context/               # AuthContext, NotificationContext, ThemeContext
│       ├── data/                  # Local medicine database (JSON/JS)
│       ├── hooks/                 # Custom React hooks
│       ├── pages/                 # Route-level page components
│       └── App.js                 # Route definitions + layout
│
├── server/                        # Express backend
│   ├── config/                    # Mail transporter configs (Mailjet)
│   ├── controllers/               # Route handler logic
│   ├── middleware/                # Auth, file upload middleware
│   ├── models/                    # Mongoose schemas
│   ├── routes/                    # Express routers
│   ├── uploads/                   # Uploaded files (chat, reports, profiles, verifications)
│   ├── utils/                     # PDF generator, revenue calculator
│   └── server.js                  # App entry point
│
├── .env.production                # Production environment variables (do not commit secrets)
├── knowledge.txt                  # Clinical knowledge base for AI triage system prompt
└── vercel.json                    # Vercel deployment config
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret |
| `MAIL_USER` | Sender email address |
| `ADMIN_EMAIL` | Admin notification email |
| `MAILJET_API_KEY` | Mailjet API key |
| `MAILJET_SECRET_KEY` | Mailjet secret key |
| `OPENAI_API_KEY` | OpenAI API key |
| `GROQ_API_KEY` | Groq API key |
| `GOOGLE_API_KEY` | Google Gemini API key |
| `GOOGLE_CLOUD_TTS_KEY` | Google Cloud Text-to-Speech API key |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `SERVER_URL` | Public server URL (used for keep-alive ping on Render) |
| `CLIENT_URL` | Frontend URL |

### Client (`client/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_BASE_URL` | Backend base URL |
| `REACT_APP_FLASK_API_URL` | Flask AI service URL (optional) |
| `RAZORPAY_KEY_ID` | Razorpay public key |
| `GENERATE_SOURCEMAP` | Set to `false` for production builds |

> Never commit `.env` files. Add them to `.gitignore`.

---

## User Roles

| Role | Description |
|---|---|
| `patient` | Books appointments, chats with doctors, uses AI tools, views prescriptions and reports |
| `doctor` | Manages appointments, uploads reports, writes prescriptions, views analytics and patient history |
| `admin` | Full platform management — doctors, patients, appointments, revenue, verifications, queries |

---

## Features

### Public / Landing Page
- Hero section with rotating doctor carousel
- AI tools showcase (Health Risk Calculator, AI Chat Doctor, Voice AI Doctor, Report Analyzer)
- Platform features overview
- How It Works walkthrough
- Live doctor listing (fetched from DB)
- Patient reviews carousel
- Register as Patient / Register as Doctor CTAs

---

### Authentication
- Patient registration with email + OTP verification
- Doctor registration (separate flow with professional details)
- Login with email/password
- Google OAuth2 login
- Forgot password / Reset password via email link
- JWT-based session management
- Protected routes per role

---

### Patient Features

#### Dashboard
- Upcoming appointments summary
- Quick links to book, chat, AI tools

#### Appointment Booking (`/patient/appointments`)
- Browse and filter doctors by specialization, name, location
- View doctor profile, ratings, availability
- Select date and time slot
- Visual slot grid — booked slots shown with strikethrough, past slots filtered client-side
- Full fee breakdown before payment:
  - Doctor consultation fee
  - Platform fee (10%)
  - GST (18% on platform fee)
  - Total charged via Razorpay
- Razorpay payment integration
- Appointment confirmation

#### My Appointments (`/patient/my-appointments`)
- List of all past and upcoming appointments
- Status tracking (pending, confirmed, completed, cancelled)
- View prescriptions linked to appointments

#### Payment History (`/patient/payments`)
- Full transaction history with fee breakdown per appointment

#### Prescriptions (`/patient/prescriptions`)
- View all prescriptions issued by doctors
- Medicines, dosage, instructions, doctor notes

#### Medical Reports (`/patient/reports`)
- View reports uploaded by doctors
- AI-powered report analysis (extract key findings)
- Download reports as PDF

#### Chat with Doctor
- Start a chat session with any doctor
- Real-time messaging with file/image sharing
- Chat list shows correct names (patient sees doctor name, doctor sees patient name)
- Archived chats visible after doctor ends session

#### AI Triage Chat (`AITriageChat`)
- Multi-turn symptom collection using clinical HPI methodology
- Multilingual: English, Hindi, Gujarati
- Session memory — collected facts persist across turns via sessionStorage
- Red-flag emergency override (e.g. chest pain → immediate ER recommendation)
- Specialist recommendation based on symptoms
- Speech-to-text mic input on every message
- Text-to-speech "Listen" button on every AI response
- Language selector (not disabled)

#### AI Voice Call (`AIVoiceCall`)
- Press-and-hold mic button for voice input
- AI responds with synthesized speech
- Same triage logic as chat

#### Voice Doctor Page (`/doctor/:doctorId/voice`)
- Voice-based consultation interface with a specific doctor's AI persona

#### Health Risk Calculator (`/health-risk`)
- Input lifestyle factors (age, BMI, smoking, activity, etc.)
- Returns risk score and personalized recommendations

#### Health Prediction (`/health-prediction`)
- AI-based disease prediction from symptoms and health data
- General prediction and condition-specific analysis

#### Symptom Checker (`/symptom-checker`)
- Select symptoms from a list
- Get suggested specialist type and possible conditions

#### Notifications (`/notifications`)
- In-app notification center
- Bell icon with unread count in navbar
- Notification sound on new alerts

#### Profile
- Edit personal details, profile photo
- Change email (with OTP verification)
- Change password

---

### Doctor Features

#### Dashboard (`/doctor/dashboard`)
- Today's appointment schedule
- Patient count, earnings summary
- Quick action links

#### Appointments (`/doctor/appointments`)
- View all appointments (upcoming, past, cancelled)
- Confirm or cancel appointments
- Mark as completed
- Link to write prescription

#### Patients (`/doctor/patients`)
- List of all patients who have booked with this doctor
- Click through to full patient detail view

#### Patient Details (`/patient/:patientId`)
- Full patient profile
- Appointment history with this doctor
- Reports and prescriptions

#### Upload Report (`/doctor/upload-report`)
- Upload PDF medical reports for a patient
- Report linked to patient account

#### Reports (`/doctor/reports`)
- View all reports uploaded by this doctor

#### Prescriptions (`/doctor/prescriptions/:appointmentId`)
- Write prescription for a completed appointment
- Add medicines with dosage, frequency, duration
- Medicine autocomplete from local database
- Instructions and notes
- PDF generation

#### Reviews (`/doctor/reviews`)
- View all patient reviews and ratings
- Average rating display

#### Analytics (`/doctor/analytics`)
- Total appointments, completed, cancelled
- Earnings breakdown:
  - Total listed fee collected
  - Platform fee charged to patients (10%)
  - GST collected (18% on platform fee)
  - Actual earnings (full listed fee — no deductions from doctor)
- Note explaining that patients pay listed fee + platform fee + GST on top

#### Profile (`/profile`)
- Edit professional details: specialization, experience, qualifications, clinic info
- Set consultation fee with live fee breakdown preview:
  - Shows what patient will pay (fee + platform fee + GST)
  - Shows what doctor receives (full listed fee)
- Availability schedule management
- Expertise: conditions treated, treatments offered
- Profile photo upload

#### Doctor Verification (`/doctor-verification`)
- Upload verification documents (degree, registration certificate)
- Track verification status (pending / approved / rejected)

---

### Admin Features

#### Dashboard (`/admin/dashboard`)
- Platform-wide stats: total doctors, patients, appointments, revenue

#### Doctors (`/admin/doctors`)
- List all registered doctors with full details
- Toggle doctor active/inactive status

#### Doctor Verifications (`/admin/verifications`)
- Review submitted verification documents
- Approve or reject doctor verification requests

#### Patients (`/admin/patients`)
- List all registered patients

#### Appointments (`/admin/appointments`)
- View all appointments across the platform
- Filter by status, date, doctor, patient

#### Revenue (`/admin/revenue`)
- 3 summary cards: Total Collected, Doctor Payouts, Net Platform Profit
- Detailed breakdown panel:
  - Total collected from patients (via Razorpay)
  - Minus doctor payouts (full listed fees)
  - Minus payment gateway charges (2%)
  - = Net platform profit
- All figures with GST breakdown

#### Analytics (`/admin/analytics`)
- Appointment trends over time (chart)
- Revenue trends
- Top doctors by appointments and earnings
- Platform commission and GST totals

#### Queries (`/admin/queries`)
- View contact form submissions from users
- Mark as resolved

---

## Revenue / Payment Model

Doctor sets a consultation fee (e.g. ₹799).

| Item | Calculation | Amount |
|---|---|---|
| Doctor consultation fee | Set by doctor | ₹799.00 |
| Platform commission (10%) | 10% of doctor fee | ₹79.90 |
| GST (18% on commission) | 18% of ₹79.90 | ₹14.38 |
| **Patient pays (Razorpay)** | Fee + commission + GST | **₹893.28** |
| Doctor receives | Full listed fee | ₹799.00 |
| Gateway charges (2%) | 2% of total | ₹17.87 |
| **Platform net profit** | Commission + GST − gateway | **₹76.41** |

- Doctor is never charged — they receive their full listed fee
- Platform earns from commission + GST minus gateway charges
- All breakdowns visible to patient (booking), doctor (analytics/profile), and admin (revenue page)

---

## API Routes Reference

| Prefix | Description |
|---|---|
| `/api/auth` | Register, login, Google OAuth, forgot/reset password |
| `/api/appointments` | Book, list, update status, get slots |
| `/api/payment` | Create Razorpay order, verify, fee preview, payment history |
| `/api/analytics` | Doctor earnings breakdown, admin platform revenue |
| `/api/revenue` | Revenue settings (commission rate, GST rate) |
| `/api/chat` | Start chat, send/get messages, end/archive chat |
| `/api/chatbot` | General health chatbot |
| `/api/triage` | AI symptom triage (multi-turn, multilingual, session memory) |
| `/api/tts` | Text-to-speech synthesis |
| `/api/ai` | AI report extraction, health prediction |
| `/api/health` | Health risk prediction |
| `/api/prescriptions` | Create, view prescriptions |
| `/api/reports` | Upload, view, download medical reports |
| `/api/reviews` | Doctor reviews and ratings |
| `/api/notifications` | In-app notifications |
| `/api/verification` | Doctor document verification workflow |
| `/api/doctors` | Doctor listing, search, filter |
| `/api/patients` | Patient data |
| `/api/profile` | Profile update |
| `/api/otp` | OTP generation and verification |
| `/api/contact` | Contact form submissions |
| `/api/admin` | Admin: doctors, patients, platform management |
| `/api/admin/appointments` | Admin appointment management |
| `/api/admin/doctors/new` | Full doctor data with toggle-active |
| `/upload` | Image/file upload |

---

## Data Models

| Model | Key Fields |
|---|---|
| `User` | name, email, password (hashed), role (patient/doctor/admin), doctorDetails, profile, profileImage, isActive |
| `Appointment` | patient, doctor, date, slot, status, paymentStatus, transactionId, notes |
| `Transaction` | patient, doctor, amount, doctorPayout, platformRevenue, platformCommission, gstAmount, gatewayCharges |
| `Chat` | patient, doctor, messages[], isArchived, endedByDoctor |
| `Prescription` | doctor, patient, appointment, medicines[], instructions, createdAt |
| `Report` | patient, doctor, fileUrl, fileName, analysisResult, createdAt |
| `Review` | doctor, patient, rating (1–5), comment, createdAt |
| `Notification` | user, type, message, isRead, createdAt |
| `DoctorVerification` | doctor, documents[], status (pending/approved/rejected), adminNote |
| `RevenueSettings` | commissionRate, gstRate, gatewayChargeRate |
| `Otp` | email, otp, expiresAt |
| `Query` | name, email, message, status (open/resolved) |

---

## Running Locally

```bash
# 1. Clone the repo
git clone <repo-url>
cd AarogyaCare

# 2. Set up server
cd server
cp .env.example .env   # fill in your values
npm install
npm run dev            # runs on http://localhost:5000

# 3. Set up client (new terminal)
cd client
cp .env.example .env   # fill in your values
npm install
npm start              # runs on http://localhost:3000
```

---

## Deployment

- Server: Render — `server/Procfile` defines `web: node server.js`
- Client: Vercel — `vercel.json` at root handles SPA routing
- Keep-alive ping runs every 14 minutes in production to prevent Render free tier sleep (`SERVER_URL` env var required)

---

## Important Notes

- All time-based filtering (past slots, etc.) is done client-side — server runs UTC, app targets IST (+5:30)
- Doctor names in the DB already include the "Dr." prefix — do not add it in code
- `knowledge.txt` contains clinical triage knowledge injected into the AI triage system prompt
- Mail is split across two Mailjet configs:
  - `mailjet.js` (SMTP/nodemailer) — used by auth emails and report notifications
  - `mailjetAPI.js` (REST API) — used by OTP and contact form
- `server/uploads/` subfolders: `chat/`, `profiles/`, `reports/`, `verifications/`, `clinic-images/`
