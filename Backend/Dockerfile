FROM node:latest

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY src/ ./src/

COPY .env .

EXPOSE 8080

CMD ["node", "src/app.js"]