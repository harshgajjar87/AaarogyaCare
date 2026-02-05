import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { AuthContext } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const DashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        };

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const endpoint = user.role === 'doctor' ? '/api/analysis/doctor' : '/api/analysis/admin';
                const response = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(response.data);
            } catch (err) {
                setError('Failed to fetch analysis data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div></div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!data) return <div className="text-center p-8">No data to display.</div>;

    const renderDoctorDashboard = () => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const chartLabels = data.monthlyAppointments.map(item => monthNames[item._id - 1]);
        const chartData = {
            labels: chartLabels,
            datasets: [{
                label: 'Appointments per Month',
                data: data.monthlyAppointments.map(item => item.count),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            }]
        };

        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-health-text-h">Doctor Analytics</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-health-surface rounded-xl shadow-sm border p-6"><h3 className="text-lg font-semibold text-health-text-p">Total Appointments</h3><p className="text-4xl font-bold text-health-text-h mt-2">{data.totalAppointments}</p></div>
                    <div className="bg-health-surface rounded-xl shadow-sm border p-6"><h3 className="text-lg font-semibold text-health-text-p">Total Revenue</h3><p className="text-4xl font-bold text-health-text-h mt-2">₹{data.totalRevenue.toLocaleString()}</p></div>
                </div>
                <div className="bg-health-surface rounded-xl shadow-sm border p-6">
                    <h3 className="text-xl font-bold text-health-text-h mb-4">Monthly Appointments</h3>
                    <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </div>
            </div>
        );
    };

    const renderAdminDashboard = () => {
        const chartLabels = data.appointmentsByMonth.map(item => `${item._id.month}/${item._id.year}`);
        const chartData = {
            labels: chartLabels,
            datasets: [{
                label: 'Appointments per Month',
                data: data.appointmentsByMonth.map(item => item.count),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.1
            }]
        };

        return (
            <div className="space-y-8">
                <h1 className="text-3xl font-bold text-health-text-h">Admin Analytics</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-health-surface rounded-xl shadow-sm border p-6"><h3 className="text-lg font-semibold text-health-text-p">Total Patients</h3><p className="text-4xl font-bold text-health-text-h mt-2">{data.totalPatients}</p></div>
                    <div className="bg-health-surface rounded-xl shadow-sm border p-6"><h3 className="text-lg font-semibold text-health-text-p">Total Doctors</h3><p className="text-4xl font-bold text-health-text-h mt-2">{data.totalDoctors}</p></div>
                    <div className="bg-health-surface rounded-xl shadow-sm border p-6"><h3 className="text-lg font-semibold text-health-text-p">Total Appointments</h3><p className="text-4xl font-bold text-health-text-h mt-2">{data.totalAppointments}</p></div>
                    <div className="bg-health-surface rounded-xl shadow-sm border p-6"><h3 className="text-lg font-semibold text-health-text-p">Total Revenue</h3><p className="text-4xl font-bold text-health-text-h mt-2">₹{data.totalPlatformRevenue.toLocaleString()}</p></div>
                </div>
                <div className="bg-health-surface rounded-xl shadow-sm border p-6">
                    <h3 className="text-xl font-bold text-health-text-h mb-4">Platform Appointments Trend</h3>
                    <Line data={chartData} />
                </div>
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            {user && (user.role === 'doctor' ? renderDoctorDashboard() : user.role === 'admin' ? renderAdminDashboard() : <div className="text-center p-8">You do not have access to this page.</div>)}
        </div>
    );
};

export default DashboardPage;