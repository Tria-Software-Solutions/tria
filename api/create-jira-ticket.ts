import type { IncomingMessage, ServerResponse } from 'node:http';

interface FormData {
  source?: string;
  name: string;
  email: string;
  company?: string;
  budget?: string;
  services?: string[];
  message: string;
  turnstileToken?: string;
}

/** Minimal body parser for Vercel JSON POST */
function parseBody(req: IncomingMessage): Promise<FormData> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

/** Write a JSON response */
function json(res: ServerResponse, status: number, data: Record<string, unknown>) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * fetch() with a hard timeout. Serverless functions get killed after the
 * platform timeout, but a hanging outbound call (Jira, Turnstile, Resend,
 * Slack) would otherwise stall the handler indefinitely — the browser shows
 * a stuck "Sending…" button. Every outbound call goes through here so a
 * single slow dependency can never hang the request.
 */
async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/* ═══════════════════════════════════════
   NOTIFICATIONS (Slack + Email)
   ═══════════════════════════════════════ */

/** Escape HTML entities to prevent injection in email */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Send a Slack notification via Incoming Webhook (if SLACK_WEBHOOK_URL is set) */
async function sendSlackNotification(data: FormData, ticketKey: string, ticketUrl: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const isQuote = data.source === 'quote';
  const servicesStr = data.services?.length
    ? data.services.join(', ')
    : '—';

  const fields = [
    { type: 'mrkdwn', text: `*Source:*\n${isQuote ? 'Budget Estimator' : 'Contact Form'}` },
    { type: 'mrkdwn', text: `*Name:*\n${data.name}` },
    { type: 'mrkdwn', text: `*Email:*\n${data.email}` },
    { type: 'mrkdwn', text: `*Company:*\n${data.company || '—'}` },
    { type: 'mrkdwn', text: `*Budget:*\n${data.budget || '—'}` },
    { type: 'mrkdwn', text: `*Services:*\n${servicesStr}` },
  ];
  if (ticketKey) {
    fields.push({ type: 'mrkdwn', text: `*Jira:*\n<${ticketUrl}|${ticketKey}>` });
  } else {
    fields.push({ type: 'mrkdwn', text: '*Jira:*\nNot created (email/Slack only)' });
  }

  const blocks = {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: isQuote ? '📊 New Budget Estimate from triacr.com' : '🎯 New Lead from triacr.com', emoji: true },
      },
      { type: 'section', fields },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Message:*\n${data.message.substring(0, 500)}` },
      },
    ],
  };

  try {
    const res = await fetchWithTimeout(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blocks),
    }, 5000);
    if (!res.ok) {
      console.error('Slack notification rejected:', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('Slack notification failed:', err);
  }
}

/** Send an email notification via Resend (if RESEND_API_KEY + NOTIFICATION_EMAIL are set) */
async function sendEmailNotification(data: FormData, ticketKey: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL;
  if (!apiKey || !to) return;

  const isQuote = data.source === 'quote';
  const from = process.env.EMAIL_FROM || 'Tria Website <onboarding@resend.dev>';

  const eName = escapeHtml(data.name);
  const eEmail = escapeHtml(data.email);
  const eCompany = escapeHtml(data.company || '—');
  const eBudget = escapeHtml(data.budget || '—');
  const eServices = escapeHtml(data.services?.join(', ') || '—');
  const eSource = isQuote ? 'Budget Estimator' : 'Contact Form';
  const eMessage = escapeHtml(data.message).replace(/\n/g, '<br>');

  const html = `
    <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto;">
      <h2 style="color: #0b0d17; margin-bottom: 24px;">${isQuote ? '📊 New Budget Estimate from triacr.com' : '🎯 New Lead from triacr.com'}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Source</td></tr>
        <tr><td style="padding: 0 0 16px; font-size: 15px;">${eSource}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Name</td></tr>
        <tr><td style="padding: 0 0 16px; font-size: 15px;">${eName}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Email</td></tr>
        <tr><td style="padding: 0 0 16px; font-size: 15px;"><a href="mailto:${eEmail}">${eEmail}</a></td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Company</td></tr>
        <tr><td style="padding: 0 0 16px; font-size: 15px;">${eCompany}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Budget</td></tr>
        <tr><td style="padding: 0 0 16px; font-size: 15px;">${eBudget}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Services</td></tr>
        <tr><td style="padding: 0 0 16px; font-size: 15px;">${eServices}</td></tr>
      </table>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #333; line-height: 1.6;">${eMessage}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      ${ticketKey
        ? `<p><a href="https://triacr.atlassian.net/browse/${escapeHtml(ticketKey)}" style="display: inline-block; padding: 10px 20px; background: #068e8c; color: #fff; text-decoration: none; border-radius: 6px;">Open Jira Ticket ${escapeHtml(ticketKey)}</a></p>`
        : '<p style="color: #999; font-size: 12px;">Jira ticket not created — respond directly to this lead.</p>'}
      <p style="color: #999; font-size: 12px;">Sent from triacr.com ${isQuote ? 'budget estimator' : 'contact form'}</p>
    </div>
  `;

  try {
    const res = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `${isQuote ? '📊' : '🎯'} New ${isQuote ? 'estimate' : 'lead'}: ${data.name} — ${data.company || data.email}`,
        html,
      }),
    }, 8000);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('Email notification rejected by Resend:', res.status, body.slice(0, 300));
    } else {
      console.log('Email notification sent via Resend to', to);
    }
  } catch (err) {
    console.error('Email notification failed:', err);
  }
}

/** Verify Cloudflare Turnstile token server-side */
async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('Missing TURNSTILE_SECRET_KEY environment variable');
    return false;
  }

  try {
    const params = new URLSearchParams({
      secret,
      response: token,
    });

    const res = await fetchWithTimeout('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    }, 6000);

    const result = await res.json();
    return result.success === true;
  } catch (err) {
    console.error('Turnstile verification failed:', err);
    return false;
  }
}

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
) {
  // Only accept POST
  if (request.method !== 'POST') {
    json(response, 405, { error: 'Method not allowed' });
    return;
  }

  console.log('create-jira-ticket: request received');

  try {
    const data: FormData = await parseBody(request);
    console.log('create-jira-ticket: body parsed, source =', data.source || 'contact');

    if (!data.turnstileToken) {
      console.log('create-jira-ticket: missing turnstile token');
    }

    // Basic validation
    if (!data.name || !data.email || !data.message) {
      json(response, 400, { error: 'Name, email, and message are required' });
      return;
    }

    // Verify Cloudflare Turnstile token
    if (!data.turnstileToken) {
      json(response, 400, { error: 'Turnstile verification is required' });
      return;
    }

    const turnstileValid = await verifyTurnstile(data.turnstileToken);

    if (!turnstileValid) {
      console.error('Turnstile verification failed');
      json(response, 403, { error: 'Verification failed. Please try again or contact us directly.' });
      return;
    }

    const hasServices = data.services && data.services.length > 0;
    const isQuote = data.source === 'quote';

    // Jira is optional: if it's not configured (or fails), we still deliver
    // the lead via email + Slack so no submission is ever lost.
    const jiraEmail = process.env.JIRA_EMAIL;
    const jiraToken = process.env.JIRA_TOKEN;
    const jiraProjectKey = process.env.JIRA_PROJECT_KEY || 'TRI';
    const jiraConfigured = !!(jiraEmail && jiraToken);

    // Build Jira issue payload (Atlassian Document Format)
    const jiraPayload = {
      fields: {
        project: { key: jiraProjectKey },
        summary: `[Web][${isQuote ? 'Quote' : 'Contact'}] ${data.name} — ${data.company || data.email}`,
        issuetype: { name: 'Task' },
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: isQuote ? 'New budget estimator submission from triacr.com' : 'New contact form submission from triacr.com' },
              ],
            },
            { type: 'rule' },
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'strong' }], text: 'Source: ' },
                { type: 'text', text: isQuote ? 'Budget Estimator' : 'Contact Form' },
              ],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'strong' }], text: 'Name: ' },
                { type: 'text', text: data.name },
              ],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'strong' }], text: 'Email: ' },
                { type: 'text', text: data.email },
              ],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'strong' }], text: 'Company: ' },
                { type: 'text', text: data.company || '—' },
              ],
            },
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'strong' }], text: 'Budget: ' },
                { type: 'text', text: data.budget || '—' },
              ],
            },
            ...(hasServices
              ? [
                  {
                    type: 'paragraph',
                    content: [
                      { type: 'text', marks: [{ type: 'strong' }], text: 'Services: ' },
                    ],
                  },
                  {
                    type: 'bulletList',
                    content: data.services!.map((s: string) => ({
                      type: 'listItem',
                      content: [
                        {
                          type: 'paragraph',
                          content: [{ type: 'text', text: s }],
                        },
                      ],
                    })),
                  },
                ]
              : []),
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'strong' }], text: 'Message: ' },
              ],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: data.message }],
            },
          ],
        },
        labels: [isQuote ? 'web-quote' : 'web-contact'],
      },
    };

    let ticketKey = '';
    let ticketUrl = '';

    if (jiraConfigured) {
      const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');

      try {
        const jiraResponse = await fetchWithTimeout(
          `https://triacr.atlassian.net/rest/api/3/issue`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(jiraPayload),
          },
          8000
        );

        const result = await jiraResponse.json();

        if (jiraResponse.ok && result?.key) {
          ticketKey = String(result.key);
          ticketUrl = `https://triacr.atlassian.net/browse/${ticketKey}`;
          console.log('Jira ticket created:', ticketKey);
        } else {
          console.error('Jira API error:', JSON.stringify(result).slice(0, 300));
        }
      } catch (err) {
        console.error('Jira request failed (lead still delivered via email/Slack):', err);
      }
    } else {
      console.error('Jira not configured (JIRA_EMAIL/JIRA_TOKEN missing) — lead delivered via email/Slack only');
    }

    // Notifications are awaited — NOT fire-and-forget. On Vercel serverless,
    // the function is frozen as soon as the response ends, so un-awaited
    // promises never get to run and emails/Slack would silently never send.
    // Each notification has its own timeout, so the total wait is bounded
    // (~max of the two, not the sum) and the user never waits long.
    await Promise.allSettled([
      sendSlackNotification(data, ticketKey, ticketUrl),
      sendEmailNotification(data, ticketKey),
    ]);

    json(response, 200, {
      success: true,
      key: ticketKey || null,
      url: ticketUrl || null,
      jiraCreated: !!ticketKey,
    });
  } catch (error) {
    console.error('Server error:', error);
    json(response, 500, { error: 'Internal server error' });
  }
}
