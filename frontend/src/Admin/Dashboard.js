/* eslint-env browser */

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import HeaderAdmin from "../Components/HeaderAdmin";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from "chart.js";
import axios from "axios";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

function AdminDashboard() {
  const location = useLocation();
  
  // Existing token state
  const [tokens, setTokens] = useState(() => {
    const locationToken = location.state?.token;
    const locationRefreshToken = location.state?.refresh_token;
    
    if (locationToken && locationRefreshToken) {
      return {
        accessToken: locationToken,
        refreshToken: locationRefreshToken
      };
    }
    
    try {
      const accessToken = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");
      return {
        accessToken: accessToken || null,
        refreshToken: refreshToken || null
      };
    } catch (error) {
      console.error("Lỗi khi truy cập localStorage:", error);
      return { accessToken: null, refreshToken: null };
    }
  });

  // Enhanced dashboard state - cập nhật theo yêu cầu
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,              // Tổng số user
    newUsersToday: 0,          // Số user mới trong ngày
    totalProducts: 0,          // Tổng số sản phẩm
    totalPosts: 0,             // Tổng số bài post
    activeUsers: 0,            // Tổng số User đang truy cập
    todayPageViews: 0,         // Những người hôm nay xem trang web
  });

  // Auto refresh tracking
  const [nextRefreshTime, setNextRefreshTime] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [realData, setRealData] = useState({
    summary: null,
    charts: null,
    recentPosts: [],
    topCategories: []
  });

  // Token refresh function (existing)
  const refreshAccessToken = async () => {
    if (!tokens.refreshToken) {
      console.error("Không có refresh token");
      return false;
    }

    try {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newTokens = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || tokens.refreshToken
        };
        
        try {
          localStorage.setItem("token", newTokens.accessToken);
          if (data.refreshToken) {
            localStorage.setItem("refreshToken", newTokens.refreshToken);
          }
        } catch (error) {
          console.error("Lỗi khi lưu token đã làm mới:", error);
        }
        
        setTokens(newTokens);
        return true;
      }
    } catch (error) {
      console.error("Lỗi khi làm mới token:", error);
    }
    return false;
  };

  // Fetch real dashboard data from API - FIXED: Use proxy URL
  const fetchRealDashboardData = async () => {
    if (!tokens.accessToken) {
      return null;
    }

    try {
      // FIXED: Use proxy URL instead of direct backend URL
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? '/api/v1/dashboard/stats'
        : `${process.env.REACT_APP_BACKEND_URL}/dashboard/stats`;
        
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          return await fetchRealDashboardData();
        }
        return null;
      }

      if (response.status === 403) {
        return null;
      }

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("❌ Response không phải JSON:", contentType);
          return null;
        }
        
        const data = await response.json();
        return data.data;
      }

      // Log error response
      const errorText = await response.text();
      return null;
    } catch (error) {
      console.error("❌ Lỗi khi lấy dữ liệu dashboard:", error);
      return null;
    }
  };

  // Fetch product stats giống Manage Product
  const fetchProductStats = async () => {
    try {
      // Sử dụng proxy URL nếu ở dev, hoặc backend URL nếu production
      const apiUrl = process.env.NODE_ENV === 'development'
        ? '/api/v1/product/'
        : `${process.env.REACT_APP_BACKEND_URL}/product/`;
      const response = await axios.get(apiUrl);
      const products = Array.isArray(response.data.data) ? response.data.data : [];
      const newCount = products.filter(p => p.status === "New").length;
      const oldCount = products.filter(p => p.status === "SecondHand").length;
      // setProductStats({
      //   total: products.length,
      //   newCount,
      //   oldCount,
      // });
    } catch (error) {
      // setProductStats({ total: 0, newCount: 0, oldCount: 0 });
    }
  };

  // Existing dashboard data fetch
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch real data from API
        const realData = await fetchRealDashboardData();
        
        if (realData) {
          setRealData(realData);
          
          // Update dashboard data với các giá trị thực theo yêu cầu mới
          setDashboardData({
            totalUsers: realData.summary.totalUsers || 0,           // Tổng số user
            newUsersToday: realData.summary.todayNewUsers || 0,     // Số user mới trong ngày
            totalProducts: realData.summary.totalProducts || 0,     // Tổng số sản phẩm
            totalPosts: realData.summary.totalPosts || 0,           // Tổng số bài post
            activeUsers: realData.summary.activeUsers || 0,         // User đang truy cập
            todayPageViews: realData.summary.todayPageViews || 0,   // Lượt xem hôm nay
            newProductCount: realData.summary.newProductCount || 0, // Số lượng SP mới
            secondHandProductCount: realData.summary.secondHandProductCount || 0 // Số lượng SP cũ
          });
          
          // Update charts data
          if (realData.charts) {
            // setPostsByMonth(realData.charts.postsByMonth || Array(12).fill(0));
          }
          
          // Set available years (just current year for now)
          // setAvailableYears([new Date().getFullYear()]);
        } else {
          console.log("⚠️ Không có dữ liệu thực - hiển thị dashboard trống");
          // Set empty data when no real data is available
          setDashboardData({
            totalUsers: 0,
            newUsersToday: 0,
            totalProducts: 0,
            totalPosts: 0,
            activeUsers: 0,
            todayPageViews: 0,
          });
          // setPostsByMonth(Array(12).fill(0));
          // setAvailableYears([new Date().getFullYear()]);
        }
      } catch (error) {
        console.error("Lỗi khi xử lý dữ liệu dashboard:", error);
        // Set empty data on error
        setDashboardData({
          totalUsers: 0,
          newUsersToday: 0,
          totalProducts: 0,
          totalPosts: 0,
          activeUsers: 0,
          todayPageViews: 0,
        });
        // setPostsByMonth(Array(12).fill(0));
        // setAvailableYears([new Date().getFullYear()]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedYear, tokens.accessToken, tokens]);

  useEffect(() => {
    fetchProductStats();
  }, []);

  if (isLoading) return <div className="d-flex justify-content-center p-5"><div className="spinner-border" role="status"><span className="visually-hidden">Đang tải...</span></div></div>;

  return (
    <Container fluid className="admin-page" style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: 0 }}>
      <HeaderAdmin />
      <Row className="g-0">
        <Col md="auto" style={{ width: "250px", background: "#ffffff", padding: 0 }}>
          <Sidebar />
        </Col>
        <Col className="p-4" style={{ height: "calc(100vh - 76px)", overflowY: "auto" }}>
          
          <style>{`
            .admin-dashboard-title {
              font-size: 1.25rem;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 16px;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .admin-stat-card {
              background: #ffffff;
              border-radius: 16px;
              padding: 16px 20px;
              border: 1px solid rgba(226, 232, 240, 0.8);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
              transition: all 0.3s ease;
              height: 100%;
              position: relative;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .admin-stat-card:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
              border-color: #cbd5e1;
            }
            .stat-icon-wrapper {
              width: 38px;
              height: 38px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 12px;
              font-size: 1rem;
            }
            .stat-value {
              font-size: 1.75rem;
              font-weight: 800;
              line-height: 1.2;
              margin-bottom: 2px;
            }
            .stat-label {
              font-size: 0.75rem;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            /* Gradient Text Colors */
            .text-gradient-primary { background: linear-gradient(135deg, #2563eb, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .bg-soft-primary { background: #eff6ff; color: #2563eb; }
            
            .text-gradient-success { background: linear-gradient(135deg, #10b981, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .bg-soft-success { background: #ecfdf5; color: #10b981; }
            
            .text-gradient-warning { background: linear-gradient(135deg, #f59e0b, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .bg-soft-warning { background: #fffbeb; color: #f59e0b; }
            
            .text-gradient-info { background: linear-gradient(135deg, #06b6d4, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .bg-soft-info { background: #ecfeff; color: #06b6d4; }
            
            .text-gradient-purple { background: linear-gradient(135deg, #8b5cf6, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .bg-soft-purple { background: #f5f3ff; color: #8b5cf6; }
          `}</style>

          {/* Data Source Status */}
          <div className="mb-4">
            <Alert variant={realData.summary ? "success" : "warning"} style={{ borderRadius: "12px", border: "none", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }} className="d-flex align-items-start">
              <div className="me-3 fs-4">{realData.summary ? "📊" : "⚠️"}</div>
              <div>
                {realData.summary ? (
                  <>
                    <strong className="d-block mb-1">Dữ Liệu Thực Đã Kết Nối</strong>
                    <span className="text-muted">Dashboard đang sử dụng dữ liệu trực tiếp từ cơ sở dữ liệu của bạn.</span>
                  </>
                ) : (
                  <>
                    <strong className="d-block mb-1">Không Có Dữ Liệu</strong>
                    <span className="text-muted mb-2 d-block">Không thể lấy dữ liệu từ cơ sở dữ liệu. Vui lòng kiểm tra:</span>
                    <ul className="mb-0 text-muted small ps-3">
                      <li>Server backend đang chạy (port 4000)</li>
                      <li>MongoDB đã kết nối</li>
                      <li>Bạn đã đăng nhập với quyền Admin</li>
                      <li>Cơ sở dữ liệu có dữ liệu (users, posts, products)</li>
                    </ul>
                  </>
                )}
              </div>
            </Alert>
          </div>

          {/* Enhanced Statistics Cards */}
          <div id="dashboard" className="mb-5">
            <h3 className="admin-dashboard-title">
              Tổng Quan Hệ Thống
            </h3>
            <Row className="g-4 mb-4">
              <Col xs={12} sm={6} lg={4}>
                <div className="admin-stat-card">
                  <div className="stat-icon-wrapper bg-soft-primary">
                    <i className="bi bi-people-fill">👥</i>
                  </div>
                  <div className="stat-value text-gradient-primary">{dashboardData.totalUsers}</div>
                  <div className="stat-label">Người dùng đã đăng ký</div>
                </div>
              </Col>
              
              <Col xs={12} sm={6} lg={4}>
                <div className="admin-stat-card">
                  <div className="stat-icon-wrapper bg-soft-success">
                    <i className="bi bi-box-seam">📦</i>
                  </div>
                  <div className="stat-value text-gradient-success">{dashboardData.totalProducts}</div>
                  <div className="stat-label">Tổng SP đã lên kệ</div>
                </div>
              </Col>

              <Col xs={12} sm={6} lg={4}>
                <div className="admin-stat-card">
                  <div className="stat-icon-wrapper bg-soft-purple">
                    <i className="bi bi-file-earmark-text">📝</i>
                  </div>
                  <div className="stat-value text-gradient-purple">{dashboardData.totalPosts}</div>
                  <div className="stat-label">Tổng số bài viết</div>
                </div>
              </Col>
              
              <Col xs={12} sm={6} lg={6}>
                <div className="admin-stat-card">
                  <div className="stat-icon-wrapper bg-soft-info">
                    <i className="bi bi-stars">✨</i>
                  </div>
                  <div className="stat-value text-gradient-info">{dashboardData.newProductCount}</div>
                  <div className="stat-label">SP Mới (New)</div>
                </div>
              </Col>

              <Col xs={12} sm={6} lg={6}>
                <div className="admin-stat-card">
                  <div className="stat-icon-wrapper bg-soft-warning">
                    <i className="bi bi-arrow-repeat">♻️</i>
                  </div>
                  <div className="stat-value text-gradient-warning">{dashboardData.secondHandProductCount}</div>
                  <div className="stat-label">SP Cũ (SecondHand)</div>
                </div>
              </Col>
            </Row>
          </div>
  
        </Col>
      </Row>
    </Container>
  );
}

export default AdminDashboard;