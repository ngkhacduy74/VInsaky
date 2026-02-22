import React, { useEffect, useState } from "react";
import { Container, Table, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import ChatWidget from "../Components/WidgetChat";
const UserProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/product/user/products`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        setProducts(res.data.data || []);
      } catch (err) {
        setError("Không thể tải danh sách sản phẩm của bạn.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <Header />
      <div className="content-wrapper">
        <Container style={{ maxWidth: 900, margin: "40px auto" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button variant="outline-secondary" onClick={() => navigate("/")}>
              ← Quay về trang chủ
            </Button>
            <h2 className="mb-0" style={{ color: "#2563eb", fontWeight: 700 }}>
              Quản lý sản phẩm của bạn
            </h2>
            <div></div>
          </div>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : products.length === 0 ? (
            <Alert variant="info">Bạn chưa có sản phẩm nào.</Alert>
          ) : (
            <Table bordered hover responsive>
              <thead style={{ background: "#f1f5f9" }}>
                <tr>
                  <th>Tên sản phẩm</th>
                  <th>Thương hiệu</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.brand}</td>
                    <td>{p.price?.toLocaleString()} VND</td>
                    <td>
                      {p.status === "SecondHand" ? "Đã qua sử dụng" : "Mới"}
                    </td>
                    <td>{new Date(p.createdAt).toLocaleString()}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => navigate(`/productView/${p._id}`)}
                      >
                        Xem
                      </Button>
                      {/* Có thể thêm nút sửa/xóa nếu muốn */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <div className="d-flex justify-content-end mt-4">
            <Button
              variant="success"
              onClick={() => navigate("/user-create-product")}
            >
              + Đăng sản phẩm mới
            </Button>
          </div>
        </Container>
      </div>
      <ChatWidget />
      <Footer />
    </div>
  );
};

export default UserProductManager;
