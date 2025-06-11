// Hàm xử lý màu sắc trạng thái
export const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'warning';      // Chờ duyệt
    case 'AVAILABLE': return 'success';    // Sẵn sàng cho thuê
    case 'DEPOSIT': return 'info';         // Đã được cọc
    case 'BOOKED': return 'primary';       // Đã có người thuê
    case 'DELIVERING': return 'delivering'; // Đang giao xe
    case 'RENTED': return 'rented';        // Đang cho thuê
    case 'RETURNED': return 'returned';     // Đã trả xe
    case 'INACTIVE': return 'secondary';    // Tạm ẩn
    case 'DELETED': return 'danger';        // Đã xóa
    case 'REJECTED': return 'rejected';     // Từ chối
    case 'CANCEL': return 'cancel';        // Đã hủy
    case 'REFUND': return 'refund';        // Đã hoàn tiền
    default: return 'secondary';
  }
};

// Hàm chuyển đổi trạng thái sang text tiếng Việt
export const getStatusText = (status) => {
  switch (status) {
    case 'PENDING': return 'Chờ duyệt';
    case 'AVAILABLE': return 'Sẵn sàng cho thuê';
    case 'DEPOSIT': return 'Đã được cọc';
    case 'BOOKED': return 'Đã có người thuê';
    case 'DELIVERING': return 'Đang giao xe';
    case 'RENTED': return 'Đang cho thuê';
    case 'RETURNED': return 'Đã trả xe';
    case 'INACTIVE': return 'Tạm ẩn';
    case 'DELETED': return 'Đã xóa';
    case 'REJECTED': return 'Bị từ chối';
    case 'CANCEL': return 'Đã hủy';
    case 'REFUND': return 'Đã hoàn tiền';
    default: return status;
  }
};

// Hàm chuyển đổi transmission sang text tiếng Việt
export const getTransmissionText = (transmission) => {
  const transmissionMap = {
    'MANUAL': 'Số sàn',
    'AUTOMATIC': 'Số tự động',
    'CVT': 'Hộp số CVT',
    'DCT': 'Hộp số ly hợp kép',
  };
  return transmissionMap[transmission] || transmission;
};

// Hàm chuyển đổi fuel sang text tiếng Việt
export const getFuelText = (fuel) => {
  const fuelMap = {
    'GASOLINE': 'Xăng',
    'DIESEL': 'Dầu diesel',
    'ELECTRIC': 'Điện',
    'HYBRID': 'Hybrid',
  };
  return fuelMap[fuel] || fuel;
};

// Hàm chuyển đổi feature sang text tiếng Việt
export const getFeatureText = (feature) => {
  const featureMap = {
    'bluetooth': 'Bluetooth',
    'gps': 'Định vị GPS',
    'usb': 'Cổng USB',
    'camera': 'Camera lùi',
    'sunRoof': 'Cửa sổ trời',
    'childSeat': 'Ghế trẻ em',
    'childLock': 'Khóa an toàn trẻ em',
    'dvd': 'Màn hình DVD',
    'airConditioner': 'Điều hòa',
    'airBag': 'Túi khí an toàn',
    'parkingSensor': 'Cảm biến đỗ xe',
    'cruiseControl': 'Kiểm soát hành trình',
  };
  return featureMap[feature] || feature.replace(/([A-Z])/g, ' $1').toLowerCase();
};

// Hàm format giá tiền
export const formatPrice = (price) => {
  if (typeof price !== 'number') return 'Đang cập nhật';
  return price.toLocaleString('vi-VN') + '₫/ngày';
};

// Hàm lấy class CSS cho trạng thái
export const getStatusClass = (status) => {
  if (!status) return '';
  return `status-${status.toLowerCase()}`;
}; 