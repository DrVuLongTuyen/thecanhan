const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware xác thực token
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(400).json({ message: 'Token is not valid' });
  }
};

// Middleware kiểm tra quyền admin
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin resources. Access denied.' });
    }
    next();
};

// @route   POST /api/users/register
router.post('/register', async (req, res) => {
  const { last_name, first_name, email, password } = req.body;
  if (!last_name || !first_name || !email || !password) return res.status(400).json({ message: 'Please enter all fields' });
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) return res.status(400).json({ message: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      "INSERT INTO users (last_name, first_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, email, role",
      [last_name, first_name, email, password_hash]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Please enter all fields' });
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: `${user.first_name} ${user.last_name}`, email: user.email, role: user.role } });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/users/me (Lấy thông tin người dùng đã đăng nhập)
router.get('/me', auth, async (req, res) => {
    try {
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
        // Xóa mật khẩu trước khi gửi về
        delete user.rows[0].password_hash;
        res.json(user.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/users/me (Cập nhật thông tin người dùng đã đăng nhập)
router.put('/me', auth, async (req, res) => {
    // Lấy tất cả các trường từ body
    const { last_name, first_name, gender, address, phone_number, zalo_url, facebook_url, tiktok_url, company_name, job_title, date_of_birth, academic_rank, academic_degree, avatar_url, cover_photo_url } = req.body;
    try {
        const updatedUser = await pool.query(
            `UPDATE users SET 
                last_name = $1, first_name = $2, gender = $3, address = $4, phone_number = $5,
                zalo_url = $6, facebook_url = $7, tiktok_url = $8, company_name = $9, job_title = $10,
                date_of_birth = $11, academic_rank = $12, academic_degree = $13, avatar_url = $14,
                cover_photo_url = $15, updated_at = NOW()
            WHERE id = $16 RETURNING *`,
            [last_name, first_name, gender, address, phone_number, zalo_url, facebook_url, tiktok_url, company_name, job_title, date_of_birth, academic_rank, academic_degree, avatar_url, cover_photo_url, req.user.id]
        );
        delete updatedUser.rows[0].password_hash;
        res.json(updatedUser.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- ADMIN ROUTES ---
// @route   GET /api/users/all (Admin lấy tất cả user)
router.get('/all', auth, adminAuth, async (req, res) => {
    try {
        const users = await pool.query("SELECT id, first_name, last_name, email, role FROM users ORDER BY created_at DESC");
        res.json(users.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE /api/users/:id (Admin xóa user)
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

