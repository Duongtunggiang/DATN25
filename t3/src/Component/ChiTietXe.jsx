import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBrandForCar, getCarById } from '../BackEnd/authen';

const ChiTietXe = () => {
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [brand, setBrand] = useState(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const data = await getCarById(carId);
        setCar(data);

        const dataBrand = await getBrandForCar(carId); 
        setBrand(dataBrand);
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết xe hoặc thương hiệu", error);
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
            <img src={`http://localhost:8080${car.imagePaths}`} alt={car.carName} title={car.carName} className="img-fluid rounded shadow" />
          </div>
          <div className="col-md-6">
            <p><strong>Tên xe:</strong> {car.carName}</p>
            <p><strong>Biển số:</strong> {car.licensePlate}</p>
            <p><strong>Hãng xe:</strong> {brand ? brand.brandName : 'Đang tải...'}</p>
            <p><strong>Model:</strong> {car.model}</p>
            <p><strong>Năm sản xuất:</strong> {car.year}</p>
            <p><strong>Màu sắc:</strong> {car.color}</p>
            <p><strong>Số ghế:</strong> {car.seats}</p>
            <p><strong>Giá/Ngày:</strong> {car.pricePerDay ? `${car.pricePerDay.toLocaleString('vi-VN')} đ` : 'Không rõ'}</p>
          </div>
        </div>
      ) : (
        <p className="text-center">Đang tải...</p>
      )}
    </div>
  );
};

export default ChiTietXe;
