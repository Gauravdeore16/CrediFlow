import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import confetti from 'canvas-confetti';
import { Calendar, CreditCard, DollarSign, FileText, CheckCircle2, AlertCircle, ArrowLeft, Shield, Upload, Lock } from 'lucide-react';

const LoanDetailsView = () => {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [emis, setEmis] = useState([]);
  const [summary, setSummary] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedEmi, setSelectedEmi] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchLoanDetails();
  }, [id]);

  const fetchLoanDetails = async () => {
    try {
      const [loanRes, emisRes, summaryRes, docsRes] = await Promise.all([
        api.get(`/loans/${id}`),
        api.get(`/loans/${id}/emis`),
        api.get(`/loans/${id}/emi-summary`),
        api.get(`/loans/${id}/documents`),
      ]);

      setLoan(loanRes.data);
      setEmis(emisRes.data);
      setSummary(summaryRes.data);
      setDocuments(docsRes.data);
    } catch (err) {
      setError('Failed to load loan details.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentModal = (emi) => {
    setSelectedEmi(emi);
    setPaymentModalOpen(true);
  };

  const handleExecutePayment = async () => {
    if (!selectedEmi) return;
    setPaying(true);

    try {
      await api.post('/payments', {
        loanId: parseInt(id),
        emiId: selectedEmi.id,
        amount: selectedEmi.emiAmount,
        paymentMethod: paymentMethod
      });

      // Celebration effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setPaymentModalOpen(false);
      fetchLoanDetails(); // refresh EMI status & balances
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading loan records...</div>;
  }

  if (!loan) {
    return <div className="p-8 text-center text-rose-400">Loan record not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to="/customer/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white">Loan #{loan.loanNumber}</h1>
            <Badge status={loan.status} />
          </div>
          <p className="text-slate-400 text-sm mt-1">{loan.loanProduct?.productName} • Purpose: {loan.purpose}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Approved / Requested Principal</p>
          <p className="text-3xl font-extrabold text-emerald-400">
            ₹{(loan.approvedAmount || loan.requestedAmount)?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* EMI Summary Metrics if Disbursed */}
      {summary && summary.totalTenureMonths > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <p className="text-xs text-slate-400 font-semibold uppercase">Monthly EMI</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">₹{summary.monthlyEmi?.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <p className="text-xs text-slate-400 font-semibold uppercase">Remaining Balance</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">₹{summary.remainingPrincipal?.toLocaleString()}</p>
          </div>
          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <p className="text-xs text-slate-400 font-semibold uppercase">EMIs Paid / Total</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{summary.paidEmisCount} / {summary.totalTenureMonths}</p>
          </div>
          <div className="p-5 rounded-2xl glass-card border border-white/10">
            <p className="text-xs text-slate-400 font-semibold uppercase">Next EMI Due</p>
            <p className="text-xl font-bold text-purple-400 mt-1">{summary.nextEmiDueDate || 'All Paid'}</p>
          </div>
        </div>
      )}

      {/* Officer Remarks */}
      {loan.remarks && (
        <div className="p-4 rounded-2xl bg-blue-900/20 border border-blue-500/30 text-sm text-blue-200">
          <strong>Officer Remarks:</strong> {loan.remarks}
        </div>
      )}

      {/* EMI Repayment Schedule */}
      {emis.length > 0 && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">EMI Repayment Schedule</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 px-4">#</th>
                  <th className="pb-3 px-4">Due Date</th>
                  <th className="pb-3 px-4">Principal</th>
                  <th className="pb-3 px-4">Interest</th>
                  <th className="pb-3 px-4">Total EMI</th>
                  <th className="pb-3 px-4">Remaining Bal</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {emis.map((e) => (
                  <tr key={e.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-300">#{e.emiNumber}</td>
                    <td className="py-3 px-4 text-white">{e.dueDate}</td>
                    <td className="py-3 px-4 text-slate-300">₹{e.principalAmount?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-400">₹{e.interestAmount?.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-blue-400">₹{e.emiAmount?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-300">₹{e.remainingPrincipal?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge status={e.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {e.status === 'PENDING' ? (
                        <button
                          onClick={() => handleOpenPaymentModal(e)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md glow-emerald transition-colors"
                        >
                          Pay EMI
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold">Paid on {e.paidDate}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mock Payment Gateway Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Mock Payment Gateway"
      >
        {selectedEmi && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 text-center">
              <p className="text-xs text-slate-400 uppercase">Payment for EMI #{selectedEmi.emiNumber}</p>
              <p className="text-4xl font-extrabold text-emerald-400 mt-1">₹{selectedEmi.emiAmount?.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Due Date: {selectedEmi.dueDate}</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-3">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {['UPI', 'CARD', 'NET_BANKING'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-3 rounded-xl border font-bold text-xs transition-colors ${
                      paymentMethod === method
                        ? 'bg-blue-600/30 border-blue-500 text-blue-300 glow-blue'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {method.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleExecutePayment}
              disabled={paying}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-base shadow-lg glow-emerald"
            >
              {paying ? 'Processing Gateway Transaction...' : `Pay ₹${selectedEmi.emiAmount?.toLocaleString()} Now`}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoanDetailsView;
