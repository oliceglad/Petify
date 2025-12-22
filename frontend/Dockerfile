FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./
# react-leaflet требует React 18 peer; используем legacy-peer-deps для совместимости с React 19
RUN npm ci --legacy-peer-deps

COPY . .

# Используем JS runtime Rollup, чтобы не подтягивать native-бинарь
ENV ROLLUP_USE_NODE_RUNTIME=1

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "--port", "5173"]
