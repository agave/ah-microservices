#[Agavelab monitoring stack]

## Usage
```
make up // Lift monitoring stack
make down // Destroy monitoring stack
```

## Stack description

Logspout: Collects output logs from all containers, formats and forwards them to Logstash.

Logstash: Processes logs and stores them in elasticsearch.

CAdvisor: Collects container metrics and forwards them to Prometheus.

Nodeexporter: Collects host metrics and forwards them to Prometheus.

Prometheus: Time series database in charge of storing metrics and defines rules for creating alerts based on metrics.

Alertmanager: Decides what to do with the alerts generated by Prometheus.

Kibana: Frontend for querying and visualizing logs stored in elasticsearch.

Grafana: Frontend for visualizing metrics stored in Prometheus.

## Instructions

Once the monitoring stack is up and ready it will start collecting logs and metrics from all containers on the current docker host.

Check metrics with grafana at: localhost:4000 user:admin password:admin

Check logs with kibana at: localhost:5601

Logging rules are configured in logstash/config

Alerts rules are configured in prometheus/rules

Alert handling is configured in alertmanager/config.yml