# Dockerfile for fragments microservice
# This file defines instructions to build a Docker image for our Node.js service

# Use a specific version of Node.js as our base image
FROM node:22.12.0

# Add metadata about the image
LABEL maintainer=" Nadi <nalin@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Set environment variables
# Default port for our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
ENV NPM_CONFIG_COLOR=false

# Create and set the working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install node dependencies
RUN npm install

# Copy source code
COPY ./src ./src

# Copy the HTPASSWD file (needed for basic auth)
COPY ./tests/.htpasswd ./tests/.htpasswd

# Expose the port our app runs on
EXPOSE 8080

# Command to start the container
CMD npm start