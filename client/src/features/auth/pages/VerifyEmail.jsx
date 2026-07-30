import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import FormError from '../components/FormError';
import FormSuccess from '../components/FormSuccess';
import LoadingButton from '../components/LoadingButton';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('No verification token was provided in the link. Please request a new verification link.');
      return;
    }

    const performVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMsg(err.message || 'Verification failed. The token may be invalid or expired.');
      }
    };

    performVerification();
  }, [token, verifyEmail]);

  return (
    <AuthLayout>
      <AuthCard>
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Verify your email</h1>
            <p className="text-sm text-text-secondary">
              Completing your Nexora.ai authentication
            </p>
          </div>

          {status === 'verifying' && (
            <div className="py-8 flex flex-col items-center justify-center gap-3">
              <svg
                className="animate-spin h-8 w-8 text-brand-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-xs text-text-secondary tracking-wide animate-pulse">
                Validating signature token...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <FormError message={errorMsg} />
              <LoadingButton onClick={() => navigate('/login')}>
                Back to Sign in
              </LoadingButton>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <FormSuccess message="Email verified successfully! You can now log in to your account." />
              <LoadingButton onClick={() => navigate('/login')}>
                Sign in to workspace
              </LoadingButton>
            </div>
          )}
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export default VerifyEmail;
