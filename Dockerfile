FROM node:latest

WORKDIR /api
COPY . .
RUN touch .env
RUN apt upgrade -y
RUN apt update -y
RUN npm install
EXPOSE 28523
CMD ["node", "./API_Front_Back/API.js"]

