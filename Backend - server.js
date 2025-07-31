// Import các thư viện cần thiết
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Để đọc các biến môi trường từ file .env

// Khởi tạo ứng dụng Express
const app = express();

// Sử dụng các middleware
app.use(cors()); // Cho phép các yêu cầu từ domain khác (frontend)
app.use(express.json()); // Phân tích các yêu cầu có body là JSON

// ---- ĐỊNH NGHĨA CÁC ROUTE (API ENDPOINTS) ----

// Route kiểm tra sức khỏe của server
// Khi bạn truy cập http://localhost:5000/api, nó sẽ trả về "API is running..."
app.get('/api', (req, res) => {
  res.json({ message: 'API đang hoạt động tốt!' });
});

// ---- KẾT NỐI DATABASE VÀ KHỞI CHẠY SERVER ----

// Lấy cổng từ biến môi trường, nếu không có thì mặc định là 5000
const PORT = process.env.PORT || 5000;

// Lắng nghe các yêu cầu trên cổng đã định nghĩa
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
