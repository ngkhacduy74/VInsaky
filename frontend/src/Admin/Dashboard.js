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
    <Container fluid className="bg-light admin-page" style={{ minHeight: "100vh" }}>
      <HeaderAdmin />
      <Row>
        <Col md="auto" style={{ width: "250px", background: "#2c3e50", color: "white", padding: 0 }}>
          <Sidebar />
        </Col>
        <Col style={{ marginLeft: "10px" }} className="p-4">




          {/* Data Source Status */}
          <div className="mb-3">
            <Alert variant={realData.summary ? "success" : "warning"}>
              {realData.summary ? (
                <>
                  📊 <strong>Dữ Liệu Thực Đã Kết Nối:</strong> Dashboard đang sử dụng dữ liệu trực tiếp từ cơ sở dữ liệu của bạn
                </>
              ) : (
                <>
                  ⚠️ <strong>Không Có Dữ Liệu:</strong> Không thể lấy dữ liệu từ cơ sở dữ liệu
                  <br />
                  <small>
                    Vui lòng kiểm tra:
                    <ul className="mb-0 mt-1">
                      <li>Server backend đang chạy (port 4000)</li>
                      <li>MongoDB đã kết nối</li>
                      <li>Bạn đã đăng nhập với quyền Admin</li>
                      <li>Cơ sở dữ liệu có dữ liệu (users, posts, products)</li>
                    </ul>
                  </small>
                </>
              )}
            </Alert>
          </div>

          {/* Enhanced Statistics Cards - Cập nhật theo yêu cầu */}
          <div id="dashboard" className="mb-5">
            <h3 className="mb-4">📊 Tổng Quan Dashboard</h3>
            <Row className="g-4 mb-4">
              <Col md={2}>
                <Card className="text-center shadow-sm h-100" style={{ borderRadius: "15px" }}>
                  <Card.Body>
                    <div className="display-6 text-primary">{dashboardData.totalUsers}</div>
                    <div className="text-muted">Người dùng đã đăng ký</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2}>
                <Card className="text-center shadow-sm h-100" style={{ borderRadius: "15px" }}>
                  <Card.Body>
                    <div className="display-6 text-success">{dashboardData.totalProducts}</div>
                    <div className="text-muted">Số lượng SP đã lên kệ</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2}>
                <Card className="text-center shadow-sm h-100" style={{ borderRadius: "15px" }}>
                  <Card.Body>
                    <div className="display-6 text-warning">{dashboardData.secondHandProductCount}</div>
                    <div className="text-muted">Số lượng SP cũ (SecondHand)</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2}>
                <Card className="text-center shadow-sm h-100" style={{ borderRadius: "15px" }}>
                  <Card.Body>
                    <div className="display-6 text-info">{dashboardData.newProductCount}</div>
                    <div className="text-muted">Số lượng SP mới (New)</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2}>
                <Card className="text-center shadow-sm h-100" style={{ borderRadius: "15px" }}>
                  <Card.Body>
                    <div className="display-6 text-primary">{dashboardData.totalPosts}</div>
                    <div className="text-muted">Tổng số bài post</div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>

  

 
        </Col>
      </Row>
    </Container>
  );
}

export default AdminDashboard;