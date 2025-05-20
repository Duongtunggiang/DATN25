import React, { useEffect, useState } from 'react';
import { getTransactionHistory, getWalletBalance, depositMoney, withdrawMoney } from '../BackEnd/authen';
import ToastNotification from '../Alert/ToastNotification';

const WalletComponent = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [modalType, setModalType] = useState(null); // 'deposit' or 'withdraw'
  const [amountInput, setAmountInput] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const wallet = await getWalletBalance();
        const history = await getTransactionHistory();
        setUser(wallet.account);
        setBalance(wallet.balance);
        // setTransactions(wallet.transactionList);
        setTransactions(history);
      } catch {
        setToastMessage('Không thể tải dữ liệu ví!');
      }
    };
    fetchData();
  }, []);

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

    // Các loại giao dịch mà số tiền là cộng (+)
    const positiveTypes = ['DEPOSIT'];
    
    // Các loại giao dịch mà số tiền là trừ (-)
    const negativeTypes = ['WITHDRAW', 'DEPOSIT_HOLD', 'PAYMENT'];

    // Nếu là chủ xe nhận (nếu có thông tin, ví dụ tx.isReceiver = true)
    // thì đảo dấu cho PAYMENT (ví dụ chủ xe nhận được tiền thanh toán => +)
    // Giả sử nếu có field tx.isReceiver thì xử lý như này:
    // if (type === 'PAYMENT' && tx.isReceiver) return '+' + amount.toLocaleString() + ' đ';

    // Ở đây bạn chưa có dữ liệu nào cho biết chủ xe nhận, nếu có bạn có thể bổ sung logic.

    let sign = '';
    if (positiveTypes.includes(type)) {
      sign = '+';
    } else if (negativeTypes.includes(type)) {
      sign = '-';
    }

    return sign + amount.toLocaleString() + ' đ';
  };


  return (
    <div className="container mt-4">
      <h2>Ví của bạn</h2>
      {user && (
        <div>
          <h5>Chủ tài khoản: {user.username}</h5>
          <p><strong>Số dư:</strong> {balance.toLocaleString()} VND</p>
          <div className="mb-3">
            <button className="btn btn-success me-2" onClick={() => setModalType('deposit')}>Nạp tiền</button>
            <button className="btn btn-warning" onClick={() => setModalType('withdraw')}>Rút tiền</button>
            <a href="/vn-pay" className='btn btn-secondary'>Nạp / rút</a>
          </div>

          <h4>Lịch sử giao dịch</h4>
          <table className="table table-bordered">
            <thead className="table-secondary">
              <tr>
                <th>#</th>
                <th>Số tiền</th>
                <th>Loại</th>
                <th>Mô tả</th>
                <th>Số dư</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(transactions) && transactions.length === 0 ? (
                  <tr><td colSpan="5">Chưa có giao dịch nào.</td></tr>
                ) : (
                  transactions?.map((tx, index) => (
                    <tr key={tx.id}>
                      <td>{index + 1}</td>
                      {/* <td>{tx.amount.toLocaleString()} VND</td> */}
                      <td>{formatAmountWithSign(tx.amount.toLocaleString(), tx.type)}</td>

                      <td>{translateType(tx.type)}</td>
                      <td>{tx.description}</td>
                      <td>{(tx.balanceAfter ?? 0).toLocaleString() + ' đ'}</td>
                      <td>{new Date(tx.transactionTime).toLocaleString()}</td>
                    </tr>
                  ))
                )}

            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalType && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalType === 'deposit' ? 'Nạp tiền' : 'Rút tiền về tài khoản'}</h5>
                <button type="button" className="btn-close" onClick={() => setModalType(null)}></button>
              </div>
              <div className="modal-body">
                <label>Nhập số tiền</label>
                <input
                  type="text"
                  className="form-control"
                  value={formatCurrency(amountInput)}
                  onChange={(e) => setAmountInput(e.target.value)}
                />
                {modalType === 'withdraw' && (
                  <button
                    className="btn btn-sm btn-outline-secondary mt-2"
                    onClick={() => setAmountInput(balance.toString())}
                  >
                    Toàn bộ ({balance.toLocaleString()} đ)
                  </button>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setModalType(null)}>Hủy</button>
                <button className="btn btn-primary" onClick={handleSubmit}>Xác nhận</button>
                
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
    default: return type;
  }
};

export default WalletComponent;