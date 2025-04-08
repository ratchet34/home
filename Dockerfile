FROM nginx:1.27.4-alpine-slim

# Copy everything in the current working directory to the default nginx folder
COPY ./dist/* /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 8080

# Add a volume to persist data
VOLUME /usr/share/nginx/html