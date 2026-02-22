import React, { useState } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import ChatWidget from "../Components/WidgetChat";
import "../Pages/styles/Guide.css";

const guideTopics = [
  {
    id: 1,
    title: "Giới thiệu Vinsaky",
    icon: "fas fa-building",
    color: "#60a5fa",
    sections: [
      {
        heading: "Thông tin tổng quan",
        content:
          "VINSAKY là nền tảng thương mại điện tử hàng đầu Việt Nam chuyên cung cấp thiết bị điện lạnh cho ngành Food & Beverage (F&B). Với sứ mệnh trở thành đối tác tin cậy của các doanh nghiệp trong lĩnh vực ẩm thực và đồ uống.",
      },
      {
        heading: "Lĩnh vực hoạt động",
        items: [
          "🛒 Thương mại điện tử — Nền tảng trực tuyến chuyên biệt",
          "❄️ Thiết bị điện lạnh F&B — Chuyên sâu về thiết bị cho ngành ẩm thực",
          "💡 Tư vấn giải pháp — Hỗ trợ khách hàng lựa chọn thiết bị phù hợp",
          "🔧 Dịch vụ hậu mãi — Bảo hành và bảo trì chuyên nghiệp",
        ],
      },
      {
        heading: "Đối tượng khách hàng",
        items: [
          "🍽️ Nhà hàng cao cấp và bình dân",
          "☕ Chuỗi quán cà phê và trà sữa",
          "🏨 Khách sạn và resort",
          "🏫 Căng tin công ty và trường học",
          "🏪 Cửa hàng thực phẩm và siêu thị",
          "🏭 Các cơ sở sản xuất thực phẩm",
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Đăng ký tài khoản",
    icon: "fas fa-user-plus",
    color: "#10b981",
    sections: [
      {
        heading: "Các bước đăng ký",
        steps: [
          {
            step: 1,
            title: "Truy cập trang chủ",
            desc: 'Vào trang chủ Vinsaky, bấm vào biểu tượng 👤 ở góc phải trên cùng, chọn "Đăng ký".',
          },
          {
            step: 2,
            title: "Điền thông tin cá nhân",
            desc: "Nhập đầy đủ: họ tên, email, số điện thoại, giới tính, địa chỉ.",
          },
          {
            step: 3,
            title: "Tạo mật khẩu",
            desc: "Nhập mật khẩu và xác nhận lại. Mật khẩu nên có ít nhất 6 ký tự.",
          },
          {
            step: 4,
            title: "Đồng ý điều khoản",
            desc: 'Tích chọn ô đồng ý điều khoản sử dụng, sau đó bấm "Tạo tài khoản".',
          },
        ],
      },
      {
        heading: "Lưu ý",
        items: [
          "📧 Email phải chưa được sử dụng trên hệ thống",
          "📱 Số điện thoại hợp lệ để nhận thông báo",
          "🔐 Mật khẩu nên bao gồm chữ hoa, chữ thường và số",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Đăng nhập",
    icon: "fas fa-sign-in-alt",
    color: "#6366f1",
    sections: [
      {
        heading: "Cách đăng nhập",
        steps: [
          {
            step: 1,
            title: "Nhập email",
            desc: "Nhập email mà bạn đã dùng khi đăng ký.",
          },
          {
            step: 2,
            title: "Nhập mật khẩu",
            desc: "Nhập mật khẩu tài khoản của bạn.",
          },
          {
            step: 3,
            title: 'Bấm "Đăng nhập"',
            desc: "Hệ thống sẽ xác thực và đưa bạn vào trang chủ.",
          },
        ],
      },
      {
        heading: "Mẹo hữu ích",
        items: [
          "💡 Nếu quên mật khẩu, liên hệ admin để được hỗ trợ",
          "🔒 Không chia sẻ mật khẩu cho người khác",
          "🌐 Đăng nhập sẽ được ghi nhận vào lịch sử hoạt động",
        ],
      },
    ],
  },
  {
    id: 4,
    title: "Tìm kiếm sản phẩm",
    icon: "fas fa-search",
    color: "#f59e0b",
    sections: [
      {
        heading: "Các cách tìm kiếm",
        steps: [
          {
            step: 1,
            title: "Thanh tìm kiếm",
            desc: "Nhập từ khoá sản phẩm vào thanh search ở đầu trang và nhấn Enter.",
          },
          {
            step: 2,
            title: "Danh mục sản phẩm",
            desc: 'Hover vào mục "Danh Mục" trên menu để xem các danh mục có sẵn.',
          },
          {
            step: 3,
            title: "Trang tất cả sản phẩm",
            desc: 'Bấm vào "Tất cả sản phẩm" để duyệt toàn bộ sản phẩm với các bộ lọc.',
          },
          {
            step: 4,
            title: "Tìm kiếm qua AI",
            desc: "Bấm vào biểu tượng chat ở góc dưới phải, hỏi AI về sản phẩm bạn cần.",
          },
        ],
      },
      {
        heading: "Bộ lọc nâng cao",
        items: [
          "🏷️ Lọc theo thương hiệu (brand)",
          "💰 Lọc theo khoảng giá",
          "📦 Lọc theo tình trạng (mới, đã qua sử dụng)",
          "⭐ Sắp xếp theo giá hoặc mức độ phổ biến",
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Quản lý sản phẩm",
    icon: "fas fa-boxes",
    color: "#ec4899",
    sections: [
      {
        heading: "Cách quản lý sản phẩm của bạn",
        steps: [
          {
            step: 1,
            title: "Truy cập quản lý",
            desc: 'Bấm vào biểu tượng 👤 ở góc phải, chọn "Quản lý sản phẩm".',
          },
          {
            step: 2,
            title: "Thêm sản phẩm mới",
            desc: 'Bấm nút "Thêm sản phẩm", điền đầy đủ thông tin: tên, giá, mô tả, ảnh, video.',
          },
          {
            step: 3,
            title: "Chỉnh sửa sản phẩm",
            desc: "Bấm vào biểu tượng ✏️ trên sản phẩm cần sửa để cập nhật thông tin.",
          },
          {
            step: 4,
            title: "Xóa sản phẩm",
            desc: "Bấm vào biểu tượng 🗑️ để xóa sản phẩm đã ngừng kinh doanh.",
          },
        ],
      },
    ],
  },
  {
    id: 6,
    title: "Trợ lý AI (Chatbot)",
    icon: "fas fa-robot",
    color: "#8b5cf6",
    sections: [
      {
        heading: "Cách sử dụng trợ lý AI",
        steps: [
          {
            step: 1,
            title: "Mở chatbot",
            desc: "Bấm vào biểu tượng chat 💬 ở góc dưới bên phải màn hình.",
          },
          {
            step: 2,
            title: "Đặt câu hỏi",
            desc: "Gõ nội dung bất kỳ rồi nhấn Enter — AI sẽ phản hồi ngay lập tức.",
          },
          {
            step: 3,
            title: "Dùng gợi ý nhanh",
            desc: "Bấm các nút gợi ý: Sản phẩm mới, So sánh, Bài viết, Thống kê...",
          },
        ],
      },
      {
        heading: "Ví dụ sử dụng",
        items: [
          '🔍 "Xem chi tiết sản phẩm tủ đông Alaska 500L"',
          '⚖️ "So sánh tủ đông Alaska và Sanaky"',
          '📰 "Bài viết mới nhất về bảo quản thực phẩm"',
          '📊 "Thống kê sản phẩm bán chạy"',
          '☕ "Tìm kiếm sản phẩm phù hợp cho quán cà phê"',
          '🛡️ "Shop có dịch vụ bảo hành không?"',
        ],
      },
      {
        heading: "Lưu ý",
        items: [
          "🔑 Cần đăng nhập để sử dụng AI",
          "💾 Lịch sử chat được lưu cho lần truy cập tiếp theo",
          "🗑️ Bấm nút Xóa để xóa lịch sử trò chuyện",
        ],
      },
    ],
  },
  {
    id: 7,
    title: "Video hướng dẫn",
    icon: "fas fa-play-circle",
    color: "#ef4444",
    isVideo: true,
    videoUrl: "https://www.youtube.com/embed/oApFAwtMCuk?start=1",
    sections: [
      {
        heading: "Nội dung video",
        items: [
          "📝 Cách đăng ký và đăng nhập tài khoản",
          "🔍 Hướng dẫn tìm kiếm và lọc sản phẩm",
          "👤 Cách quản lý tài khoản và sản phẩm",
          "🤖 Sử dụng trợ lý AI để được hỗ trợ",
          "⚡ Các tính năng nâng cao khác",
        ],
      },
      {
        heading: "Mẹo khi xem",
        items: [
          "⏸️ Video có thể tạm dừng và tua lại",
          "🖥️ Xem chế độ toàn màn hình để dễ theo dõi",
          "🤖 Nếu có thắc mắc, hãy hỏi trợ lý AI",
        ],
      },
    ],
  },
];

function Guide() {
  const [selectedTopic, setSelectedTopic] = useState(guideTopics[0]);

  return (
    <>
      <Header />
      <div className="content-wrapper">
        <div className="gd-page">
          {/* Hero */}
          <div className="gd-hero">
            <div className="gd-hero-content">
              <h1>
                <i className="fas fa-book-open"></i>
                Hướng dẫn sử dụng
              </h1>
              <p>
                Tìm hiểu cách sử dụng Vinsaky một cách hiệu quả nhất
              </p>
            </div>
          </div>

          <div className="gd-container">
            {/* Sidebar */}
            <div className="gd-sidebar">
              <div className="gd-sidebar-card">
                <div className="gd-sidebar-header">📋 Mục lục</div>
                <nav>
                  <ul className="gd-sidebar-nav">
                    {guideTopics.map((topic) => (
                      <li key={topic.id}>
                        <button
                          type="button"
                          className={`gd-sidebar-btn ${
                            selectedTopic.id === topic.id ? "active" : ""
                          }`}
                          onClick={() => setSelectedTopic(topic)}
                        >
                          <i
                            className={topic.icon}
                            style={{ color: topic.color }}
                          ></i>
                          <span>{topic.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="gd-content">
              {/* Topic Header */}
              <div className="gd-topic-header">
                <div
                  className="gd-topic-icon"
                  style={{ background: selectedTopic.color }}
                >
                  <i className={selectedTopic.icon}></i>
                </div>
                <div>
                  <h2>{selectedTopic.title}</h2>
                  <p>
                    Bước {selectedTopic.id} / {guideTopics.length}
                  </p>
                </div>
              </div>

              {/* Video */}
              {selectedTopic.isVideo && selectedTopic.videoUrl && (
                <div className="gd-video-wrapper">
                  <iframe
                    src={selectedTopic.videoUrl}
                    title="Video hướng dẫn Vinsaky"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      border: "none",
                      width: "100%",
                      height: "100%",
                    }}
                  ></iframe>
                </div>
              )}

              {/* Sections */}
              {selectedTopic.sections.map((section, sIdx) => (
                <div key={sIdx} className="gd-section">
                  <h3 className="gd-section-title">
                    <span
                      className="gd-section-dot"
                      style={{ background: selectedTopic.color }}
                    />
                    {section.heading}
                  </h3>

                  {/* Text content */}
                  {section.content && (
                    <p className="gd-section-text">{section.content}</p>
                  )}

                  {/* Steps */}
                  {section.steps && (
                    <div className="gd-steps">
                      {section.steps.map((s) => (
                        <div key={s.step} className="gd-step">
                          <div
                            className="gd-step-number"
                            style={{ background: selectedTopic.color }}
                          >
                            {s.step}
                          </div>
                          <div className="gd-step-content">
                            <strong>{s.title}</strong>
                            <p>{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* List items */}
                  {section.items && (
                    <ul className="gd-items">
                      {section.items.map((item, i) => (
                        <li key={i} className="gd-item">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Navigation */}
              <div className="gd-nav-buttons">
                {selectedTopic.id > 1 && (
                  <button
                    type="button"
                    className="gd-nav-btn gd-nav-prev"
                    onClick={() =>
                      setSelectedTopic(
                        guideTopics.find(
                          (t) => t.id === selectedTopic.id - 1
                        )
                      )
                    }
                  >
                    <i className="fas fa-arrow-left"></i>
                    Trước
                  </button>
                )}
                {selectedTopic.id < guideTopics.length && (
                  <button
                    type="button"
                    className="gd-nav-btn gd-nav-next"
                    onClick={() =>
                      setSelectedTopic(
                        guideTopics.find(
                          (t) => t.id === selectedTopic.id + 1
                        )
                      )
                    }
                  >
                    Tiếp
                    <i className="fas fa-arrow-right"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChatWidget />
      <Footer />
    </>
  );
}

export default Guide;
