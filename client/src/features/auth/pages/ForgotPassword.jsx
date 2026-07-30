import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import Input from '../components/Input';
import LoadingButton from '../components/LoadingButton';
import FormError from '../components/FormError';
import FormSuccess from '../components/FormSuccess';

export function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [orgId, setOrgId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !orgId) {
      setErrorMsg('Please provide both email and Organization ID.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await forgotPassword(email, orgId);
      // Result returns confirmation message safely
      setSuccessMsg(result.message || 'If that account exists, a reset link has been dispatched.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Forgot Password</h1>
            <p className="text-sm text-text-secondary">
              Request reset instructions for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Organization ID"
              placeholder="e.g. 65db4f39e3f940a..."
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              disabled={isLoading}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />

            <FormError message={errorMsg} />
            <FormSuccess message={successMsg} />

            <LoadingButton isLoading={isLoading}>
              Send Recovery Email
            </LoadingButton>
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

export default ForgotPassword;
