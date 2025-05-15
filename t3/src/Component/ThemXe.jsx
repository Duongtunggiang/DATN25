import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { addCar } from '../BackEnd/authen';

const ThemXe = () => {
  const [carData, setCarData] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    year: '',
    color: '',
    seats: '',
    pricePerDay: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCarData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const carDataWithNumbers = {
      ...carData,
      year: Number(carData.year), // Chuyển year thành number
      seats: Number(carData.seats), // Chuyển seats thành number
      pricePerDay: Number(carData.pricePerDay) // Chuyển pricePerDay thành number
    };

    try {
      await addCar(carDataWithNumbers);
      alert("Thêm xe thành công!");
      navigate('/home-xe'); // Quay lại trang danh sách xe
      console.log("Dữ liệu xe cần thêm:", carDataWithNumbers);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        alert("Bạn không có quyền thêm xe!");
      } else {
        alert("Có lỗi khi thêm xe");
      }
      console.error("Có lỗi khi thêm xe", error);
      console.log("Dữ liệu xe cần thêm:", carDataWithNumbers);
    }
  };


  return (
    <div>
      <h1>Thêm Xe Mới</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="licensePlate"
          value={carData.licensePlate}
          onChange={handleChange}
          placeholder="Biển số"
          required
        />
        <input
          type="text"
          name="brand"
          value={carData.brand}
          onChange={handleChange}
          placeholder="Hãng xe"
          required
        />
        <input
          type="text"
          name="model"
          value={carData.model}
          onChange={handleChange}
          placeholder="Model"
          required
        />
        <input
          type="number"
          name="year"
          value={carData.year}
          onChange={handleChange}
          placeholder="Năm sản xuất"
          required
        />
        <input
          type="text"
          name="color"
          value={carData.color}
          onChange={handleChange}
          placeholder="Màu sắc"
          required
        />
        <input
          type="number"
          name="seats"
          value={carData.seats}
          onChange={handleChange}
          placeholder="Số ghế"
          required
        />
        <input
          type="number"
          name="pricePerDay"
          value={carData.pricePerDay}
          onChange={handleChange}
          placeholder="Giá/Ngày"
          required
        />
        <button type="submit">Thêm Xe</button>
      </form>
    </div>
  );
};

export default ThemXe;
