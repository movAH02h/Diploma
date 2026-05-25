FROM node:20-alpine

WORKDIR /app

ENV NEXT_PUBLIC_API_URL=http://backend:8000

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
