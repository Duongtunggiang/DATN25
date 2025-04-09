import React, { useState, useEffect } from 'react';
import { UpdateProfile } from '../BackEnd/authen';

function EditProfile() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationalId: '',
    drivingLicense: '',
    phoneNumber: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await UpdateProfile(); // Hàm này phải trả về dữ liệu profile từ backend
        setProfile(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await UpdateProfile(profile); // 👈 Gửi dữ liệu profile đã chỉnh sửa lên backend
      alert("Cập nhật thành công!");
    } catch (err) {
      alert("Lỗi khi cập nhật thông tin!");
      console.error(err);
    }
  };

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit} className="card shadow-lg p-4">
        <h4 className="mb-4">Chỉnh sửa thông tin cá nhân</h4>

        <div className="mb-3">
          <label className="form-label">Họ</label>
          <input className="form-control" name="firstName" value={profile.firstName} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Tên</label>
          <input className="form-control" name="lastName" value={profile.lastName} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Ngày sinh</label>
          <input type="date" className="form-control" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Số CCCD</label>
          <input className="form-control" name="nationalId" value={profile.nationalId} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Số bằng lái</label>
          <input className="form-control" name="drivingLicense" value={profile.drivingLicense} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Số điện thoại</label>
          <input className="form-control" name="phoneNumber" value={profile.phoneNumber} onChange={handleChange} />
        </div>

        <button className="btn btn-success" type="submit">Lưu thay đổi</button>
      </form>
    </div>
  );
}

export default EditProfile;
