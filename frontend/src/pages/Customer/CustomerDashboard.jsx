import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { CreditCard, FileText, ArrowUpRight, DollarSign, Calendar, AlertCircle, PlusCircle, CheckCircle2 } from 'lucide-react';

const CustomerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/customers/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Loading customer dashboard...
      </div>
    );
  }

  const loans = dashboardData?.loans || [];
  const activeLoans = loans.filter((l) => l.status === 'DISBURSED');

  // Calculate metrics
  const totalActiveAmount = activeLoans.reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/30">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Customer Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Track loan applications, view EMI schedules, and process payments.</p>
        </div>

        <Link
          to="/customer/apply"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg glow-blue flex items-center gap-2 transition-all"
        >
          <PlusCircle className="w-5 h-5" /> Apply for New Loan
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Loans"
          value={activeLoans.length}
          subtitle={`Total Apps: ${loans.length}`}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Active Loan Principal"
          value={`₹${totalActiveAmount.toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Total Applications"
          value={loans.length}
          icon={CreditCard}
          color="purple"
        />
        <StatCard
          title="Account Status"
          value="VERIFIED"
          subtitle="KYC Verified"
          icon={CheckCircle2}
          color="amber"
        />
      </div>

      {/* Applications Table */}
      <div className="glass-panel rounded-3xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Loan Applications</h2>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
            {loans.length} Total Record(s)
          </span>
        </div>

        {loans.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-lg font-medium text-white">No loan applications found</p>
            <p className="text-sm mt-1">Submit your first loan application in minutes.</p>
            <Link
              to="/customer/apply"
              className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm"
            >
              Apply Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 px-4">Loan ID</th>
                  <th className="pb-3 px-4">Product</th>
                  <th className="pb-3 px-4">Requested Amt</th>
                  <th className="pb-3 px-4">Tenure</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {loans.map((l) => (
                  <tr key={l.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-bold text-white">{l.loanNumber}</td>
                    <td className="py-4 px-4 text-slate-300">{l.loanProduct?.productName}</td>
                    <td className="py-4 px-4 font-semibold text-emerald-400">₹{l.requestedAmount?.toLocaleString()}</td>
                    <td className="py-4 px-4 text-slate-300">{l.tenureMonths} Months</td>
                    <td className="py-4 px-4">
                      <Badge status={l.status} />
                    </td>
                    <td className="py-4 px-4 text-slate-400">{l.applicationDate}</td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/customer/loans/${l.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20"
                      >
                        View Details <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
