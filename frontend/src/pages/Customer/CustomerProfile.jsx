import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Save, AlertCircle, CheckCircle } from 'lucide-react';

const CustomerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/customers/profile');
      setProfile(res.data);
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');

    try {
      await api.put('/customers/profile', profile);
      setMsg('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass-panel p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Customer Profile</h1>
            <p className="text-sm text-slate-400">Manage your contact, address, and income details</p>
          </div>
        </div>

        {msg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{msg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {profile && (
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email (Read Only)</label>
              <input
                type="email"
                disabled
                value={profile.email || ''}
                className="w-full px-4 py-2.5 rounded-xl glass-input opacity-60 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Mobile Number</label>
              <input
                type="text"
                value={profile.mobile || ''}
                onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">PAN Number</label>
              <input
                type="text"
                value={profile.panNumber || ''}
                onChange={(e) => setProfile({ ...profile, panNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Monthly Income (₹)</label>
              <input
                type="number"
                value={profile.monthlyIncome || ''}
                onChange={(e) => setProfile({ ...profile, monthlyIncome: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Employment Type</label>
              <input
                type="text"
                value={profile.employmentType || ''}
                onChange={(e) => setProfile({ ...profile, employmentType: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Address</label>
              <input
                type="text"
                value={profile.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input"
              />
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg glow-blue flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Profile Updates
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;
