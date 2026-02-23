const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/Admin/UserCreateProduct.js');
let code = fs.readFileSync(filePath, 'utf8');

const returnRegex = /return \(\s*<div className="content-wrapper">[\s\S]*?\);\s*};\s*export default/m;

const newReturn = `return (
    <div className="content-wrapper" style={{ backgroundColor: "#f8fafc", paddingBottom: "100px" }}>
      <Header />

      <Container style={{ maxWidth: 900, marginTop: "40px" }}>
        <style>{\`
          .user-create-product-header {
            margin-bottom: 24px;
            display: flex;
            align-items: center;
          }
          .user-create-product-header h2 {
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -0.5px;
            margin: 0;
            flex-grow: 1;
            text-align: center;
          }
          .user-create-product-section {
            background: #ffffff;
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 24px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
          }
          .user-create-product-section:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border-color: #cbd5e1;
          }
          .section-title {
            font-size: 1.2rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
            padding-bottom: 12px;
            border-bottom: 2px solid #f1f5f9;
          }
          .user-create-product-label {
            color: #475569;
            font-weight: 600;
            font-size: 0.95rem;
            margin-bottom: 8px;
          }
          .form-control {
            border-radius: 10px;
            border: 1px solid #cbd5e1;
            padding: 12px 16px;
            transition: all 0.2s;
            background-color: #f8fafc;
          }
          .form-control:focus {
            background-color: #ffffff;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          .image-upload-container {
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            padding: 40px 20px;
            text-align: center;
            background: #f8fafc;
            transition: all 0.2s;
            cursor: pointer;
            margin-bottom: 20px;
          }
          .image-upload-container:hover {
            border-color: #3b82f6;
            background: #eff6ff;
          }
          .image-preview-card {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            aspect-ratio: 1;
            background: #f1f5f9;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          .image-preview-card img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .image-remove-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(239, 68, 68, 0.9);
            color: white;
            border: none;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            z-index: 10;
          }
          .image-remove-btn:hover {
            background: rgb(220, 38, 38);
            transform: scale(1.1);
          }
          .sticky-action-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            padding: 16px 24px;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
            z-index: 1000;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 16px;
            border-top: 1px solid #e2e8f0;
          }
          .btn-save-sticky {
            background: linear-gradient(135deg, #0d6efd, #2563eb);
            border: none;
            border-radius: 10px;
            padding: 12px 36px;
            font-weight: 600;
            font-size: 1.1rem;
            color: white;
            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .btn-save-sticky:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(13, 110, 253, 0.3);
          }
          .description-editable {
            min-height: 200px;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            padding: 16px;
            font-family: inherit;
            background: #f8fafc;
            outline: none;
            word-break: break-word;
            transition: all 0.2s;
          }
          .description-editable:focus {
            background: #fff;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        \`}</style>

        <div className="user-create-product-header">
          <Button
            variant="light"
            onClick={() => navigate(-1)}
            style={{ borderRadius: "10px", width: "45px", height: "45px", display: "flex", alignItems: "center", justifyContent: "center" }}
            className="shadow-sm border-0 bg-white"
          >
            <ArrowLeft size={20} color="#475569" />
          </Button>
          <h2>Tạo Sản Phẩm Mới</h2>
          <div style={{ width: "45px" }}></div>
        </div>

        {error && <Alert variant="danger" className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>{error}</Alert>}
        {success && <Alert variant="success" className="border-0 shadow-sm" style={{ borderRadius: "12px" }}>{success}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* Section 1: Thông tin cơ bản */}
          <div className="user-create-product-section">
            <div className="section-title">
              <span style={{ background: "#eff6ff", padding: "8px", borderRadius: "8px", color: "#2563eb", display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
              </span>
              Thông tin cơ bản
            </div>
            
            <Row>
              <Col md={12}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Tên sản phẩm *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.name}
                    placeholder="VD: Tủ đông công nghiệp 4 cánh"
                    maxLength={100}
                  />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Thương hiệu *</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    isInvalid={!!errors.brand}
                    placeholder="VD: Sanaky, Berjaya..."
                    maxLength={50}
                  />
                  <Form.Control.Feedback type="invalid">{errors.brand}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Giá (VND) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    isInvalid={!!errors.price}
                    placeholder="VD: 15000000"
                  />
                  <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Liên Hệ Doanh Nghiệp *</Form.Label>
                  <Form.Control
                    type="text"
                    name="business_phone"
                    value={formData.business_phone}
                    onChange={handleInputChange}
                    isInvalid={!!errors.business_phone}
                    placeholder="Số điện thoại liên hệ"
                  />
                  <Form.Control.Feedback type="invalid">{errors.business_phone}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Tình trạng</Form.Label>
                  <Form.Control
                    type="text"
                    name="status"
                    value="Đã qua sử dụng"
                    readOnly
                    disabled
                    style={{ background: "#f1f5f9", fontWeight: 600, color: "#64748b" }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Section 2: Chi tiết kỹ thuật */}
          <div className="user-create-product-section">
            <div className="section-title">
              <span style={{ background: "#f0fdf4", padding: "8px", borderRadius: "8px", color: "#16a34a", display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </span>
              Chi tiết kỹ thuật
            </div>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Kích thước (cm)</Form.Label>
                  <Form.Control
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    isInvalid={!!errors.size}
                    placeholder="VD: 60 x 55 x 85"
                  />
                  <Form.Control.Feedback type="invalid">{errors.size}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Trọng lượng (kg)</Form.Label>
                  <Form.Control
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    isInvalid={!!errors.weight}
                    placeholder="VD: 65"
                  />
                  <Form.Control.Feedback type="invalid">{errors.weight}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Điện áp (V)</Form.Label>
                  <Form.Control
                    type="text"
                    name="voltage"
                    value={formData.voltage}
                    onChange={handleInputChange}
                    isInvalid={!!errors.voltage}
                    placeholder="VD: 220V"
                  />
                  <Form.Control.Feedback type="invalid">{errors.voltage}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Thời gian bảo hành (tháng)</Form.Label>
                  <Form.Control
                    type="number"
                    name="warranty_period"
                    value={formData.warranty_period}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="user-create-product-label">Kho hàng (Số lượng) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    isInvalid={!!errors.quantity}
                  />
                  <Form.Control.Feedback type="invalid">{errors.quantity}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Section 3: Tính năng nổi bật */}
          <div className="user-create-product-section">
            <div className="section-title">
              <span style={{ background: "#fef3c7", padding: "8px", borderRadius: "8px", color: "#d97706", display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </span>
              Tính năng nổi bật
            </div>
            
            {formData.features.map((feature, index) => (
              <Row key={index} className="mb-3 align-items-start">
                <Col md={4}>
                  <Form.Control
                    type="text"
                    value={feature.title}
                    onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
                    placeholder={\`Tiêu đề (VD: Công nghệ)\`}
                    isInvalid={!!errors.features}
                  />
                </Col>
                <Col md={7}>
                  <Form.Control
                    type="text"
                    value={feature.description}
                    onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
                    placeholder={\`Mô tả tính năng\`}
                    isInvalid={!!errors.features}
                  />
                </Col>
                <Col md={1} className="text-end">
                  {formData.features.length > 1 && (
                    <Button variant="outline-danger" className="border-0 bg-light" onClick={() => removeFeature(index)}>
                      <X size={18} className="text-danger" />
                    </Button>
                  )}
                </Col>
              </Row>
            ))}
            <Button variant="outline-primary" onClick={addFeature} className="mt-2" style={{ borderRadius: "8px", fontWeight: "600" }}>
              <Plus size={18} className="me-1" /> Thêm tính năng
            </Button>
            {errors.features && <Form.Text className="text-danger d-block mt-2">{errors.features}</Form.Text>}
          </div>

          {/* Section 4: Hình ảnh và Video */}
          <div className="user-create-product-section">
            <div className="section-title">
              <span style={{ background: "#f3e8ff", padding: "8px", borderRadius: "8px", color: "#9333ea", display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </span>
              Hình ảnh & Video
            </div>
            
            <Form.Group className="mb-4">
              <Form.Label className="user-create-product-label">Hình ảnh sản phẩm (Tối đa 5 ảnh) *</Form.Label>
              
              <div className="image-upload-container" onClick={() => document.getElementById('file-upload').click()}>
                <div style={{ background: "white", width: "64px", height: "64px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", marginBottom: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <h6 style={{ color: "#1e293b", fontWeight: 700, fontSize: "1.1rem" }}>Click để tải ảnh lên</h6>
                <p className="text-muted small mb-0 mt-2">Hỗ trợ JPG, PNG, GIF, WebP (Tối đa 5MB)</p>
                <Form.Control
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImageFile}
                  disabled={imageUrls.filter(u => u.trim() !== "").length >= 5}
                  style={{ display: "none" }}
                />
              </div>

              {/* Lưới hiển thị ảnh đã upload */}
              {imageUrls.filter(url => url.trim() !== "").length > 0 && (
                <div className="row g-3 mt-4">
                  <div className="col-12 mb-2"><span className="fw-semibold" style={{color: "#64748b"}}>Ảnh đã chọn:</span></div>
                  {imageUrls.map((url, index) => {
                    if (url.trim() === "") return null;
                    return (
                      <div key={index} className="col-sm-4 col-md-3">
                        <div className="image-preview-card">
                          <button 
                            type="button" 
                            className="image-remove-btn"
                            onClick={(e) => { e.stopPropagation(); removeImageUrl(index); }}
                          >
                            <X size={14} strokeWidth={3} />
                          </button>
                          <img 
                            src={url} 
                            alt={\`Preview \${index + 1}\`} 
                            onError={(e) => { e.target.style.display = "none"; }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                  {imageUrls.filter(u => u.trim() !== "").length < 5 && (
                     <div className="col-sm-4 col-md-3">
                        <div 
                          className="image-preview-card d-flex flex-column align-items-center justify-content-center"
                          style={{ border: "2px dashed #cbd5e1", background: "#f8fafc", cursor: "pointer", transition: "all 0.2s" }}
                          onClick={() => {
                            const lastBlank = imageUrls.findIndex(u => u.trim() === "");
                            if (lastBlank === -1) {
                                addImageUrl();
                            }
                          }}
                          onMouseOver={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                          onMouseOut={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
                        >
                          <Plus size={32} color="#94a3b8" />
                          <div className="fw-semibold mt-2" style={{color: "#94a3b8", fontSize: "0.9rem"}}>Thêm URL</div>
                        </div>
                     </div>
                  )}
                </div>
              )}

              {/* URL Inputs fallback for direct links */}
              <div className="mt-4 pt-4 border-top">
                 <p className="text-muted mb-3 small fw-semibold">Hoặc dán link hình ảnh trực tiếp:</p>
                 {imageUrls.map((url, index) => (
                    <div key={index} className="mb-2 d-flex align-items-center">
                      <Form.Control
                        type="url"
                        value={url}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                        placeholder="https://..."
                        style={{ fontSize: "0.9rem" }}
                        isInvalid={!!errors.images && url.trim() !== "" && !isImageUrl(url)}
                      />
                      {imageUrls.length > 1 && (
                         <Button variant="light" className="ms-2 text-danger border-0 d-flex align-items-center justify-content-center" style={{width: '44px', height: '44px', borderRadius: '10px'}} onClick={() => removeImageUrl(index)}><X size={20}/></Button>
                      )}
                    </div>
                 ))}
                 {errors.images && <Form.Text className="text-danger fw-semibold">{errors.images}</Form.Text>}
              </div>
            </Form.Group>

            <Form.Group className="mb-0 mt-4 pt-4 border-top">
              <Form.Label className="user-create-product-label">URL Video sản phẩm (Tùy chọn)</Form.Label>
              <Form.Control
                type="url"
                value={videoUrl}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                placeholder="https://youtube.com/..."
                isInvalid={!!errors.video}
              />
              <Form.Control.Feedback type="invalid">{errors.video}</Form.Control.Feedback>
              
              {videoUrl.trim() !== "" && isVideoUrl(videoUrl) && (
                <div className="mt-3">
                  <video
                    src={videoUrl}
                    controls
                    style={{ height: "200px", borderRadius: "12px", background: "#000", width: "100%", objectFit: "contain" }}
                  />
                </div>
              )}
            </Form.Group>
          </div>

          {/* Section 5: Mô tả chi tiết */}
          <div className="user-create-product-section">
            <div className="section-title">
              <span style={{ background: "#ffe4e6", padding: "8px", borderRadius: "8px", color: "#e11d48", display: "flex" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </span>
              Mô tả chi tiết
            </div>
            <Form.Group>
              <div
                ref={descriptionDivRef}
                contentEditable
                suppressContentEditableWarning
                className="description-editable"
                placeholder="Nhập mô tả chi tiết sản phẩm..."
                onPaste={handleDescriptionPaste}
                onInput={handleDescriptionInput}
                spellCheck={true}
              />
              <div className="d-flex justify-content-between mt-3 align-items-center">
                 <Form.Text className="text-muted m-0">Bạn có thể dán ảnh trực tiếp vào khung soạn thảo này.</Form.Text>
                 <span className="badge rounded-pill" style={{ background: formData.description.length > 2000 ? "#fee2e2" : "#f1f5f9", color: formData.description.length > 2000 ? "#ef4444" : "#64748b", fontWeight: 600 }}>
                   {formData.description.length}/2000
                 </span>
              </div>
              {errors.description && <div className="text-danger small mt-2 fw-semibold">{errors.description}</div>}
            </Form.Group>
          </div>

          {/* Sticky Save Action Bar */}
          <div className="sticky-action-bar">
            <Button variant="light" onClick={() => navigate(-1)} style={{ fontWeight: 600, color: "#475569", padding: "12px 28px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="btn-save-sticky">
              {loading ? (
                <><Spinner size="sm" /> Đang xử lý...</>
              ) : (
                <><Save size={20} /> Tạo sản phẩm</>
              )}
            </Button>
          </div>

        </Form>
      </Container>
      <Footer />

      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={2000}
        autohide
        style={{
          position: "fixed",
          top: 80,
          right: 20,
          minWidth: 320,
          zIndex: 10000,
          background: "#16a34a",
          color: "#fff",
          fontWeight: 600,
          boxShadow: "0 10px 25px -5px rgba(22,163,74,0.4)",
          borderRadius: "14px",
          border: "none",
        }}
      >
        <Toast.Body className="d-flex align-items-center p-3 fs-6">
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "12px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          Tạo sản phẩm thành công!
        </Toast.Body>
      </Toast>
    </div>
  );
};

export default UserCreateProduct;
`;

const updatedCode = code.replace(returnRegex, newReturn);
fs.writeFileSync(filePath, updatedCode, 'utf8');
console.log('Successfully updated UserCreateProduct.js');
