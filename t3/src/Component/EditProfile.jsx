import React, { useState, useEffect } from 'react';
import { checkNationalId, GetProfile, UpdateProfileInfo, verifyCCCD, updateAvatar, getAccountStatus, getAllProvinces } from '../BackEnd/authen';
import '../css/EditProfile.css';

function EditProfile() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationalId: '',
    drivingLicense: '',
    phoneNumber: '',
    avatarPath: '',
    cccdVerified: false,
    address: '',
    provinceCode: '',
    provinceName: ''
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [cccdFile, setCCCDFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [verifying, setVerifying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState(null);
  const [provinces, setProvinces] = useState([]);

  // Load profile data and account status when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, statusData, provincesData] = await Promise.all([
          GetProfile(),
          getAccountStatus(),
          getAllProvinces()
        ]);
        
        // Format date of birth to YYYY-MM-DD for input type="date"
        let formattedDateOfBirth = '';
        if (profileData.dateOfBirth) {
          try {
            const [day, month, year] = profileData.dateOfBirth.split('-');
            formattedDateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } catch (error) {
            console.error('Error formatting date:', error);
          }
        }

        // Ensure all values are strings, not null
        const sanitizedProfile = {
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          dateOfBirth: formattedDateOfBirth,
          nationalId: profileData.nationalId || '',
          drivingLicense: profileData.drivingLicense || '',
          phoneNumber: profileData.phoneNumber || '',
          avatarPath: profileData.avatarPath || '',
          cccdVerified: profileData.cccdVerified || false,
          address: profileData.address || '',
          provinceCode: profileData.provinceCode || '',
          provinceName: profileData.provinceName || ''
        };

        setProfile(sanitizedProfile);
        setAccountStatus(statusData.status);
        setProvinces(provincesData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCCCDFileChange = (e) => {
    setCCCDFile(e.target.files[0]);
  };

  const handleVerifyCCCD = async (e) => {
    e.preventDefault();
    if (!cccdFile) {
      alert('Vui lòng chọn ảnh CCCD');
      return;
    }

    setVerifying(true);
    try {
      const result = await verifyCCCD(cccdFile);
      console.log('OCR Result:', result); // Debug log
      
      // Cập nhật thông tin profile từ kết quả OCR
      setProfile(prev => ({
        ...prev,
        nationalId: result.cccd || prev.nationalId,
        firstName: result.firstName || prev.firstName,
        lastName: result.lastName || prev.lastName,
        dateOfBirth: result.dob || prev.dateOfBirth,
        cccdVerified: true
      }));

      // Hiển thị thông tin chi tiết
      const message = `Xác thực CCCD thành công!\n\n` +
        `Họ và tên: ${result.firstName} ${result.lastName}\n` +
        `Ngày sinh: ${result.dob}\n` +
        `Số CCCD: ${result.cccd}`;
      
      alert(message);
    } catch (error) {
      console.error('OCR Error:', error); // Debug log
      
      // Kiểm tra lỗi trùng CCCD
      if (error.message && error.message.includes('Duplicate entry')) {
        alert('Số CCCD này đã được sử dụng để xác thực cho một tài khoản khác. Vui lòng sử dụng CCCD khác.');
      } else {
        alert('Lỗi khi xác thực CCCD: ' + (error.message || 'Không thể đọc thông tin từ CCCD'));
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!avatarFile) {
      alert('Vui lòng chọn ảnh');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await updateAvatar(formData);
      
      if (response.data) {
        alert('Cập nhật ảnh đại diện thành công!');
        // Refresh profile data
        const profileData = await GetProfile();
        setProfile(profileData);
        setAvatarFile(null);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật ảnh:', error);
      alert(error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật ảnh');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('firstName', profile.firstName);
      formData.append('lastName', profile.lastName);
      
      // Format date back to DD-MM-YYYY for backend
      if (profile.dateOfBirth) {
        try {
          const [year, month, day] = profile.dateOfBirth.split('-');
          // Ensure month and day are padded with leading zeros
          const formattedDate = `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
          console.log('Formatted date:', formattedDate); // Debug log
          formData.append('dateOfBirth', formattedDate);
        } catch (error) {
          console.error('Error formatting date for backend:', error);
          formData.append('dateOfBirth', '');
        }
      } else {
        formData.append('dateOfBirth', '');
      }
      
      formData.append('nationalId', profile.nationalId || '');
      formData.append('drivingLicense', profile.drivingLicense || '');
      formData.append('phoneNumber', profile.phoneNumber || '');
      formData.append('address', profile.address || '');
      formData.append('provinceCode', profile.provinceCode || '');

      // Log the data being sent
      console.log('Sending data:', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirth: formData.get('dateOfBirth'),
        nationalId: profile.nationalId,
        drivingLicense: profile.drivingLicense,
        phoneNumber: profile.phoneNumber,
        address: profile.address,
        provinceCode: profile.provinceCode
      });

      const response = await UpdateProfileInfo(formData);
      if (response.data) {
        alert('Cập nhật thông tin thành công!');
        // Refresh profile data
        const profileData = await GetProfile();
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      if (error.response?.data) {
        console.error('Error details:', error.response.data);
      }
      alert(error.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row">
        {/* Avatar Section - Left Column */}
        <div className="col-md-4">
          <div className="card shadow mb-4">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Ảnh Đại Diện</h4>
            </div>
            <div className="card-body">
              <div className="avatar-upload-section">
                <div 
                  className="drop-zone" 
                  onClick={() => document.getElementById('avatarInput').click()}
                >
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="preview-image" 
                    />
                  ) : profile.avatarPath ? (
                    <img
                      src={profile.avatarPath.startsWith('http')
                        ? profile.avatarPath
                        : `http://localhost:8080${profile.avatarPath}`}
                      alt="Current Avatar"
                      className="preview-image"
                    />
                  ) : (
                    <div className="drop-zone-content">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Kéo thả ảnh vào đây hoặc click để chọn</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="avatarInput"
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="file-input"
                    hidden
                  />
                </div>
                <button 
                  className={`btn btn-primary w-100 mt-3 ${loading ? 'loading' : ''}`}
                  onClick={handleUpdateAvatar}
                  disabled={loading || !avatarFile}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang cập nhật...
                    </>
                  ) : "Cập nhật ảnh đại diện"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Section - Right Column */}
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Thông Tin Cá Nhân</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleUpdateProfile}>
                {/* CCCD Verification Section */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="mb-3">Xác thực CCCD</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <label className="form-label">Số CCCD</label>
                        <input
                          className={`form-control ${errors.nationalId ? 'is-invalid' : ''}`}
                          name="nationalId"
                          value={profile.nationalId}
                          onChange={handleChange}
                          readOnly={profile.cccdVerified || accountStatus === 'ACTIVE'}
                          placeholder="Nhập số CCCD"
                        />
                        {errors.nationalId && <small className="text-danger">{errors.nationalId}</small>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Upload ảnh CCCD</label>
                        <input 
                          type="file" 
                          className="form-control" 
                          accept="image/*" 
                          onChange={handleCCCDFileChange}
                          disabled={profile.cccdVerified || accountStatus === 'ACTIVE'}
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <button 
                        type="button" 
                        className={`btn ${profile.cccdVerified || accountStatus === 'ACTIVE' ? 'btn-success' : 'btn-primary'}`}
                        onClick={handleVerifyCCCD}
                        disabled={!cccdFile || verifying || profile.cccdVerified || accountStatus === 'ACTIVE'}
                      >
                        {profile.cccdVerified || accountStatus === 'ACTIVE' ? 'Đã xác thực' : verifying ? 'Đang xác thực...' : 'Xác thực CCCD'}
                      </button>
                      {(profile.cccdVerified || accountStatus === 'ACTIVE') && (
                        <small className="text-success mt-2 d-block">
                          ✓ Tài khoản đã được xác thực CCCD
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Họ</label>
                    <input 
                      className="form-control" 
                      name="firstName" 
                      value={profile.firstName} 
                      onChange={handleChange}
                      placeholder="Nhập họ"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Tên</label>
                    <input 
                      className="form-control" 
                      name="lastName" 
                      value={profile.lastName} 
                      onChange={handleChange}
                      placeholder="Nhập tên"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Ngày sinh</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      name="dateOfBirth" 
                      value={profile.dateOfBirth} 
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Số bằng lái</label>
                    <input 
                      className="form-control" 
                      name="drivingLicense" 
                      value={profile.drivingLicense} 
                      onChange={handleChange}
                      placeholder="Nhập số bằng lái"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Số điện thoại</label>
                    <input 
                      className="form-control" 
                      name="phoneNumber" 
                      value={profile.phoneNumber} 
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Địa chỉ</label>
                    <input 
                      className="form-control" 
                      name="address" 
                      value={profile.address} 
                      onChange={handleChange}
                      placeholder="Nhập địa chỉ chi tiết"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Tỉnh/Thành phố</label>
                    <select
                      className="form-select"
                      name="provinceCode"
                      value={profile.provinceCode || ''}
                      onChange={handleChange}
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      {provinces.map(province => (
                        <option key={province.code} value={province.code}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 mt-4">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Đang cập nhật...
                        </>
                      ) : "Cập nhật thông tin"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className='container mt-3 d-flex gap-2'>
        <a href="/profile" className='btn btn-warning'>Quay lại</a>
        <a href="/change-password" className='btn btn-secondary'>Đổi mật khẩu</a>
      </div>
    </div>
  );
}

export default EditProfile;