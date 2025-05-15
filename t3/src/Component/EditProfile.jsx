import React, { useState, useEffect } from 'react';
import { fetchProfile, GetProfile, UpdateProfile } from '../BackEnd/authen';



function EditProfile() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationalId: '',
    drivingLicense: '',
    phoneNumber: '',
    avatarPath: ''
  });

  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetProfile();

        if (data.dateOfBirth) {
          const parts = data.dateOfBirth.split('-'); // dd-MM-yyyy
          data.dateOfBirth = `${parts[2]}-${parts[1]}-${parts[0]}`; // yyyy-MM-dd
        }

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

  const handleAvatarChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("firstName", profile.firstName);
    formData.append("lastName", profile.lastName);
    formData.append("dateOfBirth", profile.dateOfBirth);
    formData.append("nationalId", profile.nationalId);
    formData.append("drivingLicense", profile.drivingLicense);
    formData.append("phoneNumber", profile.phoneNumber);
  
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
  
    try {
      await UpdateProfile(formData); // API call
      alert("Cập nhật thành công!");
    } catch (err) {
      alert("Lỗi khi cập nhật thông tin!");
      console.error(err);
    }
    const avatarUrl = profile.avatarPath
    ? profile.avatarPath.startsWith('http') 
      ? profile.avatarPath 
      : `http://localhost:8080${profile.avatarPath}`
    : defaultAvatar;
  };
  

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit} className="card shadow-lg p-4" encType="multipart/form-data">
        <h4 className="mb-4">Chỉnh sửa thông tin cá nhân</h4>

        {profile.avatarPath && (
          <div className="mb-3 text-center">
            <img
              src={profile.avatarPath.startsWith('http') 
                ? profile.avatarPath 
                : `http://localhost:8080${profile.avatarPath}`}
              alt="Ảnh đại diện"
              className="rounded-circle img-thumbnail"
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Chọn ảnh mới</label>
          <input type="file" className="form-control" accept="image/*" onChange={handleAvatarChange} />
        </div>

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
      <div className='container'> 
          <div className='d-flex'>
            <a href="/profile" className='btn btn-warning'>Quay lại</a>
            <a href="/change-password" className='btn btn-secondary'>Đổi mật khẩu</a>
          </div>
      </div>
    </div>  
  );
}

export default EditProfile;
