# Monitoring & Alerting Guide

## Overview

The Weekly Reporting system includes comprehensive monitoring and alerting using Prometheus, Grafana, and Alertmanager to ensure reliability and observability in production.

## Architecture

- **Prometheus**: Scrapes metrics from the app (`/metrics` endpoint) every 15 seconds
- **Grafana**: Visualizes metrics via dashboards and provides real-time insights
- **Alertmanager**: Routes alerts based on rules and configured receivers (email, Slack, webhooks)
- **Alert Rules**: Configured in `monitoring/alerting/alert.rules.yml`

## Key Metrics

### Report Generation Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `reports_weekly_generated_total` | Counter | Total successfully generated weekly reports |
| `reports_weekly_failed_total` | Counter | Total failed weekly reports (after retries) |
| `reports_weekly_skipped_total` | Counter | Total skipped reports (idempotency) |
| `reports_weekly_duration_seconds` | Histogram | Duration to generate a report (with buckets: 0.1s, 0.5s, 1s, 2s, 5s, 10s) |

### Scheduler & Lock Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `scheduler_lock_acquired_total` | Counter | Times the scheduler lock was successfully acquired |
| `scheduler_lock_failed_total` | Counter | Times the scheduler lock acquisition failed |
| `report_last_generated_timestamp_seconds` | Gauge | Unix timestamp of the last generated report |

### Audit Trail Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `report_audit_events_total` | Counter | Total audit events by action (started, generated, failed, skipped) |

## Alerts

### Critical Alerts (Immediate Action Required)

#### WeeklyReportsNotGenerated
- **Threshold**: No reports generated in 7 days
- **Action**: Verify scheduler is running, check application logs, ensure database is accessible

#### HighWeeklyReportFailureRate
- **Threshold**: >20% failure rate in the last hour
- **Action**: Check application logs for errors, verify database health, ensure adequate retries

#### HighAuditFailureEvents
- **Threshold**: More failed events than successful events in 1 hour
- **Action**: Investigate root cause in logs, check database and external dependencies

#### NoReportsGeneratedInSchedule
- **Threshold**: Neither generated nor skipped reports in 7 days
- **Action**: Verify scheduler process is running, check system clock sync across instances

### Warning Alerts (Investigate)

#### WeeklyReportsFailed
- **Threshold**: Any failures detected in 1 hour
- **Action**: Review error details, may be transient (retry logic should handle)

#### SchedulerLockAcquisitionFailed
- **Threshold**: >2 lock failures in 1 hour
- **Action**: Check for multi-instance issues, database locks, or clock skew

#### JobHealthStaleReport
- **Threshold**: >10 days since last report generated
- **Action**: Verify scheduler health, check for clock drift or configuration issues

## Grafana Dashboard

Access at: `http://localhost:3000` (default login: admin/admin)

### Dashboard Panels

1. **Weekly Reports Generated** - Total count (top-left)
2. **Weekly Reports Failed** - Total failures (top-center-left)
3. **Weekly Reports Skipped** - Idempotent skips (top-center-right)
4. **Lock Acquisitions** - Scheduler lock success count (top-right)
5. **Report Generation Duration** - p50 and p95 latencies (middle-left)
6. **Audit Events Distribution** - By action type (middle-right)
7. **Last Report Generated** - Time since last report (bottom-left)
8. **Lock Failures (1h)** - Recent acquisition failures (bottom-center)
9. **Failure Rate (1h)** - Percentage of failed vs total (bottom-right)

## Metrics Endpoint

Direct access to all metrics:

```bash
curl http://localhost:8000/metrics
```

Example output:
```
# HELP reports_weekly_generated_total Total number of weekly reports generated
# TYPE reports_weekly_generated_total counter
reports_weekly_generated_total{periodEnd="2000-01-07",periodStart="2000-01-01"} 1

# HELP scheduler_lock_acquired_total Total number of times scheduler lock was acquired
# TYPE scheduler_lock_acquired_total counter
scheduler_lock_acquired_total 1
```

## Job Health Endpoint

Check last audit event and report status:

```bash
curl http://localhost:8000/api/health/job
```

Response:
```json
{
  "success": true,
  "lastAudit": {
    "action": "generated",
    "details": "{\"durationMs\": 15, \"attempt\": 1}",
    "created_at": "2026-06-03 11:16:07"
  },
  "lastReport": {
    "id": 3,
    "report_type": "weekly",
    "period_start": "2000-01-01",
    "period_end": "2000-01-07",
    "generated_at": "2026-06-03 11:16:07"
  }
}
```

## Running the Monitoring Stack

### Start Monitoring Services

```bash
docker-compose up -d
```

Services will be available at:
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`
- Alertmanager: `http://localhost:9093`

### Verify Metrics Collection

1. Open Prometheus: `http://localhost:9090`
2. Navigate to Status → Targets
3. Verify `localhost:8000/metrics` is UP

### Configure Alert Receivers

Edit `monitoring/alertmanager/alertmanager.yml` to add notification channels (email, Slack, webhooks):

```yaml
receivers:
  - name: 'team-slack'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ .CommonAnnotations.description }}'

  - name: 'team-email'
    email_configs:
      - to: 'team@example.com'
        from: 'alertmanager@example.com'
        smarthost: 'smtp.example.com:587'
        auth_username: 'user@example.com'
        auth_password: 'password'
```

## Production Checklist

- [ ] Configure NTP synchronization across all instances
- [ ] Set `SCHEDULER_LOCK_TTL_MS` to a value larger than expected job runtime (e.g., 1200000 for 20 min)
- [ ] Configure external alert receivers (Slack, email, etc.)
- [ ] Set up persistent storage for Prometheus and Grafana
- [ ] Enable authentication for Grafana and Prometheus
- [ ] Test failover scenarios (stop one instance, verify scheduler runs on other)
- [ ] Verify database backups before production deployment
- [ ] Monitor `scheduler_lock_failed_total` as a leading indicator of multi-instance issues

## Troubleshooting

### Metrics not appearing in Prometheus

1. Verify app is running: `curl http://localhost:8000/metrics`
2. Check Prometheus scrape config: `http://localhost:9090/config`
3. Review Prometheus logs for scrape errors

### Alerts not firing

1. Check Prometheus alert status: `http://localhost:9090/alerts`
2. Verify alert rules are loaded: `http://localhost:9090/rules`
3. Test alert condition manually in Prometheus

### Lock acquisition failures

1. Verify database is accessible: `sqlite3 finance.db "SELECT * FROM locks;"`
2. Check system clocks are synchronized across instances
3. Increase `SCHEDULER_LOCK_TTL_MS` if job runtime is longer than TTL
4. Review logs for database lock contention

## Notes

- Audit trail is stored in `report_audit` table and exposed via metrics
- Lock-based leader election ensures only one scheduler runs across instances
- Metrics retention depends on Prometheus storage configuration
- Grafana dashboards are auto-provisioned on startup
