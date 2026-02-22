import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import apiClient from '../Services/api.service';
import Sidebar from '../Components/Sidebar';
import HeaderAdmin from '../Components/HeaderAdmin';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const res = await apiClient.get(`/post/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPost(res.data.data);
      } catch (err) {
        setError('Không thể tải bài viết.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <HeaderAdmin />
      <Row style={{ margin: 0 }}>
        <Col md="auto" style={{ width: 250, background: '#2c3e50', color: 'white', padding: 0 }}>
          <Sidebar />
        </Col>
        <Col style={{ marginLeft: 10, padding: 24 }}>
          {loading ? (
            <div className="py-5 text-center">
              <Spinner animation="border" />
              <div>Đang tải chi tiết bài viết...</div>
            </div>
          ) : error ? (
            <div className="py-5">
              <Alert variant="danger">{error}</Alert>
              <Button variant="secondary" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} className="me-2" /> Quay lại
              </Button>
            </div>
          ) : !post ? null : (
            <>
              <Button variant="outline-primary" className="mb-3" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} className="me-2" /> Quay lại
              </Button>
              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <h2 className="mb-3">{post.title}</h2>
                  <Row className="mb-3">
                    <Col md={6}>
                      <div><strong>Danh mục:</strong> {post.category}</div>
                      <div><strong>Tình trạng:</strong> {post.condition}</div>
                      <div><strong>Ngày đăng:</strong> {new Date(post.createdAt).toLocaleDateString('vi-VN')}</div>
                    </Col>
                    <Col md={6}>
                      <div><strong>Người đăng:</strong> {post.seller?.fullname || 'Ẩn danh'}</div>
                      <div><strong>SĐT:</strong> {post.seller?.phone || 'Ẩn'}</div>
                      <div><strong>Email:</strong> {post.seller?.email || 'Ẩn'}</div>
                    </Col>
                  </Row>
                  {post.content && (
                    <div className="mb-3">
                      <strong>Nội dung:</strong>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
                    </div>
                  )}
                  {post.description && (
                    <div className="mb-3">
                      <strong>Mô tả:</strong>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{post.description}</div>
                    </div>
                  )}
                  {post.image && post.image.length > 0 && (
                    <div className="mb-3">
                      <strong>Hình ảnh:</strong>
                      <Row>
                        {post.image.map((img, idx) => (
                          <Col key={idx} xs={6} md={4} lg={3} className="mb-2">
                            <img src={img} alt={`Ảnh ${idx + 1}`} style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }} />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                  {post.video && post.video.length > 0 && (
                    <div className="mb-3">
                      <strong>Video:</strong>
                      <Row>
                        {post.video.map((vid, idx) => (
                          <Col key={idx} xs={12} md={6} className="mb-2">
                            <video controls style={{ width: '100%', borderRadius: 8, background: '#000' }} src={vid} />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                  <div className="mb-2">
                    <strong>Lượt thích:</strong> {post.likes ? post.likes.length : 0}
                  </div>
                  {post.comments && post.comments.length > 0 && (
                    <div className="mt-3">
                      <strong>Bình luận:</strong>
                      <ul>
                        {post.comments.map((c, idx) => (
                          <li key={idx}>
                            <b>{c.user}:</b> {c.content}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default PostDetail;
