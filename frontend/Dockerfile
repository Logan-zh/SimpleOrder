# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

ARG REACT_APP_API_URL=http://localhost:3000/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---- Serve stage ----
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/build ./build

EXPOSE 3001
CMD ["serve", "-s", "build", "-l", "3001"]
