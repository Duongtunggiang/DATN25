import React, { useState, useEffect } from 'react';
import { FaCamera, FaKey, FaSave } from 'react-icons/fa';
import '../../css/Admin.css';
import { getAdminProfile } from '../../BackEnd/authen';
import defaultAvatar from '../../Images/avatars/default-avatar.png';

const AdminProfile = () => {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        fullName: '',
        phone: '',
        avatar: '',
        role: 'ADMIN'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await getAdminProfile();
            setProfile(response);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Không thể tải thông tin người dùng' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('avatar', file);
                
                const response = await fetch('/api/admin/profile/avatar', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                setProfile(prev => ({
                    ...prev,
                    avatar: data.avatarUrl
                }));
                
                setMessage({ type: 'success', text: 'Cập nhật ảnh đại diện thành công' });
            } catch (error) {
                console.error('Error uploading avatar:', error);
                setMessage({ type: 'error', text: 'Không thể cập nhật ảnh đại diện' });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await fetch('/api/admin/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profile)
            });
            
            setMessage({ type: 'success', text: 'Cập nhật thông tin thành công' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Không thể cập nhật thông tin' });
        } finally {
            setSaving(false);
        }
    };

    const getAvatarUrl = () => {
        if (!profile?.avatarPath) return defaultAvatar;
        return `http://localhost:8080${profile.avatarPath}`;
    };

    if (loading) {
        return (
            <div className="admin-page">
                <section className="admin-section">
                    <div className="admin-container">
                        <div className="admin-wrapper">
                            <div className="admin-content">
                                <div className="admin-loading">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <section className="admin-section">
                <div className="admin-container">
                    <div className="admin-wrapper">
                        <div className="admin-content">
                            <div className="profile-content">
                                <div className="avatar-section">
                                    <div className="avatar-container">
                                        <img
                                            src={getAvatarUrl()}
                                            alt="Avatar"
                                            className="profile-avatar"
                                            onError={(e) => e.target.src = defaultAvatar}
                                        />
                                        <label className="avatar-upload-btn">
                                            <FaCamera />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    </div>
                                    <h3>{profile.username}</h3>
                                    <span className="role-badge role-admin">{profile.role}</span>
                                </div>

                                {message.text && (
                                    <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'}`}>
                                        {message.text}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="profile-form">
                                    <div className="form-group">
                                        <label>Tên đăng nhập</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={profile.username}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            disabled
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profile.email}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Họ và tên</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={profile.fullName}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Số điện thoại</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profile.phone}
                                            onChange={handleInputChange}
                                            className="form-control"
                                        />
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave className="me-2" /> Lưu thay đổi
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() => window.location.href = '/admin/change-password'}
                                        >
                                            <FaKey className="me-2" /> Đổi mật khẩu
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminProfile; 