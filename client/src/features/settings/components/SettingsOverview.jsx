import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useMyOrganizations, useUpdateOrganization } from '../../organizations/api/useOrganizations';

const TABS = ['General', 'Profile', 'Members & Roles', 'Integrations', 'Billing', 'API & Security'];

export default function SettingsOverview() {
  const { user, membership, changePassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === 'integrations') {
      setActiveTab(3);
    } else if (tabParam === 'profile') {
      setActiveTab(1);
    } else if (tabParam === 'members') {
      setActiveTab(2);
    } else if (tabParam === 'billing') {
      setActiveTab(4);
    } else if (tabParam === 'security' || tabParam === 'api') {
      setActiveTab(5);
    }
  }, [tabParam]);

  const { data: myOrgsData } = useMyOrganizations();
  const updateOrgMutation = useUpdateOrganization();
  const currentOrg = myOrgsData?.data?.find(org => org._id === membership?.organizationId);

  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    if (currentOrg) {
      setOrgName(currentOrg.name);
    }
  }, [currentOrg]);

  const handleUpdateOrg = () => {
    if (orgName && orgName !== currentOrg?.name) {
      updateOrgMutation.mutate({ orgId: currentOrg._id, payload: { name: orgName } });
    }
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const formatRole = (role) => {
    if (!role) return 'Member';
    return role.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const copyOrgId = () => {
    if (membership?.organizationId) {
      navigator.clipboard.writeText(membership.organizationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    if (!currentPassword || !newPassword) {
      setPwError('Both fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwMsg('Password changed successfully. You have been signed out.');
    } catch (err) {
      setPwError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-primary">Organization Settings</h2>
        <p className="text-xs text-text-secondary mt-1">
          Manage your account, organization, integrations, and security.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border-primary gap-1 overflow-x-auto">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`text-xs font-medium pb-3 px-3 transition-colors whitespace-nowrap ${
              activeTab === idx
                ? 'text-brand-500 border-b-2 border-brand-500'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md p-8 space-y-6"
        >
          {/* ─── Tab 0: General ─── */}
          {activeTab === 0 && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-text-primary">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-tertiary">Organization Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-border-primary bg-bg-secondary text-text-primary focus:outline-none focus:border-brand-500/80 transition-colors"
                    />
                    <button
                      onClick={handleUpdateOrg}
                      disabled={updateOrgMutation.isPending || orgName === currentOrg?.name}
                      className="px-4 py-2 text-xs rounded-xl bg-bg-tertiary hover:bg-bg-primary border border-border-primary transition-colors disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-tertiary">Organization Subdomain</label>
                  <div className="flex rounded-xl overflow-hidden border border-border-primary">
                    <input
                      type="text"
                      defaultValue="nexora-hq"
                      disabled
                      className="flex-1 px-4 py-2.5 text-xs bg-bg-secondary text-text-primary focus:outline-none opacity-50"
                    />
                    <span className="px-3 bg-bg-tertiary text-text-secondary text-xs flex items-center border-l border-border-primary font-mono">
                      .nexora.ai
                    </span>
                  </div>
                </div>
              </div>

              {/* Org ID Display */}
              {membership?.organizationId && (
                <div className="space-y-2 pt-4 border-t border-border-primary">
                  <h3 className="text-sm font-semibold text-text-primary">Organization ID</h3>
                  <p className="text-xs text-text-secondary">
                    Share this ID with team members so they can join your organization at login.
                  </p>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-bg-tertiary/30 border border-border-primary font-mono">
                    <span className="text-xs text-text-primary flex-1 break-all select-all">
                      {membership.organizationId}
                    </span>
                    <button
                      onClick={copyOrgId}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all shrink-0 ${
                        copied
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-bg-secondary hover:bg-bg-primary text-text-secondary border-border-primary'
                      }`}
                    >
                      {copied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* AI Settings */}
              <div className="pt-4 border-t border-border-primary space-y-4">
                <h3 className="text-sm font-semibold text-text-primary">AI Automation Profile</h3>
                {[
                  { title: 'Autonomous Backlog Grooming', desc: 'Allow Nexora AI to analyze task drift and tag blockers on stale board cards.', on: true },
                  { title: 'Automated Release Notes', desc: 'Generate draft markdown summaries when card statuses transition to Completed.', on: false },
                ].map((item) => (
                  <div key={item.title} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-bg-tertiary/20 border border-border-primary">
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium text-text-primary">{item.title}</h4>
                      <p className="text-[11px] text-text-secondary">{item.desc}</p>
                    </div>
                    <div className={`w-10 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${item.on ? 'bg-brand-500 justify-end' : 'bg-bg-tertiary border border-border-primary justify-start'}`}>
                      <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 text-xs rounded-xl bg-bg-secondary hover:bg-bg-tertiary font-medium border border-border-primary text-text-secondary transition-colors">
                  Discard
                </button>
                <button className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-sm transition-opacity">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ─── Tab 1: Profile ─── */}
          {activeTab === 1 && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-text-primary">Your Profile</h3>

              {/* Avatar Section */}
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-brand-500 to-pink-500 flex items-center justify-center text-white text-xl font-black shadow-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{user?.name}</p>
                  <p className="text-xs text-text-secondary">{user?.email}</p>
                  <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 border border-brand-500/20 capitalize">
                    {formatRole(membership?.role)}
                  </span>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-border-primary">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-tertiary">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name || ''}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-border-primary bg-bg-secondary text-text-primary focus:outline-none focus:border-brand-500/80 transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-tertiary">Username</label>
                  <input
                    type="text"
                    defaultValue={user?.username || ''}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-border-primary bg-bg-secondary text-text-primary focus:outline-none focus:border-brand-500/80 transition-colors"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-text-tertiary">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-border-primary bg-bg-tertiary/30 text-text-tertiary cursor-not-allowed"
                  />
                  <p className="text-[10px] text-text-tertiary">Email changes require re-verification and are not supported yet.</p>
                </div>
              </div>

              {/* Change Password */}
              <div className="pt-4 border-t border-border-primary space-y-4">
                <h3 className="text-sm font-semibold text-text-primary">Change Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-text-tertiary">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 text-xs rounded-xl border border-border-primary bg-bg-secondary text-text-primary focus:outline-none focus:border-brand-500/80 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-text-tertiary">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 text-xs rounded-xl border border-border-primary bg-bg-secondary text-text-primary focus:outline-none focus:border-brand-500/80 transition-colors"
                      />
                    </div>
                  </div>
                  {pwError && (
                    <p className="text-xs text-rose-500 font-medium">{pwError}</p>
                  )}
                  {pwMsg && (
                    <p className="text-xs text-emerald-600 font-medium">{pwMsg}</p>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={pwLoading}
                      className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-sm transition-opacity disabled:opacity-50"
                    >
                      {pwLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── Tab 2: Members & Roles ─── */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-text-primary">Members & Roles</h3>
                <button className="px-3 py-1.5 text-[11px] rounded-lg bg-gradient-to-r from-brand-600 to-[#9f85ff] text-white font-semibold hover:opacity-90 transition-opacity">
                  + Invite Member
                </button>
              </div>
              {[
                { name: user?.name || 'You', email: user?.email || '', role: membership?.role || 'member', status: 'active', isYou: true },
                { name: 'Sarah Connor', email: 'sarah@nexora.ai', role: 'admin', status: 'active', isYou: false },
                { name: 'Marcus Vance', email: 'marcus@nexora.ai', role: 'project_manager', status: 'active', isYou: false },
              ].map((member, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border-primary bg-bg-tertiary/10 hover:bg-bg-tertiary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-brand-500 flex items-center justify-center text-white text-[11px] font-black shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">{member.name} {member.isYou && <span className="text-[9px] text-text-tertiary">(You)</span>}</p>
                      <p className="text-[10px] text-text-tertiary">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 capitalize">
                      {member.status}
                    </span>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 border border-brand-500/20">
                      {formatRole(member.role)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── Tabs 3-5: Coming Soon Stubs ─── */}
          {activeTab >= 3 && (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <span className="text-4xl">{['🔌', '💳', '🔐'][activeTab - 3]}</span>
              <h3 className="text-base font-bold text-text-primary">{TABS[activeTab]}</h3>
              <p className="text-xs text-text-secondary max-w-sm">
                This section is under development and will be available in the next release of Nexora.ai.
              </p>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 border border-brand-500/20">
                Coming Soon
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
