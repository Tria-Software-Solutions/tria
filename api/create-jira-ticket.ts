import type { IncomingMessage, ServerResponse } from 'node:http';

interface FormData {
  name: string;
  email: string;
  company?: string;
  budget?: string;
  services?: string[];
  message: string;
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

  const servicesStr = data.services?.length
    ? data.services.join(', ')
    : '—';

  const blocks = {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '🎯 New Lead from triacr.com', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${data.name}` },
          { type: 'mrkdwn', text: `*Email:*\n${data.email}` },
          { type: 'mrkdwn', text: `*Company:*\n${data.company || '—'}` },
          { type: 'mrkdwn', text: `*Budget:*\n${data.budget || '—'}` },
          { type: 'mrkdwn', text: `*Services:*\n${servicesStr}` },
          { type: 'mrkdwn', text: `*Jira:*\n<${ticketUrl}|${ticketKey}>` },
        ],
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Message:*\n${data.message.substring(0, 500)}` },
      },
    ],
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blocks),
    });
  } catch (err) {
    console.error('Slack notification failed:', err);
  }
}

/** Send an email notification via Resend (if RESEND_API_KEY + NOTIFICATION_EMAIL are set) */
async function sendEmailNotification(data: FormData, ticketKey: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL;
  if (!apiKey || !to) return;

  const servicesHtml = data.services?.length
    ? `<p><strong>Services:</strong> ${data.services.join(', ')}</p>`
    : '';

  const eName = escapeHtml(data.name);
  const eEmail = escapeHtml(data.email);
  const eCompany = escapeHtml(data.company || '—');
  const eBudget = escapeHtml(data.budget || '—');
  const eServices = escapeHtml(data.services?.join(', ') || '—');
  const eMessage = escapeHtml(data.message).replace(/\n/g, '<br>');

  const html = `
    <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto;">
      <h2 style="color: #0b0d17; margin-bottom: 24px;">🎯 New Lead from triacr.com</h2>
      <table style="width: 100%; border-collapse: collapse;">
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
      <p><a href="https://triacr.atlassian.net/browse/${escapeHtml(ticketKey)}" style="display: inline-block; padding: 10px 20px; background: #068e8c; color: #fff; text-decoration: none; border-radius: 6px;">Open Jira Ticket ${escapeHtml(ticketKey)}</a></p>
      <p style="color: #999; font-size: 12px;">Sent from triacr.com contact form</p>
    </div>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Tria Website <onboarding@resend.dev>',
        to: [to],
        subject: `🎯 New lead: ${data.name} — ${data.company || data.email}`,
        html,
      }),
    });
  } catch (err) {
    console.error('Email notification failed:', err);
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

  // Validate required env vars
  const jiraEmail = process.env.JIRA_EMAIL;
  const jiraToken = process.env.JIRA_TOKEN;
  const jiraProjectKey = process.env.JIRA_PROJECT_KEY || 'TRI';

  if (!jiraEmail || !jiraToken) {
    console.error('Missing JIRA_EMAIL or JIRA_TOKEN environment variables');
    json(response, 500, { error: 'Server configuration error' });
    return;
  }

  try {
    const data: FormData = await parseBody(request);

    // Basic validation
    if (!data.name || !data.email || !data.message) {
      json(response, 400, { error: 'Name, email, and message are required' });
      return;
    }

    const hasServices = data.services && data.services.length > 0;

    // Build Jira issue payload (Atlassian Document Format)
    const jiraPayload = {
      fields: {
        project: { key: jiraProjectKey },
        summary: `[Web] ${data.name} — ${data.company || data.email}`,
        issuetype: { name: 'Task' },
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'New contact form submission from triacr.com' },
              ],
            },
            { type: 'rule' },
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
        labels: ['web-contact'],
      },
    };

    const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64');

    const jiraResponse = await fetch(
      `https://triacr.atlassian.net/rest/api/3/issue`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(jiraPayload),
      }
    );

    const result = await jiraResponse.json();

    if (!jiraResponse.ok) {
      console.error('Jira API error:', result);
      json(response, 500, {
        error: 'Failed to create Jira ticket',
        detail: result?.errors || result?.errorMessages || 'Unknown error',
      });
      return;
    }

    const ticketKey: string = result.key;
    const ticketUrl = `https://triacr.atlassian.net/browse/${ticketKey}`;

    // Fire notifications in background (don't block the response)
    Promise.all([
      sendSlackNotification(data, ticketKey, ticketUrl),
      sendEmailNotification(data, ticketKey),
    ]).catch((err) => console.error('Notifications error:', err));

    json(response, 200, {
      success: true,
      key: ticketKey,
      url: ticketUrl,
    });
  } catch (error) {
    console.error('Server error:', error);
    json(response, 500, { error: 'Internal server error' });
  }
}
