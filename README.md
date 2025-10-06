# AarogyaCare

A comprehensive healthcare management system built with React for the frontend and Node.js/Express for the backend.

## Features

- **User Management**: Registration, login, and authentication for patients, doctors, and admins.
- **Appointment Booking**: Patients can book appointments with doctors.
- **Doctor Profiles**: Doctors can manage their profiles, availability, and patient records.
- **Admin Dashboard**: Admins can manage users, appointments, and system settings.
- **Chat System**: Real-time messaging between patients and doctors.
- **Notifications**: In-app notifications for appointments and updates.
- **Report Management**: Upload and manage medical reports.
- **Reviews and Ratings**: Patients can review and rate doctors.
- **Doctor Verification**: Admin approval process for new doctors.

## Tech Stack

### Frontend
- React
- React Router
- Axios for API calls
- CSS for styling

### Backend
- Node.js
- Express.js
- MongoDB (assumed from models)
- JWT for authentication
- Multer for file uploads
- Nodemailer for email services

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AarogyaCare
   ```

2. Install dependencies for the server:
   ```bash
   cd server
   npm install
   ```

3. Install dependencies for the client:
   ```bash
   cd ../client
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the `server` directory with necessary configurations (e.g., database URL, JWT secret, email settings).

5. Start the server:
   ```bash
   cd server
   npm start
   ```

6. Start the client:
   ```bash
   cd client
   npm start
   ```

The application will be running on `http://localhost:3000` for the client and `http://localhost:5000` for the server (adjust ports as needed).

## Usage

- Register as a patient, doctor, or admin.
- Patients can search for doctors, book appointments, and manage their health records.
- Doctors can view appointments, manage profiles, and communicate with patients.
- Admins can oversee the entire system.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.

## License

This project is licensed under the MIT License.
