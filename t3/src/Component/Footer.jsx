import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaCcVisa, FaCcMastercard, FaCcPaypal } from 'react-icons/fa';
import '../css/Footer.css';
import logo from '../Logo/Logo-removebackgroung.png';

const Footer = () => {
    return (
        <footer className="car-rental-footer">
            <div className="car-rental-footer-content">
                <div className="car-rental-footer-section">
                    <div className="car-rental-footer-logo">
                        <img src={logo} alt="Logo" className="car-rental-footer-logo-img" />
                    </div>
                    <h3>Về chúng tôi</h3>
                    <p>
                        Car Rental là nền tảng chia sẻ xe hàng đầu Việt Nam. 
                        Chúng tôi kết nối chủ xe và khách hàng, mang đến trải nghiệm 
                        thuê xe an toàn, tiện lợi và giá cả hợp lý.
                    </p>
                    <div className="car-rental-footer-social">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                            <FaFacebook />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <FaTwitter />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                            <FaInstagram />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                            <FaYoutube />
                        </a>
                    </div>
                </div>

                <div className="car-rental-footer-section">
                    <h3>Liên kết nhanh</h3>
                    <ul>
                        <li><Link to="/about">Giới thiệu</Link></li>
                        <li><Link to="/how-it-works">Hướng dẫn</Link></li>
                        <li><Link to="/terms">Điều khoản</Link></li>
                        <li><Link to="/privacy">Chính sách</Link></li>
                        <li><Link to="/contact">Liên hệ</Link></li>
                    </ul>
                </div>

                <div className="car-rental-footer-section">
                    <h3>Dành cho chủ xe</h3>
                    <ul>
                        <li><Link to="/dang-ky-chu-xe">Đăng ký cho thuê xe</Link></li>
                        <li><Link to="/owner-guide">Hướng dẫn cho chủ xe</Link></li>
                        <li><Link to="/owner-support">Hỗ trợ</Link></li>
                        <li><Link to="/owner-faq">Câu hỏi thường gặp</Link></li>
                    </ul>
                </div>

                <div className="car-rental-footer-section">
                    <h3>Liên hệ</h3>
                    <ul className="car-rental-footer-contact">
                        <li>Hotline: 1900 xxxx</li>
                        <li>Email: support@carrental.vn</li>
                        <li>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</li>
                    </ul>
                    <div className="car-rental-footer-payments">
                        <FaCcVisa />
                        <FaCcMastercard />
                        <FaCcPaypal />
                    </div>
                </div>
            </div>

            <div className="car-rental-footer-bottom">
                <div className="car-rental-footer-bottom-container">
                    <p>&copy; 2024 Car Rental. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 