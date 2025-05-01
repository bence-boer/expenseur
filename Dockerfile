# Use the official Deno image
FROM denoland/deno:2.3.6

# Set working directory
WORKDIR /app

# Copy necessary files first to leverage Docker cache
COPY deno.json deno.json
# COPY deno.lock deno.lock
COPY frontend/deno.json frontend/deno.json
COPY backend backend

# Expose the port that the backend server will run on
EXPOSE 8000

# Install dependencies and cache them
RUN deno cache backend/server.ts

# Command to run the backend server
CMD ["deno", "task", "backend:serve:production"]