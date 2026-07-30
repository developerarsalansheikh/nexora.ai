import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertOctagon } from 'react-icons/fi';
import LoadingButton from '../components/LoadingButton';

export function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary px-6 relative overflow-hidden">
      {/* Decors */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-brand-500/5 to-indigo-500/5 blur-[120px] pointer-events-none z-0" />
      
      <div className="text-center space-y-6 max-w-md z-10">
        <div className="flex justify-center">
          <div className="p-4 rounded-full border border-red-500/20 bg-red-500/5 text-red-500">
            <FiAlertOctagon size={48} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">403 — Unauthorized</h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            You do not have the required permissions or role status to access this page. Please contact your organization administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border-primary hover:bg-bg-secondary text-sm font-semibold transition-colors cursor-pointer"
          >
            Go Back
          </button>
          <LoadingButton className="flex-1" onClick={() => navigate('/')}>
            Go Home
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
