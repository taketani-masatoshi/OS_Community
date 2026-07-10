FROM node:20-alpine
WORKDIR /app
COPY apps/cloud-dash/package.json ./
RUN npm install --omit=dev
COPY apps/cloud-dash/public ./public
COPY apps/cloud-dash/src ./src
EXPOSE 8082
CMD ["node", "src/server.js"]
