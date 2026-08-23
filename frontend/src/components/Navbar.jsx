import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, User, Landmark, LayoutDashboard, FileText, CreditCard, Users, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isCustomer, isOfficer, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">
                CrediFlow
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-blue-400 -mt-1">
                Loan & EMI Management
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {!user && (
              <>
                <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Home
                </Link>
                <Link to="/#products" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Loan Products
                </Link>
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 glow-blue"
                >
                  Apply Now
                </Link>
              </>
            )}

            {user && isCustomer() && (
              <>
                <Link to="/customer/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  <LayoutDashboard className="w-4 h-4 text-blue-400" />
                  Dashboard
                </Link>
                <Link to="/customer/apply" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Apply Loan
                </Link>
                <Link to="/customer/profile" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  <User className="w-4 h-4 text-purple-400" />
                  My Profile
                </Link>
              </>
            )}

            {user && isOfficer() && !isAdmin() && (
              <>
                <Link to="/officer/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Officer Console
                </Link>
              </>
            )}

            {user && isAdmin() && (
              <>
                <Link to="/admin/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  <Settings className="w-4 h-4 text-rose-400" />
                  Admin Control Center
                </Link>
              </>
            )}
          </div>

          {/* User Profile & Actions */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-white leading-tight">{user.name}</p>
                  <span className="inline-block text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {user.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
