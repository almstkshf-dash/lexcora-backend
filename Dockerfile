# Use the official Node.js runtime as the base image
# Using Node.js 18 LTS for stability and Google Cloud Run compatibility
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
# This is done before copying the entire app to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
# Using npm ci for faster, reliable, reproducible builds
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port that the app runs on
# Google Cloud Run will inject the PORT environment variable
EXPOSE 8080

# Define the command to run the application
CMD ["npm", "start"]