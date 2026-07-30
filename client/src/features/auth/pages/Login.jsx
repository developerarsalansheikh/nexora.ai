import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import Input from '../components/Input';
import PasswordInput from '../components/PasswordInput';
import LoadingButton from '../components/LoadingButton';
import FormError from '../components/FormError';
import FormSuccess from '../components/FormSuccess';
import { FiMail, FiHash } from 'react-icons/fi';
import { useUI } from '../../../providers/UIProvider';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useUI();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgId, setOrgId] = useState(() => localStorage.getItem('nexora_org_id') || '');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password || !orgId) {
      setErrorMsg('All fields, including Organization ID, are required.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, orgId);
      setSuccessMsg('Logged in successfully! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Invalid credentials or organization.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        {/* Heading */}
        <div className="text-center mb-7">
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
          >
            Welcome back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.4 }}
            className="text-sm mt-1.5"
            style={{ color: isDark ? 'rgba(148,163,184,0.8)' : 'rgba(51,65,85,0.65)' }}
          >
            Sign in to your Nexora workspace
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Org ID */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22, duration: 0.35 }}
          >
            <Input
              label="Organization ID"
              id="login-org-id"
              icon={FiHash}
              placeholder="Your 24-character Organization ID"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              disabled={isLoading}
              required
            />
            {orgId ? (
              <p className="text-[11px] mt-1.5 pl-1 flex items-center gap-1 font-medium"
                style={{ color: '#7c3aed' }}>
                <span>✓</span> Auto-filled from saved session
              </p>
            ) : (
              <p className="text-[11px] mt-1.5 pl-1"
                style={{ color: isDark ? 'rgba(100,116,139,0.8)' : 'rgba(100,116,139,0.7)' }}>
                Found in registration email or workspace settings
              </p>
            )}
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28, duration: 0.35 }}
          >
            <Input
              label="Email Address"
              id="login-email"
              type="email"
              icon={FiMail}
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.34, duration: 0.35 }}
          >
            <div className="flex justify-between items-center mb-2">
              <label
                className="text-[11px] font-bold tracking-widest uppercase"
                style={{ color: isDark ? 'rgba(148,163,184,0.9)' : 'rgba(51,65,85,0.8)' }}
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold transition-colors hover:underline"
                style={{ color: '#7c3aed' }}
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="login-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </motion.div>

          <FormError message={errorMsg} />
          <FormSuccess message={successMsg} />

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.35 }}
            className="pt-1"
          >
            <LoadingButton isLoading={isLoading} id="login-submit-btn">
              Sign In to Workspace
            </LoadingButton>
          </motion.div>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div
            className="flex-1 h-px"
            style={{ background: isDark ? 'rgba(167,139,250,0.12)' : 'rgba(99,60,220,0.1)' }}
          />
          <span
            className="text-[11px] font-medium"
            style={{ color: isDark ? 'rgba(100,116,139,0.7)' : 'rgba(100,116,139,0.6)' }}
          >
            or
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: isDark ? 'rgba(167,139,250,0.12)' : 'rgba(99,60,220,0.1)' }}
          />
        </div>

        {/* Register link */}
        <p
          className="text-center text-sm"
          style={{ color: isDark ? 'rgba(148,163,184,0.7)' : 'rgba(51,65,85,0.6)' }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold transition-colors hover:underline"
            style={{ color: '#7c3aed' }}
          >
            Create account →
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

export default Login;
