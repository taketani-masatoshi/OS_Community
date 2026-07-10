FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY apps/cloud-control/package.json ./
RUN npm install --omit=dev
COPY apps/cloud-control/src ./src
EXPOSE 8080
CMD ["node", "src/server.js"]
