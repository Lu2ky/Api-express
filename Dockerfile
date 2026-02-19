FROM node:latest

WORKDIR /api
COPY . .
RUN touch .env
RUN npm install
EXPOSE 28522
CMD ["node", "/api/js/API_Front_Back/API.js"]

