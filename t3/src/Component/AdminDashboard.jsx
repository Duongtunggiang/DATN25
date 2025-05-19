import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../Authen/axiosInstance';

function AdminDashboard() {
  const [pendingCars, setPendingCars] = useState([]);

  const fetchPendingCars = async () => {
    try {
        const res = await axiosInstance.get('/api/admin/cars/pending');
        console.log("Dữ liệu từ server:", res.data); 
        setPendingCars(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
        console.error("Lỗi khi fetch:", err);
        setPendingCars([]);
    }
    };


  const approveCar = async (carId) => {
    if (window.confirm("Bạn có chắc muốn phê duyệt xe này không?")) {
      await axiosInstance.put(`/api/admin/cars/approve/${carId}`);
      alert("Đã phê duyệt xe!");
      fetchPendingCars();
    }
  };

  useEffect(() => {
    fetchPendingCars();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Danh sách xe chờ phê duyệt ({pendingCars.length})</h2>
      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Tên xe</th>
            <th>Biển số</th>
            <th>Giá/ngày</th>
            <th>Chủ xe</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {pendingCars.map(car => (
            <tr key={car.id}>
                <td>{car.carName}</td>
                <td>{car.licensePlate}</td>
                <td>{car.pricePerDay?.toLocaleString()}₫</td>
                <td>
                    <div><strong>Email:</strong> {car.email}</div>
                    <div><strong>Username:</strong> {car.username}</div>
                </td>


                <td>
                <button className="btn btn-success btn-sm" onClick={() => approveCar(car.id)}>Phê duyệt</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
