# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the production build
RUN npm install -g serve

# Copy built app from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/.env ./.env

# Expose port
EXPOSE 3000

# Start app
CMD ["serve", "-s", "dist", "-l", "3000"]
