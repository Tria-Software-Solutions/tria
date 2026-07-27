#!/usr/bin/env node

/**
 * Populate Jira TRI project with complete Kanban board structure
 * 
 * Usage: node scripts/populate-jira.mjs
 * 
 * Requires env vars:
 *   JIRA_EMAIL, JIRA_TOKEN
 */

const JIRA_EMAIL = process.env.JIRA_EMAIL || 'luis.herrera506@gmail.com';
const JIRA_TOKEN = process.env.JIRA_TOKEN;

if (!JIRA_TOKEN) {
  console.error('Missing JIRA_TOKEN env var');
  process.exit(1);
}

const AUTH = Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString('base64');
const BASE = 'https://triacr.atlassian.net/rest/api/3';
const PROJECT_KEY = 'TRI';
const ISSUE_TYPE_TASK = '10103';    // Task
const ISSUE_TYPE_SUBTASK = '10104'; // Sub-task

// ── Helpers ──

let issueCount = 0;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function api(method, path, body) {
  const opts = {
    method,
    headers: {
      Authorization: `Basic ${AUTH}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  // Handle empty responses
  const text = await res.text();
  if (!text || !text.trim()) {
    if (!res.ok) {
      console.error(`  ✗ ${method} ${path} FAILED (empty response, status ${res.status})`);
      return null;
    }
    return {}; // Success but no body
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error(`  ✗ ${method} ${path} JSON parse error:`, text.substring(0, 200));
    return null;
  }
  if (!res.ok) {
    console.error(`  ✗ ${method} ${path} FAILED:`, data.errorMessages || data.errors || data.message || 'Unknown');
    return null;
  }
  return data;
}

async function createIssue(summary, description, labels, parentKey) {
  await sleep(300); // Rate limiting buffer
  const fields = {
    project: { key: PROJECT_KEY },
    summary,
    issuetype: { id: ISSUE_TYPE_TASK },
    description: {
      type: 'doc',
      version: 1,
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: description || '' }] },
      ],
    },
    labels: labels || [],
  };
  const result = await api('POST', '/issue', { fields });
  if (result && result.key) {
    issueCount++;
    const key = result.key;
    const url = `https://triacr.atlassian.net/browse/${key}`;
    console.log(`  ✓ ${key}: ${summary}`);
    return { key, url, id: result.id };
  }
  return null;
}

async function linkIssues(inwardKey, outwardKey) {
  await sleep(200);
  const result = await api('POST', '/issueLink', {
    type: { name: 'Relates' },
    inwardIssue: { key: inwardKey },
    outwardIssue: { key: outwardKey },
  });
  return result !== null;
}

// ── Create everything ──

async function main() {
  console.log(`\n╔══════════════════════════════════════════╗`);
  console.log(`║   POPULATING TRI — triacr.com Website   ║`);
  console.log(`╚══════════════════════════════════════════╝\n`);

  // ================================================================
  // EPICS
  // ================================================================
  console.log('━━━ EPICS ━━━\n');

  const epics = {};
  const epicList = [
    { id: 'infra',       name: 'EPIC: Core Website Infrastructure & Architecture',
      desc: 'Base infrastructure and architecture for the triacr.com website built with Astro 7.x. Includes project setup, TypeScript configuration, routing, build optimization, Vercel deployment, and SEO foundations.' },
    { id: 'design',      name: 'EPIC: Design System & User Experience',
      desc: 'Custom design system with tria-theme.css, Outfit typography system, responsive breakpoints, dark/light theme adaptation, UI components (buttons, links, forms, cards), and consistent visual language across all pages.' },
    { id: 'services',    name: 'EPIC: Service Pages & Content Strategy',
      desc: 'Service overview page and four detailed service pages: Software Development, Cybersecurity, Cloud & DevOps, and AI/ML. Each page includes detailed descriptions, process workflows, and CTAs.' },
    { id: 'portfolio',   name: 'EPIC: Portfolio & Case Studies',
      desc: 'Portfolio overview page and five detailed case study pages: Parkit, Fault Diagnosis, Las Granas, Goalr, and Choferes. Each case study includes challenge, solution, and results sections.' },
    { id: 'blog',        name: 'EPIC: Blog Engine & Content Management',
      desc: 'Astro content collections for blog management, blog listing with pagination, blog post detail pages, and 7 initial blog posts covering AI, cloud-native, microservices, cybersecurity, and engineering topics.' },
    { id: 'i18n',        name: 'EPIC: Internationalization & Multilingual Support',
      desc: 'Complete i18n system with English and Spanish support. Includes i18n utility functions, JSON translation files, Spanish route pages, dynamic language switcher with theme adaptation, and hreflang tags for SEO.' },
    { id: 'leads',       name: 'EPIC: Lead Generation & Contact Integration',
      desc: 'Contact form with validation, Jira ticket creation via API, Slack notifications for new leads, email notifications via Resend, and reCAPTCHA integration for spam protection.' },
    { id: 'animations',  name: 'EPIC: Animations & Interactive Experience',
      desc: 'Splash/preloader animation with GSAP, hero section gradient animation, scroll-triggered animations, page transitions via Swup, Lenis smooth scrolling, and hover micro-interactions throughout.' },
    { id: 'perf',        name: 'EPIC: Performance, SEO & Analytics',
      desc: 'SEO meta tags across all pages, JSON-LD structured data (Organization, WebSite, Article), Open Graph and Twitter Card support, Lighthouse optimization, build performance tuning, and analytics integration.' },
    { id: 'team',        name: 'EPIC: Team & About Pages',
      desc: 'About page with company mission and values, Team page with member profiles, Skills and expertise showcase, and custom 404 error page.' },
  ];

  for (const epic of epicList) {
    const result = await createIssue(epic.name, epic.desc, ['epic', 'website']);
    if (result) epics[epic.id] = result;
  }

  // ================================================================
  // STORIES under each Epic
  // ================================================================
  console.log('\n━━━ STORIES ━━━\n');

  const stories = {};

  // ── EPIC: Infrastructure ──
  async function createStories() {
    const infraStories = [
      { summary: 'Set up Astro project with TypeScript and Vite',
        desc: 'Initialize Astro 7.x project with TypeScript strict mode, configure tsconfig.json, set up Vite optimizations, and establish project folder structure conventions.',
        labels: ['story', 'website'], epic: 'infra' },
      { summary: 'Configure routing, 404 page, and page structure',
        desc: 'Set up Astro file-based routing for all pages including static routes for services, projects, blog, and i18n support. Implement 404 page with site navigation.',
        labels: ['story', 'website'], epic: 'infra' },
      { summary: 'Implement Layout component with SEO meta tags',
        desc: 'Build main Layout.astro component with dynamic SEO meta tags, Open Graph, Twitter Cards, JSON-LD structured data, canonical URLs, and hreflang tags for multilingual SEO.',
        labels: ['story', 'website'], epic: 'infra' },
      { summary: 'Configure Vercel deployment pipeline',
        desc: 'Set up Vercel deployment with proper build configuration, environment variables for Jira/Slack/Resend APIs, preview deployments for PRs, and custom domain (triacr.com).',
        labels: ['story', 'website'], epic: 'infra' },
    ];
    for (const s of infraStories) {
      const result = await createIssue(s.summary, s.desc, s.labels);
      if (result) {
        stories[s.summary] = result;
        if (epics[s.epic]) await linkIssues(result.key, epics[s.epic].key, 'Relates');
      }
    }
  }

  // ── EPIC: Design System ──
  async function createDesignStories() {
    const designStories = [
      { summary: 'Design and implement tria-theme.css',
        desc: 'Create comprehensive theme stylesheet with CSS variables for colors (accent, text, backgrounds), consistent spacing system, responsive breakpoints (1200px, 992px, 768px, 576px, 400px), and utility classes.',
        labels: ['story', 'website'], epic: 'design' },
      { summary: 'Implement typography system with Outfit font',
        desc: 'Set up Outfit font family via Google Fonts with all weights (100-900). Define heading hierarchy (h1-h6), body text sizes, letter-spacing, and responsive font scaling with clamp().',
        labels: ['story', 'website'], epic: 'design' },
      { summary: 'Create Button, Link, and UI components',
        desc: 'Build reusable Button.astro (primary, icon, icon-sm variants) and Link.astro components with hover effects, transitions, and consistent styling. Include form inputs, breadcrumbs, and cards.',
        labels: ['story', 'website'], epic: 'design' },
      { summary: 'Implement dark/light theme adaptation system',
        desc: 'Build scroll-based theme detection system that dynamically adjusts UI element colors (logo, menu, language switcher, back-to-top) based on the current section background (light/dark).',
        labels: ['story', 'website'], epic: 'design' },
      { summary: 'Implement responsive design for all breakpoints',
        desc: 'Ensure all components and pages render correctly across desktop (1200px+), tablet (992px), small tablet (768px), mobile (576px), and small mobile (400px). Test navigation, layout, and readability.',
        labels: ['story', 'website'], epic: 'design' },
    ];
    for (const s of designStories) {
      const result = await createIssue(s.summary, s.desc, s.labels);
      if (result) {
        stories[s.summary] = result;
        if (epics[s.epic]) await linkIssues(result.key, epics[s.epic].key, 'Relates');
      }
    }
  }

  // ── EPIC: Service Pages ──
  async function createServiceStories() {
    const serviceStories = [
      { summary: 'Create Services overview page with grid layout',
        desc: 'Build service listing page showing all four services with icons, brief descriptions, and links to detail pages. Include page banner and CTA section.',
        labels: ['story', 'website'], epic: 'services' },
      { summary: 'Build Software Development service page',
        desc: 'Detailed page for custom software development, web apps, and mobile solutions. Include process workflow, technologies, case studies, and CTA for consultation.',
        labels: ['story', 'website'], epic: 'services' },
      { summary: 'Build Cybersecurity service page',
        desc: 'Detailed page for security audits, penetration testing, compliance, and managed security services. Include threat landscape overview and methodology.',
        labels: ['story', 'website'], epic: 'services' },
      { summary: 'Build Cloud & DevOps service page',
        desc: 'Detailed page for cloud migration, infrastructure-as-code, CI/CD pipelines, and managed cloud services. Include architecture diagrams and provider expertise.',
        labels: ['story', 'website'], epic: 'services' },
      { summary: 'Build AI/ML service page',
        desc: 'Detailed page for machine learning models, data pipelines, AI consulting, and intelligent automation. Include use cases, tools, and success metrics.',
        labels: ['story', 'website'], epic: 'services' },
    ];
    for (const s of serviceStories) {
      const result = await createIssue(s.summary, s.desc, s.labels);
      if (result) {
        stories[s.summary] = result;
        if (epics[s.epic]) await linkIssues(result.key, epics[s.epic].key, 'Relates');
      }
    }
  }

  // ── EPIC: Portfolio ──
  async function createPortfolioStories() {
    const portfolioStories = [
      { summary: 'Create Portfolio overview with grid showcase',
        desc: 'Build portfolio listing page showing all 5 projects with thumbnail, tags, and brief description. Include filter/sort functionality and featured work section.',
        labels: ['story', 'website'], epic: 'portfolio' },
      { summary: 'Build Parkit case study page',
        desc: 'Smart parking app case study with challenge description, solution architecture, key features (real-time availability, license plate recognition, payment integration), and measurable results.',
        labels: ['story', 'website'], epic: 'portfolio' },
      { summary: 'Build Fault Diagnosis case study page',
        desc: 'Industrial fault diagnosis system case study covering data collection, ML model training, real-time monitoring dashboard, and cost savings achieved.',
        labels: ['story', 'website'], epic: 'portfolio' },
      { summary: 'Build Las Granas case study page',
        desc: 'Corporate website for Las Granas — modern design, CMS integration, multi-language support, and performance optimization results.',
        labels: ['story', 'website'], epic: 'portfolio' },
      { summary: 'Build Goalr case study page',
        desc: 'Goal tracking app case study with UX research, feature set (OKR tracking, team dashboards, progress analytics), and user adoption metrics.',
        labels: ['story', 'website'], epic: 'portfolio' },
      { summary: 'Build Choferes case study page',
        desc: 'Driver management platform case study including fleet tracking, scheduling system, mobile app, and operational efficiency improvements.',
        labels: ['story', 'website'], epic: 'portfolio' },
    ];
    for (const s of portfolioStories) {
      const result = await createIssue(s.summary, s.desc, s.labels);
      if (result) {
        stories[s.summary] = result;
        if (epics[s.epic]) await linkIssues(result.key, epics[s.epic].key, 'Relates');
      }
    }
  }

  // ── EPIC: Blog ──
  async function createBlogStories() {
    const blogStories = [
      { summary: 'Set up Astro content collections for blog',
        desc: 'Configure src/content.config.ts with collection schema, define frontmatter fields (title, description, date, tags, author), and set up content sync pipeline.',
        labels: ['story', 'website'], epic: 'blog' },
      { summary: 'Create blog listing with pagination',
        desc: 'Build blog list page showing post cards with thumbnail, excerpt, date, and tags. Implement pagination with configurable posts-per-page and page navigation.',
        labels: ['story', 'website'], epic: 'blog' },
      { summary: 'Create blog post detail page',
        desc: 'Build article page with rich typography, featured image, author bio, reading time, social sharing, related posts, and structured data for articles.',
        labels: ['story', 'website'], epic: 'blog' },
      { summary: 'Write 7 initial blog posts on tech topics',
        desc: 'Create blog posts covering: AI-powered analytics, cloud-native architecture, scalable microservices (Go), high-performance teams, cybersecurity 2024, Rust vs Go, and observability at scale.',
        labels: ['story', 'website'], epic: 'blog' },
    ];
    for (const s of blogStories) {
      const result = await createIssue(s.summary, s.desc, s.labels);
      if (result) {
        stories[s.summary] = result;
        if (epics[s.epic]) await linkIssues(result.key, epics[s.epic].key, 'Relates');
      }
    }
  }

  // ── EPIC: i18n ──
  async function createI18nStories() {
    const i18nStories = [
      { summary: 'Implement i18n utilities and JSON translation files',
        desc: 'Build i18n utility functions (createT, getLocale, etc.) with TypeScript. Create en.json and es.json translation files covering all UI text, metadata, services, projects, and blog.',
        labels: ['story', 'website'], epic: 'i18n' },
      { summary: 'Build Spanish (es) route pages',
        desc: 'Create complete Spanish versions of all pages: home, about, services (4), projects (5), blog, team, contact, portfolio, 404. Mirror English page structure with Spanish translations.',
        labels: ['story', 'website'], epic: 'i18n' },
      { summary: 'Implement dynamic language switcher UI',
        desc: 'Build language switcher in bottom frame (desktop, rotated -90°) and top bar (mobile). Add smooth transitions, active state with theme-adaptive styling (underline on dark/light sections).',
        labels: ['story', 'website'], epic: 'i18n' },
      { summary: 'Implement dynamic locale detection and routing',
        desc: 'Build client-side locale detection from URL path, implement switchLanguage function for seamless locale switching, add hreflang tags for SEO, and ensure canonical URLs per locale.',
        labels: ['story', 'website'], epic: 'i18n' },
    ];
    for (const s of i18nStories) {
      const result = await createIssue(s.summary, s.desc, s.labels);
      if (result) {
        stories[s.summary] = result;
        if (epics[s.epic]) await linkIssues(result.key, epics[s.epic].key, 'Relates');
      }
    }
  }

  // ── EPIC: Lead Generation ──
  async function createLeadStories() {
    const leadStories = [
      { summary: 'Build contact form with validation',
        desc: 'Create contact form UI with fields: name, email, company (optional), budget range, services selection (multi-checkbox), and message textarea. Add client-side and server-side validation.',
        labels: ['story', 'website'], epic: 'leads' },
      { summary: 'Implement Jira ticket creation API endpoint',
        desc: 'Build Vercel serverless API endpoint (api/create-jira-ticket.ts) that creates Jira issues from contact form submissions using Atlassian Document Format. Handle errors and return ticket URL.',
        labels: ['story', 'website'], epic: 'leads' },
      { summary: 'Add Slack notifications for new leads',
        desc: 'Integrate Slack Incoming Webhook to send formatted notifications with lead details, company info, services requested, and direct link to the Jira ticket.',
        labels: ['story', 'website'], epic: 'leads' },
      { summary: 'Add email notifications via Resend',
        desc: 'Integrate Resend API to send HTML email notifications for new leads with professional template showing all form fields and direct link to Jira ticket.',
        labels: ['story', 'website'], epic: 'leads' },
      { summary: 'Add reCAPTCHA for spam protection',
        desc: 'Implement Google reCAPTCHA v3 on contact form to prevent spam submissions. Integrate token verification in the API endpoint before creating Jira tickets.',
        labels: ['story', 'website'], epic: 'leads' },
    ];
    for (const s of leadStories) {
      const result = await createIssue(s.summary, s.desc, s.labels);
      if (result) {
        stories[s.summary] = result;
        if (epics[s.epic]) await linkIssues(result.key, epics[s.epic].key, 'Relates');
      }
    }
  }

  // ── EPIC: Animations ──
  async function createAnimStories() {
    const animStories = [
      { summary: 'Implement splash/preloader animation with GSAP',
        desc: 'Build animated preloader shown on first visit showing "Design — Build — Grow" with reveal effects. Cache in sessionStorage so it only shows once per session.',
        labels: ['story', 'website'], epic: 'animations' },
      { summary: 'Build hero gradient animation',
        desc: 'Create interactive gradient background for hero sections using canvas/WebGL. Smooth color transitions based on mouse position with GSAP-powered reveal animation.',
        labels: ['story', 'website'], epic: 'animations' },
      { summary: 'Implement GSAP scroll-triggered animations',
        desc: 'Add scroll-triggered animations for page elements: fade-in, slide-up, stagger reveals for grids, and parallax effects. Use ScrollTrigger plugin for viewport-based triggers.',
        labels: ['story', 'website'], epic: 'animations' },
      { summary: 'Build page transitions with Swup',
        desc: 'Integrate Swup for smooth page transitions between routes. Animate content out, load new page, animate content in. Preserve persistent elements (frame, audio player).',
        labels: ['story', 'website'], epic: 'animations' },
      { summary: 'Implement Lenis smooth scrolling',
        desc: 'Integrate Lenis smooth scroll library for consistent, smooth scrolling across all pages. Configure easing, duration, and wheel/touch sensitivity. Sync with GSAP ScrollTrigger.',
        labels: ['story', 'website'], epic: 'animations' },
    ];
    for (const s of animStories) {
      const result = await createIssue(s.summary, s.desc, s.labels);
      if (result) {
        stories[s.summary] = result;
        if (epics[s.epic]) await linkIssues(result.key, epics[s.epic].key, 'Relates');
      }
    }
  }

  // ── EPIC: Performance & SEO ──
  async function createPerfStories() {
    const perfStories = [
      { summary: 'Implement SEO meta tags across all pages',
        desc: 'Ensure every page has unique title, meta description, canonical URL, Open Graph tags (title, description, image, locale), Twitter Cards, and JSON-LD structured data.',
        labels: ['story', 'website'], epic: 'perf' },
      { summary: 'Lighthouse performance optimization',
        desc: 'Optimize Core Web Vitals: lazy-load images, preload critical fonts, minify CSS/JS, eliminate render-blocking resources, optimize Largest Contentful Paint (LCP), and reduce Cumulative Layout Shift (CLS).',
        labels: ['story', 'website'], epic: 'perf' },
      { summary: 'Build size optimization and code splitting',
        desc: 'Analyze and reduce bundle size: tree-shake unused CSS, code-split vendor bundles, optimize SVG assets, compress images (WebP/AVIF), and implement Astro islands architecture for partial hydration.',
        labels: ['story', 'website'], epic: 'perf' },
      { summary: 'Fix build OOM issue with Node.js memory configuration',
        desc: 'Resolve JavaScript heap out of memory during Astro build. Root cause: Astro 7.1.3 + content collections across multiple locales. Solution: Remove unused Italian locale, clean up large Lighthouse audit JSON files from project root, set NODE_OPTIONS=--max-old-space-size=8192.',
        labels: ['story', 'website', 'bug'], epic: 'perf' },
    ];
    for (const s of perfStories) {
      const result = await createIssue(s.summary, s.desc, s.labels);
      if (result) {
        stories[s.summary] = result;
        if (epics[s.epic]) await linkIssues(result.key, epics[s.epic].key, 'Relates');
      }
    }
  }

  // ── EPIC: Team & About ──
  async function createTeamStories() {
    const teamStories = [
      { summary: 'Build About page with mission and values',
        desc: 'Create company about page with mission statement, core values, company history timeline, and differentiators. Include stats section and team photo.',
        labels: ['story', 'website'], epic: 'team' },
      { summary: 'Build Team page with member profiles',
        desc: 'Create team listing page with individual profiles including photo, name, role, bio, skills, and social links. Use grid layout with hover effects.',
        labels: ['story', 'website'], epic: 'team' },
      { summary: 'Build custom 404 error page',
        desc: 'Design and implement custom 404 page with brand-consistent styling, helpful navigation links, search option, and subtle animation to soften the error experience.',
        labels: ['story', 'website'], epic: 'team' },
    ];
    for (const s of teamStories) {
      const result = await createIssue(s.summary, s.desc, s.labels);
      if (result) {
        stories[s.summary] = result;
        if (epics[s.epic]) await linkIssues(result.key, epics[s.epic].key, 'Relates');
      }
    }
  }

  // Execute all story creation
  await createStories();
  await createDesignStories();
  await createServiceStories();
  await createPortfolioStories();
  await createBlogStories();
  await createI18nStories();
  await createLeadStories();
  await createAnimStories();
  await createPerfStories();
  await createTeamStories();

  // ================================================================
  // BUGS
  // ================================================================
  console.log('\n━━━ BUGS ━━━\n');

  const bugs = [
    { summary: 'BUG: GSAP "target not found" warnings in console',
      desc: 'GSAP ScrollTrigger throws "target not found" warnings when animating elements that do not exist on certain pages. Need to add null checks before GSAP animations and use conditional targeting based on element existence.\n\nFix: Check element existence before creating GSAP timelines. Use conditional selectors in tria-main.js.',
      epic: 'animations' },
    { summary: 'BUG: Language switcher not adapting to dark sections',
      desc: 'Language switcher text color does not change when scrolling from light to dark sections on the homepage. The underline/active indicator is invisible on dark backgrounds.\n\nFix: Add theme detection in updateFrameTheme() JS function to toggle .tria-on-dark class on language buttons and divider.',
      epic: 'design' },
    { summary: 'BUG: LightningCSS pseudo-class warning during build',
      desc: 'Build shows warning: "\'slotted\' is not recognized as a valid pseudo-class. Did you mean \'::slotted\' (pseudo-element)?" in tria-btn--icon-only CSS.\n\nFix: Replace :slotted with ::slotted (double colon) in CSS.',
      epic: 'design' },
    { summary: 'BUG: Contact form missing reCAPTCHA integration',
      desc: 'Contact form does not have spam protection. Need to integrate reCAPTCHA v3 to prevent automated spam submissions through the contact form API endpoint.',
      epic: 'leads' },
  ];

  for (const bug of bugs) {
    const result = await createIssue(bug.summary, bug.desc, ['bug', 'website']);
    if (result && epics[bug.epic]) {
      await linkIssues(result.key, epics[bug.epic].key, 'Relates');
    }
  }

  // ================================================================
  // BLOG TASKS (Sub-tasks under Blog Writing story)
  // ================================================================
  console.log('\n━━━ BLOG SUB-TASKS ━━━\n');

  const blogPosts = [
    { summary: 'Write: AI-Powered Analytics in Production',
      desc: 'Blog post about implementing AI analytics pipelines in production environments. Cover data collection, model serving, monitoring, and real-world performance metrics.',
      parentSummary: 'Write 7 initial blog posts on tech topics' },
    { summary: 'Write: The Future of Cloud-Native Architecture',
      desc: 'Blog post on cloud-native architectural patterns, serverless vs containers, service mesh, and emerging trends in distributed systems.',
      parentSummary: 'Write 7 initial blog posts on tech topics' },
    { summary: 'Write: Building Scalable Microservices with Go',
      desc: 'Technical blog post on designing and implementing scalable microservices using Go. Cover concurrency patterns, gRPC, and deployment strategies.',
      parentSummary: 'Write 7 initial blog posts on tech topics' },
    { summary: 'Write: Building High-Performance Engineering Teams',
      desc: 'Blog post on engineering management: hiring, culture, processes, and tools for building and scaling high-performance software teams.',
      parentSummary: 'Write 7 initial blog posts on tech topics' },
    { summary: 'Write: Cybersecurity Best Practices 2024',
      desc: 'Blog post covering current threat landscape, zero-trust architecture, security tooling, and best practices for modern web applications.',
      parentSummary: 'Write 7 initial blog posts on tech topics' },
    { summary: 'Write: Rust vs Go for Backend Systems',
      desc: 'Comparative blog post analyzing Rust and Go for backend development: performance, safety, ecosystem, learning curve, and use cases.',
      parentSummary: 'Write 7 initial blog posts on tech topics' },
    { summary: 'Write: Observability at Scale',
      desc: 'Blog post on observability pillars (metrics, logs, traces), OpenTelemetry implementation, cost optimization, and building effective monitoring dashboards.',
      parentSummary: 'Write 7 initial blog posts on tech topics' },
  ];

  const blogStory = stories['Write 7 initial blog posts on tech topics'];
  if (blogStory) {
    for (const post of blogPosts) {
      // Create sub-task directly under the blog story using parent link
      const fields = {
        project: { key: PROJECT_KEY },
        summary: post.summary,
        issuetype: { id: ISSUE_TYPE_SUBTASK },
        description: {
          type: 'doc',
          version: 1,
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: post.desc }] },
          ],
        },
        labels: ['blog', 'content'],
        parent: { key: blogStory.key },
      };
      const result = await api('POST', '/issue', { fields });
      if (result) {
        issueCount++;
        console.log(`  ✓ ${result.key}: ${post.summary} (sub-task)`);
      }
    }
  }

  // ================================================================
  // SUMMARY
  // ================================================================
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  ✅ Done! ${issueCount} issues created in project TRI`);
  console.log(`  📋 ${epicList.length} Epics`);
  console.log(`  📝 ${Object.keys(stories).length} Stories/Features`);
  console.log(`  🐛 ${bugs.length} Bugs`);
  console.log(`  📄 ${blogPosts.length} Blog sub-tasks`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`👉 https://triacr.atlassian.net/jira/software/c/projects/TRI/boards`);
  console.log();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
