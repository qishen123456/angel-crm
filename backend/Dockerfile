FROM node:20-slim

RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list && \
    apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    NODE_ENV=production \
    PORT=3001 \
    DATA_DIR=/app/data \
    NPM_REGISTRY=https://registry.npmmirror.com

WORKDIR /app

COPY package*.json ./
RUN npm config set registry $NPM_REGISTRY && npm ci --include=dev

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "dist/server.js"]
