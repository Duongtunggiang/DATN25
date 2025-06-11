import React, { useEffect, useState } from 'react';
import { GetProfile, getWalletBalance } from '../BackEnd/authen';
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaIdCard, FaCar, FaWallet, FaMapMarkerAlt } from 'react-icons/fa';
import '../css/Profile.css';

const ProfileComponent = () => {
  const [profile, setProfile] = useState(null);
  const defaultAvatar = '/default-avatar.png';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetProfile();
        const walletData = await getWalletBalance();
        setProfile({ ...data, wallet: walletData.balance });
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchData();
  }, []);

  if (!profile) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  const avatarUrl = profile.avatarPath
    ? profile.avatarPath.startsWith('http') 
      ? profile.avatarPath 
      : `http://localhost:8080${profile.avatarPath}`
    : defaultAvatar;

  const getRoleFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch (error) {
      console.error("Không thể giải mã token:", error);
      return null;
    }
  };
  
  const role = getRoleFromToken();
  const roleDisplay = {
    'CUSTOMER': 'Khách hàng',
    'CAR_OWNER': 'Chủ xe',
    'ADMIN': 'Quản trị viên'
  }[profile.role] || profile.role;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-section">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="profile-avatar"
            />
            <div className="profile-name">
              <h3>{fullName || profile.username}</h3>
              <span className="role-badge">{roleDisplay}</span>
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="info-grid">
            <div className="info-item">
              
              <div className="info-text">
                <div className="info-icon">
                <FaUser />
              </div>
                <label>Họ và tên</label>
                <p>{fullName || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-text">
                <div className="info-icon">
                  <FaEnvelope />
                </div>
                <label>Email</label>
                <p>{profile.email || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="info-item">
              
              <div className="info-text">
                <div className="info-icon">
                <FaPhone />
              </div>
                <label>Số điện thoại</label>
                <p>{profile.phoneNumber || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="info-item">
              
              <div className="info-text">
                <div className="info-icon">
                <FaBirthdayCake />
              </div>
                <label>Ngày sinh</label>
                <p>{profile.dateOfBirth || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="info-item">
              
              <div className="info-text">
                <div className="info-icon">
                <FaIdCard />
              </div>
                <label>Số CMND/CCCD</label>
                <p>{profile.nationalId || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="info-item">
              
              <div className="info-text">
                <div className="info-icon">
                <FaCar />
              </div>
                <label>Bằng lái xe</label>
                <p>{profile.drivingLicense || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-text">
                <div className="info-icon">
                  <FaMapMarkerAlt />
                </div>
                <label>Địa chỉ</label>
                <p>
                  {profile.address ? (
                    <>
                      {profile.address}
                      {profile.provinceName && `, ${profile.provinceName}`}
                    </>
                  ) : 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            <div className="info-item wallet-item">
              
              <div className="info-text">
                <div className="info-icon">
                <FaWallet />
              </div>
                <label>Số dư ví</label>
                <p className="wallet-balance">{Number(profile.wallet || 0).toLocaleString()} VND</p>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <a href={role === 'CUSTOMER' ? '/' : '/home-xe'} className="profile-btn profile-btn-back">
            Quay lại
          </a>
          <a href="/edit-profile" className="profile-btn profile-btn-edit">
            Chỉnh sửa thông tin
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;