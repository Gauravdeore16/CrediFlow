import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ShieldCheck, ArrowRight, CheckCircle2, DollarSign, Percent, Calendar, Sparkles, Building, Car, GraduationCap, Briefcase } from 'lucide-react';

const Home = () => {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(11.5);
  const [tenureMonths, setTenureMonths] = useState(36);

  // EMI Math Calculation
  const calculateEmi = () => {
    const p = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 12 / 100;
    const n = parseInt(tenureMonths);

    if (!p || !r || !n) return 0;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const emi = calculateEmi();
  const totalPayable = emi * tenureMonths;
  const totalInterest = totalPayable - loanAmount;

  const products = [
    {
      id: 1,
      name: 'Personal Loan',
      icon: Briefcase,
      rate: '11.5%',
      amount: '₹50,000 – ₹10,00,000',
      tenure: '12 – 60 Months',
      fee: '1.5%',
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30',
      badge: 'Most Popular'
    },
    {
      id: 2,
      name: 'Home Loan',
      icon: Building,
      rate: '8.5%',
      amount: '₹5,00,000 – ₹1,00,00,000',
      tenure: '60 – 360 Months',
      fee: '1.0%',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      badge: 'Low Rate'
    },
    {
      id: 3,
      name: 'Vehicle Loan',
      icon: Car,
      rate: '9.5%',
      amount: '₹1,00,000 – ₹25,00,000',
      tenure: '12 – 84 Months',
      fee: '1.2%',
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30',
      badge: 'Instant Approval'
    },
    {
      id: 4,
      name: 'Education Loan',
      icon: GraduationCap,
      rate: '7.5%',
      amount: '₹50,000 – ₹30,00,000',
      tenure: '12 – 120 Months',
      fee: '0.5%',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
      badge: 'Student Friendly'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-blue-500/30 text-blue-400 text-sm font-semibold mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen Enterprise Banking & EMI Management</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent leading-[1.1]">
              Smart Loans. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Seamless EMI Tracking.
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-400 leading-relaxed font-normal">
              Apply for instant personal, home, vehicle, and education loans with automated eligibility verification, digital document submission, and real-time EMI repayment schedules.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-base hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 glow-blue flex items-center gap-2"
              >
                Apply for a Loan <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/login"
                className="px-8 py-4 rounded-xl glass-panel border border-white/15 text-white font-bold text-base hover:bg-white/10 transition-colors"
              >
                Account Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* EMI Calculator Section */}
      <section className="py-16 relative border-t border-white/10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white">Interactive EMI Calculator</h2>
            <p className="text-slate-400 mt-2">Estimate your monthly payments before applying</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 glass-panel p-8 rounded-3xl border border-white/10">
            {/* Input Controls */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-300">Loan Amount (Principal)</label>
                  <span className="text-lg font-bold text-blue-400">₹{parseInt(loanAmount).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="5000000"
                  step="25000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-300">Interest Rate (Annual %)</label>
                  <span className="text-lg font-bold text-emerald-400">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="24"
                  step="0.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-300">Tenure (Months)</label>
                  <span className="text-lg font-bold text-purple-400">{tenureMonths} Months ({Math.round(tenureMonths / 12)} Yrs)</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="120"
                  step="6"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(e.target.value)}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>

            {/* EMI Summary Card */}
            <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-blue-500/20 flex flex-col justify-between bg-gradient-to-br from-blue-950/40 to-slate-900">
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Estimated Monthly EMI</p>
                <h3 className="text-4xl font-extrabold text-blue-400 mt-2">₹{emi.toLocaleString()}</h3>

                <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Principal Amount:</span>
                    <span className="font-semibold text-white">₹{parseInt(loanAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Interest Payable:</span>
                    <span className="font-semibold text-amber-400">₹{Math.max(0, Math.round(totalInterest)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Amount Payable:</span>
                    <span className="font-semibold text-emerald-400">₹{Math.max(0, Math.round(totalPayable)).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/register"
                className="mt-8 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-center block transition-colors shadow-lg shadow-blue-600/30"
              >
                Proceed with Application
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Products Section */}
      <section id="products" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white">Our Tailored Loan Products</h2>
          <p className="text-slate-400 mt-3 max-w-2xl mx-auto">Flexible loan amounts and competitive interest rates tailored to your financial goals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const IconComponent = p.icon;
            return (
              <div key={p.id} className={`glass-panel p-6 rounded-2xl border bg-gradient-to-br ${p.color} flex flex-col justify-between hover:-translate-y-1 transition-all duration-300`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
                  <div className="space-y-2 text-sm text-slate-300 mb-6">
                    <p><strong className="text-white">Interest Rate:</strong> {p.rate}</p>
                    <p><strong className="text-white">Amount:</strong> {p.amount}</p>
                    <p><strong className="text-white">Tenure:</strong> {p.tenure}</p>
                    <p><strong className="text-white">Processing Fee:</strong> {p.fee}</p>
                  </div>
                </div>

                <Link
                  to="/register"
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-center block transition-colors"
                >
                  Apply Now
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
