FROM logstash:5.1.1

COPY ./logstash/config /config
COPY ./logstash/patterns /opt/logstash/extra_patterns

CMD ["logstash", "-f", "/config"]

EXPOSE 5000
