import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import Input from '../components/Input';
import PasswordInput from '../components/PasswordInput';
import LoadingButton from '../components/LoadingButton';
import FormError from '../components/FormError';
import FormSuccess from '../components/FormSuccess';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgMode, setOrgMode] = useState('create'); // 'create' | 'join'
  const [orgName, setOrgName] = useState('');
  const [orgId, setOrgId] = useState('');

  // Flow State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [registeredOrgId, setRegisteredOrgId] = useState('');
  const [copied, setCopied] = useState(false);

  const copyOrgId = () => {
    if (registeredOrgId) {
      navigator.clipboard.writeText(registeredOrgId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Frontend validations
    if (name.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters.');
      return;
    }
    if (username.trim().length < 3) {
      setErrorMsg('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setErrorMsg('Username must be alphanumeric.');
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
    if (orgMode === 'create' && !orgName.trim()) {
      setErrorMsg('Please specify an Organization Name.');
      return;
    }
    if (orgMode === 'join' && !/^[a-f\d]{24}$/i.test(orgId)) {
      setErrorMsg('Please provide a valid 24-character Organization ID.');
      return;
    }

    const payload = {
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password,
      ...(orgMode === 'create' ? { organizationName: orgName.trim() } : { organizationId: orgId.trim() }),
    };

    setIsLoading(true);
    try {
      const result = await register(payload);
      const orgId = result?.membership?.organizationId || result?.data?.membership?.organizationId;
      setRegisteredOrgId(orgId || '');
      setSuccessMsg('Account created! Verification email sent.');
      setTimeout(() => navigate('/'), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthLayout>
      <AuthCard>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Create your account</h1>
            <p className="text-sm text-text-secondary">
              Get started with Nexora.ai today
            </p>
          </div>

          {/* Org Mode Toggle Switch */}
          <div className="flex p-1 rounded-xl bg-bg-tertiary border border-border-primary text-xs font-semibold select-none">
            <button
              type="button"
              onClick={() => {
                setOrgMode('create');
                setOrgId('');
              }}
              className={`flex-1 py-2 text-center rounded-lg cursor-pointer transition-colors ${
                orgMode === 'create'
                  ? 'bg-bg-secondary text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Create Org
            </button>
            <button
              type="button"
              onClick={() => {
                setOrgMode('join');
                setOrgName('');
              }}
              className={`flex-1 py-2 text-center rounded-lg cursor-pointer transition-colors ${
                orgMode === 'join'
                  ? 'bg-bg-secondary text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Join Org
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {orgMode === 'create' ? (
              <Input
                label="Organization Name"
                placeholder="e.g. Acme Corp"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                disabled={isLoading}
                required
              />
            ) : (
              <Input
                label="Organization ID"
                placeholder="e.g. 65db4f39e3f940a..."
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                disabled={isLoading}
                required
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Alex Miller"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
              <Input
                label="Username"
                placeholder="alexmiller"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />

            <FormError message={errorMsg} />

            {successMsg && registeredOrgId ? (
              <div className="space-y-3 p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5">
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="text-base">✅</span>
                  <span className="text-xs font-semibold">{successMsg}</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-tertiary mb-1.5 tracking-wider">Your Organization ID — Share with teammates</p>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-bg-tertiary border border-border-primary">
                    <span className="text-[11px] font-mono text-text-primary flex-1 break-all select-all">{registeredOrgId}</span>
                    <button
                      type="button"
                      onClick={copyOrgId}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border shrink-0 transition-all ${
                        copied
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-bg-secondary hover:bg-bg-primary text-text-secondary border-border-primary'
                      }`}
                    >
                      {copied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[10px] text-text-tertiary mt-1.5">Redirecting to workspace in a moment...</p>
                </div>
              </div>
            ) : (
              <>
                <FormSuccess message={successMsg} />
                <LoadingButton isLoading={isLoading}>
                  Sign Up for Workspace
                </LoadingButton>
              </>
            )}
          </form>

          <div className="text-center text-xs text-text-secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:text-brand-500 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export default Register;
