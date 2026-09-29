# What is the ELK Stack?
Elastic => to store and searches logs/events
Logstash => to collect, process, transform, and forward the data
Kibana => Provides Dashboards and visualization for ES data.

# What is Elasticsearch?
- Elasticsearch is a distributed search and analytics engine built on Apache Lucene.
- It stores data as JSON documents.
- Allows fast searching, filtering, aggregation, and analysis. 
- Used for
    - Log management
    - Application monitoring
    - Full-text search
    - Observability
    - Security analytics

# What is a document in Elasticsearch?
A document is a JSON object that represents a single record.

# What is an index?
- It is an collection of documents having similar data.
- It is internally divided into shards.

# What is a shard?
- A shard is a portion of an Elasticsearch index.
- If an index contains a very large amount of data, Elasticsearch can distribute that data across multiple shards and nodes.
- It allows Elasticsearch to distribute storage and search workload.

Index
 ├── Shard 0
 ├── Shard 1
 ├── Shard 2
 └── Shard 3

# What is a replica?
- It is a copy of a primary shard.
- Used as a backup.
-If the primary shard fails, a replica can be promoted.

#  What is Logstash?
- It is a Data Processing pipeline used to collect, transform and send data to elastic search

# What are Logstash inputs, filters, and outputs?
- Input: Defines where data comes from. eg beats, file, http
- Filter: Processes or transforms data. eg grok, mutate, json
- Output: Defines where data goes. eg elk, kafka

# What is a Logstash pipeline?
- A pipeline defines how Logstash receives, processes, and sends events.

#  What is Kibana?
- Kibana is a visualization and analysis interface for Elasticsearch.
- used to create:
        Dashboards
        Charts
        Tables
        Alerts
        Log analysis
        Discover/search views

# What is the difference between text and keyword?
- text is analyzed and is generally used for full-text searches.
- keyword is not analyzed and is useful for exact matching, filtering, sorting, and aggregations.
{
  "user.name": "Nilesh Shinde"
   user.name.keyword: "Nilesh Shinde"
}


# What is Inverted index in ES?
- Inverted index is a data structure used by Elasticsearch to make text search fast.
- Instead of mapping documents to words, Inverted index is a structure that stores which documents contain each word,
 so Elasticsearch can find matching documents quickly

- Inverted index is automatically created by Elasticsearch. We don't need to create or enable anything separately. When we store a document, Elasticsearch creates the inverted index internally so that it can search the data quickly

# Difference between match and term query?
match = search by meaning/words

```json
{
  "query": {
    "match": {
      "message": "Elasticsearch fast"
    }
  }
}

```
term = search for exact value. Term is used with keyword field

```json
{
  "query": {
    "term": {
      "status": 500
    }
  }
}

```

# What is Elasticsearch mapping?
- Mapping defines how fields in Elasticsearch documents are stored and indexed.
```json
{
  "properties": {
    "username": {
      "type": "keyword"
    },
   }
}
```

# 15. What is dynamic mapping?
- Automatically detect and create mappings for new fields.
```json
{
  "name": "John",
  "age": 30
}s
```
- it can automatically create mappings for name and age.

# What are must, should, filter, and must_not?
- must: Condition must match and contributes to scoring.
- filter: Condition must match but is used for filtering rather than relevance scoring.
- should: Optional/preferred condition depending on the query context.
- must_not: Documents matching the condition are excluded.


# what is cluster?
- It is group of one or more elastic nodes that work as a single system to store, search and process data.


# What is cluster health?
- Green: All primary and replica shards are allocated.
- Yellow: Primary shards are allocated, but some replicas are not.
- Red: One or more primary shards are unavailable.
- ``json GET /_cluster/health ``

# What would you do if Elasticsearch health is red?
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

# What would you do if Elasticsearch disk usage is 90%?
 I would:

    - Check disk usage on all nodes.
    - Identify the largest indices.
    - Check Elasticsearch watermarks.
    - Remove or archive unnecessary data according to retention policy.
    - Apply/verify ILM policies.
    - Add storage or nodes if required.
    - Investigate unexpected data growth.
    - I would not simply delete random indices in production
 
# What is ILM?
- It stands for Index Lifecycle Management.
- It allows you to automate index life cycle management.
- It contains multiple phases like:

    - Hot →
        - This is a required phase.
        - It stores the latest data.
        - Users can get search results immediately.
        - It provides the best indexing and search performance.

    - Warm →
        - It stores older data that is accessed less frequently.
        - It provides a balance between storage cost and search performance.

    - Cold →
        - It stores older data that is rarely accessed.
        - It is mainly used to reduce storage cost.

    - Delete →
        - It deletes the data after the defined retention period.

Example:

- Logs could be:
    - 0–7 days   → Hot
    - 7–30 days  → Warm
    - 30–90 days → Cold
    - 90+ days   → Delete
