/**
 * EmailQueueService — queue-based email notification engine.
 * Supports HTML email templates for welcome, invitation, task assignments, sprint started/completed,
 * password resets, daily digests, and weekly summaries.
 */
class EmailQueueService {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  /** Push an email payload to the async sending queue. */
  async sendEmail({ to, subject, template, data }) {
    const job = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      to,
      subject,
      template,
      data,
      status: 'pending',
      createdAt: new Date(),
    };

    this.queue.push(job);
    console.log(`[EmailQueue] Enqueued email job '${job.id}' (${template}) to ${to}`);
    this._processQueue();
    return job;
  }

  /** Process enqueued email jobs asynchronously. */
  async _processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      try {
        job.status = 'sending';
        const html = this.renderTemplate(job.template, job.data);
        // Simulate SMTP/SendGrid delivery
        console.log(`[EmailQueue] Sent email '${job.subject}' to ${job.to}`);
        job.status = 'delivered';
      } catch (err) {
        console.error(`[EmailQueue] Failed to send email '${job.id}':`, err.message);
        job.status = 'failed';
      }
    }

    this.isProcessing = false;
  }

  /** Render HTML email templates. */
  renderTemplate(template, data = {}) {
    const brandHeader = `
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-family: sans-serif; font-size: 24px;">Nexora<span style="color: #a5b4fc;">.ai</span></h1>
      </div>
    `;

    const brandFooter = `
      <div style="padding: 20px; text-align: center; color: #94a3b8; font-family: sans-serif; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Nexora.ai Enterprise Project Management. All rights reserved.</p>
      </div>
    `;

    const wrap = (body) => `
      <div style="background-color: #f8fafc; padding: 30px; font-family: sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden;">
          ${brandHeader}
          <div style="padding: 30px; color: #1e293b; line-height: 1.6;">
            ${body}
          </div>
          ${brandFooter}
        </div>
      </div>
    `;

    switch (template) {
      case 'welcome':
        return wrap(`
          <h2>Welcome to Nexora.ai, ${data.name || 'Team Member'}! 👋</h2>
          <p>We are excited to have you on board. Nexora.ai brings AI-powered intelligence, Kanban workflows, and real-time collaboration to your project teams.</p>
          <a href="${data.loginUrl || 'http://localhost:5173/login'}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">Go to Workspace</a>
        `);

      case 'invitation':
        return wrap(`
          <h2>You're invited to join ${data.orgName || 'a Nexora Workspace'} 🚀</h2>
          <p><strong>${data.inviterName || 'An administrator'}</strong> has invited you to collaborate on <strong>${data.workspaceName || 'Nexora.ai'}</strong> as a ${data.role || 'Member'}.</p>
          <a href="${data.inviteUrl || 'http://localhost:5173/register'}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">Accept Invitation</a>
        `);

      case 'password_reset':
        return wrap(`
          <h2>Reset Your Password 🔐</h2>
          <p>We received a request to reset your password. Click the button below to set a new password. If you didn't request this, please ignore this email.</p>
          <a href="${data.resetUrl || '#'}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">Reset Password</a>
        `);

      case 'task_assigned':
        return wrap(`
          <h2>New Task Assigned: "${data.taskTitle}" 📋</h2>
          <p><strong>${data.assignerName || 'A teammate'}</strong> assigned you a new task in project <strong>${data.projectName || 'Nexora'}</strong>.</p>
          <p><strong>Priority:</strong> ${data.priority || 'Normal'} | <strong>Due Date:</strong> ${data.dueDate || 'Not set'}</p>
          <a href="${data.taskUrl || 'http://localhost:5173/board'}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">View Task</a>
        `);

      case 'sprint_started':
        return wrap(`
          <h2>Sprint Started: "${data.sprintName}" 🏃‍♂️</h2>
          <p>Sprint <strong>${data.sprintName}</strong> has officially started with ${data.taskCount || 0} tasks (${data.storyPoints || 0} story points).</p>
          <p><strong>Sprint Goal:</strong> ${data.sprintGoal || 'No goal specified.'}</p>
          <a href="${data.sprintUrl || 'http://localhost:5173/board'}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">View Active Sprint</a>
        `);

      case 'sprint_completed':
        return wrap(`
          <h2>Sprint Completed: "${data.sprintName}" 🎉</h2>
          <p>Sprint <strong>${data.sprintName}</strong> has completed! Velocity achieved: <strong>${data.completedPoints || 0}</strong> points.</p>
          <a href="${data.reportUrl || 'http://localhost:5173/reports'}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">View Sprint Report</a>
        `);

      case 'daily_digest':
        return wrap(`
          <h2>Your Daily Nexora Digest ☀️</h2>
          <p>Here is your daily activity summary for <strong>${data.date || new Date().toLocaleDateString()}</strong>:</p>
          <ul>
            <li><strong>Tasks Assigned to You:</strong> ${data.assignedCount || 0}</li>
            <li><strong>Tasks Due Today:</strong> ${data.dueTodayCount || 0}</li>
            <li><strong>Sprint Progress:</strong> ${data.sprintProgress || 'On Track'}</li>
          </ul>
        `);

      default:
        return wrap(`
          <h2>Nexora.ai Notification</h2>
          <p>${data.message || 'You have a new update in your workspace.'}</p>
        `);
    }
  }
}

export default new EmailQueueService();
