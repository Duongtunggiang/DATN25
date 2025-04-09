import React, { useEffect, useState } from 'react';
import { GetProfile } from '../BackEnd/authen';


const ProfileComponent = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetProfile();
        setProfile(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchData();
  }, []);

  if (!profile) {
    return <div className="text-center mt-5">Đang tải thông tin...</div>;
  }

  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  const avatarUrl = profile.avatarPath
    ? profile.avatarPath.startsWith('http') 
      ? profile.avatarPath 
      : `http://localhost:8080${profile.avatarPath}`
    : defaultAvatar;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <div className="row g-4 align-items-center">
          <div className="col-md-3 text-center">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="rounded-circle img-thumbnail"
              style={{ width: '200px', height: '200px', objectFit: 'cover' }}
            />
            <h4 className="mt-3">{fullName || profile.username}</h4>
            <span className="badge bg-secondary">{profile.role}</span>
          </div>

          <div className="col-md-9">
            <table className="table table-hover">
              <tbody>
                <tr>
                  <th>Họ tên</th>
                  <td>{profile.firstName} {profile.lastName}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{profile.email}</td>
                </tr>
                <tr>
                  <th>Số điện thoại</th>
                  <td>{profile.phoneNumber}</td>
                </tr>
                <tr>
                  <th>Ngày sinh</th>
                  <td>{profile.dateOfBirth}</td>
                </tr>
                
                <tr>
                  <th>Số CMND/CCCD</th>
                  <td>{profile.nationalId}</td>
                </tr>
              
                <tr>
                  <th>Bằng lái xe</th>
                  <td>{profile.drivingLicense}</td>
                </tr>
                
                <tr>
                  <th>Số dư ví</th>
                  <td>{Number(profile.wallet || 0).toLocaleString()} VND</td>
                </tr>
              </tbody>
            </table>
            <div className='d-flex'>
              <a href="/" className='btn btn-danger'>Quay lại</a>
              <div className="text-end">
                <a className="btn btn-outline-primary" href="/edit-profile">
                  Chỉnh sửa thông tin
                </a>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;