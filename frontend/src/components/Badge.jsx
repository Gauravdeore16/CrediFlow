import React from 'react';

const Badge = ({ status }) => {
  const getBadgeStyle = (s) => {
    switch (s) {
      case 'APPROVED':
      case 'PAID':
      case 'VERIFIED':
      case 'SUCCESS':
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'DISBURSED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'DOCUMENT_VERIFICATION':
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'REJECTED':
      case 'FAILED':
      case 'OVERDUE':
      case 'INACTIVE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'CLOSED':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  const formatText = (text) => {
    if (!text) return '';
    return text.replace(/_/g, ' ');
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getBadgeStyle(status)} backdrop-blur-sm inline-flex items-center gap-1.5`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {formatText(status)}
    </span>
  );
};

export default Badge;
