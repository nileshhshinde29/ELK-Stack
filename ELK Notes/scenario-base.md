
# CHEAT SHEET – How to Remember These Answers

## How to use this sheet

The 50+ questions above fall into only **12 answer groups**. Remember the 12 groups and the list of checks for each group.

Use the same 4-step frame for every answer:

1. **Cause**: name 2–3 likely causes.
2. **Check**: list the checks for the group, with the API name.
3. **Fix**: give the one main fix.
4. **Prevent**: ILM, monitoring, or limits so it does not happen again.

Opening line that works for any question: *"First I check cluster health and node stats (CPU, heap, disk), then thread pools and slow logs, then the specific component."*

<a id="quick-map"></a>

## Quick map: question to group

| # | Group | Question numbers | What to check |
| --- | --- | --- | --- |
| 1 | [High CPU](#group-1) | 146, 162, 210 | Hot threads, tasks + slow logs, search/indexing rate, merges, expensive queries, ingest pipeline load |
| 2 | [High heap / GC](#group-2) | 147, 148, 161, 212, 213 | GC logs + node stats, shard/segment count, fielddata, large aggregations, query cache, circuit breakers, cluster state size, JVM heap sizing |
| 3 | [Slow indexing / rejections / bulk](#group-3) | 149, 151, 156, 168, 209, 214, 222 | Bulk size, thread pool queue, indexing pressure, Logstash/Agent backpressure, ingest pipeline failures, mapping, refresh interval, replicas, disk I/O |
| 4 | [Slow search](#group-4) | 150, 157, 167, 208, 229, 234 | Query DSL / Profile API, slow logs, time range, shards queried, aggregation size, node CPU/heap/thread pool, cache, upgrade/mapping changes |
| 5 | [Disk full / read-only](#group-5) | 163, 164, 165, 166, 216, 228 | Old indices, ILM failures, ingestion growth, replica count, shard allocation, hot tier retention, merges and snapshots |
| 6 | [Alerts not firing / delayed](#group-6) | 201, 235 | Rule query and time window, rule schedule, execution history, connector execution, Task Manager + Kibana health, Elasticsearch load |
| 7 | [Dashboard slow](#group-7) | 202, 218, 233 | Shard count, mapping, runtime fields, high-cardinality fields, Inspect panel, slow logs |
| 8 | [ILM / rollover stuck](#group-8) | 206, 207 | ILM explain, policy and rollover conditions, write index, warm nodes, tier preference, disk watermark |
| 9 | [Storage too high](#group-9) | 211, 237 | Replicas, mapping explosion, large fields / `_source`, compression, segment count |
| 10 | [Master keeps changing](#group-10) | 215 | Master CPU/heap, network, GC pauses, quorum, logs, dedicated master sizing |
| 11 | [Slow restore / recovery](#group-11) | 219, 232 | Shard size/count, index size, repository speed, network, disk I/O, recovery throttling, allocation settings, cluster load |
| 12 | [Pipeline: missing / duplicate data](#group-12) | 223, 224 | Missing: simulate, on_failure, DLQ, routing, remove processor, Logstash output errors. Duplicate: retries, no fixed ID, restart re-reads, multiple inputs, duplicate agents |

## Each group: checks and fix

<a id="group-1"></a>

### 1. High CPU

Causes: too many shards, runtime fields, heavy aggregations, expensive queries, high indexing.

- Hot threads: `GET _nodes/hot_threads`
- Tasks + slow logs: `GET _tasks`, cancel the bad one with `POST _tasks/<id>/_cancel`
- Search / indexing rate
- Merge activity
- Expensive queries: optimize or restrict them
- Ingest pipeline load

[⬆ Back to table](#quick-map)

<a id="group-2"></a>

### 2. High heap / GC

Causes: big aggregations, fielddata, too many shards, large cluster state, undersized heap.

- GC logs + `GET _nodes/stats` (old-gen GC)
- Shard and segment count
- Fielddata
- Large aggregation queries
- Query cache
- Circuit breakers
- Cluster state size
- JVM heap sizing (too small?)

[⬆ Back to table](#quick-map)

<a id="group-3"></a>

### 3. Slow indexing / thread pool rejections / bulk fails

Thread pool rejection = the queue is full, so the cluster is overloaded.

- Bulk size
- Thread pool queue: `GET _cat/thread_pool`
- Indexing pressure, query rate, CPU
- Logstash / Agent backpressure, retries, DLQ
- Ingest pipeline failures
- Mapping errors or changes
- Refresh interval
- Replicas
- Disk I/O

Fix: use bulk API, raise refresh interval, 0 replicas during backfill, lighter pipeline, no dynamic mapping explosion.

[⬆ Back to table](#quick-map)

<a id="group-4"></a>

### 4. Slow search

Causes: wide time range, many shards, wildcards, runtime fields, scripts, cold/frozen tier.

- Query DSL / Profile API
- Slow logs
- Time range (make it smaller)
- Shards queried
- Aggregation size
- Node CPU, heap, thread pool
- Cache
- Upgrade / mapping changes

Special cases: cold tier is slow by design (searchable snapshots). Discover slow = raw docs, highlighting, runtime fields, wide range. Fix: filters, keyword fields, smaller time range, fewer shards, no wildcards/scripts.

[⬆ Back to table](#quick-map)

<a id="group-5"></a>

### 5. Disk full / index read-only

Watermarks (defaults): low 85% = no new shards on node; high 90% = move shards away; flood 95% = index set read-only.

- Old indices and index size
- ILM rollover/delete failing
- Growth in daily ingestion
- Replica count
- Shard allocation
- Hot tier retention period
- Merges and snapshots

Fix: free disk first (delete old data, fix ILM, add nodes), then remove the block:

```
PUT */_settings
{ "index.blocks.read_only_allow_delete": null }
```

[⬆ Back to table](#quick-map)

<a id="group-6"></a>

### 6. Alerts not firing / delayed

- Query and time window of the rule
- Schedule of the rule
- Execution history / alert status
- Connector execution
- Task Manager + Kibana health
- Elasticsearch load / query time

[⬆ Back to table](#quick-map)

<a id="group-7"></a>

### 7. Dashboard slow

A dashboard runs many visualizations at once; Discover runs fewer queries.

- Shard count of the new index
- Mapping
- Runtime fields: move to ingest pipeline / indexed field
- High-cardinality fields
- Inspect panel in the dashboard
- Slow logs

[⬆ Back to table](#quick-map)

<a id="group-8"></a>

### 8. ILM not moving / rollover stuck

- Explain: `GET <index>/_ilm/explain` (failed step, error)
- Policy and rollover conditions (max_age, max_size)
- Write index of the data stream
- Warm nodes available?
- Tier preference / allocation filters
- Disk watermark

[⬆ Back to table](#quick-map)

<a id="group-9"></a>

### 9. Storage too high / cut 50%

- Replicas (fewer for old data)
- Mapping explosion, unused fields
- Large fields, `_source`, nested
- Compression (`best_compression`)
- Segment count (force merge)

Recommend: ILM + warm/cold/frozen tiers + searchable snapshots.

[⬆ Back to table](#quick-map)

<a id="group-10"></a>

### 10. Master changes often

- CPU / heap of master
- Network instability
- GC pauses
- Quorum
- Logs
- Dedicated master node sizing

[⬆ Back to table](#quick-map)

<a id="group-11"></a>

### 11. Snapshot restore / recovery slow

- Shard size and count
- Index size
- Repository speed
- Network
- Disk I/O
- Throttling of recovery
- Allocation settings
- Load on cluster

[⬆ Back to table](#quick-map)

<a id="group-12"></a>

### 12. Pipeline change: missing or duplicate data

**Missing data**

- Simulate: `POST _ingest/pipeline/<name>/_simulate`
- on_failure block catching docs
- DLQ in Logstash
- Routing to the wrong index
- Remove processor deleting a needed field
- Logstash output errors in logs

**Duplicate data**

- Retries resend the same data
- ID not fixed: use a fingerprint as `_id`
- Restart re-reads the same file
- Multiple inputs / pipelines for one log
- Duplicate agents (Agent + Filebeat on one file)

[⬆ Back to table](#quick-map)
