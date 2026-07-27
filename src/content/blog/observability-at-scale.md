---
title: "Observability at Scale: Metrics, Traces, Logs, and OpenTelemetry"
description: "How we built an observability stack with OpenTelemetry that gives our teams deep visibility into distributed systems without drowning in data or cloud costs."
pubDate: "2024-11-01"
author: "tria team"
image: "/assets/img/blog/observability.jpg"
category: "Infrastructure"
tags: ["Observability", "OpenTelemetry", "Monitoring", "Distributed Systems", "SRE", "Cost Optimization"]
---

As systems grow in complexity, traditional monitoring approaches break down. You can't alert on everything — you need to understand what matters, and you need to do it without burning through your infrastructure budget.

Over the past three years, we've migrated three major client platforms from legacy monitoring (Nagios, Datadog at scale) to an OpenTelemetry-native stack. Here's what we learned about doing observability right at scale.

## The Three Pillars — and the Fourth

### Metrics: The Health Signal

Metrics give you the health of your system at a glance. But raw metrics without context are noise.

**What we actually use:**

- **RED metrics (Rate, Errors, Duration)** for every service — these are the non-negotiable starting point
- **Saturation signals** for critical resources (CPU, memory, connection pools, disk I/O)
- **Business metrics** that correlate with technical health — things like checkout completion rate, API latency by customer tier, and error rates by deployment version

**The mistake teams make:** They instrument everything promiscuously. We've seen teams with 50,000+ time series per host. Most of those metrics are never queried. They're just burning cardinality budget.

**Our rule:** Every metric must answer a specific question that has triggered an incident in the past 6 months. If it hasn't, it gets removed.

### Traces: The Context

Distributed tracing connects the dots across service boundaries. Without traces, you're debugging microservices with a flashlight in a dark room.

**Our tracing strategy:**

- Every request gets a trace ID from ingress to egress — this is non-negotiable
- **Head-based sampling** for high-traffic endpoints (keep 1% of all traffic)
- **Tail-based sampling** for low-traffic or high-value endpoints (keep 10-100%)
- Error traces are **always** retained regardless of sample rate

The key insight: you don't need all traces. You need enough traces to detect patterns, and all traces when something fails.

### Logs: The Safety Net

Structured logs are your safety net. They're the last resort when metrics show a problem and traces point to a service but you still can't figure out what happened.

**Best practices we enforce:**

- **JSON output** with consistent field names across all services
- Log levels used meaningfully: `debug` for development, `info` for normal operations, `warn` for unexpected but handled states, `error` for actual failures
- Every log line has `trace_id`, `service.name`, `environment`, and `version` — this lets you jump from a trace to its logs instantly
- **Retention policies** that make economic sense: hot storage for 7 days, warm for 30, cold for 90, deleted after that unless it's an audited compliance requirement

### The Fourth Pillar: Continuous Profiling

This is the emerging fourth pillar. Continuous profiling captures CPU, memory, and I/O profiles of your running production systems at regular intervals (e.g., every 60 seconds).

**Why it matters:** You can have perfect metrics, traces, and logs, and still not know why a service is using 20% more CPU after a deploy. A flame graph from continuous profiling answers that question immediately.

Tools like Pyroscope and Google Cloud Profiler make this practical at scale.

## OpenTelemetry: The Unified Standard

OpenTelemetry (OTel) has become the industry standard for instrumentation. It's not a vendor — it's a framework for generating telemetry data in a vendor-agnostic way.

### Why OpenTelemetry

Before OTel, every vendor had its own agent, its own SDK, its own data format. Switching from Datadog to Grafana meant re-instrumenting everything. OTel solves this:

- **One SDK** for metrics, traces, and logs
- **One wire format** (OTLP)
- **Any backend** can consume the data (Grafana, Datadog, SigNoz, New Relic, etc.)

