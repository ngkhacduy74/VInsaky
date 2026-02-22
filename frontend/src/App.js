import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import Bootstrap JavaScript
import * as bootstrap from "bootstrap";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { BannerProvider } from "./context/BannerContext";
import AdminPage from "./Admin/Dashboard";
import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Register from "./Pages/Register";
import ManaAccount from "./Admin/ManaAccount";
import UserDetails from "./Admin/UserDetails";
import ManaProduct from "./Admin/ManaProduct";
import ProductDetails from "./Admin/ProductDetail";
import ManaPost from "./Admin/ManaPost";
import PostDetails from "./Admin/PostDetail";
// import ProductDetail from "./Pages/ProductDetail";
import ErrorPage from "./Components/ErrorPage";

import CreateProduct from "./Admin/CreateProduct";
import ProductBrowser from "./Pages/ProductBrowser";
import CompareProduct from "./Pages/CompareProduct";
import MultiProductViewer from "./Admin/MultiProductViewer";
import Profile from "./Pages/Profile";
import ProductView from "./Pages/ProductView";
import CreatePost from "./Admin/CreatePost";
import PhoneFixed from "./Components/Phonefixed";
import PostView from "./Pages/PostView";
import UserCreateProduct from "./Admin/UserCreateProduct";
import UserProductManager from "./Pages/UserProductManager";
import UpdateProduct from "./Admin/UpdateProduct";
import Favorites from "./Pages/Favorites";
import EditPost from "./Admin/EditPost";
import Guide from "./Pages/Guide";
import Cart from "./Pages/Cart";

const App = () => {
  const [message, setMessage] = useState("");

  // Đồng bộ logout giữa các tab khi token bị xóa/thay đổi
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "token" && !event.newValue) {
        // Token đã bị xóa (logout ở tab khác hoặc token hết hạn)
        window.location.href = "/login";
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Make Bootstrap available globally
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.bootstrap = bootstrap;
    }
  }, []);

  // XÓA hoặc comment đoạn code fetch('/api/test') để không gọi API test nữa
  // useEffect(() => {
  //   fetch("/api/test")
  //     .then((response) => response.json())
  //     .then((data) => setMessage(data.message))
  //     .catch((error) => console.error("Error fetching data:", error));
  // }, []);

  return (
    <BannerProvider>
      <Router>
        <div>
          <Routes>
            {/* UI USER */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/profile" element={<Profile />} />
            <Route path="/productView/:productId" element={<ProductView />} />
            <Route path="/postView/:postId" element={<PostView />} />
            {/* UI ADMIN */}
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/manaAccount" element={<ManaAccount />} />
            <Route path="/user/:userId" element={<UserDetails />} />
            <Route path="/user/:userId" element={<UserDetails />} />
            <Route path="/manaProduct" element={<ManaProduct />} />
            <Route path="/manaPost" element={<ManaPost />} />
            <Route
              path="/multiProductViewer"
              element={<MultiProductViewer />}
            />
            <Route path="/post/:postId" element={<PostDetails />} />
            {/* Error Page */}
            <Route path="/product/:productId" element={<ProductDetails />} />

            <Route path="/create-product" element={<CreateProduct />} />
            <Route
              path="/user-create-product"
              element={<UserCreateProduct />}
            />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/product-browser" element={<ProductBrowser />} />
            <Route path="/products" element={<ProductBrowser />} />
            <Route path="/compare-product" element={<CompareProduct />} />
            <Route path="/user-products" element={<UserProductManager />} />
            <Route path="/update-product/:id" element={<UpdateProduct />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/admin/edit-post/:postId" element={<EditPost />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/cart" element={<Cart />} />
            {/* 404 Error Page */}
          </Routes>
          <PhoneFixed />
          <ToastContainer position="top-right" autoClose={2000} />
        </div>
      </Router>
    </BannerProvider>
  );
};

export default App;
