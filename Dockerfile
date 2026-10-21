# Build the React application with Node.js.
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve the built React files and proxy API/WebSocket using Node.js (no Nginx).
FROM node:20-bookworm-slim
WORKDIR /app
COPY docker/package.json ./package.json
RUN npm install --omit=dev
COPY docker/server.js ./server.js
COPY --from=build /app/build ./build

ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
