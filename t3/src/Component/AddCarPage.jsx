import React, { useState, useEffect } from 'react';
import '../css/AddCarPage.css';
import { addBrand, addCar, getAllbrand, getAllCategory, getAllSegment, getAllProvinces } from '../BackEnd/authen';
import axiosInstance from '../Authen/axiosInstance';
import { useNavigate } from 'react-router-dom';

const AddCarPage = () => {
  const [segments, setSegments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState('');
  const [brandInput, setBrandInput] = useState('');
  const [brandId, setBrandId] = useState(null);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const [carData, setCarData] = useState({
    carName: '',
    licensePlate: '',
    model: '',
    year: '',
    color: '',
    seats: '',
    pricePerDay: '',
    imagePaths: '',
    address: '',
    provinceCode: '',
    fuel: '',
    transmission: ''
  });
  const token = localStorage.getItem('token');
  useEffect(() => {
    getAllSegment()
      .then(res => setSegments(Array.isArray(res) ? res : []))
      .catch(err => console.error("Error fetching segments:", err));

    getAllCategory()
      .then(res => setCategories(Array.isArray(res) ? res : []))
      .catch(err => console.error("Error fetching categories:", err));

    getAllbrand()
      .then(res => setBrands(Array.isArray(res) ? res : []))
      .catch(err => console.error("Error fetching brands:", err));

    getAllProvinces()
      .then(res => setProvinces(Array.isArray(res) ? res : []))
      .catch(err => console.error("Error fetching provinces:", err));
  }, []);

  const handleCarChange = (e) => {
    const { name, value } = e.target;
    if (name === 'pricePerDay') {
      // Remove commas and convert to number
      const numericValue = value.replace(/,/g, '');
      if (!isNaN(numericValue)) {
        // Format with commas
        const formattedValue = Number(numericValue).toLocaleString('en-US');
        setCarData(prev => ({ ...prev, [name]: formattedValue }));
      }
    } else if (name === 'provinceCode') {
      // When province is selected, update both provinceCode and address
      const selectedProvince = provinces.find(p => p.code === value);
      setCarData(prev => ({
        ...prev,
        provinceCode: value,
        address: selectedProvince ? selectedProvince.name : ''
      }));
    } else {
      setCarData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
  
    if (!selectedCategoryId) {
      alert("Vui lòng chọn danh mục xe!");
      return;
    }
  
    if (!selectedSegmentId) {
      alert("Vui lòng chọn phân khúc xe!");
      return;
    }
  
    if (!brandId) {
      alert("Vui lòng chọn hoặc thêm một thương hiệu!");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("carName", carData.carName);
      formData.append("licensePlate", carData.licensePlate);
      formData.append("model", carData.model);
      formData.append("year", parseInt(carData.year));
      formData.append("color", carData.color);
      formData.append("seats", parseInt(carData.seats));
      // Remove commas before sending to server
      formData.append("pricePerDay", parseFloat(carData.pricePerDay.replace(/,/g, '')));
      formData.append("carImage", carData.imagePaths);
      formData.append("address", carData.address);
      formData.append("provinceCode", carData.provinceCode);
      formData.append("brandId", parseInt(brandId));
      formData.append("segmentId", parseInt(selectedSegmentId));
      formData.append("categoryId", parseInt(selectedCategoryId));
      formData.append("fuel", carData.fuel);
      formData.append("transmission", carData.transmission);
  
      const response = await axiosInstance.post("/api/cars/add-car", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
  
      const carId = response.data;
      alert('Thêm xe thành công!');
      navigate(`/them-chi-tiet-xe/${carId}`);
  
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response?.data);
      
      setErrorMessage('');
      
      if (err.response?.status === 400) {
        setErrorMessage('Biển số xe đã tồn tại trong hệ thống');
      } else if (err.customMessage) {
        setErrorMessage(err.customMessage);
      } else {
        setErrorMessage('Đã xảy ra lỗi khi thêm xe');
      }
    }
  };
  



  const handleAddBrand = async () => {
    if (!brandInput ) {
      alert('Vui lòng chọn đủ thông tin thương hiệu');
      return;
    }

    try {
      const data = await addBrand({
        brandName: brandInput
      });
      setBrandId(data.id);
      alert('Thêm thương hiệu thành công!');
      
    } catch (err) {
      alert('Lỗi khi thêm thương hiệu: ' + err.message);
      console.error(err);
    }
    window.location.reload();
  };
  

  return (
    <div className="container py-4">
      <h3 className="mb-3">1. Chọn Danh Mục (Loại Xe)</h3>
      <div className="d-flex flex-wrap gap-3">
        {Array.isArray(categories) && categories.length > 0 ? (
          categories.map(cat => (
            <div
              key={cat.id}
              className={`category-card ${selectedCategoryId === cat.id ? 'selected' : ''}`}
              onClick={() => setSelectedCategoryId(cat.id)}
            >
              <img
                src={
                  cat.categoryImage
                    ? (cat.categoryImage.startsWith('http') ? cat.categoryImage : `http://localhost:8080${cat.categoryImage}`)
                    : 'http://localhost:8080/Image/category/default.png'
                }
                alt={cat.name}
                className="img-fluid"
              />

              <p className="mt-2 text-center fw-bold">{cat.name}</p>
            </div>
          ))
        ) : (
          <p>Đang tải danh mục...</p>
        )}
      </div>

      <h3 className="mt-4">2. Chọn Phân Khúc</h3>
      <select
        className="form-select w-50"
        value={selectedSegmentId}
        onChange={(e) => setSelectedSegmentId(e.target.value)}
      >
        <option value="">-- Chọn phân khúc --</option>
        {segments.map(seg => (
          <option key={seg.id} value={seg.id}>
            {seg.name} - {seg.description}
          </option>
        ))}
      </select>

      <h3 className="mt-4">3. Nhập hoặc chọn Thương Hiệu</h3>
      <div className="d-flex gap-2 align-items-center">
        <input
          className="form-control w-50"
          type="text"
          placeholder="Nhập tên thương hiệu xe"
          value={brandInput}
          onChange={(e) => setBrandInput(e.target.value)}
        />
        <button className="btn btn-success" onClick={handleAddBrand}>Thêm Brand</button>
      </div>

      <div className="mt-3">
      <select
          className="form-select w-50"
          onChange={(e) => setBrandId(Number(e.target.value))}  
        >

          <option value="">-- Hoặc chọn brand có sẵn --</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.brandName}</option>
          ))}
        </select>
      </div>

      {brandId && (
        <>
          <h3 className="mt-5">4. Nhập Thông Tin Xe Mới</h3>
          <form onSubmit={handleAddCar} className="row g-3 mt-2">
            <div className='col-md-6'>
                <input
                  type="file"
                  className="form-control"
                  name="imagePaths"
                  onChange={(e) => setCarData(prev => ({ ...prev, imagePaths: e.target.files[0] }))}
                  required
                />

            </div>
            <div className="col-md-6">
                <input
                  className="form-control"
                  type="text"
                  name="carName"
                  placeholder="Tên xe"
                  onChange={handleCarChange}
                  required
                />
              </div>

            <div className="col-md-6">
              <input className="form-control" type="text" name="licensePlate" placeholder="Biển số" onChange={handleCarChange} required />
              {errorMessage && (
                <div className="alert alert-danger mt-3">{errorMessage}</div>
              )}

            </div>
            <div className="col-md-6">
              <input className="form-control" type="text" name="model" placeholder="Model" onChange={handleCarChange} required />
            </div>
            <div className="col-md-6">
              <input className="form-control" type="number" name="year" placeholder="Năm sản xuất" onChange={handleCarChange} required />
            </div>
            <div className="col-md-6">
              <input className="form-control" type="text" name="color" placeholder="Màu sắc" onChange={handleCarChange} required />
            </div>
            <div className="col-md-6">
              <input className="form-control" type="number" name="seats" placeholder="Số ghế" onChange={handleCarChange} required />
            </div>
            <div className="col-md-6">
              <input 
                className="form-control" 
                type="text" 
                name="pricePerDay" 
                placeholder="Giá thuê mỗi ngày" 
                value={carData.pricePerDay}
                onChange={handleCarChange} 
                required 
              />
            </div>
            <div className="col-md-6">
              <select
                className="form-select"
                name="provinceCode"
                value={carData.provinceCode}
                onChange={handleCarChange}
                required
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinces.map(province => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <select
                className="form-control"
                name="fuel"
                onChange={handleCarChange}
                required
              >
                <option value="">-- Chọn loại nhiên liệu --</option>
                <option value="GASOLINE">Xăng</option>
                <option value="DIESEL">Dầu diesel</option>
                <option value="ELECTRIC">Điện</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div className="col-md-6">
              <select
                className="form-control"
                name="transmission"
                onChange={handleCarChange}
                required
              >
                <option value="">-- Chọn hộp số --</option>
                <option value="MANUAL">Số sàn</option>
                <option value="AUTOMATIC">Số tự động</option>
                <option value="CVT">Hộp số CVT</option>
                <option value="DCT">Hộp số ly hợp kép</option>
              </select>
            </div>
            <div className="col-12">
              <button className="btn btn-primary" type="submit">Thêm Xe</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default AddCarPage;
