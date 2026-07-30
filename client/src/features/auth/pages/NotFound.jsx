import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHelpCircle } from 'react-icons/fi';
import LoadingButton from '../components/LoadingButton';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary px-6 relative overflow-hidden">
      {/* Decors */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-brand-500/5 to-indigo-500/5 blur-[120px] pointer-events-none z-0" />
      
      <div className="text-center space-y-6 max-w-md z-10">
        <div className="flex justify-center">
          <div className="p-4 rounded-full border border-border-primary bg-bg-secondary text-brand-500">
            <FiHelpCircle size={48} />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">404 — Not Found</h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            The page you are looking for does not exist, or has been moved. Check the URL or click below to return home.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg border border-border-primary hover:bg-bg-secondary text-sm font-semibold transition-colors cursor-pointer"
          >
            Go Back
          </button>
          <LoadingButton className="px-6" onClick={() => navigate('/')}>
            Go Home
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
