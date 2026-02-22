import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, Link as LinkIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { authApiClient } from "../Services/auth.service";

export default function NewPostForm() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      // Chỉ cho phép admin truy cập trang này
      if (!user || !user.role || user.role.toLowerCase() !== "admin") {
        navigate("/", { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const [formData, setFormData] = useState({
    title: "",
    category: "A",
    status: "New",
    address: "",
    description: "",
    condition: "Pending",
    user_position: "Newbie",
    image: null,
    video: null,
    mediaUrl: "",
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("file"); // 'file' or 'url'
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return null; // Or a spinner if you want
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData({
        ...formData,
        image: file,
        mediaUrl: "", // Clear URL when file is selected
      });
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setFormData({
      ...formData,
      mediaUrl: url,
      image: null, // Clear file when URL is entered
    });

    if (url) {
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      alert("Bạn cần đăng nhập để tạo bài viết!");
      setLoading(false);
      return;
    }

    let submissionData;
    let headers = {};

    if (formData.image) {
      submissionData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submissionData.append(key, value);
      });
      headers["Content-Type"] = "multipart/form-data";
    } else {
      submissionData = {
        ...formData,
        createdAt: new Date().toISOString(),
      };
    }

    try {
      const response = await authApiClient.post(
        "/post/createPost",
        submissionData,
        { headers }
      );
      alert("Tạo bài viết thành công!");
      setSubmitted(true);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Tạo bài viết thất bại! " + (error.response?.data?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "A",
      status: "New",
      address: "",
      description: "",
      condition: "Pending",
      user_position: "Newbie",
      image: null,
      video: null,
      mediaUrl: "",
    });
    setPreviewUrl(null);
    setSubmitted(false);
    setUploadMethod("file");
  };

  if (submitted) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-body">
                <h2 className="card-title text-success mb-3">
                  <i className="bi bi-check-circle me-2"></i>
                  Post Submitted Successfully!
                </h2>
                <p className="card-text mb-3">
                  Your product has been posted and is pending review.
                </p>
                <div className="bg-light p-3 rounded">
                  <pre
                    className="mb-0"
                    style={{
                      fontSize: "0.875rem",
                      maxHeight: "300px",
                      overflow: "auto",
                    }}
                  >
                    {JSON.stringify(
                      {
                        ...formData,
                        image: formData.image ? formData.image.name : null,
                        createdAt: new Date().toISOString(),
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
                <button className="btn btn-primary mt-3" onClick={resetForm}>
                  Create Another Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Bootstrap CSS */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css"
        rel="stylesheet"
      />
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h1 className="card-title h4 mb-0">Create New Product Post</h1>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  {/* Media Upload Section */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Product Image or Video
                    </label>
                    {/* Upload Method Tabs */}
                    <ul className="nav nav-tabs mb-3" role="tablist">
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${
                            uploadMethod === "file" ? "active" : ""
                          }`}
                          type="button"
                          onClick={() => setUploadMethod("file")}
                        >
                          <Upload size={16} className="me-1" />
                          Upload File
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${
                            uploadMethod === "url" ? "active" : ""
                          }`}
                          type="button"
                          onClick={() => setUploadMethod("url")}
                        >
                          <LinkIcon size={16} className="me-1" />
                          Use URL
                        </button>
                      </li>
                    </ul>
                    {/* File Upload Tab */}
                    {uploadMethod === "file" && (
                      <div
                        className={`border border-2 border-dashed rounded p-4 text-center ${
                          previewUrl && !formData.mediaUrl
                            ? "border-success"
                            : "border-secondary"
                        }`}
                      >
                        {previewUrl && !formData.mediaUrl ? (
                          <div className="position-relative">
                            {formData.image?.type?.startsWith("video/") ? (
                              <video
                                src={previewUrl}
                                controls
                                className="img-fluid rounded"
                                style={{ maxHeight: "300px" }}
                              />
                            ) : (
                              <img
                                src={previewUrl}
                                alt="Product preview"
                                className="img-fluid rounded"
                                style={{ maxHeight: "300px" }}
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewUrl(null);
                                setFormData({ ...formData, image: null });
                              }}
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="py-4">
                            <div className="mb-3">
                              <Camera size={48} className="text-muted" />
                            </div>
                            <p className="text-muted mb-3">
                              Drag and drop your image/video here or click to
                              browse
                            </p>
                            <label className="btn btn-primary">
                              <Upload size={16} className="me-2" />
                              Select File
                              <input
                                type="file"
                                accept="image/*,video/*"
                                className="d-none"
                                onChange={handleImageChange}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                    {/* URL Input Tab */}
                    {uploadMethod === "url" && (
                      <div>
                        <div className="mb-3">
                          <input
                            type="url"
                            className="form-control"
                            placeholder="Enter image or video URL (e.g., https://example.com/image.jpg)"
                            value={formData.mediaUrl}
                            onChange={handleUrlChange}
                          />
                          <div className="form-text">
                            Enter a direct link to an image (jpg, png, gif) or
                            video (mp4, webm)
                          </div>
                        </div>
                        {previewUrl && formData.mediaUrl && (
                          <div className="border rounded p-3">
                            <div className="position-relative">
                              {formData.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                <video
                                  src={previewUrl}
                                  controls
                                  className="img-fluid rounded"
                                  style={{ maxHeight: "300px" }}
                                  onError={() => {
                                    setPreviewUrl(null);
                                    alert("Could not load video from this URL");
                                  }}
                                />
                              ) : (
                                <img
                                  src={previewUrl}
                                  alt="Product preview"
                                  className="img-fluid rounded"
                                  style={{ maxHeight: "300px" }}
                                  onError={() => {
                                    setPreviewUrl(null);
                                    alert("Could not load image from this URL");
                                  }}
                                />
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewUrl(null);
                                  setFormData({ ...formData, mediaUrl: "" });
                                }}
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Title */}
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label fw-semibold">
                      Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {/* Category */}
                  <div className="mb-3">
                    <label
                      htmlFor="category"
                      className="form-label fw-semibold"
                    >
                      Category
                    </label>
                    <select
                      className="form-select"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>
                  {/* Status */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Status</label>
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="statusNew"
                          value="New"
                          checked={formData.status === "New"}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="statusNew">
                          New
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="status"
                          id="statusSecondHand"
                          value="SecondHand"
                          checked={formData.status === "SecondHand"}
                          onChange={handleInputChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="statusSecondHand"
                        >
                          SecondHand
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* Address */}
                  <div className="mb-3">
                    <label htmlFor="address" className="form-label fw-semibold">
                      Address
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {/* Description */}
                  <div className="mb-4">
                    <label
                      htmlFor="description"
                      className="form-label fw-semibold"
                    >
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {/* Submit Button */}
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? "Đang gửi..." : "Submit Post"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Bootstrap JS */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/js/bootstrap.bundle.min.js"></script>
    </>
  );
}
