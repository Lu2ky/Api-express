FROM ubuntu:latest

WORKDIR /api
COPY . .
RUN touch .env
RUN apt upgrade
RUN apt update
RUN apt install node
RUN npm install
EXPOSE 28522
CMD ["node", "/api/js/API_Front_Back/API.js"]

