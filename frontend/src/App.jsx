import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <footer className="glass-panel border-t border-white/10 py-6 text-center text-xs text-slate-400">
            <p>© 2026 CrediFlow – Loan Processing & EMI Management System. Built with Spring Boot & React.</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
