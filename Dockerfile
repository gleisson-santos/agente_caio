FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Install Node.js 20 for the WhatsApp bridge + Chromium for Browser Control
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates gnupg git chromium chromium-driver && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get purge -y gnupg && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Set Chromium env vars for Selenium
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver

WORKDIR /app

# Install Python dependencies first (cached layer)
COPY pyproject.toml README.md LICENSE ./
    RUN mkdir -p bridge caiocore && touch caiocore/__init__.py && \
        uv pip install --system --no-cache . && \
        rm -rf bridge caiocore

# Copy the full source and install
COPY caiocore/ caiocore/
COPY bridge/ bridge/
COPY tools/ tools/
RUN uv pip install --system --no-cache .

# Build the WhatsApp bridge
WORKDIR /app/bridge
RUN npm install && npm run build
WORKDIR /app

# Create config directory
RUN mkdir -p /root/.caiocore

# Gateway default port
EXPOSE 18795

ENTRYPOINT ["caio"]
CMD ["status"]
