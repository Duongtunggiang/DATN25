import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getCarById, 
  getCarDetailById, 
  updateCar, 
  updateCarDetail, 
  getAllbrand, 
  getAllCategory, 
  getAllSegment,
  getCarImagesByCarId,
  deleteCarImage,
  addCarImages,
  updateCarImage
} from '../BackEnd/authen';
import axiosInstance from '../Authen/axiosInstance';
import '../css/AddCarPage.css';
import '../css/AddCarDetail.css';
import '../css/UpdateCarPage.css';
import '../css/AddCarImage.css';

const UpdateCarPage = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [segments, setSegments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [car, setCars] = useState([]);
  const [error, setError] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [carData, setCarData] = useState({
    carName: '',
    licensePlate: '',
    model: '',
    year: '',
    color: '',
    seats: '',
    pricePerDay: '',
    address: '',
    fuel: '',
    transmission: '',
    brandId: '',
    segmentId: '',
    categoryId: ''
  });

  const [carDetail, setCarDetail] = useState({
    bluetooth: false,
    camera: false,
    mileage: '',
    fuelCommission: '',
    sunRoof: false,
    childLock: false,
    childSeat: false,
    dvd: false,
    description: '',
    usb: false,
    gps: false,
    noSmoking: false,
    noPets: false,
    noEating: false,
    returnFullTank: false,
    noOffroad: false,
    cleanCar: false,
    noDeliveryService: false
  });

  const fetchImages = async () => {
    try {
      const res = await axiosInstance.get(`/api/cars/${carId}/car-images`);
      if (res.data) {
        setImages(res.data);
      }
    } catch (error) {
      console.error("Lấy ảnh lỗi:", error);
    }
  };

  const fetchCars = async () => {
    try {
      const res = await axiosInstance.get(`/api/cars/${carId}`);
      setCars(res.data);
    } catch (error) {
      console.error("Lấy xe lỗi:", error);
      setError("Không thể tải thông tin xe");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carResponse, detailResponse, segmentsData, categoriesData, brandsData] = await Promise.all([
          getCarById(carId),
          getCarDetailById(carId),
          getAllSegment(),
          getAllCategory(),
          getAllbrand()
        ]);

        if (carResponse) {
          setCarData({
            ...carResponse,
            brandId: carResponse.brand?.id,
            segmentId: carResponse.segment?.id,
            categoryId: carResponse.category?.id
          });
          setCars(carResponse);
        }

        if (detailResponse) setCarDetail(detailResponse);
        if (segmentsData) setSegments(segmentsData);
        if (categoriesData) setCategories(categoriesData);
        if (brandsData) setBrands(brandsData);
        
        await fetchImages();
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Không thể tải thông tin xe");
      }
    };

    fetchData();
  }, [carId]);

  const handleCarChange = (e) => {
    const { name, value } = e.target;
    setCarData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (e) => {
    const { name, type, checked, value } = e.target;
    setCarDetail(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdateCar = async (e) => {
    e.preventDefault();
    try {
      await updateCar(carId, carData);
      alert('Cập nhật thông tin xe thành công!');
    } catch (error) {
      alert('Lỗi khi cập nhật thông tin xe: ' + error.message);
    }
  };

  const handleUpdateCarDetail = async (e) => {
    e.preventDefault();
    try {
      await updateCarDetail(carId, carDetail);
      alert('Cập nhật chi tiết xe thành công!');
    } catch (error) {
      alert('Lỗi khi cập nhật chi tiết xe: ' + error.message);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!imageId) {
      alert('Không thể xóa ảnh này. ID ảnh không hợp lệ.');
      return;
    }
    
    try {
      await deleteCarImage(imageId);
      setImages(prevImages => prevImages.filter(img => img.id !== imageId));
      alert('Xóa ảnh thành công!');
      await fetchImages(); // Refresh images after deletion
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Lỗi khi xóa ảnh: ' + error.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Vui lòng chọn ảnh để tải lên");
      return;
    }

    const formData = new FormData();
    formData.append("carImage", selectedFile);

    try {
      setLoading(true);
      await axiosInstance.post(`/api/cars/add-images/${carId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchImages();
    } catch (error) {
      alert("Lỗi khi thêm ảnh");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfileImage = async () => {
    if (!profileImageFile) {
      alert('Vui lòng chọn ảnh đại diện mới');
      return;
    }

    try {
      setIsUpdating(true);
      await updateCarImage(carId, profileImageFile);
      alert('Cập nhật ảnh đại diện thành công!');
      // Refresh car data to show new image
      await fetchCars();
      setProfileImageFile(null);
      setProfilePreview(null);
    } catch (error) {
      alert('Lỗi khi cập nhật ảnh đại diện: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBack = () => {
    navigate(`/chi-tiet-xe/${carId}`);
  };

  const features = [
    { name: 'bluetooth', label: 'Bluetooth', icon: '🎵' },
    { name: 'camera', label: 'Camera', icon: '📸' },
    { name: 'sunRoof', label: 'Cửa sổ trời', icon: '☀️' },
    { name: 'childLock', label: 'Khóa trẻ em', icon: '🔒' },
    { name: 'childSeat', label: 'Ghế trẻ em', icon: '👶' },
    { name: 'dvd', label: 'DVD', icon: '📀' },
    { name: 'usb', label: 'USB', icon: '🔌' },
    { name: 'gps', label: 'GPS', icon: '🛰️' }
  ];

  const terms = [
    { name: 'noSmoking', label: 'Không hút thuốc', icon: '🚭' },
    { name: 'noPets', label: 'Không thú cưng', icon: '🐾' },
    { name: 'noEating', label: 'Không ăn uống', icon: '🍽️' },
    { name: 'returnFullTank', label: 'Trả xe đầy xăng', icon: '⛽' },
    { name: 'noOffroad', label: 'Không đi địa hình', icon: '🚫' },
    { name: 'cleanCar', label: 'Trả xe sạch sẽ', icon: '✨' },
    { name: 'noDeliveryService', label: 'Không dùng để giao hàng', icon: '📦' }
  ];

  return (
    <div className="container py-5">
      {/* Back button */}
      <div className="mb-4">
        <button 
          className="btn btn-secondary"
          onClick={handleBack}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại chi tiết xe
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Car Information Section */}
      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Cập Nhật Thông Tin Xe</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleUpdateCar}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Tên xe</label>
                <input
                  type="text"
                  className="form-control"
                  name="carName"
                  value={carData.carName}
                  onChange={handleCarChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Biển số xe</label>
                <input
                  type="text"
                  className="form-control"
                  name="licensePlate"
                  value={carData.licensePlate}
                  onChange={handleCarChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Danh mục</label>
                <select
                  className="form-select"
                  name="categoryId"
                  value={carData.categoryId}
                  onChange={handleCarChange}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Phân khúc</label>
                <select
                  className="form-select"
                  name="segmentId"
                  value={carData.segmentId}
                  onChange={handleCarChange}
                  required
                >
                  <option value="">Chọn phân khúc</option>
                  {segments.map(seg => (
                    <option key={seg.id} value={seg.id}>
                      {seg.name} - {seg.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Thương hiệu</label>
                <select
                  className="form-select"
                  name="brandId"
                  value={carData.brandId}
                  onChange={handleCarChange}
                  required
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.brandName}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Model</label>
                <input
                  type="text"
                  className="form-control"
                  name="model"
                  value={carData.model}
                  onChange={handleCarChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Năm sản xuất</label>
                <input
                  type="number"
                  className="form-control"
                  name="year"
                  value={carData.year}
                  onChange={handleCarChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Màu sắc</label>
                <input
                  type="text"
                  className="form-control"
                  name="color"
                  value={carData.color}
                  onChange={handleCarChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Số ghế</label>
                <input
                  type="number"
                  className="form-control"
                  name="seats"
                  value={carData.seats}
                  onChange={handleCarChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Giá thuê/ngày</label>
                <input
                  type="number"
                  className="form-control"
                  name="pricePerDay"
                  value={carData.pricePerDay}
                  onChange={handleCarChange}
                  required
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">Địa chỉ</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={carData.address}
                  onChange={handleCarChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Nhiên liệu</label>
                <select
                  className="form-select"
                  name="fuel"
                  value={carData.fuel}
                  onChange={handleCarChange}
                  required
                >
                  <option value="">Chọn loại nhiên liệu</option>
                  <option value="GASOLINE">Xăng</option>
                  <option value="DIESEL">Dầu diesel</option>
                  <option value="ELECTRIC">Điện</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Hộp số</label>
                <select
                  className="form-select"
                  name="transmission"
                  value={carData.transmission}
                  onChange={handleCarChange}
                  required
                >
                  <option value="">Chọn hộp số</option>
                  <option value="MANUAL">Số sàn</option>
                  <option value="AUTOMATIC">Số tự động</option>
                </select>
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary">
                  Cập nhật thông tin xe
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Car Detail Section */}
      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Cập Nhật Chi Tiết Xe</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleUpdateCarDetail}>
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label">Số km đã đi</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    name="mileage"
                    value={carDetail.mileage}
                    onChange={handleDetailChange}
                    required
                  />
                  <span className="input-group-text">km</span>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label">Mức tiêu thụ nhiên liệu</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    name="fuelCommission"
                    value={carDetail.fuelCommission}
                    onChange={handleDetailChange}
                    required
                  />
                  <span className="input-group-text">L/100km</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Tính năng xe</label>
              <div className="row g-3">
                {features.map((feature) => (
                  <div key={feature.name} className="col-md-3 col-sm-6">
                    <div className="feature-card">
                      <label className="feature-label">
                        <input
                          type="checkbox"
                          name={feature.name}
                          checked={carDetail[feature.name]}
                          onChange={handleDetailChange}
                          className="feature-input"
                        />
                        <span className="feature-icon">{feature.icon}</span>
                        <span className="feature-text">{feature.label}</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Điều khoản sử dụng xe</label>
              <div className="row g-3">
                {terms.map((term) => (
                  <div key={term.name} className="col-md-3 col-sm-6">
                    <div className="feature-card terms-card">
                      <label className="feature-label">
                        <input
                          type="checkbox"
                          name={term.name}
                          checked={carDetail[term.name]}
                          onChange={handleDetailChange}
                          className="feature-input"
                        />
                        <span className="feature-icon">{term.icon}</span>
                        <span className="feature-text">{term.label}</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Mô tả thêm</label>
              <textarea
                name="description"
                value={carDetail.description}
                onChange={handleDetailChange}
                className="form-control"
                rows="4"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Cập nhật chi tiết xe
            </button>
          </form>
        </div>
      </div>

      {/* Car Images Section */}
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Quản Lý Ảnh Xe</h2>
        </div>
        <div className="card-body">
          <div className="row">
            {/* Profile Image Update Section */}
            <div className="col-md-6 mb-4">
              <div className="upload-section">
                <h4 className="mb-3">Cập nhật ảnh đại diện xe</h4>
                <div className="profile-image-upload">
                  <div 
                    className="drop-zone" 
                    onClick={() => document.getElementById('profileImageInput').click()}
                  >
                    {profilePreview ? (
                      <img 
                        src={profilePreview} 
                        alt="Preview" 
                        className="preview-image" 
                      />
                    ) : car && car.imagePaths ? (
                      <img
                        src={`http://localhost:8080${car.imagePaths}`}
                        alt="Current Profile"
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
                      id="profileImageInput"
                      onChange={handleProfileImageChange}
                      accept="image/*"
                      className="file-input"
                      hidden
                    />
                  </div>
                  <button 
                    className={`btn btn-primary w-100 mt-3 ${isUpdating ? 'loading' : ''}`}
                    onClick={handleUpdateProfileImage}
                    disabled={isUpdating || !profileImageFile}
                  >
                    {isUpdating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang cập nhật...
                      </>
                    ) : "Xác nhận cập nhật ảnh đại diện"}
                  </button>
                </div>
              </div>
            </div>

            {/* Detail Images Upload Section */}
            <div className="col-md-6 mb-4">
              <div className="upload-section">
                <h4 className="mb-3">Tải lên ảnh chi tiết mới</h4>
                <form onSubmit={handleUploadImage} className="upload-form">
                  <div className="drop-zone" onClick={() => document.getElementById('fileInput').click()}>
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
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
                      id="fileInput"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="file-input"
                      hidden
                    />
                  </div>
                  <button 
                    className={`btn btn-primary w-100 mt-3 ${loading ? 'loading' : ''}`}
                    disabled={loading || !selectedFile}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang tải...
                      </>
                    ) : "Tải ảnh lên"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="image-gallery-section mt-4">
            <h4 className="mb-3">Thư viện ảnh</h4>
            <div className="row g-3">
              {Array.isArray(images) && images.length > 0 ? (
                images.map((image, index) => (
                  <div key={`car-image-${index}`} className="col-md-3">
                    <div className="image-container position-relative">
                      <img
                        src={`http://localhost:8080${image.imagePath}`}
                        alt={`Car Image ${index + 1}`}
                        className="img-fluid rounded"
                      />
                      <button
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center">
                  <p className="text-muted">Chưa có ảnh nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateCarPage; 