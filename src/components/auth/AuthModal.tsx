import React, { useState } from 'react';
import { Shield, User, Lock, Mail, CheckCircle2, Sparkles, Building, ArrowRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup, loginAsDemoRole } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Community Reporter');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (isSignUp) {
      signup(name || 'Community Member', email, role);
    } else {
      login(email, role);
    }
    onClose();
  };

  const handleDemoClick = (demoRole: UserRole) => {
    loginAsDemoRole(demoRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {isSignUp ? 'Create MtaaWatch Account' : 'Sign in to MtaaWatch AI'}
              </h3>
              <p className="text-[11px] text-slate-500">Citizen & Municipal Access Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Demo Login Options for Hackathon Judges (Requirement 3.B) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-600" />
              1-Click Demo Logins for Judges:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoClick('Administrator')}
              className="p-2 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 text-left transition-colors cursor-pointer group"
            >
              <div className="font-bold text-slate-900 text-xs group-hover:text-teal-700">Admin</div>
              <div className="text-[10px] text-slate-400">Dr. Anne (County)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('Authority Officer')}
              className="p-2 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 text-left transition-colors cursor-pointer group"
            >
              <div className="font-bold text-slate-900 text-xs group-hover:text-teal-700">Officer</div>
              <div className="text-[10px] text-slate-400">Eng. Dennis (KURA)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoClick('Community Reporter')}
              className="p-2 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 text-left transition-colors cursor-pointer group"
            >
              <div className="font-bold text-slate-900 text-xs group-hover:text-teal-700">Citizen</div>
              <div className="text-[10px] text-slate-400">Grace (Ruiru)</div>
            </button>
          </div>
        </div>

        {/* Standard Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samuel Maina"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.ke"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select User Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white font-medium"
            >
              <option value="Community Reporter">Community Reporter (Citizen)</option>
              <option value="Authority Officer">Authority Officer (KURA, NCWSC, County)</option>
              <option value="Administrator">Administrator (Oversight & Dispatch)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>{isSignUp ? 'Create Account & Sign In' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-teal-700 hover:underline font-semibold cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};
