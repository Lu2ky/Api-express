
FROM node:25-alpine AS builder
WORKDIR /api
COPY package*.json ./
RUN npm install --production
COPY . .
FROM node:25-alpine AS runner
WORKDIR /api
COPY --from=builder /api /api
RUN touch .env
EXPOSE 28523
CMD ["node", "API_Front_Back/API.js"]