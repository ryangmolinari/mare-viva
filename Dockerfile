FROM node:22-alpine
WORKDIR /app
COPY package.json server.mjs ./
COPY shared ./shared
COPY public ./public
ENV PORT=3210 HOST=0.0.0.0 SAVE_DIR=/app/data
VOLUME ["/app/data"]
EXPOSE 3210
CMD ["node", "server.mjs"]
