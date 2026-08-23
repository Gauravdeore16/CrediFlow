import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    dateOfBirth: '1995-06-15',
    gender: 'MALE',
    address: '123 Park Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    panNumber: 'ABCDE1234F',
    employmentType: 'SALARIED',
    monthlyIncome: '45000',
    role: 'CUSTOMER'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/customer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Create Customer Account</h2>
          <p className="text-sm text-slate-400 mt-1">Register to apply for instant loans and track monthly EMIs</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Gaurav Sharma"
                className="w-full px-4 py-2.5 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="gaurav@example.com"
                className="w-full px-4 py-2.5 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Password *</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Mobile Number *</label>
              <input
                type="text"
                name="mobile"
                required
                value={formData.mobile}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full px-4 py-2.5 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">PAN Number *</label>
              <input
                type="text"
                name="panNumber"
                required
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                className="w-full px-4 py-2.5 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Monthly Income (₹) *</label>
              <input
                type="number"
                name="monthlyIncome"
                required
                value={formData.monthlyIncome}
                onChange={handleChange}
                placeholder="45000"
                className="w-full px-4 py-2.5 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Employment Type</label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl glass-input bg-slate-900"
              >
                <option value="SALARIED">SALARIED</option>
                <option value="SELF_EMPLOYED">SELF EMPLOYED</option>
                <option value="BUSINESS">BUSINESS OWNER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl glass-input bg-slate-900"
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition-all shadow-lg glow-blue disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
