import React, { useState, useEffect, useRef } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../Services/api.service";

const LOCAL_KEY = "searchHistory";

function saveSearchHistory(keyword) {
  if (!keyword.trim()) return;
  let history = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  history = [
    keyword.trim(),
    ...history.filter((k) => k !== keyword.trim()),
  ].slice(0, 10);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(history));
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/gi, "")
    .trim();
}

function getSearchHistory(filter = "") {
  let history = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  if (filter) {
    const filterWords = normalizeText(filter).split(/\s+/).filter(Boolean);
    history = history.filter((k) => {
      const normalizedK = normalizeText(k);
      return filterWords.every((word) => normalizedK.includes(word));
    });
  }
  return history;
}

const SearchWithAutocomplete = ({
  placeholder = "Tìm kiếm sản phẩm...",
  onSearch,
  className = "",
  size = "lg",
  initialValue = "",
  value,
  onChangeValue,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Controlled mode: update searchQuery if value prop changes
  useEffect(() => {
    if (typeof value === "string" && value !== searchQuery) {
      setSearchQuery(value);
    }
  }, [value]);

  // Load suggestions khi component mount hoặc searchQuery thay đổi
  useEffect(() => {
    if (showDropdown) {
      setSuggestions(getSearchHistory(searchQuery).slice(0, 5));
      // Gọi API lấy sản phẩm theo tên
      if (searchQuery.trim()) {
        getProducts({ search: searchQuery.trim() })
          .then((res) => {
            let products = res.data?.data || [];
            setProductSuggestions(products.slice(0, 5));
          })
          .catch(() => setProductSuggestions([]));
      } else {
        setProductSuggestions([]);
      }
    }
  }, [searchQuery, showDropdown]);

  // Handle input change
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (onChangeValue) onChangeValue(e.target.value);
    setSelectedIndex(-1);
  };

  // Handle key navigation
  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      saveSearchHistory(searchQuery);
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      }
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    saveSearchHistory(suggestion);
    if (onSearch) {
      onSearch(suggestion);
    } else {
      navigate(`/products?search=${encodeURIComponent(suggestion)}`);
    }
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // Handle product suggestion click
  const handleProductClick = (product) => {
    saveSearchHistory(product.name);
    navigate(`/productView/${product._id || product.id}`);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xóa lịch sử
  const handleClearHistory = () => {
    localStorage.removeItem(LOCAL_KEY);
    setSuggestions([]);
  };

  return (
    <div className={`search-autocomplete ${className}`} ref={searchRef}>
      <style>{`
        .search-autocomplete { position: relative; }
        .search-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 1000;
          background: white;
          border: 1px solid #dee2e6;
          border-top: none;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          max-height: 350px;
          overflow-y: auto;
        }
        .suggestion-item, .product-suggestion-item {
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f8f9fa;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
        }
        .suggestion-item:hover, .suggestion-item.selected, .product-suggestion-item:hover {
          background-color: #f8f9fa;
        }
        .suggestion-item:last-child, .product-suggestion-item:last-child { border-bottom: none; }
        .product-thumb {
          width: 40px;
          height: 40px;
          object-fit: cover;
          margin-right: 12px;
          border-radius: 4px;
        }
      `}</style>
      <InputGroup size={size}>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          className="border-end-0"
        />
        <InputGroup.Text
          className="bg-white cursor-pointer"
          onClick={handleSearch}
          style={{ cursor: "pointer" }}
        >
          <Search size={20} />
        </InputGroup.Text>
      </InputGroup>

      {showDropdown &&
        (suggestions.length > 0 || productSuggestions.length > 0) && (
          <div className="search-dropdown" ref={dropdownRef}>
            {suggestions.length > 0 && (
              <>
                <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                  <small className="text-muted">Lịch sử tìm kiếm</small>
                  <button
                    className="btn btn-link btn-sm p-0 text-decoration-none"
                    onClick={handleClearHistory}
                  >
                    Xóa lịch sử
                  </button>
                </div>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion}
                    className={`suggestion-item ${
                      index === selectedIndex ? "selected" : ""
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search size={16} className="me-2 text-muted" />
                    {suggestion}
                  </div>
                ))}
              </>
            )}

            {productSuggestions.length > 0 && (
              <>
                <div className="px-3 py-2 border-bottom">
                  <small className="text-muted">Sản phẩm gợi ý</small>
                </div>
                {productSuggestions.map((product) => (
                  <div
                    key={product._id || product.id}
                    className="product-suggestion-item"
                    onClick={() => handleProductClick(product)}
                  >
                    <img
                      src={product.image?.[0] || "/images/placeholder.png"}
                      alt={product.name}
                      className="product-thumb"
                      onError={(e) => {
                        e.target.src = "/images/placeholder.png";
                      }}
                    />
                    <div>
                      <div className="fw-semibold">{product.name}</div>
                      <small className="text-muted">
                        {product.brand || "Không có thương hiệu"}
                      </small>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
    </div>
  );
};

export default SearchWithAutocomplete;
