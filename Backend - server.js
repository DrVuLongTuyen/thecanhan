// Import các thư viện cần thiết
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Thư viện mã hóa mật khẩu
const jwt = require('jsonwebtoken'); // Thư viện tạo Token
const { Pool } = require('pg'); // Thư viện để kết nối PostgreSQL
require('dotenv').config();

// ---- KẾT NỐI DATABASE ----
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Khởi tạo ứng dụng Express
const app = express();

// Sử dụng các middleware
app.use(cors());
app.use(express.json());


// ---- MIDDLEWARE "NGƯỜI GÁC CỔNG" ----
/**
 * @desc Middleware để xác thực token JWT
 */
const auth = (req, res, next) => {
    // Lấy token từ header của request
    const token = req.header('x-auth-token');

    // Nếu không có token, từ chối truy cập
    if (!token) {
        return res.status(401).json({ message: 'Không có token, truy cập bị từ chối.' });
    }

    try {
        // Giải mã token bằng khóa bí mật
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Gắn thông tin người dùng từ token vào request
        req.user = decoded.user;
        next(); // Cho phép request đi tiếp
    } catch (error) {
        res.status(401).json({ message: 'Token không hợp lệ.' });
    }
};


// ---- ĐỊNH NGHĨA CÁC ROUTE (API ENDPOINTS) ----

// Route kiểm tra sức khỏe của server
app.get('/api', (req, res) => {
  res.json({ message: 'API đang hoạt động tốt!' });
});

// --- CÁC ROUTE CÔNG KHAI (KHÔNG CẦN ĐĂNG NHẬP) ---

/**
 * @route   POST /api/users/register
 * @desc    Đăng ký người dùng mới
 */
app.post('/api/users/register', async (req, res) => {
  const { last_name, first_name, email, password } = req.body;
  if (!last_name || !first_name || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' });
  }
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email này đã được sử dụng.' });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const newUserQuery = `
      INSERT INTO users (last_name, first_name, email, password_hash, role)
      VALUES ($1, $2, $3, $4, 'user')
      RETURNING id, last_name, first_name, email, role, created_at
    `;
    const values = [last_name, first_name, email, password_hash];
    const { rows } = await pool.query(newUserQuery, values);
    res.status(201).json({
      message: 'Tạo tài khoản thành công!',
      user: rows[0],
    });
  } catch (error) {
    console.error('Lỗi khi đăng ký người dùng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
  }
});

/**
 * @route   POST /api/users/login
 * @desc    Đăng nhập người dùng
 */
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
    }
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác.' });
        }
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác.' });
        }
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({
                message: 'Đăng nhập thành công!',
                token,
                user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role }
            });
        });
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
    }
});


// --- CÁC ROUTE ĐƯỢC BẢO VỆ (YÊU CẦU ĐĂNG NHẬP) ---

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin người dùng hiện tại
 * @access  Private
 */
app.get('/api/auth/me', auth, async (req, res) => {
    try {
        // req.user.id được lấy từ middleware "auth" sau khi giải mã token
        const userResult = await pool.query('SELECT id, first_name, last_name, email, role FROM users WHERE id = $1', [req.user.id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        res.json(userResult.rows[0]);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});


// ---- KHỞI CHẠY SERVER ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});

// ---- KHỞI CHẠY SERVER ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
