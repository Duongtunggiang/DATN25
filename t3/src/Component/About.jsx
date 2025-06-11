import React from 'react';
import CustomerHeader from './Headers/CustomerHeader';
import Footer from './Footer';
import '../css/About.css';
import { FaCar, FaUsers, FaShieldAlt, FaHandshake, FaStar, FaMapMarkedAlt } from 'react-icons/fa';

const AboutComponent = () => {
    return (
        <div className="about-page">
            
            <main className="about-content">
                <section className="hero-section-about">
                    <div className="container-about">
                        <h1 className="title-about">Về Chúng Tôi</h1>
                        <p className="lead-about">
                            Thuê Xe Nhanh là nền tảng chia sẻ xe hàng đầu tại Việt Nam, 
                            kết nối chủ xe và khách hàng một cách an toàn, tiện lợi và đáng tin cậy.
                        </p>
                    </div>
                </section>

                <section className="mission-section-about">
                    <div className="container-about">
                        <h2 className="section-title-about">Sứ Mệnh Của Chúng Tôi</h2>
                        <div className="mission-grid-about">
                            <div className="mission-card-about">
                                <FaCar className="mission-icon-about" />
                                <h3>Đa Dạng Lựa Chọn</h3>
                                <p>Cung cấp đa dạng các loại xe từ xe 4 chỗ đến xe 16 chỗ, đáp ứng mọi nhu cầu di chuyển.</p>
                            </div>
                            <div className="mission-card-about">
                                <FaUsers className="mission-icon-about" />
                                <h3>Cộng Đồng Tin Cậy</h3>
                                <p>Xây dựng cộng đồng chia sẻ xe uy tín, với hệ thống đánh giá và xác thực chặt chẽ.</p>
                            </div>
                            <div className="mission-card-about">
                                <FaShieldAlt className="mission-icon-about" />
                                <h3>An Toàn Tối Đa</h3>
                                <p>Đảm bảo an toàn với bảo hiểm toàn diện và đội ngũ hỗ trợ 24/7.</p>
                            </div>
                            <div className="mission-card-about">
                                <FaHandshake className="mission-icon-about" />
                                <h3>Dịch Vụ Chuyên Nghiệp</h3>
                                <p>Cam kết mang đến trải nghiệm thuê xe chuyên nghiệp, thuận tiện và tiết kiệm.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="stats-section-about">
                    <div className="container-about">
                        <div className="stats-grid-about">
                            <div className="stat-item-about">
                                <h3>1000+</h3>
                                <p>Xe đang cho thuê</p>
                            </div>
                            <div className="stat-item-about">
                                <h3>5000+</h3>
                                <p>Khách hàng hài lòng</p>
                            </div>
                            <div className="stat-item-about">
                                <h3>500+</h3>
                                <p>Chủ xe tin cậy</p>
                            </div>
                            <div className="stat-item-about">
                                <h3>20+</h3>
                                <p>Tỉnh thành phủ sóng</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="features-section-about">
                    <div className="container-about">
                        <h2 className="section-title-about">Tại Sao Chọn Chúng Tôi</h2>
                        <div className="features-grid-about">
                            <div className="feature-card-about">
                                <FaStar className="feature-icon-about" />
                                <h3>Chất Lượng Đảm Bảo</h3>
                                <p>Tất cả xe đều được kiểm định chất lượng và bảo dưỡng định kỳ</p>
                            </div>
                            <div className="feature-card-about">
                                <FaMapMarkedAlt className="feature-icon-about" />
                                <h3>Phủ Sóng Rộng Khắp</h3>
                                <p>Có mặt tại nhiều tỉnh thành với đa dạng các loại xe</p>
                            </div>
                            <div className="feature-card-about">
                                <FaShieldAlt className="feature-icon-about" />
                                <h3>An Toàn & Bảo Mật</h3>
                                <p>Thông tin khách hàng được bảo vệ theo tiêu chuẩn cao nhất</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="contact-section-about">
                    <div className="container-about">
                        <h2 className="section-title-about">Liên Hệ Với Chúng Tôi</h2>
                        <div className="contact-info-about">
                            <div className="contact-item-about">
                                <h3>Địa Chỉ</h3>
                                <p>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
                            </div>
                            <div className="contact-item-about">
                                <h3>Email</h3>
                                <p>support@thuexenhanh.com</p>
                            </div>
                            <div className="contact-item-about">
                                <h3>Hotline</h3>
                                <p>1900 1234</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            
        </div>
    );
};

export default AboutComponent; 