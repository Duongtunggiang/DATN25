import React, { useEffect, useState } from 'react';
import { getTransactionHistory, getWalletBalance, depositMoney, withdrawMoney } from '../BackEnd/authen';
import ToastNotification from '../Alert/ToastNotification';
import { FaWallet, FaMoneyBillWave, FaHistory, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './WalletComponent.css';

const WalletComponent = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [modalType, setModalType] = useState(null);
  const [amountInput, setAmountInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(8);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const wallet = await getWalletBalance();
        const history = await getTransactionHistory();
        
        if (wallet && wallet.account) {
          setUser(wallet.account);
          setBalance(wallet.balance || 0);
        }
        
        if (Array.isArray(history)) {
          setTransactions(history);
        } else {
          setTransactions([]);
          setToastMessage('Không có dữ liệu giao dịch');
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        setToastMessage('Không thể tải dữ liệu ví!');
        setTransactions([]);
        setBalance(0);
      }
    };
    fetchData();
  }, []);

  // Tính toán phân trang
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatCurrency = (value) => {
    if (!value) return '';
    return parseInt(value.replace(/\D/g, '') || 0).toLocaleString() + ' đ';
  };

  const parseCurrency = (formatted) => parseInt(formatted.replace(/\D/g, '') || 0);

  const handleSubmit = async () => {
    const amount = parseCurrency(amountInput);
    try {
      if (amount <= 0) {
        setToastMessage('Vui lòng nhập số tiền hợp lệ!');
        return;
      }

      if (modalType === 'deposit') {
        await depositMoney(amount);
        setToastMessage('Nạp tiền thành công!');
      } else if (modalType === 'withdraw') {
        if (amount > balance) {
          setToastMessage('Số dư không đủ để rút!');
          return;
        }
        await withdrawMoney(amount);
        setToastMessage('Rút tiền thành công!');
      }

      const wallet = await getWalletBalance();
      setBalance(wallet.balance);
      setTransactions(wallet.transactionList);
      window.location.reload();
    } catch {
      setToastMessage('Lỗi khi thực hiện giao dịch!');
    } finally {
      setModalType(null);
      setAmountInput('');
    }
  };

  const formatAmountWithSign = (amount, type) => {
    if (amount == null) return '0 đ';
    const positiveTypes = ['DEPOSIT'];
    const negativeTypes = ['WITHDRAW', 'DEPOSIT_HOLD', 'PAYMENT'];
    let sign = '';
    if (positiveTypes.includes(type)) {
      sign = '+';
    } else if (negativeTypes.includes(type)) {
      sign = '-';
    }
    return sign + amount.toLocaleString() + ' đ';
  };

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <div className="wallet-info">
          <div className="wallet-icon">
            <FaWallet size={40} />
          </div>
          <div className="wallet-details">
            <h2>Ví của {user?.username}</h2>
            <div className="balance-display">
              <span className="balance-label">Số dư hiện tại:</span>
              <span className="balance-amount">{balance.toLocaleString()} VNĐ</span>
            </div>
          </div>
        </div>
        <div className="wallet-actions">
          <button className="btn-deposit" onClick={() => setModalType('deposit')}>
            <FaArrowDown /> Nạp tiền
          </button>
          <button className="btn-withdraw" onClick={() => setModalType('withdraw')}>
            <FaArrowUp /> Rút tiền
          </button>
          <a href="/vn-pay" className="btn-vnpay">
            <FaMoneyBillWave /> VNPay
          </a>
        </div>
      </div>

      <div className="transaction-history">
        <div className="history-header">
          <h3><FaHistory /> Lịch sử giao dịch</h3>
        </div>
        <div className="table-responsive">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Số tiền</th>
                <th>Loại</th>
                <th>Mô tả</th>
                <th>Thời gian</th>
                <th>Số dư</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.length === 0 ? (
                <tr><td colSpan="6" className="no-transactions">Chưa có giao dịch nào.</td></tr>
              ) : (
                currentTransactions.map((tx, index) => (
                  <tr key={tx.id} className={tx.type ? tx.type.toLowerCase() : ''}>
                    <td>{(currentPage - 1) * transactionsPerPage + index + 1}</td>
                    <td className={tx.type === 'DEPOSIT' ? 'amount-positive' : 'amount-negative'}>
                      {formatAmountWithSign(tx.amount, tx.type)}
                    </td>
                    <td>{translateType(tx.type || 'UNKNOWN')}</td>
                    <td>{tx.description || '-'}</td>
                    <td>{tx.transactionTime ? new Date(tx.transactionTime).toLocaleString() : '-'}</td>
                    <td>{(tx.balanceAfter ?? 0).toLocaleString() + ' đ'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className="page-btn"
            >
              &laquo;
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))}
            <button 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="page-btn"
            >
              &raquo;
            </button>
          </div>
        )}
      </div>

      {modalType && (
        <div className="modal-overlay">
          <div className='modal-overlay-content'>

          
          <div className="modal-content">
            <div className="modal-header">
              <h5>{modalType === 'deposit' ? 'Nạp tiền vào ví' : 'Rút tiền về tài khoản'}</h5>
              <button className="close-btn" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="amount-input">
                <label>Số tiền</label>
                <input
                  type="text"
                  value={formatCurrency(amountInput)}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="Nhập số tiền"
                />
              </div>
              {modalType === 'withdraw' && (
                <button
                  className="max-amount-btn"
                  onClick={() => setAmountInput(balance.toString())}
                >
                  Rút toàn bộ ({balance.toLocaleString()} đ)
                </button>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setModalType(null)}>Hủy</button>
              <button className="confirm-btn" onClick={handleSubmit}>Xác nhận</button>
            </div>
            </div>
          </div>
        </div>
      )}

      {toastMessage && <ToastNotification message={toastMessage} onClose={() => setToastMessage('')} />}
    </div>
  );
};

const translateType = (type) => {
  switch (type) {
    case 'DEPOSIT': return 'Nạp tiền';
    case 'WITHDRAW': return 'Rút tiền';
    case 'DEPOSIT_HOLD': return 'Đặt cọc xe';
    case 'PAYMENT': return 'Thanh toán xe';
    case 'UNKNOWN': return 'Không xác định';
    default: return type;
  }
};

export default WalletComponent;