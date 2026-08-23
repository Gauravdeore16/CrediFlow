import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CheckCircle, AlertCircle, Upload, ArrowRight, ArrowLeft, ShieldCheck, DollarSign, Calculator } from 'lucide-react';

const ApplyLoan = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [requestedAmount, setRequestedAmount] = useState(200000);
  const [tenureMonths, setTenureMonths] = useState(24);
  const [purpose, setPurpose] = useState('Home renovation and personal expenses');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdLoan, setCreatedLoan] = useState(null);

  // Document Upload States
  const [panFile, setPanFile] = useState(null);
  const [salaryFile, setSalaryFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/loan-products');
      setProducts(res.data);
      if (res.data.length > 0) {
        setSelectedProduct(res.data[0]);
      }
    } catch (err) {
      setError('Failed to load loan products.');
    }
  };

  const calculateEmi = () => {
    if (!selectedProduct) return 0;
    const p = parseFloat(requestedAmount);
    const r = parseFloat(selectedProduct.interestRate) / 12 / 100;
    const n = parseInt(tenureMonths);

    if (!p || !r || !n) return 0;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/loans', {
        loanProductId: selectedProduct.id,
        requestedAmount: parseFloat(requestedAmount),
        tenureMonths: parseInt(tenureMonths),
        purpose: purpose
      });
      setCreatedLoan(res.data);
      setStep(3); // Move to Document Upload step
    } catch (err) {
      setError(err.response?.data?.message || 'Loan application submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!createdLoan) return;
    setUploading(true);

    try {
      if (panFile) {
        const formData = new FormData();
        formData.append('documentType', 'PAN');
        formData.append('file', panFile);
        await api.post(`/loans/${createdLoan.id}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (salaryFile) {
        const formData = new FormData();
        formData.append('documentType', 'SALARY_SLIP');
        formData.append('file', salaryFile);
        await api.post(`/loans/${createdLoan.id}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setUploadSuccess(true);
      setTimeout(() => {
        navigate(`/customer/loans/${createdLoan.id}`);
      }, 1500);
    } catch (err) {
      setError('Failed to upload document files.');
    } finally {
      setUploading(false);
    }
  };

  const emi = calculateEmi();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 glass-panel p-4 rounded-2xl border border-white/10">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
          <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-sm">1</span>
          <span>Product & Terms</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-800"></div>
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
          <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-sm">2</span>
          <span>Review Application</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-800"></div>
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
          <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-sm">3</span>
          <span>Upload Documents</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Select Product & Configure Amount */}
      {step === 1 && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-8">
          <h2 className="text-2xl font-extrabold text-white">Select Loan Product</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProduct(p);
                  setRequestedAmount(p.minAmount);
                }}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  selectedProduct?.id === p.id
                    ? 'bg-blue-600/20 border-blue-500 glow-blue'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg text-white">{p.productName}</h3>
                  <span className="text-xs font-bold text-emerald-400">{p.interestRate}% P.A.</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{p.description}</p>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>Min – Max Amount: ₹{p.minAmount?.toLocaleString()} – ₹{p.maxAmount?.toLocaleString()}</p>
                  <p>Tenure: {p.minTenure} – {p.maxTenure} Months</p>
                </div>
              </div>
            ))}
          </div>

          {selectedProduct && (
            <div className="pt-6 border-t border-white/10 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-300">Requested Amount (₹)</label>
                  <span className="text-lg font-bold text-emerald-400">₹{parseInt(requestedAmount).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={selectedProduct.minAmount}
                  max={selectedProduct.maxAmount}
                  step="10000"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-300">Tenure (Months)</label>
                  <span className="text-lg font-bold text-purple-400">{tenureMonths} Months</span>
                </div>
                <input
                  type="range"
                  min={selectedProduct.minTenure}
                  max={selectedProduct.maxTenure}
                  step="6"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(e.target.value)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Calculated Monthly EMI</p>
                  <p className="text-2xl font-bold text-blue-400">₹{emi.toLocaleString()} / mo</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Purpose & Submission */}
      {step === 2 && selectedProduct && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
          <button
            onClick={() => setStep(1)}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Product Selection
          </button>

          <h2 className="text-2xl font-extrabold text-white">Review Loan Terms & Purpose</h2>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Selected Product:</span><span className="font-bold text-white">{selectedProduct.productName}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Requested Amount:</span><span className="font-bold text-emerald-400">₹{parseInt(requestedAmount).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Interest Rate:</span><span className="font-bold text-white">{selectedProduct.interestRate}% P.A.</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Tenure:</span><span className="font-bold text-white">{tenureMonths} Months</span></div>
            <div className="flex justify-between pt-2 border-t border-white/10"><span className="text-slate-400">Estimated Monthly EMI:</span><span className="font-bold text-blue-400 text-base">₹{emi.toLocaleString()}</span></div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Loan Purpose / Reason</label>
            <textarea
              rows="3"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-4 rounded-xl glass-input"
              placeholder="State the purpose for borrowing..."
            ></textarea>
          </div>

          <button
            onClick={handleApply}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg glow-blue disabled:opacity-50"
          >
            {loading ? 'Submitting Application...' : 'Submit Application & Proceed to Uploads'}
          </button>
        </div>
      )}

      {/* Step 3: Document Uploads */}
      {step === 3 && createdLoan && (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-bold text-base">Application Submitted Successfully!</p>
              <p className="text-xs">Loan Reference ID: <strong>{createdLoan.loanNumber}</strong></p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white">Upload Verification Documents</h2>
          <p className="text-sm text-slate-400">Upload clear scanned copies of your PAN card and Salary slip for officer verification.</p>

          <form onSubmit={handleDocumentUpload} className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
              <label className="block text-sm font-bold text-white mb-2">1. PAN Card Document</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setPanFile(e.target.files[0])}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
              />
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-white/10">
              <label className="block text-sm font-bold text-white mb-2">2. Salary Slip / Bank Statement</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setSalaryFile(e.target.files[0])}
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
              />
            </div>

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 text-sm font-bold text-center">
                Documents uploaded! Redirecting to loan details...
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-lg glow-emerald"
              >
                {uploading ? 'Uploading Files...' : 'Upload & Finish'}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/customer/loans/${createdLoan.id}`)}
                className="px-6 py-3.5 rounded-xl glass-panel border border-white/15 text-slate-300 hover:text-white font-bold text-sm"
              >
                Skip for Now
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ApplyLoan;
