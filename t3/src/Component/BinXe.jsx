import React, { useEffect, useState } from 'react';
import { getMyCars, setAvailableSatusForCar, setCarAvailable } from '../BackEnd/authen';
import { FaTrashRestore, FaCar } from 'react-icons/fa';
import ToastNotification from '../Alert/ToastNotification';
import '../css/BinXe.css';

function BinXe() {
  const [deletedCars, setDeletedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchDeletedCars = async () => {
    try {
      setLoading(true);
      const cars = await getMyCars();
      const filtered = cars.filter(car => car.status === 'DELETED');
      setDeletedCars(filtered);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách xe đã xóa:", error);
      setToastMessage("Không thể tải danh sách xe đã xóa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedCars();
  }, []);

  const handleRestore = async (carId) => {
    if (processing) return;
    
    try {
      setProcessing(true);
      await setAvailableSatusForCar(carId);
      setToastMessage('Đã phục hồi xe thành công!');
      await fetchDeletedCars();
    } catch (error) {
      console.error('Lỗi khi phục hồi xe:', error);
      setToastMessage(error.message || 'Không thể phục hồi xe');
    } finally {
      setProcessing(false);
    }
  };

  const totalPages = Math.ceil(deletedCars.length / itemsPerPage);
  
  const getCurrentCars = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return deletedCars.slice(startIndex, endIndex);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`recycle-pagination__btn ${currentPage === i ? 'recycle-pagination__btn--active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  if (loading) {
    return (
      <div id="recycleLoadingContainer" className="recycle-loading">
        <div className="recycle-loading__spinner">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="recycleBinContainer" className="recycle-container">
      <div className="recycle-header">
        <h2 className="recycle-header__title">
          <FaTrashRestore className="recycle-header__icon" />
          Thùng rác - Xe đã xóa
        </h2>
        <p className="recycle-header__desc">
          Các xe đã xóa sẽ được lưu tại đây. Bạn có thể phục hồi chúng bất cứ lúc nào.
        </p>
      </div>

      {deletedCars.length === 0 ? (
        <div className="recycle-empty">
          <FaCar className="recycle-empty__icon" />
          <h4 className="recycle-empty__title">Không có xe nào trong thùng rác</h4>
          <p className="recycle-empty__desc">Các xe đã xóa sẽ xuất hiện ở đây</p>
        </div>
      ) : (
        <>
          <div className="recycle-table-wrapper">
            <table className="recycle-table">
              <thead className="recycle-table__head">
                <tr>
                  <th className="recycle-table__header">STT</th>
                  <th className="recycle-table__header">Hình ảnh</th>
                  <th className="recycle-table__header">Tên xe</th>
                  <th className="recycle-table__header">Biển số</th>
                  <th className="recycle-table__header">Giá thuê/ngày</th>
                  <th className="recycle-table__header">Trạng thái</th>
                  <th className="recycle-table__header">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentCars().map((car, index) => (
                  <tr key={car.id} className="recycle-table__row">
                    <td className="recycle-table__cell">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="recycle-table__cell">
                      <img
                        src={`http://localhost:8080${car.imagePaths}`}
                        alt={car.carName}
                        className="recycle-table__image"
                        onError={(e) => {
                          e.target.src = '/default-car.png';
                        }}
                      />
                    </td>
                    <td className="recycle-table__cell recycle-table__cell--name">{car.carName}</td>
                    <td className="recycle-table__cell">{car.licensePlate}</td>
                    <td className="recycle-table__cell recycle-table__cell--price">
                      {car.pricePerDay.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="recycle-table__cell">
                      <span className="recycle-status-badge">Đã xóa</span>
                    </td>
                    <td className="recycle-table__cell">
                      <button
                        className="recycle-restore-btn"
                        onClick={() => handleRestore(car.id)}
                        disabled={processing}
                      >
                        <FaTrashRestore className="recycle-restore-btn__icon" />
                        {processing ? 'Đang phục hồi...' : 'Phục hồi'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="recycle-pagination">
              {renderPagination()}
            </div>
          )}
        </>
      )}

      {toastMessage && (
        <ToastNotification
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
}

export default BinXe;
