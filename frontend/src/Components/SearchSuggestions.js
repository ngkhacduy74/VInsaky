import React, { useState, useEffect } from "react";
import { Card, Badge, Button, Spinner } from "react-bootstrap";
import { Clock, TrendingUp, Eye, Trash2 } from "lucide-react";
import SearchHistoryService from "../Services/searchHistory.service";
import { useNavigate } from "react-router-dom";

const SearchSuggestions = ({ onSearchSelect, showHistory = true }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await SearchHistoryService.getSearchSuggestions(
        10,
        "product"
      );
      setSuggestions(response.data);
    } catch (error) {
      setError("Không thể tải đề xuất tìm kiếm");
      console.error("Error loading suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = (searchQuery) => {
    if (onSearchSelect) {
      onSearchSelect(searchQuery);
    } else {
      // Mặc định navigate đến trang tìm kiếm sản phẩm
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleProductClick = (product) => {
    const id = product._id || product.id;
    navigate(`/productView/${id}`);
  };

  const handleDeleteHistory = async (searchQuery) => {
    try {
      // Lấy lịch sử tìm kiếm để xóa
      const historyResponse = await SearchHistoryService.getSearchHistory(
        1,
        100
      );
      const searchHistory = historyResponse.data.find(
        (item) => item.searchQuery === searchQuery
      );

      if (searchHistory) {
        await SearchHistoryService.deleteSearchHistory(searchHistory._id);
        // Reload suggestions
        loadSuggestions();
      }
    } catch (error) {
      console.error("Error deleting search history:", error);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải đề xuất...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-danger">
        <p>{error}</p>
        <Button variant="outline-primary" size="sm" onClick={loadSuggestions}>
          Thử lại
        </Button>
      </div>
    );
  }

  if (!suggestions) {
    return null;
  }

  return (
    <div className="search-suggestions">
      <style>{`
        .search-suggestions {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .suggestion-section {
          padding: 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        .suggestion-section:last-child {
          border-bottom: none;
        }
        .suggestion-item {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          margin: 4px 0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .suggestion-item:hover {
          background: #f8f9fa;
        }
        .suggestion-item .delete-btn {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .suggestion-item:hover .delete-btn {
          opacity: 1;
        }
        .product-card {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          transition: all 0.2s;
          cursor: pointer;
        }
        .product-card:hover {
          border-color: #007bff;
          box-shadow: 0 2px 8px rgba(0,123,255,0.1);
        }
        .product-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 6px;
        }
        .trending-badge {
          background: linear-gradient(45deg, #ff6b6b, #ff8e53);
          color: white;
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 12px;
        }
      `}</style>

      {/* Lịch sử tìm kiếm gần đây */}
      {showHistory &&
        suggestions.popularSearches &&
        suggestions.popularSearches.length > 0 && (
          <div className="suggestion-section">
            <div className="d-flex align-items-center mb-3">
              <Clock size={16} className="me-2 text-muted" />
              <h6 className="mb-0">Tìm kiếm gần đây</h6>
            </div>
            {suggestions.popularSearches.slice(0, 5).map((item, index) => (
              <div key={index} className="suggestion-item">
                <div
                  className="flex-grow-1"
                  onClick={() => handleSearchClick(item.searchQuery)}
                >
                  <div className="d-flex align-items-center">
                    <span className="fw-medium">{item.searchQuery}</span>
                    {item.category && (
                      <Badge bg="light" text="dark" className="ms-2">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <small className="text-muted">
                    Tìm {item.searchCount} lần •{" "}
                    {new Date(item.lastSearched).toLocaleDateString("vi-VN")}
                  </small>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="delete-btn text-danger p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHistory(item.searchQuery);
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}

      {/* Sản phẩm đã xem */}
      {suggestions.viewedProducts && suggestions.viewedProducts.length > 0 && (
        <div className="suggestion-section">
          <div className="d-flex align-items-center mb-3">
            <Eye size={16} className="me-2 text-muted" />
            <h6 className="mb-0">Sản phẩm đã xem</h6>
          </div>
          <div className="row g-2">
            {suggestions.viewedProducts.slice(0, 4).map((product, index) => (
              <div key={index} className="col-6">
                <Card
                  className="product-card"
                  onClick={() => handleProductClick(product)}
                >
                  <Card.Body className="p-2">
                    <div className="d-flex align-items-center">
                      <img
                        src={product.image?.[0] || "/placeholder-product.jpg"}
                        alt={product.name}
                        className="product-image me-2"
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                      <div className="flex-grow-1">
                        <h6 className="mb-1 small">{product.name}</h6>
                        <p className="mb-0 text-primary fw-bold">
                          {product.price?.toLocaleString("vi-VN")} ₫
                        </p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tìm kiếm phổ biến */}
      {suggestions.trendingSearches &&
        suggestions.trendingSearches.length > 0 && (
          <div className="suggestion-section">
            <div className="d-flex align-items-center mb-3">
              <TrendingUp size={16} className="me-2 text-muted" />
              <h6 className="mb-0">Tìm kiếm phổ biến</h6>
            </div>
            {suggestions.trendingSearches.slice(0, 5).map((item, index) => (
              <div key={index} className="suggestion-item">
                <div
                  className="flex-grow-1"
                  onClick={() => handleSearchClick(item.searchQuery)}
                >
                  <div className="d-flex align-items-center">
                    <span className="fw-medium">{item.searchQuery}</span>
                    <Badge className="trending-badge ms-2">
                      {item.totalSearches} lượt
                    </Badge>
                  </div>
                  <small className="text-muted">
                    {item.uniqueUsers} người tìm kiếm
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default SearchSuggestions;
