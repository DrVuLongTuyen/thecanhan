import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';

const Profile = () => {
  const { authState, loadUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    last_name: '', first_name: '', gender: '', address: '', phone_number: '',
    zalo_url: '', facebook_url: '', tiktok_url: '', company_name: '', job_title: '',
    date_of_birth: '', academic_rank: '', academic_degree: '', avatar_url: '', cover_photo_url: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authState.user) {
      const userProfile = { ...authState.user };
      // Chuyển đổi giá trị null thành chuỗi rỗng để hiển thị trong form
      for (const key in userProfile) {
        if (userProfile[key] === null) {
          userProfile[key] = '';
        }
      }
      // Định dạng lại ngày tháng
      if (userProfile.date_of_birth) {
        userProfile.date_of_birth = new Date(userProfile.date_of_birth).toISOString().split('T')[0];
      }
      setFormData(userProfile);
    }
  }, [authState.user]);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.put('http://localhost:5000/api/users/me', formData);
      setMessage('Cập nhật thông tin thành công!');
      loadUser(); // Tải lại thông tin user sau khi cập nhật
    } catch (err) {
      setMessage('Cập nhật thất bại, vui lòng thử lại.');
    }
  };

  return (
    <div className="form-container">
      <h2>Hồ Sơ Cá Nhân</h2>
      <form onSubmit={onSubmit}>
        {Object.keys(formData).map(key => {
          // Không hiển thị các trường không cần thiết
          if (['id', 'email', 'role', 'created_at', 'updated_at', 'password_hash'].includes(key)) return null;
          
          return (
            <div key={key}>
              <label style={{textTransform: 'capitalize', display: 'block', margin: '0.5rem 0'}}>{key.replace(/_/g, ' ')}</label>
              <input
                type={key === 'date_of_birth' ? 'date' : 'text'}
                name={key}
                value={formData[key]}
                onChange={onChange}
                placeholder={`Nhập ${key.replace(/_/g, ' ')}`}
              />
            </div>
          );
        })}
        <button type="submit">Cập Nhật Hồ Sơ</button>
      </form>
      {message && <p style={{color: message.includes('thành công') ? 'green' : 'red', textAlign: 'center'}}>{message}</p>}
    </div>
  );
};

export default Profile;

