import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { ShieldCheck, FileCheck, CheckCircle, XCircle, DollarSign, Search, Filter, Eye, AlertCircle } from 'lucide-react';

const OfficerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loans, setLoans] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loanDocs, setLoanDocs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Approval Form State
  const [approvedAmount, setApprovedAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [tenureMonths, setTenureMonths] = useState('');
  const [processingFee, setProcessingFee] = useState('');
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOfficerData();
  }, []);

  const fetchOfficerData = async () => {
    try {
      const [statsRes, loansRes] = await Promise.all([
        api.get('/officer/dashboard'),
        api.get('/officer/loans'),
      ]);
      setStats(statsRes.data);
      setLoans(loansRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenReview = async (loan) => {
    setSelectedLoan(loan);
    setApprovedAmount(loan.approvedAmount || loan.requestedAmount);
    setInterestRate(loan.interestRate || loan.loanProduct?.interestRate);
    setTenureMonths(loan.tenureMonths);
    setProcessingFee(loan.processingFee || loan.loanProduct?.processingFee);
    setRemarks(loan.remarks || '');

    try {
      const docsRes = await api.get(`/loans/${loan.id}/documents`);
      setLoanDocs(docsRes.data);
    } catch (e) {
      setLoanDocs([]);
    }

    setModalOpen(true);
  };

  const handleVerifyDocument = async (docId, status) => {
    try {
      await api.put(`/documents/${docId}/verify`, { status });
      const docsRes = await api.get(`/loans/${selectedLoan.id}/documents`);
      setLoanDocs(docsRes.data);
    } catch (e) {
      alert('Failed to update document status');
    }
  };

  const handleApprove = async () => {
    if (!selectedLoan) return;
    setActionLoading(true);
    try {
      await api.put(`/officer/loans/${selectedLoan.id}/approve`, {
        approvedAmount: parseFloat(approvedAmount),
        interestRate: parseFloat(interestRate),
        tenureMonths: parseInt(tenureMonths),
        processingFee: parseFloat(processingFee),
        remarks: remarks
      });
      setModalOpen(false);
      fetchOfficerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedLoan) return;
    setActionLoading(true);
    try {
      await api.put(`/officer/loans/${selectedLoan.id}/reject`, { remarks });
      setModalOpen(false);
      fetchOfficerData();
    } catch (err) {
      alert('Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisburse = async () => {
    if (!selectedLoan) return;
    setActionLoading(true);
    try {
      await api.put(`/officer/loans/${selectedLoan.id}/disburse`);
      setModalOpen(false);
      fetchOfficerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Disbursement failed');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLoans = loans.filter((l) => {
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesSearch =
      l.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customer?.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex justify-between items-center bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Loan Officer Control Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Review customer applications, verify uploaded documents, approve terms, and trigger disbursement.</p>
        </div>
      </div>

      {/* Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Total Apps" value={stats.totalApplications} icon={FileCheck} color="blue" />
          <StatCard title="Verification" value={stats.pendingVerification} icon={ShieldCheck} color="amber" />
          <StatCard title="Pending Appr" value={stats.pendingApproval} icon={AlertCircle} color="purple" />
          <StatCard title="Approved" value={stats.approvedCount} icon={CheckCircle} color="emerald" />
          <StatCard title="Rejected" value={stats.rejectedCount} icon={XCircle} color="rose" />
          <StatCard title="Disbursed" value={stats.disbursedCount} icon={DollarSign} color="emerald" />
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Loan # or Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-sm"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10">
            {['ALL', 'SUBMITTED', 'DOCUMENT_VERIFICATION', 'APPROVED', 'DISBURSED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 px-4">Loan No</th>
                <th className="pb-3 px-4">Customer Name</th>
                <th className="pb-3 px-4">Monthly Income</th>
                <th className="pb-3 px-4">Product</th>
                <th className="pb-3 px-4">Requested Amt</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredLoans.map((l) => (
                <tr key={l.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-4 font-bold text-white">{l.loanNumber}</td>
                  <td className="py-4 px-4 text-slate-300 font-medium">{l.customer?.user?.name}</td>
                  <td className="py-4 px-4 text-slate-300">₹{l.customer?.monthlyIncome?.toLocaleString()}</td>
                  <td className="py-4 px-4 text-slate-400">{l.loanProduct?.productName}</td>
                  <td className="py-4 px-4 font-semibold text-emerald-400">₹{l.requestedAmount?.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <Badge status={l.status} />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleOpenReview(l)}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" /> Review / Decision
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Review & Decision Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedLoan ? `Review Application — ${selectedLoan.loanNumber}` : 'Loan Review'}
        maxWidth="max-w-3xl"
      >
        {selectedLoan && (
          <div className="space-y-6 text-sm">
            {/* Customer & Income Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900 border border-white/10">
              <div><p className="text-xs text-slate-400">Applicant Name</p><p className="font-bold text-white">{selectedLoan.customer?.user?.name}</p></div>
              <div><p className="text-xs text-slate-400">Monthly Income</p><p className="font-bold text-emerald-400">₹{selectedLoan.customer?.monthlyIncome?.toLocaleString()}</p></div>
              <div><p className="text-xs text-slate-400">Employment Type</p><p className="font-bold text-white">{selectedLoan.customer?.employmentType}</p></div>
              <div><p className="text-xs text-slate-400">PAN Number</p><p className="font-bold text-white">{selectedLoan.customer?.panNumber}</p></div>
              <div><p className="text-xs text-slate-400">Requested Amount</p><p className="font-bold text-blue-400">₹{selectedLoan.requestedAmount?.toLocaleString()}</p></div>
              <div><p className="text-xs text-slate-400">Tenure</p><p className="font-bold text-white">{selectedLoan.tenureMonths} Months</p></div>
            </div>

            {/* Document Verification Section */}
            <div>
              <h4 className="font-bold text-white mb-2">Uploaded Verification Documents</h4>
              {loanDocs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No document uploads found for this application.</p>
              ) : (
                <div className="space-y-2">
                  {loanDocs.map((d) => (
                    <div key={d.id} className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{d.documentType}</p>
                        <p className="text-xs text-slate-400">{d.fileName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge status={d.verificationStatus} />
                        <button
                          onClick={() => handleVerifyDocument(d.id, 'VERIFIED')}
                          className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleVerifyDocument(d.id, 'REJECTED')}
                          className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 text-xs font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Terms & Approval Form */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <h4 className="font-bold text-white">Officer Approval & Term Adjustments</h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Approved Amount (₹)</label>
                  <input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Interest Rate (% P.A.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Officer Remarks / Comments</label>
                <textarea
                  rows="2"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input"
                  placeholder="Verification comments..."
                ></textarea>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md"
              >
                Approve Loan
              </button>

              {selectedLoan.status === 'APPROVED' && (
                <button
                  onClick={handleDisburse}
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-md glow-blue"
                >
                  Disburse Loan Funds
                </button>
              )}

              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md"
              >
                Reject Application
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OfficerDashboard;
