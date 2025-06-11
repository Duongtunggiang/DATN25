import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../Authen/axiosInstance';
import { getCars, deleteCarImage } from '../BackEnd/authen';
import '../css/AddCarImage.css';
import { FaCloudUploadAlt } from 'react-icons/fa';

const AddCarImageComponent = () => {
    const { carId } = useParams();
    const navigate = useNavigate();
    const [car, setCars] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const fetchImages = async () => {
        try {
            const res = await axiosInstance.get(`/api/cars/${carId}/car-images`);
            if (res.data) {
                setImages(res.data);
            }
        } catch (error) {
            console.error("Lấy ảnh lỗi:", error);
        }
    };

    useEffect(() => {
        fetchImages();
        fetchCars();
    }, [carId]);

    const fetchCars = async () => {
        try {
            const res = await axiosInstance.get(`/api/cars/${carId}`);
            setCars(res.data);
        } catch (error) {
            console.error("Lấy xe lỗi:", error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert("Vui lòng chọn ảnh để tải lên");
            return;
        }

        const formData = new FormData();
        formData.append("carImage", selectedFile);

        try {
            setLoading(true);
            await axiosInstance.post(`/api/cars/add-images/${carId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setSelectedFile(null);
            setPreviewUrl(null);
            fetchImages();
        } catch (error) {
            alert("Lỗi khi thêm ảnh");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!imageId) {
            alert('Không thể xóa ảnh này. ID ảnh không hợp lệ.');
            return;
        }
        
        try {
            await deleteCarImage(imageId);
            setImages(prevImages => prevImages.filter(img => img.id !== imageId));
            alert('Xóa ảnh thành công!');
            await fetchImages(); // Refresh images after deletion
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Lỗi khi xóa ảnh: ' + error.message);
        }
    };

    const handleFinish = () => {
        navigate(`/xac-nhan-dang-ky-xe/${carId}`);
    };

    return (
        <div className="container py-5">
            <div className="card shadow-lg">
                <div className="card-header bg-primary text-white">
                    <h2 className="mb-0">Thêm Ảnh Chi Tiết Xe</h2>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <div className="upload-section">
                                <h4 className="mb-3">Tải lên ảnh mới</h4>
                                <form onSubmit={handleUpload} className="upload-form">
                                    <div className="drop-zone" onClick={() => document.getElementById('fileInput').click()}>
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="preview-image" />
                                        ) : (
                                            <div className="drop-zone-content">
                                                <FaCloudUploadAlt size={48} />
                                                <p>Kéo thả ảnh vào đây hoặc click để chọn</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            id="fileInput"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="file-input"
                                            hidden
                                        />
                                    </div>
                                    <button 
                                        className={`btn btn-primary w-100 mt-3 ${loading ? 'loading' : ''}`}
                                        disabled={loading || !selectedFile}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Đang tải...
                                            </>
                                        ) : "Tải ảnh lên"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="col-md-6 mb-4">
                            {car && car.imagePaths && (
                                <div className="main-image-section">
                                    <h4 className="mb-3">Ảnh đại diện xe</h4>
                                    <div className="main-image-container">
                                        <img
                                            src={`http://localhost:8080${car.imagePaths}`}
                                            alt={car.carName || "Ảnh đại diện xe"}
                                            className="main-image"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="image-gallery-section mt-4">
                        <h4 className="mb-3">Thư viện ảnh</h4>
                        <div className="row g-3">
                            {Array.isArray(images) && images.length > 0 ? (
                                images.map((image, index) => (
                                    <div key={`car-image-${index}`} className="col-md-3">
                                        <div className="image-container position-relative">
                                            <img
                                                src={`http://localhost:8080${image.imagePath}`}
                                                alt={`Car Image ${index + 1}`}
                                                className="img-fluid rounded"
                                            />
                                            <button
                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                                                onClick={() => handleDeleteImage(image.id)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-12 text-center">
                                    <p className="text-muted">Chưa có ảnh nào</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mt-4">
                        {images.length > 0 && (
                            <button 
                                className="btn btn-success btn-lg"
                                onClick={handleFinish}
                            >
                                Hoàn tất đăng ký xe
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCarImageComponent;
