import React, { useState, useEffect } from 'react';
import '../css/AddCarPage.css';
import { addBrand, addCar, getAllbrand, getAllCategory, getAllSegment } from '../BackEnd/authen';
import axios from 'axios';


const AddCarPage = () => {
  const [segments, setSegments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState('');
  const [brandInput, setBrandInput] = useState('');
  const [brandId, setBrandId] = useState(null);
  const [carData, setCarData] = useState({
    carName: '',
    licensePlate: '',
    model: '',
    year: '',
    color: '',
    seats: '',
    pricePerDay: '',
    imagePaths: ''
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
  }, []);

  const handleCarChange = (e) => {
    const { name, value } = e.target;
    setCarData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCar = async (e) => {
    e.preventDefault();

    if (!brandId) {
      alert("Vui lòng chọn hoặc thêm một thương hiệu trước.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("carName", carData.carName);
      formData.append("licensePlate", carData.licensePlate);
      formData.append("brandId", brandId);
      formData.append("model", carData.model);
      formData.append("year", carData.year);
      formData.append("color", carData.color);
      formData.append("seats", carData.seats);
      formData.append("pricePerDay", carData.pricePerDay);
      formData.append("carImage", carData.imagePaths); // carImage là file

      await axios.post("http://localhost:8080/api/cars/add-car", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert('Thêm xe thành công!');
    } catch (err) {
      alert('Lỗi khi thêm xe: ' + err.message);
      console.error(err);
    }
  };



  const handleAddBrand = async () => {
    if (!brandInput || !selectedCategoryId || !selectedSegmentId) {
      alert('Vui lòng chọn đủ thông tin thương hiệu');
      return;
    }

    try {
      const data = await addBrand({
        brandName: brandInput,
        categoryId: selectedCategoryId,
        segmentId: selectedSegmentId
      });
      setBrandId(data.id);
      alert('Thêm thương hiệu thành công!');
    } catch (err) {
      alert('Lỗi khi thêm thương hiệu: ' + err.message);
      console.error(err);
    }
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
          onChange={(e) => setBrandId(e.target.value)}
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
              <input className="form-control" type="number" name="pricePerDay" placeholder="Giá thuê mỗi ngày" onChange={handleCarChange} required />
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
