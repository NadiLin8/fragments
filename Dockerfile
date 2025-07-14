# Multi-stage build for smaller image
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS runtime
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fragments -u 1001

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application files
COPY package*.json ./
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

# Change ownership and switch to non-root user
RUN chown -R fragments:nodejs /app
USER fragments

# Environment variables
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

EXPOSE 8080
CMD ["npm", "start"]