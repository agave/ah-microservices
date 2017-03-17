FROM prom/prometheus

COPY ./prometheus/rules/ /etc/prometheus/
COPY ./prometheus/prometheus.yml /etc/prometheus/prometheus.yml

CMD ["-config.file=/etc/prometheus/prometheus.yml", \
     "-storage.local.path=/prometheus", \
     "-web.console.libraries=/etc/prometheus/console_libraries", \
     "-web.console.templates=/etc/prometheus/consoles", \
     "-web.listen-address=:9090", \
     "-alertmanager.url=http://alertmanager:9093", \
     "-storage.local.memory-chunks=300000", \
     "-storage.local.retention=744h"]

EXPOSE 9090
