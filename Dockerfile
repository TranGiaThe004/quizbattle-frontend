# quizbattle-frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package.json và cài đặt thư viện
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code vào container
COPY . .

# [ĐIỂM KHÁC BIỆT]: Đóng gói code ra bản chính thức (Production)
RUN npm run build

# Mở cổng 3000
EXPOSE 3000

# [ĐIỂM KHÁC BIỆT]: Chạy Web ở chế độ Production (Bỏ qua Turbopack, cực kỳ ổn định)
CMD ["npm", "run", "start"]