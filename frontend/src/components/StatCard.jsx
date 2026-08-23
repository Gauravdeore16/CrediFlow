import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colorMap = {
    blue: 'from-blue-600/20 to-blue-900/10 text-blue-400 border-blue-500/20 glow-blue',
    emerald: 'from-emerald-600/20 to-emerald-900/10 text-emerald-400 border-emerald-500/20 glow-emerald',
    purple: 'from-purple-600/20 to-purple-900/10 text-purple-400 border-purple-500/20 glow-purple',
    amber: 'from-amber-600/20 to-amber-900/10 text-amber-400 border-amber-500/20',
    rose: 'from-rose-600/20 to-rose-900/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className={`p-6 rounded-2xl glass-card bg-gradient-to-br ${colorMap[color]} transition-all duration-300 hover:-translate-y-1 hover:border-white/20`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-white mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-current backdrop-blur-md">
            <Icon className="w-7 h-7" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
