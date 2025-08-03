import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

const Navbar = () => {
  const { authState, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const authLinks = (
    <div>
      {authState.user && authState.user.role === 'admin' && <Link to="/admin">Admin</Link>}
      <Link to="/profile">Hồ sơ</Link>
      <a onClick={onLogout} href="#!">Đăng xuất</a>
    </div>
  );

  const guestLinks = (
    <div>
      <Link to="/register">Đăng ký</Link>
      <Link to="/login">Đăng nhập</Link>
    </div>
  );

  return (
    <nav>
      <h1><Link to="/">Thẻ Cá Nhân</Link></h1>
      {authState.isAuthenticated ? authLinks : guestLinks}
    </nav>
  );
};

export default Navbar;

