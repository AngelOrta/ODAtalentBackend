FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

ENV GOOGLE_APPLICATION_CREDENTIALS = "/app/serviceAccountKey.json"

ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]

