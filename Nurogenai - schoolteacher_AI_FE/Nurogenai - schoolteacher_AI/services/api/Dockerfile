FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

# Install system dependencies for Tesseract OCR and PyMuPDF
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Enable bytecode compilation and set environment variables
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Install dependencies using uv
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=services/api/uv.lock,target=uv.lock \
    --mount=type=bind,source=services/api/pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev

# Final stage
FROM python:3.12-slim-bookworm

WORKDIR /app

# Copy system dependencies from builder if needed (or just install them again for simplicity)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Copy the environment from the builder
COPY --from=builder /app/.venv /app/.venv

# Add .venv/bin to PATH
ENV PATH="/app/.venv/bin:$PATH"

# Copy application code
COPY services/api/app /app/app
COPY services/api/alembic /app/alembic
COPY services/api/alembic.ini /app/alembic.ini
COPY services/api/scripts /app/scripts

# Expose port
EXPOSE 8000

# Run uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
