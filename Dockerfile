# Use node alpine as our base image
FROM node:18-alpine@sha256:02376a266c84acbf45bd19440e08e48b1c8b98037417334046029ab585de03e2 AS dependencies

LABEL maintainer="Nadi Lin <nadi.lin@email.com>"
LABEL description="Fragments microservice API"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm ci --only=production

#######################################################################

# Stage 2: use dependencies to build the app
FROM node:18-alpine@sha256:02376a266c84acbf45bd19440e08e48b1c8b98037417334046029ab585de03e2 AS build

WORKDIR /app

# Copy cached dependencies from previous stage
COPY --from=dependencies /app /app

# Copy src to /app/src/
COPY ./src ./src

#######################################################################

# Stage 3: nginx production image
FROM node:18-alpine@sha256:02376a266c84acbf45bd19440e08e48b1c8b98037417334046029ab585de03e2 AS production

# Use /app as our working directory
WORKDIR /app

# Copy cached dependencies and built app from previous stage
COPY --from=build /app /app

# We run our service on port 8080
EXPOSE 8080

# Switch to a non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup
USER appuser

# Start the container by running our server
CMD ["npm", "start"]