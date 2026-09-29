# ElK questions and ans

### What is elastic search and why it is better than other?

- Elasticsearch is a tool used to store, search, and analyze large amounts of data very quickly, especially logs.

### What Is Log Analysis?

- Process of analyzing computer generated data to extract analyze log, meaningful insights, patterns.

### Advantages of Elasticsearch?

- Highly used for store, search and analyze the data very quickly, especially logs.
- Elastic Common Schema (ECS): normalize un-consistent logs in standard formate.
- Pri-building integration: elastic agents automatically parses data into standard formate like Apache.
- Ingest pipeline: Native grok and Dissect processors are present to filter and structure out data.
- use date processor to ingest pipeline to parse multiple pattern and convert into UTC
- Data streams: ship all logs into unified streams for standardized storage and also can automatic rollover index.
- Cross-Cluster-Search( CCS ): Enable single plane of glass visibility across multiple region without moving data
- Can use kibana for visualize  dashboards.
- 300+ pre-build integrations for ready to build pipelines
- automatically manage data retention by using ILMs phases.

### What is cluster?

- It is group of one or more elastic nodes that work as a single system to store, search and process data.

### What is cluster health?

- Green: All primary and replica shards are allocated.
- Yellow: Primary shards are allocated, but some replicas are not.
- Red: One or more primary shards are unavailable.
- ``json GET /_cluster/health ``

### What would you do if Elasticsearch health is red?

I would first identify the unassigned shards.
``GET /_cluster/health``

Then:

``GET /_cat/shards?v``

and investigate unassigned shards using the allocation explanation API.

- I would check:
  - Node availability
  - Disk space
  - Shard allocation rules
  - Index corruption
  - Cluster/node logs
  - Resource availability
- I would avoid immediately deleting data because the root cause needs to be understood first.

### What is xpack.security.enabled: true?

- If its true then we need to credentials while login in elk.

### What is xpack.security.enrollment.enabled: true?

- Enables easy and secure enrollment of Elastic components. like Kibana

### What is TLS and SSL?
- **TLS** stands for **Transport Layer Security**.
- **SSL** stands for **Secure Sockets Layer**.
- SSL is the older security protocol, while TLS is its newer and more secure replacement.
- In Elasticsearch, TLS is mainly used to **secure and encrypt communication** between Elasticsearch components and clients.

- TLS helps protect:
    - Username and password
    - Elasticsearch data
    - API requests and responses
    - Communication between Elasticsearch nodes

### What is Transport SSL?
- Transport SSL is used specifically to **secure communication between Elasticsearch nodes**.
- Elasticsearch nodes use TLS/SSL to encrypt their communication with each other.
- It helps provide:
    - Encryption
    - Authentication
    - Data integrity

- Example:
    Node 1 → **TLS/SSL** → Node 2
---

```json

xpack.security.transport.ssl:

  enabled: true
  verification_mode: none
  keystore.path: certs/transport.p12   // it contains security key
  truststore.path: certs/transport.p12   // it contains security path

cluster.initial_master_nodes: ["node-1"]     // it defines initial master node

```

### What is the security layers in ES
-- user security = usename and password :  xpack.security.enabled
-- client security(HTTP SSL) : ssl/tls
-- cluster security=> node to node : transport ssl  

## Xms and xmx
in side es => config => Jvm.option there is option for assign memory for JVM. always recommended to use half of ram and max 32gb. 

