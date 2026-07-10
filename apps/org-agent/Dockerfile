FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY apps/org-agent/package.json ./
RUN npm install --omit=dev
COPY apps/org-agent/src ./src
CMD ["node", "src/agent.js"]
