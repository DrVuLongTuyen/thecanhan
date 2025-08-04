import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await axios.get(${import.meta.env.VITE_API_URL}/api/users/all);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Không thể tải danh sách người dùng.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này? Thao tác này không thể hoàn tác.')) {
      try {
        await axios.delete(import.meta.env.VITEAPIURL/api/users/{id});
        setMessage('Xóa người dùng thành công!');
        fetchUsers(); // Tải lại danh sách sau khi xóa
      } catch (err) {
        setMessage('Không thể xóa người dùng. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div>
      <h2>Bảng Điều Khiển Của Admin</h2>
      <p>Quản lý tất cả người dùng trong hệ thống.</p>
      {message && <p style={{color: 'green'}}>{message}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ background: '#f2f2f2' }}>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Họ Tên</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Vai trò</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.id}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.first_name} {user.last_name}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.email}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.role}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                <button onClick={() => deleteUser(user.id)} style={{backgroundColor: '#dc3545', padding: '8px 12px'}}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;

