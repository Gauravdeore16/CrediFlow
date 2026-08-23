import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Users, Shield, Settings, DollarSign, FileText, PlusCircle, CheckCircle, XCircle, Activity, UserPlus } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [loading, setLoading] = useState(true);

  // Officer Modal State
  const [officerModalOpen, setOfficerModalOpen] = useState(false);
  const [officerData, setOfficerData] = useState({
    name: '', email: '', password: 'Officer@123', mobile: '', employeeCode: '', department: 'Loan Officer', designation: 'Credit Analyst'
  });

  // Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productData, setProductData] = useState({
    productName: '', description: '', minAmount: '50000', maxAmount: '1000000', interestRate: '12.0', minTenure: '12', maxTenure: '60', processingFee: '1.5'
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, productsRes, logsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/loan-products'),
        api.get('/admin/audit-logs')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
      setAuditLogs(logsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/status`);
      fetchAdminData();
    } catch (e) {
      alert('Failed to toggle status');
    }
  };

  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/officers', officerData);
      setOfficerModalOpen(false);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create officer account');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/loan-products', productData);
      setProductModalOpen(false);
      fetchAdminData();
    } catch (err) {
      alert('Failed to save loan product');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading admin console...</div>;

  // Chart dataset preparation
  const statusChartData = stats ? [
    { name: 'Approved', count: stats.approvedLoans, color: '#10b981' },
    { name: 'Active (Disbursed)', count: stats.activeLoans, color: '#06b6d4' },
    { name: 'Rejected', count: stats.rejectedLoans, color: '#f43f5e' },
    { name: 'Closed', count: stats.closedLoans, color: '#64748b' }
  ] : [];

  const financialChartData = stats ? [
    { category: 'Total Disbursed', amount: stats.totalDisbursed },
    { category: 'Total Collected', amount: stats.totalCollected },
    { category: 'Outstanding', amount: stats.outstandingAmount }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-purple-950/30 via-slate-900 to-blue-950/30">
        <div>
          <h1 className="text-3xl font-extrabold text-white">System Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">System metrics analytics, user authorization, product catalog, and audit trail.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setOfficerModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
          >
            <UserPlus className="w-4 h-4" /> Add Loan Officer
          </button>

          <button
            onClick={() => setProductModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
          >
            <PlusCircle className="w-4 h-4" /> Create Loan Product
          </button>
        </div>
      </div>

      {/* Admin Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} color="blue" />
          <StatCard title="Loan Officers" value={stats.totalOfficers} icon={Shield} color="purple" />
          <StatCard title="Total Disbursed" value={`₹${stats.totalDisbursed?.toLocaleString()}`} icon={DollarSign} color="emerald" />
          <StatCard title="Total Collected" value={`₹${stats.totalCollected?.toLocaleString()}`} icon={CheckCircle} color="amber" />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {['OVERVIEW', 'USERS', 'PRODUCTS', 'AUDIT_LOGS'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg glow-blue'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & CHARTS */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Breakdown Bar Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white">Application Status Analytics</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Financial Portfolio Breakdown */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white">Financial Portfolio Overview (₹)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialChartData}>
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-xl font-bold text-white">System Users & Accounts</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 px-4">User</th>
                  <th className="pb-3 px-4">Role</th>
                  <th className="pb-3 px-4">Mobile</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-bold text-white">{u.name} <span className="block text-xs font-normal text-slate-400">{u.email}</span></td>
                    <td className="py-4 px-4"><span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 text-xs font-bold">{u.role}</span></td>
                    <td className="py-4 px-4 text-slate-300">{u.mobile || 'N/A'}</td>
                    <td className="py-4 px-4"><Badge status={u.status} /></td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          u.status === 'ACTIVE' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOAN PRODUCTS */}
      {activeTab === 'PRODUCTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => (
            <div key={p.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{p.productName}</h3>
                <span className="text-sm font-bold text-emerald-400">{p.interestRate}% P.A.</span>
              </div>
              <p className="text-xs text-slate-400">{p.description}</p>
              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 text-xs text-slate-300 space-y-1">
                <p>Min – Max Amount: ₹{p.minAmount?.toLocaleString()} – ₹{p.maxAmount?.toLocaleString()}</p>
                <p>Min – Max Tenure: {p.minTenure} – {p.maxTenure} Months</p>
                <p>Processing Fee: {p.processingFee}%</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-xl font-bold text-white">System Audit Trails</h3>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-400">{log.username}</span> ({log.role}) — <span className="font-semibold text-white">{log.action}</span>
                  <p className="text-slate-400 mt-0.5">{log.details}</p>
                </div>
                <span className="text-slate-500">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Officer Modal */}
      <Modal isOpen={officerModalOpen} onClose={() => setOfficerModalOpen(false)} title="Register Loan Officer">
        <form onSubmit={handleCreateOfficer} className="space-y-4 text-sm">
          <div><label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label><input type="text" required value={officerData.name} onChange={(e) => setOfficerData({ ...officerData, name: e.target.value })} className="w-full px-3 py-2 rounded-xl glass-input" placeholder="Rajesh Kumar" /></div>
          <div><label className="block text-xs font-bold text-slate-300 mb-1">Email</label><input type="email" required value={officerData.email} onChange={(e) => setOfficerData({ ...officerData, email: e.target.value })} className="w-full px-3 py-2 rounded-xl glass-input" placeholder="officer2@loansphere.com" /></div>
          <div><label className="block text-xs font-bold text-slate-300 mb-1">Password</label><input type="password" required value={officerData.password} onChange={(e) => setOfficerData({ ...officerData, password: e.target.value })} className="w-full px-3 py-2 rounded-xl glass-input" /></div>
          <div><label className="block text-xs font-bold text-slate-300 mb-1">Mobile</label><input type="text" required value={officerData.mobile} onChange={(e) => setOfficerData({ ...officerData, mobile: e.target.value })} className="w-full px-3 py-2 rounded-xl glass-input" placeholder="9876543210" /></div>
          <div><label className="block text-xs font-bold text-slate-300 mb-1">Employee Code</label><input type="text" required value={officerData.employeeCode} onChange={(e) => setOfficerData({ ...officerData, employeeCode: e.target.value })} className="w-full px-3 py-2 rounded-xl glass-input" placeholder="OFF1002" /></div>
          <button type="submit" className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold">Create Officer</button>
        </form>
      </Modal>

      {/* Create Product Modal */}
      <Modal isOpen={productModalOpen} onClose={() => setProductModalOpen(false)} title="Create Loan Product">
        <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
          <div><label className="block text-xs font-bold text-slate-300 mb-1">Product Name</label><input type="text" required value={productData.productName} onChange={(e) => setProductData({ ...productData, productName: e.target.value })} className="w-full px-3 py-2 rounded-xl glass-input" placeholder="Gold Loan" /></div>
          <div><label className="block text-xs font-bold text-slate-300 mb-1">Description</label><input type="text" required value={productData.description} onChange={(e) => setProductData({ ...productData, description: e.target.value })} className="w-full px-3 py-2 rounded-xl glass-input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-slate-300 mb-1">Min Amount (₹)</label><input type="number" required value={productData.minAmount} onChange={(e) => setProductData({ ...productData, minAmount: e.target.value })} className="w-full px-3 py-2 rounded-xl glass-input" /></div>
            <div><label className="block text-xs font-bold text-slate-300 mb-1">Max Amount (₹)</label><input type="number" required value={productData.maxAmount} onChange={(e) => setProductData({ ...productData, maxAmount: e.target.value })} className="w-full px-3 py-2 rounded-xl glass-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-bold text-slate-300 mb-1">Interest Rate (% P.A.)</label><input type="number" step="0.1" required value={productData.interestRate} onChange={(e) => setProductData({ ...productData, interestRate: e.target.value })} className="w-full px-3 py-2 rounded-xl glass-input" /></div>
            <div><label className="block text-xs font-bold text-slate-300 mb-1">Processing Fee (%)</label><input type="number" step="0.1" required value={productData.processingFee} onChange={(e) => setProductData({ ...productData, processingFee: e.target.value })} className="w-full px-3 py-2 rounded-xl glass-input" /></div>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold">Save Loan Product</button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
