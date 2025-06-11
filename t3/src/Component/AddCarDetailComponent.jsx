import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { addCarDetail, getCarImagesByCarId, deleteCarImage } from '../BackEnd/authen';
import '../css/AddCarDetail.css';

const AddCarDetailComponent = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [carImages, setCarImages] = useState([]);

  const [detailData, setDetailData] = useState({
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
    // Car Usage Terms
    noSmoking: false,
    noPets: false,
    noEating: false,
    returnFullTank: false,
    noOffroad: false,
    cleanCar: false,
    noDeliveryService: false
  });

  useEffect(() => {
    fetchCarImages();
  }, []);

  const fetchCarImages = async () => {
    try {
      const images = await getCarImagesByCarId(carId);
      setCarImages(images);
    } catch (error) {
      console.error("Error fetching car images:", error);
    }
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    
    if (name === 'mileage') {
      // Remove commas and convert to number
      const numericValue = value.replace(/,/g, '');
      if (!isNaN(numericValue)) {
        // Format with commas
        const formattedValue = Number(numericValue).toLocaleString('en-US');
        setDetailData(prev => ({ ...prev, [name]: formattedValue }));
      }
    } else {
      setDetailData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...detailData,
      mileage: Number(detailData.mileage.replace(/,/g, '')), // Remove commas before converting to number
      fuelCommission: Number(detailData.fuelCommission),
      carId: Number(carId)
    };

    try {
      await addCarDetail(carId, payload);
      alert('Thêm chi tiết xe thành công');
      navigate('/them-anh-xe/' + carId); 
    } catch (error) {
      alert('Có lỗi khi thêm chi tiết xe');
      console.error(error);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteCarImage(imageId);
      setCarImages(prevImages => prevImages.filter(img => img.id !== imageId));
      alert('Xóa ảnh thành công!');
    } catch (error) {
      alert('Lỗi khi xóa ảnh: ' + error.message);
    }
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
      <div className="card shadow">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h2 className="mb-0">Thêm Chi Tiết Xe</h2>
          <Link to={`/cap-nhat-xe/${carId}`} className="btn btn-light">
            Cập nhật xe
          </Link>
        </div>
        <div className="card-body">
          {/* Hiển thị ảnh xe */}
          <div className="mb-4">
            <h4>Ảnh xe</h4>
            <div className="row g-3">
              {carImages.map((image) => (
                <div key={image.id} className="col-md-3">
                  <div className="image-container position-relative">
                    <img
                      src={`http://localhost:8080${image.imgPath}`}
                      alt="Car"
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
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label className="form-label">Số km đã đi:</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      name="mileage"
                      value={detailData.mileage}
                      onChange={handleChange}
                      required
                      placeholder="Nhập số km"
                    />
                    <span className="input-group-text">km</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label className="form-label">Mức tiêu thụ nhiên liệu:</label>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      name="fuelCommission"
                      value={detailData.fuelCommission}
                      onChange={handleChange}
                      required
                      placeholder="Nhập mức tiêu thụ"
                    />
                    <span className="input-group-text">L/100km</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Tính năng xe:</label>
              <div className="row g-3">
                {features.map((feature) => (
                  <div key={feature.name} className="col-md-3 col-sm-6">
                    <div className="feature-card">
                      <label className="feature-label">
                        <input
                          type="checkbox"
                          name={feature.name}
                          checked={detailData[feature.name]}
                          onChange={handleChange}
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
              <label className="form-label">Điều khoản sử dụng xe:</label>
              <div className="row g-3">
                {terms.map((term) => (
                  <div key={term.name} className="col-md-3 col-sm-6">
                    <div className="feature-card terms-card">
                      <label className="feature-label">
                        <input
                          type="checkbox"
                          name={term.name}
                          checked={detailData[term.name]}
                          onChange={handleChange}
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
              <label className="form-label">Mô tả thêm:</label>
              <textarea
                name="description"
                value={detailData.description}
                onChange={handleChange}
                className="form-control"
                rows="4"
                placeholder="Nhập mô tả chi tiết về xe..."
              />
            </div>

            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-primary btn-lg">
                Lưu và Tiếp Tục
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCarDetailComponent;
