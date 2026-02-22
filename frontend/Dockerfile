# Sử dụng image Node.js chính thức
FROM node:20

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép file package để cài dependency trước
COPY package*.json ./

# Cài đặt các dependency
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Mở cổng 3000 cho React dev server
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "start"]
