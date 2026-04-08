FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY prisma ./prisma
COPY src ./src
COPY .env .env
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
