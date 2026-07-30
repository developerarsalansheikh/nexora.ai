import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSubscription, useUpgradePlan, useInvoices } from '../api/useBilling';
import {
  FiCreditCard,
  FiCheck,
  FiZap,
  FiUsers,
  FiDownload,
  FiShield,
  FiArrowUpRight,
  FiCheckCircle,
} from 'react-icons/fi';

/**
 * BillingDashboardPage — Subscription plan switcher, seat usage bar, and invoice history.
 */
export default function BillingDashboardPage() {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId;

  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: subData, isLoading: isSubLoading } = useSubscription(organizationId);
  const { data: invoicesData, isLoading: isInvoicesLoading } = useInvoices(organizationId);
  const upgradeMutation = useUpgradePlan(organizationId);

  const subscription = subData?.subscription || {};
  const usage = subData?.usage || {};
  const currentPlan = subscription.plan || 'free';
  const invoices = invoicesData?.docs || [];

  const handleUpgrade = (planKey) => {
    upgradeMutation.mutate({ plan: planKey, billingCycle });
  };

  const plans = [
    {
      key: 'free',
      name: 'Free Tier',
      price: '$0',
      period: 'forever',
      desc: 'Essential Kanban & project management for small teams',
      seats: 'Up to 5 seats',
      features: ['Basic Kanban Boards', 'Up to 3 Projects', '10,000 AI Tokens/mo', 'Community Support'],
    },
    {
      key: 'pro',
      name: 'Pro SaaS',
      price: billingCycle === 'yearly' ? '$15' : '$19',
      period: 'per seat / mo',
      desc: 'Complete agile sprints, AI assistant, and reports suite',
      seats: 'Up to 25 seats',
      popular: true,
      features: [
        'Everything in Free',
        'Unlimited Projects & Sprints',
        'Sprint Burndown & Velocity',
        'Gemini AI Assistant & Chat',
        'Advanced Reports & CSV Export',
        'Priority Email Support',
      ],
    },
    {
      key: 'enterprise',
      name: 'Enterprise Ultra',
      price: billingCycle === 'yearly' ? '$39' : '$49',
      period: 'per seat / mo',
      desc: 'Dedicated AI models, unlimited seats, SSO, and custom domain',
      seats: 'Unlimited seats',
      features: [
        'Everything in Pro',
        'Unlimited Seats & Projects',
        'Dedicated AI Token Quota (10M)',
        'AI Usage Audit & Logging',
        'SSO / SAML Authentication',
        'Dedicated Success Manager',
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Subscription & Billing</h2>
          <p className="text-xs text-text-tertiary">Manage your SaaS plan, seat allocations, and payment invoices</p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center gap-2 bg-bg-secondary border border-border-primary rounded-xl p-1 text-xs">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              billingCycle === 'monthly' ? 'bg-brand-600 text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              billingCycle === 'yearly' ? 'bg-brand-600 text-white' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <span>Yearly</span>
            <span className="px-1.5 py-0.5 rounded bg-green-500 text-white text-[9px] font-extrabold">SAVE 20%</span>
          </button>
        </div>
      </div>

      {/* Active Subscription Overview Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="uppercase text-[10px] font-black tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                Active Plan
              </span>
              <span className="text-xs font-semibold capitalize opacity-90">{subscription.status || 'Active'}</span>
            </div>
            <h3 className="text-2xl font-black capitalize">{currentPlan} Plan</h3>
            <p className="text-xs opacity-80">
              Renews on {new Date(subscription.currentPeriodEnd || Date.now()).toLocaleDateString()}
            </p>
          </div>

          {/* Seat Usage Bar */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl space-y-2 min-w-[260px]">
            <div className="flex justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5"><FiUsers size={14} /> Seats Allocated</span>
              <span>{usage.seatsUsed || 1} / {usage.seatLimit || 5}</span>
            </div>
            <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${Math.min(100, usage.seatPercentage || 20)}%` }}
              />
            </div>
            <p className="text-[10px] opacity-75">{usage.seatLimit - usage.seatsUsed} additional seats available</p>
          </div>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.key;
          return (
            <div
              key={p.key}
              className={`p-6 rounded-2xl bg-bg-secondary border transition-all duration-200 flex flex-col justify-between relative ${
                p.popular ? 'border-brand-500 shadow-xl ring-2 ring-brand-500/20' : 'border-border-primary'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-500 text-white text-[10px] font-black uppercase rounded-full tracking-wider shadow-md">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-text-primary">{p.name}</h3>
                  <p className="text-xs text-text-tertiary mt-1 min-h-[36px]">{p.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-text-primary">{p.price}</span>
                  <span className="text-xs text-text-tertiary">{p.period}</span>
                </div>

                <div className="pt-2 border-t border-border-primary space-y-2 text-xs">
                  <p className="font-semibold text-text-primary mb-2">{p.seats}</p>
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-text-secondary">
                      <FiCheck size={14} className="text-green-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => handleUpgrade(p.key)}
                  disabled={isCurrent || upgradeMutation.isPending}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-bg-tertiary text-text-tertiary cursor-default'
                      : p.popular
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20'
                      : 'border border-border-primary hover:bg-bg-tertiary text-text-primary'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <FiCheckCircle size={14} /> Current Plan
                    </>
                  ) : (
                    <>
                      <FiZap size={14} /> Switch to {p.name}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice History Section */}
      <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Billing Invoices</h3>
            <p className="text-xs text-text-tertiary">Payment receipts and PDF invoice records</p>
          </div>
          <span className="text-[10px] font-mono text-text-tertiary">{invoices.length} Invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-tertiary/50 text-text-tertiary border-b border-border-primary">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Invoice Number</th>
                <th className="px-6 py-3.5 font-semibold">Billing Period</th>
                <th className="px-6 py-3.5 font-semibold">Amount</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary/50 text-text-primary font-sans">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-tertiary">
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-bg-tertiary/30 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-semibold text-brand-500">{inv.invoiceNumber}</td>
                    <td className="px-6 py-3.5 text-text-secondary">
                      {new Date(inv.billingPeriodStart).toLocaleDateString()} - {new Date(inv.billingPeriodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 font-bold">${inv.amount} {inv.currency}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-500/10 text-green-500">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button className="text-brand-500 font-semibold hover:underline inline-flex items-center gap-1">
                        <FiDownload size={13} /> PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
