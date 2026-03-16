import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { 
  DollarSign, TrendingUp, Users, CreditCard, 
  Settings, Download, Calendar, Filter, CheckCircle, Clock 
} from 'lucide-react';

const AdminRevenue = () => {
  const [analytics, setAnalytics] = useState(null);
  const [settings, setSettings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    platformCommissionPercentage: 10,
    gstPercentage: 18,
    gstAppliedOn: 'commission',
    paymentGatewayPercentage: 2,
    paymentGatewayFixedCharge: 0
  });

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, settingsRes, transactionsRes] = await Promise.all([
        axios.get(`/revenue/analytics?period=${period}`),
        axios.get('/revenue/settings'),
        axios.get('/revenue/transactions?limit=10')
      ]);

      setAnalytics(analyticsRes.data.analytics);
      setSettings(settingsRes.data);
      setTransactions(transactionsRes.data.transactions);
      setSettingsForm({
        platformCommissionPercentage: settingsRes.data.platformCommissionPercentage,
        gstPercentage: settingsRes.data.gstPercentage,
        gstAppliedOn: settingsRes.data.gstAppliedOn,
        paymentGatewayPercentage: settingsRes.data.paymentGatewayPercentage,
        paymentGatewayFixedCharge: settingsRes.data.paymentGatewayFixedCharge
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/revenue/settings', settingsForm);
      toast.success('Revenue settings updated successfully');
      setShowSettings(false);
      fetchData();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount?.toFixed(2) || '0.00'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Revenue Management</h1>
          <p className="text-sm text-slate-600 mt-1">Track platform earnings and manage payouts</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm sm:text-base"
        >
          <Settings size={18} />
          Settings
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Revenue Settings</h2>
          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Platform Commission (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsForm.platformCommissionPercentage}
                  onChange={(e) => setSettingsForm({...settingsForm, platformCommissionPercentage: parseFloat(e.target.value)})}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  GST (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsForm.gstPercentage}
                  onChange={(e) => setSettingsForm({...settingsForm, gstPercentage: parseFloat(e.target.value)})}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  GST Applied On
                </label>
                <select
                  value={settingsForm.gstAppliedOn}
                  onChange={(e) => setSettingsForm({...settingsForm, gstAppliedOn: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="commission">Commission Only</option>
                  <option value="total">Total Amount</option>
                  <option value="none">No GST</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Gateway Charges (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsForm.paymentGatewayPercentage}
                  onChange={(e) => setSettingsForm({...settingsForm, paymentGatewayPercentage: parseFloat(e.target.value)})}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Save Settings
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Period Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['today', 'week', 'month', 'year', 'all'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              period === p
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={24} />
            <span className="text-xs sm:text-sm opacity-90">Total Collected</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(analytics?.totalRevenue)}</p>
          <p className="text-xs sm:text-sm opacity-90 mt-1">From patients ({analytics?.totalTransactions} transactions)</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Users size={24} />
            <span className="text-xs sm:text-sm opacity-90">Doctor Payouts</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(analytics?.doctorPayouts)}</p>
          <p className="text-xs sm:text-sm opacity-90 mt-1">{analytics?.pendingPayouts} pending</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-6 text-white shadow-lg sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} />
            <span className="text-xs sm:text-sm opacity-90">Net Platform Profit</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(analytics?.platformRevenue)}</p>
          <p className="text-xs sm:text-sm opacity-90 mt-1">After gateway charges</p>
        </div>
      </div>

      {/* Detailed Breakdown Panel */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CreditCard size={20} className="text-teal-600" /> Revenue Breakdown
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-600">Total collected from patients</span>
            <span className="font-semibold text-slate-800">{formatCurrency(analytics?.totalRevenue)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500">− Doctor payouts</span>
            <span className="text-orange-600 font-medium">− {formatCurrency(analytics?.doctorPayouts)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100 pl-4">
            <span className="text-slate-400 text-xs">Platform commission ({settings?.platformCommissionPercentage || 10}%)</span>
            <span className="text-slate-600 text-xs">{formatCurrency(analytics?.platformCommission)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100 pl-4">
            <span className="text-slate-400 text-xs">GST collected ({settings?.gstPercentage || 18}%)</span>
            <span className="text-slate-600 text-xs">{formatCurrency(analytics?.gstCollected)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-slate-500">− Payment gateway charges ({settings?.paymentGatewayPercentage || 2}%)</span>
            <span className="text-red-500 font-medium">− {formatCurrency(analytics?.gatewayCharges)}</span>
          </div>
          <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-3 mt-2">
            <span className="font-bold text-green-800">Net Platform Profit</span>
            <span className="font-bold text-green-700 text-lg">{formatCurrency(analytics?.platformRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Date</th>
                <th className="text-left py-3 px-2 text-sm font-semibold text-slate-700">Doctor</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-slate-700">Total</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-slate-700">Commission</th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-slate-700">Platform</th>
                <th className="text-center py-3 px-2 text-sm font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-2 text-sm text-slate-600">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2 text-sm text-slate-800">
                    {transaction.doctorId?.name || 'N/A'}
                  </td>
                  <td className="py-3 px-2 text-sm text-slate-800 text-right font-medium">
                    {formatCurrency(transaction.totalAmount)}
                  </td>
                  <td className="py-3 px-2 text-sm text-slate-600 text-right">
                    {formatCurrency(transaction.platformCommission)}
                  </td>
                  <td className="py-3 px-2 text-sm text-teal-600 text-right font-medium">
                    {formatCurrency(transaction.platformRevenue)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {transaction.doctorPayoutStatus === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        <CheckCircle size={12} />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        <Clock size={12} />
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenue;
