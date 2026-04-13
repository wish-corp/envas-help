FROM python:3.11-slim

RUN pip install --no-cache-dir zensical

WORKDIR /docs
EXPOSE 8000

ENTRYPOINT ["zensical"]
CMD ["serve", "-a", "0.0.0.0:8000"]
