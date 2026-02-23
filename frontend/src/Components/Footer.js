import React, { useState } from 'react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Đăng ký nhận bản tin:', email);
    setEmail('');
  };

  return (
    <footer className="footer-elegant">
      <style>{`
        .footer-elegant {
          background-color: #ffffff;
          padding: 80px 0 40px;
          border-top: 1px solid rgba(226, 232, 240, 0.8);
          font-family: inherit;
        }

        .footer-logo {
          max-width: 160px;
          height: auto;
          margin-bottom: 24px;
          transition: transform 0.3s ease;
        }
        
        .footer-logo:hover {
          transform: scale(1.02);
        }

        .footer-text {
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.8;
          margin-bottom: 32px;
        }

        .footer-title {
          color: #0f172a;
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 24px;
          position: relative;
          padding-bottom: 12px;
        }

        .footer-title::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 40px;
          height: 3px;
          background: #3b82f6;
          border-radius: 2px;
        }

        .footer-link-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-link-item {
          margin-bottom: 14px;
        }

        .footer-link {
          color: #475569;
          text-decoration: none;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          display: inline-block;
          font-weight: 500;
        }

        .footer-link:hover {
          color: #3b82f6;
          transform: translateX(4px);
        }

        .social-icons-wrapper {
          display: flex;
          gap: 12px;
        }

        .social-icon-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .social-icon-btn:hover {
          background: #ffffff;
          color: #3b82f6;
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
          transform: translateY(-3px);
        }

        .newsletter-form {
          position: relative;
          display: flex;
          width: 100%;
          margin-top: 16px;
        }

        .newsletter-input {
          width: 100%;
          padding: 14px 20px;
          padding-right: 120px;
          border: 1px solid #cbd5e1;
          border-radius: 30px;
          background: #f8fafc;
          color: #334155;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .newsletter-input:focus {
          background: #ffffff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .newsletter-btn {
          position: absolute;
          right: 4px;
          top: 4px;
          bottom: 4px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 26px;
          padding: 0 24px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
        }

        .newsletter-btn:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .footer-bottom {
          margin-top: 60px;
          padding-top: 24px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-copyright {
          color: #94a3b8;
          font-size: 0.9rem;
          margin: 0;
        }

        .footer-hotline {
          background: #eff6ff;
          color: #2563eb;
          padding: 10px 24px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.05);
        }

        @media (max-width: 991px) {
          .footer-padding {
            padding-bottom: 40px;
          }
        }
      `}</style>
      
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-6 mb-5 footer-padding">
            <img src="/images/Logo.png" alt="Vinsaky Logo" className="footer-logo" />
            <p className="footer-text">
              Chúng tôi cung cấp các sản phẩm chất lượng cao với dịch vụ khách hàng tốt nhất. Sự hài lòng của bạn là mục tiêu của chúng tôi.
            </p>
            <h6 className="mb-3" style={{ color: '#0f172a', fontWeight: '700' }}>Theo dõi chúng tôi</h6>
            <div className="social-icons-wrapper">
              <a href="#" className="social-icon-btn" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="social-icon-btn" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="social-icon-btn" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="social-icon-btn" aria-label="Amazon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.36 17.3c-.64.53-2.14 1.7-4.8 2.3-2.66.6-4.68.6-6.19.4-1.5-.2-2.58-.65-3.08-.85-.5-.2-.72-.37-.8-.49-.08-.12-.04-.26.09-.32.13-.06.4-.04.6.01.2.05.57.17 1.48.42 1.35.37 2.76.5 4.14.37 1.38-.13 3.12-.49 4.88-1.28 1.76-.79 3.03-1.6 3.43-1.85.4-.25.56-.25.66-.18.1.07.13.25-.01.68z"/><path d="M21.36 16.5c.08-.13.2-.23.36-.28.16-.05.34-.04.5.03.1.04.16.1.19.16.03.06.03.14-.01.24-.04.1-.12.23-.23.37-.15.2-.42.48-.75.76-.33.28-.73.55-1.13.78v-1.17c.23-.22.61-.53 1.07-.89z"/></svg>
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 mb-5 footer-padding">
            <h5 className="footer-title">Về Chúng Tôi</h5>
            <ul className="footer-link-list">
              <li className="footer-link-item"><a href="#" className="footer-link">Giới thiệu</a></li>
              <li className="footer-link-item"><a href="#" className="footer-link">Điều khoản</a></li>
              <li className="footer-link-item"><a href="#" className="footer-link">Tạp chí nội bộ</a></li>
              <li className="footer-link-item"><a href="#" className="footer-link">Cơ hội nghề</a></li>
              <li className="footer-link-item"><a href="#" className="footer-link">Báo chí Vinsaky</a></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-4 mb-5 footer-padding">
            <h5 className="footer-title">Khách Hàng</h5>
            <ul className="footer-link-list">
              <li className="footer-link-item"><a href="#" className="footer-link">Câu hỏi & FAQ</a></li>
              <li className="footer-link-item"><a href="#" className="footer-link">Bảo mật</a></li>
              <li className="footer-link-item"><a href="#" className="footer-link">Đổi trả & hoàn tiền</a></li>
              <li className="footer-link-item"><a href="#" className="footer-link">Hướng dẫn mua</a></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-4 mb-5 footer-padding">
            <h5 className="footer-title">Liên Kết Nhanh</h5>
            <ul className="footer-link-list">
              <li className="footer-link-item"><a href="#" className="footer-link">Tài khoản của tôi</a></li>
              <li className="footer-link-item"><a href="#" className="footer-link">Theo dõi đơn hàng</a></li>
              <li className="footer-link-item"><a href="#" className="footer-link">Thanh toán</a></li>
              <li className="footer-link-item"><a href="#" className="footer-link">Tìm cửa hàng</a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6 mb-5 footer-padding">
            <h5 className="footer-title">Nhận Ưu Đãi</h5>
            <p className="footer-text" style={{ marginBottom: '16px' }}>
              Đăng ký email để nhận thông báo về sản phẩm mới và khuyến mãi.
            </p>
            <form className="newsletter-form" onSubmit={handleSubmit}>
              <input
                type="email"
                className="newsletter-input"
                placeholder="Nhập email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="newsletter-btn">
                Gửi
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Vinsaky. All rights reserved. Designed with precision.
          </p>
          <div className="footer-hotline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Hotline Hỗ Trợ: 0903 242 748
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;