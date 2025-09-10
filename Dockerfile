FROM node:18-alpine
WORKDIR /dist
COPY package*.json ./
RUN npm ci
COPY . .
ADD init-db.sh /docker-entrypoint-initdb.d/
RUN npm run build 
CMD ["node", "dist/bot.js"]