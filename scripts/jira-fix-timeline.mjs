#!/usr/bin/env node
/**
 * Jira Timeline Fix Script
 * 
 * Fetches all issues from the Jira project and assigns them start/due dates
 * so they appear on the project timeline/roadmap view.
 * 
 * Usage: node scripts/jira-fix-timeline.mjs
 */

const JIRA_EMAIL = process.env.JIRA_EMAIL || 'luis.herrera506@gmail.com';
const JIRA_TOKEN = process.env.JIRA_TOKEN;
if (!JIRA_TOKEN) {
  console.error('Error: JIRA_TOKEN environment variable is required.');
  console.error('Set it with: export JIRA_TOKEN=your_token');
  process.exit(1);
}
const JIRA_BASE = 'https://triacr.atlassian.net';
const PROJECT_KEY = 'TRI';

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString('base64');
const headers = {
  Authorization: `Basic ${auth}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function jiraFetch(path, options = {}) {
  const url = `${JIRA_BASE}${path}`;
  const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jira API error ${res.status}: ${text.substring(0, 300)}`);
  }
  // Some endpoints (like PUT issue) return 204 No Content — return null instead of parsing
  if (res.status === 204) return null;
  return res.json();
}

async function main() {
  console.log('🔍 Step 1: Finding custom field IDs for start/due dates...\n');

  // Step 1: Get all custom fields to find date fields
  const fields = await jiraFetch('/rest/api/3/field');
  const dateFields = fields.filter(f =>
    f.schema?.type === 'date' ||
    f.name.toLowerCase().includes('start date') ||
    f.name.toLowerCase().includes('due date') ||
    f.name.toLowerCase().includes('story point')
  );

  console.log('Date-related custom fields found:');
  const startDateField = fields.find(f =>
    f.name.toLowerCase() === 'start date' ||
    f.name.toLowerCase().includes('start date')
  );
  const dueDateField = fields.find(f =>
    f.name.toLowerCase() === 'due date' ||
    f.name.toLowerCase() === 'duedate' ||
    f.name.toLowerCase().includes('due date')
  );

  if (!startDateField) {
    console.log('❌ No "Start date" custom field found.');
    console.log('Available date fields:');
    dateFields.forEach(f => console.log(`  - ${f.id}: "${f.name}" (${f.schema?.type || 'unknown'})`));
    console.log('\n⚠️  The timeline may need specific custom fields configured in Jira first.');
    console.log('   Go to: Jira Settings → Issues → Custom Fields → Add "Start date" and "Due date"\n');
  }
  if (!dueDateField) {
    console.log('❌ No "Due date" custom field found.');
  }

  if (startDateField) console.log(`  ✅ Start date: ${startDateField.id} — "${startDateField.name}"`);
  if (dueDateField) console.log(`  ✅ Due date: ${dueDateField.id} — "${dueDateField.name}"`);

  if (!startDateField || !dueDateField) {
    console.log('\n⚠️  Cannot proceed without both date fields. Configure them in Jira first.');
    process.exit(1);
  }

  // Step 2: Fetch all issues in the project
  console.log(`\n🔍 Step 2: Fetching all issues in project ${PROJECT_KEY}...`);
  let allIssues = [];
  let startAt = 0;
  const maxResults = 100;
  let total = 0;

  do {
    const data = await jiraFetch(
      `/rest/api/3/search/jql?jql=project=${PROJECT_KEY}+ORDER+BY+created+ASC&startAt=${startAt}&maxResults=${maxResults}&fields=id,key,summary,created`
    );
    total = data.total;
    allIssues = allIssues.concat(data.issues);
    startAt += maxResults;
    console.log(`  Fetched ${allIssues.length} / ${total} issues...`);
  } while (startAt < total);

  console.log(`\n📋 Total issues found: ${allIssues.length}\n`);

  // Step 3: Update each issue with start/due dates
  console.log('🔧 Step 3: Updating issues with timeline dates...\n');

  let updated = 0;
  let errors = 0;

  for (const issue of allIssues) {
    const createdDate = issue.fields.created.substring(0, 10); // YYYY-MM-DD
    const createdObj = new Date(createdDate);
    const dueObj = new Date(createdObj);
    dueObj.setDate(dueObj.getDate() + 14); // +2 weeks
    const dueDate = dueObj.toISOString().substring(0, 10);

    const startFieldId = startDateField.id;
    const dueFieldId = dueDateField.id;

    try {
      await jiraFetch(`/rest/api/3/issue/${issue.key}`, {
        method: 'PUT',
        body: JSON.stringify({
          fields: {
            [startFieldId]: createdDate,
            [dueFieldId]: dueDate,
          },
        }),
      });
      console.log(`  ✅ ${issue.key}: ${issue.fields.summary.substring(0, 50)}`);
      console.log(`     Start: ${createdDate}  →  Due: ${dueDate}`);
      updated++;
    } catch (err) {
      console.error(`  ❌ ${issue.key}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\n══════════════════════════════════════`);
  console.log(`📊 Results:`);
  console.log(`   Total issues: ${allIssues.length}`);
  console.log(`   Updated:      ${updated}`);
  console.log(`   Errors:       ${errors}`);
  console.log(`══════════════════════════════════════`);
  console.log(`\n✅ Timeline fix complete! Open your Jira project to see issues on the timeline:`);
  console.log(`   ${JIRA_BASE}/jira/software/projects/${PROJECT_KEY}/timeline\n`);
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
