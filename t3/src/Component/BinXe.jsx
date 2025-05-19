import React, { useEffect, useState } from 'react';
import { getMyCars } from '../BackEnd/authen';

function BinXe() {
  const [deletedCars, setDeletedCars] = useState([]);

  useEffect(() => {
    const fetchDeletedCars = async () => {
      try {
        const cars = await getMyCars();
        const filtered = cars.filter(car => car.status === 'DELETED');
        setDeletedCars(filtered);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách xe đã xóa:", error);
      }
    };

    fetchDeletedCars();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Thùng rác - Xe đã xóa</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Hình ảnh</th>
              <th>Tên xe</th>
              <th>Biển số</th>
              <th>Giá / Ngày</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {deletedCars.length > 0 ? (
              deletedCars.map(car => (
                <tr key={car.id}>
                  <td>
                    <img
                      src={`http://localhost:8080${car.imagePaths}`}
                      alt={car.carName}
                      style={{ width: '100px', height: '60px', objectFit: 'cover' }}
                      className="rounded"
                    />
                  </td>
                  <td>{car.carName}</td>
                  <td>{car.licensePlate}</td>
                  <td className="text-danger fw-bold">
                    {car.pricePerDay.toLocaleString('vi-VN')}₫/ngày
                  </td>
                  <td><span className="badge bg-danger">{car.status}</span></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="text-center">Không có xe nào trong thùng rác.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BinXe;
