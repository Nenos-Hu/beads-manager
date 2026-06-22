FROM node:20-alpine

RUN apk add --no-cache curl bash

# Install bd CLI from GitHub releases.
# If the URL below doesn't match, find the correct asset at:
# https://github.com/gastownhall/beads/releases
ARG BD_VERSION=latest
RUN set -e; \
    if [ "$BD_VERSION" = "latest" ]; then \
      URL=$(curl -s https://api.github.com/repos/gastownhall/beads/releases/latest \
            | grep -o '"browser_download_url": "[^"]*linux[_-]amd64[^"]*"' \
            | head -1 \
            | sed 's/"browser_download_url": "//;s/"//'); \
    else \
      URL="https://github.com/gastownhall/beads/releases/download/${BD_VERSION}/bd-linux-amd64"; \
    fi; \
    if [ -n "$URL" ]; then \
      curl -sSL "$URL" -o /usr/local/bin/bd && chmod +x /usr/local/bin/bd; \
    else \
      echo "WARNING: Could not determine bd download URL. bd will not be available."; \
    fi

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

EXPOSE 3001

CMD ["node", "src/server.js"]
