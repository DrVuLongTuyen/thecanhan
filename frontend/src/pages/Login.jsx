import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(${import.meta.env.VITE_API_URL}/api/users/login, formData);
      login(res.data.token, res.data.user);
      if(res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setMessage(err.response.data.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="form-container">
      <h2>Đăng Nhập</h2>
      <form onSubmit={onSubmit}>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={onChange} required />
        <input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={onChange} required />
        <button type="submit">Đăng Nhập</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;

