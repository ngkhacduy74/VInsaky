import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { authApiClient } from "../Services/auth.service";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { Helmet, HelmetProvider } from "react-helmet-async";
import ChatWidget from "../Components/WidgetChat";
import { loadRecentlyViewed } from "../utils/recentlyViewed";
import favoriteService from "../Services/favorite.service";
import {
  getRewardPoints,
  getRewardHistory,
  getRewardLevel,
  getNextLevel,
  getLevelProgress,
  checkDailyLoginBonus,
  checkFirstVisitBonus,
  REWARD_LEVELS,
} from "../utils/rewardPoints";
import "./Profile.css";

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, loading, handleLogout } = useAuth();
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Reward points state
  const [rewardPoints, setRewardPoints] = useState(0);
  const [rewardHistory, setRewardHistory] = useState([]);
  const [dailyBonusToast, setDailyBonusToast] = useState(null);

  // Favorites & recently viewed
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      try {
        setError(null);
        setProfileUser(user);
        const response = await authApiClient.get(`/user/${user.id}`);
        const updatedUserData =
          response.data?.data?.data ||
          response.data?.data ||
          response.data?.user?.[0] ||
          response.data?.user ||
          null;
        if (
          updatedUserData &&
          typeof updatedUserData === "object" &&
          updatedUserData.email
        ) {
          setProfileUser(updatedUserData);
          localStorage.setItem("user", JSON.stringify(updatedUserData));
        }
      } catch (err) {
        setProfileUser(user);
        if (err.response?.status !== 403 && err.response?.status !== 404) {
          setError("Không thể tải thông tin mới nhất");
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  // Initialize reward points & daily bonus
  useEffect(() => {
    if (!user?.id) return;
    
    // Check first visit bonus
    const firstVisit = checkFirstVisitBonus(user.id);
    
    // Check daily login bonus
    const dailyBonus = checkDailyLoginBonus(user.id);
    if (dailyBonus.awarded) {
      setDailyBonusToast({
        points: dailyBonus.points,
        total: dailyBonus.total,
      });
      setTimeout(() => setDailyBonusToast(null), 4000);
    } else if (firstVisit.awarded) {
      setDailyBonusToast({
        points: firstVisit.points,
        total: firstVisit.total,
        first: true,
      });
      setTimeout(() => setDailyBonusToast(null), 5000);
    }

    // Load points & history
    setRewardPoints(getRewardPoints(user.id));
    setRewardHistory(getRewardHistory(user.id));
  }, [user]);

  // Load recently viewed
  useEffect(() => {
    setRecentlyViewed(loadRecentlyViewed().slice(0, 8));
  }, []);

  // Load favorites
  const fetchFavorites = useCallback(async () => {
    try {
      setFavoritesLoading(true);
      const res = await favoriteService.getFavorites();
      const items = res?.data?.data || res?.data?.favorites || res?.data || [];
      setFavorites(Array.isArray(items) ? items : []);
    } catch {
      setFavorites([]);
    } finally {
      setFavoritesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "favorites" && user) {
      fetchFavorites();
    }
  }, [activeTab, user, fetchFavorites]);

  // Avatar upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("img", file);
      const token = localStorage.getItem("token");
      const uploadRes = await fetch("/file/upload-image", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      const uploadData = await uploadRes.json();
      const avatarUrl = uploadData?.urls?.[0];
      if (!avatarUrl) throw new Error("Upload thất bại");
      const userId = profileUser?.id || user?.id;
      await authApiClient.put(`/user/${userId}`, { ava_img_url: avatarUrl });
      const updated = { ...(profileUser || user), ava_img_url: avatarUrl };
      setProfileUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(
        "Không thể upload ảnh: " +
          (err.response?.data?.message || err.message)
      );
      setTimeout(() => setError(null), 5000);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Edit profile
  const displayUser = profileUser || user;

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditForm({
        fullname: displayUser?.fullname || "",
        phone: displayUser?.phone || "",
        address: displayUser?.address || "",
        bio: displayUser?.bio || "",
        gender: displayUser?.gender || "",
      });
    }
    setIsEditing(!isEditing);
    setSaveSuccess(false);
  };

  const handleSaveProfile = async () => {
    try {
      if (!displayUser) {
        setError("Không có thông tin người dùng để lưu");
        return;
      }
      const userId = displayUser.id;
      const response = await authApiClient.put(`/user/${userId}`, editForm);
      const updatedUser =
        response.data?.data?.data ||
        response.data?.data ||
        response.data?.user ||
        { ...displayUser, ...editForm };
      const merged = { ...displayUser, ...editForm, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(merged));
      setProfileUser(merged);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        const merged = { ...displayUser, ...editForm };
        localStorage.setItem("user", JSON.stringify(merged));
        setProfileUser(merged);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError("Không thể lưu thông tin hồ sơ");
      }
    }
  };

  // Helpers
  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getProductImage = (product) => {
    if (Array.isArray(product?.image) && product.image.length > 0) {
      return product.image[0];
    }
    if (typeof product?.image === "string") return product.image;
    if (product?.productId?.image) {
      return Array.isArray(product.productId.image)
        ? product.productId.image[0]
        : product.productId.image;
    }
    return "https://fushimavina.com/data/data/files/test/may-lam-da-100kg.jpg";
  };

  const getProductName = (item) => {
    return item?.name || item?.productId?.name || "Sản phẩm";
  };

  const getProductPrice = (item) => {
    return item?.price || item?.productId?.price || null;
  };

  const getProductId = (item) => {
    return item?._id || item?.id || item?.productId?._id || item?.productId?.id;
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
  };

  // ===== Render =====
  if (loading) {
    return (
      <HelmetProvider>
        <div className="prf-page">
          <Helmet>
            <title>Hồ Sơ Cá Nhân - Vinsaky</title>
          </Helmet>
          <Header />
          <div className="content-wrapper">
            <div
              style={{
                minHeight: "80vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="text-center">
                <div
                  className="spinner-border text-primary"
                  role="status"
                  style={{ width: "3rem", height: "3rem" }}
                />
                <p
                  style={{
                    marginTop: "1rem",
                    color: "#64748b",
                    fontSize: "0.9rem",
                  }}
                >
                  Đang tải thông tin hồ sơ...
                </p>
              </div>
            </div>
          </div>
          <ChatWidget />
          <Footer />
        </div>
      </HelmetProvider>
    );
  }

  if (!displayUser) {
    return (
      <HelmetProvider>
        <div className="prf-page">
          <Helmet>
            <title>Không tìm thấy - Vinsaky</title>
          </Helmet>
          <Header />
          <div className="content-wrapper">
            <div
              style={{
                minHeight: "80vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h3
                  style={{ color: "#1e293b", marginBottom: "0.5rem" }}
                >
                  Vui lòng đăng nhập
                </h3>
                <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
                  Bạn cần đăng nhập để xem hồ sơ cá nhân
                </p>
                <button
                  className="prf-btn prf-btn-primary"
                  onClick={() => navigate("/login")}
                >
                  <i className="fas fa-sign-in-alt"></i>
                  Đăng nhập
                </button>
              </div>
            </div>
          </div>
          <ChatWidget />
          <Footer />
        </div>
      </HelmetProvider>
    );
  }

  const currentLevel = getRewardLevel(rewardPoints);
  const nextLevel = getNextLevel(rewardPoints);
  const progress = getLevelProgress(rewardPoints);

  // ===== Sidebar tabs definition =====
  const tabs = [
    { id: "profile", icon: "fas fa-user", label: "Hồ sơ" },
    { id: "rewards", icon: "fas fa-trophy", label: "Điểm thưởng" },
    { id: "favorites", icon: "fas fa-heart", label: "Yêu thích" },
    { id: "recent", icon: "fas fa-clock", label: "Đã xem gần đây" },
  ];

  return (
    <HelmetProvider>
      <div className="prf-page">
        <Helmet>
          <title>
            Hồ Sơ - {displayUser.fullname || displayUser.name} - Vinsaky
          </title>
        </Helmet>
        <Header />

        <div className="content-wrapper">
          {/* Cover Photo */}
          <div className="prf-cover" />

          {/* Profile Header */}
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="prf-header">
              {/* Avatar */}
              <div className="prf-avatar-wrapper">
                <img
                  src={
                    displayUser.ava_img_url ||
                    displayUser.profileImage ||
                    "https://res.cloudinary.com/dtdwjplew/image/upload/v1737903159/9_gnxlmk.jpg"
                  }
                  alt="Ảnh đại diện"
                  className={`prf-avatar ${
                    uploadingAvatar ? "prf-avatar-uploading" : ""
                  }`}
                  onError={(e) => {
                    e.target.src =
                      "https://res.cloudinary.com/dtdwjplew/image/upload/v1737903159/9_gnxlmk.jpg";
                  }}
                />
                {uploadingAvatar && (
                  <div className="prf-avatar-spinner">
                    <div className="spinner-border text-primary" role="status" />
                  </div>
                )}
                <label className="prf-avatar-upload-btn" title="Thay đổi ảnh">
                  <i className="fas fa-camera"></i>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>

              {/* User Info */}
              <div className="prf-header-info">
                <h1>
                  {displayUser.fullname || displayUser.name || "Người dùng"}
                </h1>
                <p className="prf-header-email">
                  <i className="fas fa-envelope" style={{ fontSize: "0.75rem" }}></i>
                  {displayUser.email || "Chưa cập nhật email"}
                </p>
                <div className="prf-header-badges">
                  <span
                    className="prf-badge prf-badge-level"
                    style={{ background: currentLevel.gradient }}
                  >
                    {currentLevel.icon} {currentLevel.name}
                  </span>
                  <span className="prf-badge prf-badge-points">
                    ⭐ {rewardPoints} điểm
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="prf-header-actions">
                {isEditing ? (
                  <>
                    <button
                      className="prf-btn prf-btn-success"
                      onClick={handleSaveProfile}
                    >
                      <i className="fas fa-check"></i> Lưu
                    </button>
                    <button
                      className="prf-btn prf-btn-outline"
                      onClick={handleEditToggle}
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    className="prf-btn prf-btn-primary"
                    onClick={handleEditToggle}
                  >
                    <i className="fas fa-pen"></i> Chỉnh sửa
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="prf-stats-row">
              <div className="prf-stat-card">
                <div className="prf-stat-icon blue">
                  <i className="fas fa-eye"></i>
                </div>
                <div>
                  <div className="prf-stat-value">{recentlyViewed.length}</div>
                  <div className="prf-stat-label">Sản phẩm đã xem</div>
                </div>
              </div>
              <div className="prf-stat-card">
                <div className="prf-stat-icon pink">
                  <i className="fas fa-heart"></i>
                </div>
                <div>
                  <div className="prf-stat-value">{favorites.length}</div>
                  <div className="prf-stat-label">Yêu thích</div>
                </div>
              </div>
              <div className="prf-stat-card">
                <div className="prf-stat-icon amber">
                  <i className="fas fa-star"></i>
                </div>
                <div>
                  <div className="prf-stat-value">{rewardPoints}</div>
                  <div className="prf-stat-label">Điểm thưởng</div>
                </div>
              </div>
            </div>

            {/* Layout: Sidebar + Content */}
            <div className="prf-layout">
              {/* Sidebar */}
              <div className="prf-sidebar">
                <div className="prf-sidebar-card">
                  <nav>
                    <ul className="prf-sidebar-nav">
                      {tabs.map((tab) => (
                        <li key={tab.id} className="prf-sidebar-item">
                          <button
                            type="button"
                            className={`prf-sidebar-btn ${
                              activeTab === tab.id ? "active" : ""
                            }`}
                            onClick={() => setActiveTab(tab.id)}
                          >
                            <i className={tab.icon}></i>
                            {tab.label}
                          </button>
                        </li>
                      ))}
                      <li>
                        <div className="prf-sidebar-divider" />
                      </li>
                      <li className="prf-sidebar-item">
                        <button
                          type="button"
                          className="prf-sidebar-btn danger"
                          onClick={handleLogout}
                        >
                          <i className="fas fa-sign-out-alt"></i>
                          Đăng xuất
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>

              {/* Content */}
              <div className="prf-content">
                {/* Alerts */}
                {saveSuccess && (
                  <div className="prf-alert prf-alert-success">
                    <i className="fas fa-check-circle"></i>
                    Cập nhật thành công!
                  </div>
                )}
                {error && (
                  <div className="prf-alert prf-alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                  </div>
                )}

                {/* ===== TAB: Profile ===== */}
                {activeTab === "profile" && (
                  <div className="prf-content-card">
                    <div className="prf-content-header">
                      <h2>
                        <i className="fas fa-id-card" style={{ color: "var(--prf-primary)" }}></i>
                        Thông tin cá nhân
                      </h2>
                    </div>
                    <div className="prf-content-body">
                      {/* Fullname */}
                      <div className="prf-form-group">
                        <div className="prf-form-icon">
                          <i className="fas fa-user"></i>
                        </div>
                        <div className="prf-form-info">
                          <div className="prf-form-label">Họ và tên</div>
                          {isEditing ? (
                            <input
                              className="prf-form-input"
                              type="text"
                              value={editForm.fullname || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  fullname: e.target.value,
                                })
                              }
                              placeholder="Nhập họ và tên"
                            />
                          ) : (
                            <div
                              className={`prf-form-value ${
                                !displayUser.fullname ? "muted" : ""
                              }`}
                            >
                              {displayUser.fullname ||
                                displayUser.name ||
                                "Chưa cập nhật"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="prf-form-group">
                        <div className="prf-form-icon">
                          <i className="fas fa-envelope"></i>
                        </div>
                        <div className="prf-form-info">
                          <div className="prf-form-label">Email</div>
                          <div className="prf-form-value">
                            {displayUser.email || "Chưa cập nhật"}
                          </div>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="prf-form-group">
                        <div className="prf-form-icon">
                          <i className="fas fa-phone"></i>
                        </div>
                        <div className="prf-form-info">
                          <div className="prf-form-label">Số điện thoại</div>
                          {isEditing ? (
                            <input
                              className="prf-form-input"
                              type="tel"
                              value={editForm.phone || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="Nhập số điện thoại"
                            />
                          ) : (
                            <div
                              className={`prf-form-value ${
                                !displayUser.phone ? "muted" : ""
                              }`}
                            >
                              {displayUser.phone || "Chưa cập nhật"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <div className="prf-form-group">
                        <div className="prf-form-icon">
                          <i className="fas fa-map-marker-alt"></i>
                        </div>
                        <div className="prf-form-info">
                          <div className="prf-form-label">Địa chỉ</div>
                          {isEditing ? (
                            <input
                              className="prf-form-input"
                              type="text"
                              value={editForm.address || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  address: e.target.value,
                                })
                              }
                              placeholder="Nhập địa chỉ"
                            />
                          ) : (
                            <div
                              className={`prf-form-value ${
                                !displayUser.address ? "muted" : ""
                              }`}
                            >
                              {displayUser.address || "Chưa cập nhật"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="prf-form-group">
                        <div className="prf-form-icon">
                          <i className="fas fa-comment-alt"></i>
                        </div>
                        <div className="prf-form-info">
                          <div className="prf-form-label">Giới thiệu</div>
                          {isEditing ? (
                            <textarea
                              className="prf-form-input prf-form-textarea"
                              rows={3}
                              value={editForm.bio || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  bio: e.target.value,
                                })
                              }
                              placeholder="Viết vài dòng giới thiệu..."
                            />
                          ) : (
                            <div
                              className={`prf-form-value ${
                                !displayUser.bio ? "muted" : ""
                              }`}
                            >
                              {displayUser.bio || "Chưa có thông tin giới thiệu"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="prf-form-group">
                        <div className="prf-form-icon">
                          <i className="fas fa-venus-mars"></i>
                        </div>
                        <div className="prf-form-info">
                          <div className="prf-form-label">Giới tính</div>
                          {isEditing ? (
                            <select
                              className="prf-form-input"
                              value={editForm.gender || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  gender: e.target.value,
                                })
                              }
                            >
                              <option value="">-- Chọn giới tính --</option>
                              <option value="Male">Nam</option>
                              <option value="Female">Nữ</option>
                              <option value="Other">Khác</option>
                            </select>
                          ) : (
                            <div
                              className={`prf-form-value ${
                                !displayUser.gender ? "muted" : ""
                              }`}
                            >
                              {displayUser.gender === "Male"
                                ? "Nam"
                                : displayUser.gender === "Female"
                                ? "Nữ"
                                : displayUser.gender === "Other"
                                ? "Khác"
                                : displayUser.gender || "Chưa cập nhật"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Role */}
                      <div className="prf-form-group">
                        <div className="prf-form-icon">
                          <i className="fas fa-shield-alt"></i>
                        </div>
                        <div className="prf-form-info">
                          <div className="prf-form-label">Vai trò</div>
                          <div className="prf-form-value">
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.35rem",
                                padding: "0.2rem 0.6rem",
                                background:
                                  displayUser.role === "Admin"
                                    ? "#fef3c7"
                                    : "#eff6ff",
                                color:
                                  displayUser.role === "Admin"
                                    ? "#92400e"
                                    : "#1e40af",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              <i
                                className={`fas ${
                                  displayUser.role === "Admin"
                                    ? "fa-crown"
                                    : "fa-user"
                                }`}
                                style={{ fontSize: "0.75rem" }}
                              ></i>
                              {displayUser.role || "User"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Member since */}
                      {displayUser.createdAt && (
                        <div className="prf-form-group">
                          <div className="prf-form-icon">
                            <i className="fas fa-calendar-alt"></i>
                          </div>
                          <div className="prf-form-info">
                            <div className="prf-form-label">Ngày tham gia</div>
                            <div className="prf-form-value">
                              {new Date(displayUser.createdAt).toLocaleDateString(
                                "vi-VN",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Last login */}
                      {displayUser.lastLoginAt && (
                        <div className="prf-form-group">
                          <div className="prf-form-icon">
                            <i className="fas fa-clock"></i>
                          </div>
                          <div className="prf-form-info">
                            <div className="prf-form-label">Đăng nhập gần nhất</div>
                            <div className="prf-form-value">
                              {new Date(displayUser.lastLoginAt).toLocaleString(
                                "vi-VN",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ===== TAB: Rewards ===== */}
                {activeTab === "rewards" && (
                  <div className="prf-content-card">
                    <div className="prf-content-header">
                      <h2>
                        <i className="fas fa-trophy" style={{ color: "#f59e0b" }}></i>
                        Điểm thưởng & Cấp bậc
                      </h2>
                    </div>
                    <div className="prf-content-body">
                      {/* Hero section */}
                      <div className="prf-reward-hero">
                        <div className="prf-reward-level-icon">
                          {currentLevel.icon}
                        </div>
                        <div
                          className="prf-reward-level-name"
                          style={{ color: currentLevel.color === '#ffd700' || currentLevel.color === '#b9f2ff' ? '#1e293b' : currentLevel.color }}
                        >
                          Thành viên {currentLevel.name}
                        </div>
                        <div className="prf-reward-points-display">
                          {rewardPoints}
                        </div>
                        <div className="prf-reward-points-label">
                          điểm thưởng
                        </div>

                        {nextLevel && (
                          <div className="prf-reward-progress">
                            <div className="prf-reward-progress-bar-bg">
                              <div
                                className="prf-reward-progress-bar-fill"
                                style={{
                                  width: `${progress}%`,
                                  background: currentLevel.gradient,
                                }}
                              />
                            </div>
                            <div className="prf-reward-progress-labels">
                              <span>{currentLevel.name}</span>
                              <span>
                                Còn {nextLevel.minPoints - rewardPoints} điểm →{" "}
                                {nextLevel.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Level cards */}
                      <div className="prf-reward-levels">
                        {REWARD_LEVELS.map((level) => (
                          <div
                            key={level.name}
                            className={`prf-level-card ${
                              currentLevel.name === level.name ? "active" : ""
                            }`}
                            style={
                              currentLevel.name === level.name
                                ? { borderColor: level.color }
                                : {}
                            }
                          >
                            <div className="prf-level-card-icon">
                              {level.icon}
                            </div>
                            <div
                              className="prf-level-card-name"
                              style={{ color: level.color === '#ffd700' || level.color === '#b9f2ff' ? '#1e293b' : level.color }}
                            >
                              {level.name}
                            </div>
                            <div className="prf-level-card-range">
                              {level.maxPoints === Infinity
                                ? `${level.minPoints}+`
                                : `${level.minPoints} - ${level.maxPoints}`}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* How to earn */}
                      <div
                        style={{
                          background: "#f8fafc",
                          borderRadius: "10px",
                          padding: "1.25rem",
                          marginBottom: "1.5rem",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            marginBottom: "0.75rem",
                            color: "#1e293b",
                          }}
                        >
                          <i className="fas fa-lightbulb" style={{ color: "#f59e0b", marginRight: "0.5rem" }}></i>
                          Cách tích điểm
                        </h4>
                        <div style={{ display: "grid", gap: "0.5rem" }}>
                          {[
                            { icon: "🔑", text: "Đăng nhập mỗi ngày", pts: "+5" },
                            { icon: "👀", text: "Xem chi tiết sản phẩm", pts: "+1" },
                            { icon: "❤️", text: "Thêm vào yêu thích", pts: "+2" },
                            { icon: "🎉", text: "Lần đầu truy cập hồ sơ", pts: "+20" },
                          ].map((item, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "0.5rem 0",
                                borderBottom:
                                  i < 3 ? "1px solid #e2e8f0" : "none",
                              }}
                            >
                              <span
                                style={{ fontSize: "0.875rem", color: "#374151" }}
                              >
                                {item.icon} {item.text}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  color: "#10b981",
                                }}
                              >
                                {item.pts}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* History */}
                      {rewardHistory.length > 0 && (
                        <>
                          <div className="prf-reward-history-title">
                            <i className="fas fa-history"></i>
                            Lịch sử tích điểm
                          </div>
                          <ul className="prf-reward-history-list">
                            {rewardHistory.slice(0, 10).map((entry, i) => (
                              <li key={i} className="prf-reward-history-item">
                                <div>
                                  <div className="prf-reward-history-reason">
                                    {entry.reason}
                                  </div>
                                  <div className="prf-reward-history-time">
                                    {formatTimeAgo(entry.timestamp)}
                                  </div>
                                </div>
                                <div className="prf-reward-history-points">
                                  +{entry.points}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* ===== TAB: Favorites ===== */}
                {activeTab === "favorites" && (
                  <div className="prf-content-card">
                    <div className="prf-content-header">
                      <h2>
                        <i className="fas fa-heart" style={{ color: "#ec4899" }}></i>
                        Sản phẩm yêu thích
                      </h2>
                      {favorites.length > 0 && (
                        <button
                          className="prf-btn prf-btn-outline"
                          onClick={() => navigate("/favorites")}
                          style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                        >
                          Xem tất cả
                        </button>
                      )}
                    </div>
                    <div className="prf-content-body">
                      {favoritesLoading ? (
                        <div className="prf-empty">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                            style={{ width: "2rem", height: "2rem" }}
                          />
                          <p style={{ marginTop: "0.75rem" }}>
                            Đang tải...
                          </p>
                        </div>
                      ) : favorites.length === 0 ? (
                        <div className="prf-empty">
                          <div className="prf-empty-icon">💔</div>
                          <h4>Chưa có sản phẩm yêu thích</h4>
                          <p>
                            Bấm ❤️ trên sản phẩm để thêm vào danh sách
                          </p>
                          <button
                            className="prf-btn prf-btn-primary"
                            style={{ marginTop: "1rem" }}
                            onClick={() => navigate("/products")}
                          >
                            Khám phá sản phẩm
                          </button>
                        </div>
                      ) : (
                        <div className="prf-products-grid">
                          {favorites.slice(0, 8).map((item, idx) => (
                            <div
                              key={getProductId(item) || idx}
                              className="prf-product-card"
                              onClick={() =>
                                navigate(
                                  `/productView/${getProductId(item)}`
                                )
                              }
                            >
                              <img
                                src={getProductImage(item)}
                                alt={getProductName(item)}
                                onError={(e) => {
                                  e.target.src =
                                    "https://fushimavina.com/data/data/files/test/may-lam-da-100kg.jpg";
                                }}
                                loading="lazy"
                              />
                              <div className="prf-product-card-body">
                                <div className="prf-product-card-name">
                                  {getProductName(item)}
                                </div>
                                <div className="prf-product-card-price">
                                  {formatPrice(getProductPrice(item))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ===== TAB: Recently Viewed ===== */}
                {activeTab === "recent" && (
                  <div className="prf-content-card">
                    <div className="prf-content-header">
                      <h2>
                        <i className="fas fa-clock" style={{ color: "var(--prf-primary)" }}></i>
                        Sản phẩm đã xem gần đây
                      </h2>
                    </div>
                    <div className="prf-content-body">
                      {recentlyViewed.length === 0 ? (
                        <div className="prf-empty">
                          <div className="prf-empty-icon">🔍</div>
                          <h4>Chưa xem sản phẩm nào</h4>
                          <p>
                            Các sản phẩm bạn đã xem sẽ hiển thị ở đây
                          </p>
                          <button
                            className="prf-btn prf-btn-primary"
                            style={{ marginTop: "1rem" }}
                            onClick={() => navigate("/products")}
                          >
                            Khám phá sản phẩm
                          </button>
                        </div>
                      ) : (
                        <div className="prf-products-grid">
                          {recentlyViewed.map((item, idx) => (
                            <div
                              key={getProductId(item) || idx}
                              className="prf-product-card"
                              onClick={() =>
                                navigate(
                                  `/productView/${getProductId(item)}`
                                )
                              }
                            >
                              <img
                                src={getProductImage(item)}
                                alt={getProductName(item)}
                                onError={(e) => {
                                  e.target.src =
                                    "https://fushimavina.com/data/data/files/test/may-lam-da-100kg.jpg";
                                }}
                                loading="lazy"
                              />
                              <div className="prf-product-card-body">
                                <div className="prf-product-card-name">
                                  {getProductName(item)}
                                </div>
                                <div className="prf-product-card-price">
                                  {formatPrice(getProductPrice(item))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Daily Bonus Toast */}
        {dailyBonusToast && (
          <div className="prf-toast">
            <div className="prf-toast-icon">
              {dailyBonusToast.first ? "🎉" : "⭐"}
            </div>
            <div className="prf-toast-text">
              <strong>
                {dailyBonusToast.first
                  ? "Chào mừng bạn mới!"
                  : "Điểm danh hàng ngày!"}
              </strong>
              <span>
                +{dailyBonusToast.points} điểm thưởng đã được cộng
              </span>
            </div>
          </div>
        )}

        <ChatWidget />
        <Footer />
      </div>
    </HelmetProvider>
  );
}
