# NeuroVision Neuro API — Hugging Face Spaces (Docker)
# HF exposes port 7860 by default.

FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860

WORKDIR /app

# System deps for scanpy / h5py wheels fallback
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# CPU-only PyTorch first (smaller image; required by scvi-tools)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY pipelines/ ./pipelines/
COPY data/ ./data/
# Optional: copy NB04 models if present at build time (see DEPLOY.md)
COPY models/ ./models/

EXPOSE 7860

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
