import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ last_name: '', first_name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users/register', formData);
      setMessage('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response.data.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="form-container">
      <h2>Đăng Ký</h2>
      <form onSubmit={onSubmit}>
        <input type="text" name="last_name" placeholder="Họ" value={formData.last_name} onChange={onChange} required />
        <input type="text" name="first_name" placeholder="Tên" value={formData.first_name} onChange={onChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={onChange} required />
        <input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={onChange} required minLength="6" />
        <button type="submit">Đăng Ký</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;

