import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCarById } from '../BackEnd/authen';

const ChiTietXe = () => {
  const { carId } = useParams();
  const [car, setCar] = useState(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const data = await getCarById(carId);
        setCar(data);
      } catch (error) {
        console.error("Không thể lấy chi tiết xe", error);
      }
    };

    fetchCarDetails();
  }, [carId]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Chi Tiết Xe</h2>
      {car ? (
        <div className="row">
          <div className="col-md-6">
            <img src={car.image} alt={car.name} className="img-fluid rounded shadow" />
          </div>
          <div className="col-md-6">
            <p><strong>Biển số:</strong> {car.licensePlate}</p>
            <p><strong>Hãng xe:</strong> {car.brand}</p>
            <p><strong>Model:</strong> {car.model}</p>
            <p><strong>Năm sản xuất:</strong> {car.year}</p>
            <p><strong>Màu sắc:</strong> {car.color}</p>
            <p><strong>Số ghế:</strong> {car.seats}</p>
            <p><strong>Giá/Ngày:</strong> {car.pricePerDay}</p>
          </div>
        </div>
      ) : (
        <p className="text-center">Đang tải...</p>
      )}
    </div>
  );
};

export default ChiTietXe;
