import React from 'react';
import CustomerHeader from './Headers/CustomerHeader';
import Footer from './Footer';
import '../css/HowToWork.css';
import { FaSearch, FaCalendarAlt, FaCar, FaMoneyBillWave, FaUserCheck, FaKey, FaClipboardCheck, FaCarSide } from 'react-icons/fa';

const HowToWork = () => {
    return (
        <div className="how-to-work-page">
        
            
            <main className="how-to-work-content">
                <section className="hero-section-how">
                    <div className="container-how">
                        <h1 className="title-how">Hướng Dẫn Thuê Xe</h1>
                        <p className="lead-how">
                            Quy trình thuê xe đơn giản, nhanh chóng và an toàn với Thuê Xe Nhanh
                        </p>
                    </div>
                </section>

                <section className="steps-section-how">
                    <div className="container-how">
                        <h2 className="section-title-how">Các Bước Thuê Xe</h2>
                        <div className="steps-grid-how">
                            <div className="step-card-how">
                                <div className="step-number-how">1</div>
                                <FaSearch className="step-icon-how" />
                                <h3>Tìm Kiếm Xe</h3>
                                <p>Chọn địa điểm, thời gian và loại xe bạn muốn thuê</p>
                            </div>
                            <div className="step-card-how">
                                <div className="step-number-how">2</div>
                                <FaCalendarAlt className="step-icon-how" />
                                <h3>Đặt Xe</h3>
                                <p>Chọn xe phù hợp và tiến hành đặt xe trực tuyến</p>
                            </div>
                            <div className="step-card-how">
                                <div className="step-number-how">3</div>
                                <FaMoneyBillWave className="step-icon-how" />
                                <h3>Thanh Toán</h3>
                                <p>Thanh toán qua ví điện tử hoặc VNPay</p>
                            </div>
                            <div className="step-card-how">
                                <div className="step-number-how">4</div>
                                <FaKey className="step-icon-how" />
                                <h3>Nhận Xe</h3>
                                <p>Nhận xe tại địa điểm đã thỏa thuận</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="requirements-section-how">
                    <div className="container-how">
                        <h2 className="section-title-how">Yêu Cầu Thuê Xe</h2>
                        <div className="requirements-grid-how">
                            <div className="requirement-card-how">
                                <FaUserCheck className="requirement-icon-how" />
                                <h3>Giấy Tờ Cần Thiết</h3>
                                <ul>
                                    <li>CMND/CCCD (bắt buộc)</li>
                                    <li>Giấy phép lái xe (bắt buộc)</li>
                                    <li>Hộ khẩu hoặc KT3 (tùy trường hợp)</li>
                                </ul>
                            </div>
                            <div className="requirement-card-how">
                                <FaMoneyBillWave className="requirement-icon-how" />
                                <h3>Tài Chính</h3>
                                <ul>
                                    <li>Đặt cọc: 15-30 triệu (tiền mặt/chuyển khoản)</li>
                                    <li>Hoặc xe máy + giấy tờ gốc</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rules-section-how">
                    <div className="container-how">
                        <h2 className="section-title-how">Quy Định Chung</h2>
                        <div className="rules-grid-how">
                            <div className="rule-card-how">
                                <FaClipboardCheck className="rule-icon-how" />
                                <h3>Thời Gian</h3>
                                <ul>
                                    <li>Tính theo ngày (24 tiếng)</li>
                                    <li>Phụ thu quá giờ: 10%/giờ</li>
                                    <li>Quá 3h tính thành 1 ngày</li>
                                </ul>
                            </div>
                            <div className="rule-card-how">
                                <FaCarSide className="rule-icon-how" />
                                <h3>Quy Định Sử Dụng</h3>
                                <ul>
                                    <li>Không hút thuốc trên xe</li>
                                    <li>Không vận chuyển hàng cấm</li>
                                    <li>Trả xe đúng thời gian và địa điểm</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="faq-section-how">
                    <div className="container-how">
                        <h2 className="section-title-how">Câu Hỏi Thường Gặp</h2>
                        <div className="faq-grid-how">
                            <div className="faq-item-how">
                                <h3>Làm sao để đặt xe?</h3>
                                <p>Bạn có thể đặt xe trực tuyến thông qua website hoặc ứng dụng của chúng tôi. Chọn xe, thời gian và địa điểm, sau đó tiến hành thanh toán.</p>
                            </div>
                            <div className="faq-item-how">
                                <h3>Phương thức thanh toán?</h3>
                                <p>Chúng tôi chấp nhận thanh toán qua ví điện tử và VNPay.</p>
                            </div>
                            <div className="faq-item-how">
                                <h3>Thời gian thuê tối thiểu?</h3>
                                <p>Thời gian thuê tối thiểu là 1 ngày (24 tiếng).</p>
                            </div>
                            <div className="faq-item-how">
                                <h3>Có thể hủy đơn không?</h3>
                                <p>Có thể hủy đơn trước thời điểm nhận xe. Phí hủy sẽ tùy thuộc vào thời điểm hủy.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

        </div>
    );
};

export default HowToWork; 