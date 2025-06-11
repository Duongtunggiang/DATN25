import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  addCar, 
  getAllbrand, 
  getAllSegment, 
  getAllCategory 
} from '../BackEnd/authen';

const ThemXe = () => {
  const [carData, setCarData] = useState({
    licensePlate: '',
    brandId: '',
    segmentId: '',
    categoryId: '',
    carName: '',
    model: '',
    year: '',
    color: '',
    seats: '',
    pricePerDay: '',
    address: '',
    fuel: 'GASOLINE',
    transmission: 'AUTO'
  });

  const [brands, setBrands] = useState([]);
  const [segments, setSegments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Enum options
  const transmissionOptions = [
    { value: 'AUTO', label: 'Số tự động' },
    { value: 'MANUAL', label: 'Số sàn' },
    { value: 'CVT', label: 'Hộp số CVT' },
    { value: 'DCT', label: 'Hộp số ly hợp kép' }
  ];

  const fuelOptions = [
    { value: 'GASOLINE', label: 'Xăng' },
    { value: 'DIESEL', label: 'Dầu diesel' },
    { value: 'ELECTRIC', label: 'Điện' },
    { value: 'HYBRID', label: 'Hybrid' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [brandsData, segmentsData, categoriesData] = await Promise.all([
        getAllbrand(),
        getAllSegment(),
        getAllCategory()
      ]);

      setBrands(brandsData);
      setSegments(segmentsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      alert("Có lỗi khi tải dữ liệu. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numberFields = ['year', 'seats', 'pricePerDay'];
    
    setCarData(prevData => ({
      ...prevData,
      [name]: numberFields.includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    
    Object.keys(carData).forEach(key => {
      formData.append(key, carData[key]);
    });

    try {
      const response = await addCar(formData);
      const newCarId = response.id;
      navigate(`/them-chi-tiet-xe/${newCarId}`);
    } catch (error) {
      if (error.response?.status === 403) {
        alert("Bạn không có quyền thêm xe!");
      } else {
        alert(error.response?.data?.message || "Có lỗi khi thêm xe");
      }
      console.error("Lỗi khi thêm xe:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="add-car-container">
      <h1>Thêm Xe Mới</h1>
      <form onSubmit={handleSubmit} className="add-car-form">
        <div className="form-group">
          <label>Biển số xe:</label>
          <input
            type="text"
            name="licensePlate"
            value={carData.licensePlate}
            onChange={handleChange}
            placeholder="Nhập biển số xe"
            required
          />
        </div>

        <div className="form-group">
          <label>Tên xe:</label>
          <input
            type="text"
            name="carName"
            value={carData.carName}
            onChange={handleChange}
            placeholder="Nhập tên xe"
            required
          />
        </div>

        <div className="form-group">
          <label>Hãng xe:</label>
          <select
            name="brandId"
            value={carData.brandId}
            onChange={handleChange}
            required
          >
            <option value="">Chọn hãng xe</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.brandName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Phân khúc:</label>
          <select
            name="segmentId"
            value={carData.segmentId}
            onChange={handleChange}
            required
          >
            <option value="">Chọn phân khúc</option>
            {segments.map(segment => (
              <option key={segment.id} value={segment.id}>
                {segment.segmentName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Loại xe:</label>
          <select
            name="categoryId"
            value={carData.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">Chọn loại xe</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Model:</label>
          <input
            type="text"
            name="model"
            value={carData.model}
            onChange={handleChange}
            placeholder="Nhập model xe"
            required
          />
        </div>

        <div className="form-group">
          <label>Năm sản xuất:</label>
          <input
            type="number"
            name="year"
            value={carData.year}
            onChange={handleChange}
            placeholder="Nhập năm sản xuất"
            min="1900"
            max={new Date().getFullYear()}
            required
          />
        </div>

        <div className="form-group">
          <label>Màu sắc:</label>
          <input
            type="text"
            name="color"
            value={carData.color}
            onChange={handleChange}
            placeholder="Nhập màu xe"
            required
          />
        </div>

        <div className="form-group">
          <label>Số ghế:</label>
          <select
            name="seats"
            value={carData.seats}
            onChange={handleChange}
            required
          >
            <option value="">Chọn số ghế</option>
            <option value="4">4 chỗ</option>
            <option value="5">5 chỗ</option>
            <option value="7">7 chỗ</option>
            <option value="16">16 chỗ</option>
          </select>
        </div>

        <div className="form-group">
          <label>Hộp số:</label>
          <select
            name="transmission"
            value={carData.transmission}
            onChange={handleChange}
            required
          >
            <option value="">Chọn hộp số</option>
            {transmissionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Nhiên liệu:</label>
          <select
            name="fuel"
            value={carData.fuel}
            onChange={handleChange}
            required
          >
            <option value="">Chọn loại nhiên liệu</option>
            {fuelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Giá thuê/ngày:</label>
          <input
            type="number"
            name="pricePerDay"
            value={carData.pricePerDay}
            onChange={handleChange}
            placeholder="Nhập giá thuê mỗi ngày"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Địa chỉ:</label>
          <input
            type="text"
            name="address"
            value={carData.address}
            onChange={handleChange}
            placeholder="Nhập địa chỉ xe"
            required
          />
        </div>

        <button type="submit" className="submit-button">Thêm Xe</button>
      </form>
    </div>
  );
};

export default ThemXe;
