import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import PasswordInput from '../components/PasswordInput';
import LoadingButton from '../components/LoadingButton';
import FormError from '../components/FormError';
import FormSuccess from '../components/FormSuccess';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!token) {
      setErrorMsg('Invalid or missing password reset token.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setErrorMsg('Password must contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(token, password);
      setSuccessMsg(result.message || 'Password has been reset successfully.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Reset Password</h1>
            <p className="text-sm text-text-secondary">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput
              label="New Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />

            <PasswordInput
              label="Confirm New Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />

            <FormError message={errorMsg} />
            <FormSuccess message={successMsg} />

            {!successMsg && (
              <LoadingButton isLoading={isLoading}>
                Update Password
              </LoadingButton>
            )}
          </form>

          <div className="text-center">
            <Link
              to="/login"
              className="text-xs font-semibold text-brand-600 hover:text-brand-500 tracking-wide transition-colors"
            >
              Return to login
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export default ResetPassword;
