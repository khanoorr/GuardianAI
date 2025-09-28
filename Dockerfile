# === STAGE 1: BUILD ===
# Use the official Node.js 20 image as a base for building the application.
FROM node:20-alpine AS builder

# Set the working directory inside the container.
WORKDIR /app

# Copy package.json and package-lock.json to the working directory.
COPY package*.json ./

# Install project dependencies.
RUN npm install

# Copy the rest of the application source code to the working directory.
COPY . .

# Build the Next.js application for production.
RUN npm run build

# === STAGE 2: PRODUCTION ===
# Use a lightweight Node.js 20 image for the production environment.
FROM node:20-alpine AS production

# Set the working directory for the production image.
WORKDIR /app

# Set the NODE_ENV environment variable to 'production'.
ENV NODE_ENV production

# Copy the build output from the 'builder' stage.
COPY --from=builder /app/.next ./.next
# Copy the standalone server files.
COPY --from=builder /app/standalone ./standalone
# Copy public assets.
COPY --from=builder /app/public ./public

# Expose port 3000 to allow traffic to the container.
EXPOSE 3000

# Set the default command to start the Next.js server.
# Using the standalone output for an optimized production server.
CMD ["node", "standalone/server.js"]
