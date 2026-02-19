FROM ubuntu:latest

WORKDIR /api
COPY . .
RUN touch .env
RUN apt upgrade -y
RUN apt update -y
RUN apt install -y nodejs npm
RUN npm install
EXPOSE 28522
CMD ["node", "/api/js/API_Front_Back/API.js"]

