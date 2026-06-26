FROM node:22-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY --from=build /usr/src/app/dist ./dist
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "server/index.js"]
