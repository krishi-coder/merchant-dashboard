# --- Stage 1: Build the React App ---
FROM node:20-alpine AS build
WORKDIR /app

# Accept the API Key as a build argument
ARG GEMINI_API_KEY

COPY package*.json ./
RUN npm install

COPY . .

# Write the API Key to .env.local so Vite can find it
RUN echo "VITE_GEMINI_API_KEY=$GEMINI_API_KEY" > .env.local

# Create the production build
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from the 'build' stage
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run uses port 8080 by default
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