### Our OTel Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Service A   │────▶│              │     │  Grafana    │
│  (OTel SDK)  │     │  OTel        │     │  Cloud      │
└─────────────┘     │  Collector   │────▶│  or On-Prem │
┌─────────────┐     │  (Agent)     │     └─────────────┘
│  Service B   │────▶│              │
│  (OTel SDK)  │     └──────────────┘
└─────────────┘
```

**The OTel Collector is the critical piece.** It runs as a sidecar or daemonset and handles:

1. **Batching** — groups telemetry data to reduce egress costs
2. **Filtering** — drops noisy or unnecessary spans/metrics before they leave the cluster
3. **Sampling** — applies head-based sampling rules
4. **Routing** — sends data to multiple backends (Grafana + S3 cold storage)
5. **Transformation** — enriches data with cluster metadata, environment tags, etc.

### Instrumentation Approaches

We use a mix of two strategies:

**Automatic instrumentation** (60% of use cases): For standard frameworks (HTTP servers, gRPC, databases, message queues), OTel's auto-instrumentation agents capture traces and metrics with zero code changes. We use this for Express/Fastify, gRPC, PostgreSQL, Redis, and Kafka.

**Manual instrumentation** (40%): For business-logic spans, custom metrics, and context propagation through async workflows, we add manual spans. Example:

```javascript
const span = tracer.startSpan('payment.process', {
  attributes: { 
    'payment.amount': amount,
    'payment.method': method,
    'customer.tier': customerTier 
  }
});
// ... payment logic ...
span.end();
```

This manual instrumentation is critical for understanding business-level performance, not just infrastructure-level.

## Cost Optimization at Scale

Observability at scale is expensive. We've seen monthly observability bills exceed $100k for mid-size platforms. Here's how we keep costs under control.

### 1. Smart Sampling

Sampling is your most powerful cost lever. We use a tiered approach:

| Endpoint Type | Traffic | Sample Rate | Rationale |
|---|---|---|---|
| Health checks | High | 0.01% | Only need to know if they break |
| User-facing APIs | High | 1% | Enough for latency distributions |
| Payment processing | Medium | 10% | High business value |
| Admin APIs | Low | 100% | Low volume, high importance |
| Error responses | Any | 100% | Always retain failures |

### 2. Cardinality Management

Cardinality kills — both performance and cost. Every unique combination of label values creates a new time series. A single metric with 3 labels, each with 100 values, creates 1,000,000 time series.

**Rules we enforce:**
- No unbounded label values (user IDs, session IDs, email addresses)
- Pin label cardinality during design reviews
- Use exemplars instead of high-cardinality labels for trace-to-metric correlation

### 3. Storage Tiers

Not all data is equally valuable over time:

- **Hot (7 days):** Full-resolution metrics, sampled traces, all logs — fast query
- **Warm (30 days):** Downsampled metrics (1m → 5m resolution), error-only traces, warning+ logs
- **Cold (90 days):** 1h resolution metrics, no traces, error-only logs
- **Archive:** Aggregated monthly metrics, compliance logs in S3/Glacier

This single change reduced our storage costs by 65% while preserving our ability to debug incidents within the hot window where 95% of incidents are resolved.

### 4. Egress Optimization

Sending raw telemetry data across regions or to cloud vendors is expensive:

- Run the OTel Collector in-cluster to batch and compress before egress
- Use tail-based sampling in the collector, not in the SDK
- Filter known-noisy spans (health checks, polling loops) at the collector level
- Compress OTLP payloads with gzip (typically 5-10x compression)

## Building Effective Monitoring Dashboards

Dashboards are how your team consumes observability data. Bad dashboards are worse than no dashboards — they create false confidence.

### Our Dashboard Hierarchy

We maintain three tiers of dashboards:

**Tier 1: Service Health (for on-call engineers)**
- RED metrics for the service
- Recent error traces
- Key business metrics
- Must fit in a single screen (no scrolling)
- Updated automatically when new services deploy

**Tier 2: System Overview (for engineering leadership)**
- Aggregate RED metrics across all services
- SLO attainment 📊
- Cost per service (infrastructure + observability)
- Deployment frequency and change failure rate

**Tier 3: Deep Dive (for debugging incidents)**
- Full trace search
- Log analytics with filtering
- Dependency graph
- Continuous profiling flame graphs
- Comparative views (before/after deploy)

### Dashboard Anti-Patterns

**The Wall of Widgets:** 40+ panels crammed onto one dashboard. Nobody reads it. Nobody can find what they need.

**The Snapshot Dashboard:** A dashboard built for a demo and never updated. It shows last quarter's metrics for a service that's been deprecated.

**The Red/Green Dashboard:** Only alerting panels with no context. When everything is green, you ignore it. When something goes red, you have no idea why.

### A Practical Dashboard Recipe

For a new microservice, here's the minimal dashboard that every team starts with:

```
┌─────────────────────────────────────────────────────────┐
│ Request Rate (RPS)  │  Error Rate (%)  │  Latency (p50) │
│ [timeseries graph]   │  [timeseries]    │  [timeseries]  │
├─────────────────────────────────────────────────────────┤
│ Latency (p95)        │  Latency (p99)   │  SLO Burn Rate │
│ [timeseries]         │  [timeseries]    │  [gauge]       │
├─────────────────────────────────────────────────────────┤
│ Top 5 Slowest Endpoints │  Recent Errors                │
│ [table]                  │  [table with trace links]     │
├─────────────────────────────────────────────────────────┤
│ Resource Usage (CPU/Mem) │  Dependencies Health          │
│ [timeseries]              │  [status grid]               │
└─────────────────────────────────────────────────────────┘
```

That's it. 12 panels. Every panel answers a question the on-call engineer will ask during an incident.

## Putting It All Together

A well-designed observability stack reduces mean time to resolution (MTTR) from hours to minutes and gives your team confidence to deploy frequently. But it requires deliberate design:

1. **Start with OpenTelemetry** — it's the industry standard and vendor-neutral
2. **Instrument strategically** — every metric and span must justify its existence
3. **Sample aggressively** — you don't need all the data, you need the right data
4. **Design dashboards for the incident** — not for the demo
5. **Monitor your observability costs** — they grow faster than your infrastructure costs if left unchecked

The goal isn't to collect all data. The goal is to have the right data when you need it, without bankrupting your cloud budget.

We've helped several clients implement this stack from scratch. If you're looking to modernize your observability practice, [let's talk](/contact).
