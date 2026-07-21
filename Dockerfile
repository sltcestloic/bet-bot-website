FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build

COPY . .
RUN npm run typecheck && npm test && npm run build

FROM nginx:alpine AS client

COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/client /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

FROM node:22-alpine AS server

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist/server ./dist/server

EXPOSE 3001

CMD ["npm", "run", "start:server:prod"]
