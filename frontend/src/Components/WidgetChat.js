import { useState, useEffect, useRef } from "react";
import { getCurrentUser } from "../Services/auth.service";

import { Send, User, Bot, MessageCircle, X, LogIn, Search, BarChart3, Package, FileText, Sparkles, Scale } from "lucide-react";
import { authApiClient } from "../Services/auth.service";
import "./WidgetChat.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const token = localStorage.getItem("token");
const currentUser = getCurrentUser();
const displayName = currentUser ? (currentUser.fullName || currentUser.name || currentUser.username || 'bạn') : 'bạn';
const isLoggedIn = !!token;

const styles = {
  container: {
    position: "fixed",
    bottom: "80px",
    right: "24px",
    zIndex: 99999,
  },
  iconButton: {
    backgroundColor: "#2563eb",
    color: "white",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "none",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    outline: "none",
    transition: "all 0.3s ease",
  },
  chatContainer: {
    position: "absolute",
    bottom: "60px",
    right: "0",
    width: "min(420px, calc(100vw - 48px))",
    height: "min(500px, calc(100vh - 120px))",
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
    border: "1px solid #e5e7eb",
    zIndex: 999999,
    // Mobile full screen
    "@media (max-width: 768px)": {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      width: "100vw",
      height: "100vh",
      borderRadius: "0",
      zIndex: 999999,
    },
  },
  header: {
    backgroundColor: "#2563eb",
    color: "white",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    margin: 0,
    fontWeight: 600,
    fontSize: "16px",
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease",
  },
  messagesContainer: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    backgroundColor: "#f9fafb",
    scrollBehavior: "smooth",
  },
  messageRow: {
    display: "flex",
    marginBottom: "16px",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botRow: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    display: "flex",
    alignItems: "flex-start",
    padding: "12px 16px",
    maxWidth: "85%",
    borderRadius: "16px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    fontSize: "14px",
    lineHeight: "1.5",
    wordWrap: "break-word",
  },
  userBubble: {
    backgroundColor: "#2563eb",
    color: "white",
    borderTopRightRadius: "4px",
  },
  botBubble: {
    backgroundColor: "#ffffff",
    color: "#1f2937",
    borderTopLeftRadius: "4px",
    border: "1px solid #e5e7eb",
  },
  iconContainer: {
    marginRight: "8px",
    marginTop: "2px",
    flexShrink: 0,
  },
  inputArea: {
    borderTop: "1px solid #e5e7eb",
    padding: "16px",
    backgroundColor: "white",
  },
  inputContainer: {
    display: "flex",
    border: "1px solid #d1d5db",
    borderRadius: "24px",
    overflow: "hidden",
    backgroundColor: "#f9fafb",
    transition: "border-color 0.2s ease",
  },
  input: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "transparent",
  },
  sendButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "12px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease",
  },
  loginMessage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "#f9fafb",
  },
  loginButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    marginTop: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  },
  clearButton: {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "12px",
    cursor: "pointer",
    marginLeft: "8px",
    transition: "background-color 0.2s ease",
  },
  quickActions: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  quickActionButton: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "16px",
    padding: "6px 12px",
    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "all 0.2s ease",
  },
  productCard: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "12px",
    marginTop: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  postCard: {
    backgroundColor: "#fef7ff",
    border: "1px solid #f3e8ff",
    borderRadius: "8px",
    padding: "12px",
    marginTop: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  typingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#6b7280",
    fontSize: "14px",
    fontStyle: "italic",
  },
};

// Quick actions mới linh hoạt hơn
const quickActions = [
  { text: "Sản phẩm mới", icon: Package, action: "Sản phẩm mới nhất" },
  { text: "Đã qua sử dụng", icon: Package, action: "Sản phẩm đã qua sử dụng" },
  { text: "So sánh sản phẩm", icon: Scale, action: "Hướng dẫn so sánh sản phẩm" },
  { text: "Bài viết", icon: FileText, action: "Bài viết mới nhất" },
  { text: "Thống kê", icon: BarChart3, action: "Thống kê shop" },
  { text: "Tìm kiếm", icon: Search, action: "Tìm kiếm sản phẩm" },
  { text: "AI hỗ trợ", icon: Sparkles, action: "Bạn có thể hỏi tôi bất cứ điều gì về sản phẩm, bài viết, hoặc thông tin shop" },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveMessagesToStorage = (messages) => {
    try {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    } catch (error) {
      // Error handling without console logging
    }
  };

  const loadMessagesFromStorage = () => {
    try {
      const saved = localStorage.getItem("chatMessages");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  };

  const clearSavedMessages = () => {
    try {
      localStorage.removeItem("chatMessages");
      setMessages([]);
      setShowQuickActions(true);
    } catch (error) {
      // Error handling without console logging
    }
  };

  const handleQuickAction = (action) => {
    setInputValue(action);
    setShowQuickActions(false);
  };

  const handleProductClick = (product) => {
    // Chuyển đến trang chi tiết sản phẩm (productView cho user, không dùng /product admin)
    const id = product._id || product.id;
    window.open(`/productView/${id}`, '_blank');
  };

  const handlePostClick = (post) => {
    // Chuyển đến trang chi tiết bài viết
    window.open(`/post/${post.id}`, '_blank');
  };

  // Xử lý khi mở chat
  useEffect(() => {
    if (isOpen) {
      // Kiểm tra cả token và user data
      const savedToken = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (savedToken && userData) {
        try {
          const user = JSON.parse(userData);
          const name = user.fullname || user.username || user.email || null;

          if (name) {
            setToken(savedToken);
            setIsLoggedIn(true);
            setUsername(name);

            // Tải tin nhắn đã lưu từ localStorage
            const savedMessages = loadMessagesFromStorage();

            if (savedMessages.length > 0) {
              setMessages(savedMessages);
            } else {
              // Nếu không có tin nhắn đã lưu, tạo tin nhắn chào mừng
              const welcomeMessage = [
                {
                  id: 1,
                  text: `Chào ${name}! Tôi là trợ lý AI của Vinsaky Shop. Tôi có thể giúp bạn tìm kiếm sản phẩm, đọc bài viết, hoặc trả lời các câu hỏi khác. Bạn cần gì?`,
                  sender: "bot",
                },
              ];
              setMessages(welcomeMessage);
              saveMessagesToStorage(welcomeMessage);
            }
          } else {
            throw new Error("Không tìm thấy tên người dùng hợp lệ");
          }
        } catch (error) {
          handleAuthError();
        }
      } else {
        handleAuthError();
      }
    }
  }, [isOpen]);

  // Lưu tin nhắn mỗi khi messages thay đổi
  useEffect(() => {
    if (messages.length > 0 && isLoggedIn) {
      saveMessagesToStorage(messages);
    }
  }, [messages, isLoggedIn]);

  const handleAuthError = () => {
    setIsLoggedIn(false);
    setToken(null);
    setUsername("");
    setMessages([]);
    setShowQuickActions(true);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isBotTyping) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: "user",
    };

    // Nếu lần đầu gửi tin và chưa có greeting thì thêm greeting
    let msgs = messages;
    if (!messages.length && currentUser) {
      msgs = [{ id: 'intro', sender: 'bot', text: `Xin chào ${displayName}! Mình là trợ lý AI của Vinsaky, sẵn sàng hỗ trợ bạn 24/7.` }];
    }
    const updatedMessages = [...msgs, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsBotTyping(true);
    setShowQuickActions(false);

    try {
      const response = await authApiClient.post("/chat/ask/", {
        prompt: userMessage.text,
          userId: currentUser ? currentUser._id || currentUser.id : undefined,
      });

      const { data } = response;

      if (data && (data.answer || (data.data && data.data.response))) {
        const text = data.answer || (data.data && data.data.response);
        const botResponse = {
          id: Date.now() + 1,
          text,
          sender: "bot",
        };
        // Nếu backend kèm sản phẩm, gắn vào botResponse để hiển thị chung 1 bubble
        if (data.products && Array.isArray(data.products) && data.products.length) {
          botResponse.products = data.products;
        }
        setMessages((prev) => [...prev, botResponse]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Nếu sau khi interceptor refresh mà vẫn 401 => token không hợp lệ, logout
        if (error.config && error.config._retry) {
          handleTokenExpired();
        }
        return;
      }

      const errorMessage = {
        id: Date.now() + 1,
        text: "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại sau.",
        sender: "bot",
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleTokenExpired = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    handleAuthError();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Focus vào input khi mở chat
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const renderMessage = (message) => {
    // User message
    if (message.sender === "user") {
      const Icon = User;
      return (
        <div key={message.id} style={{ ...styles.messageRow, ...styles.userRow }}>
          <div style={{ ...styles.messageBubble, ...styles.userBubble }}>
            <div style={styles.iconContainer}>
              <Icon size={16} />
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{message.text}</div>
          </div>
        </div>
      );
    }

    // Bot text message (markdown)
    if (message.sender === "bot") {
      return (
        <div key={message.id} style={{ ...styles.messageRow, ...styles.botRow }}>
          <div style={{ ...styles.messageBubble, ...styles.botBubble }}>
            <div style={styles.iconContainer}>
              <Bot size={16} />
            </div>
            <div style={{ flex: 1, whiteSpace: "pre-line", wordBreak: "break-word" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              strong: ({node, ...props}) => <strong style={{ color: "#2563eb" }} {...props} />,
            }}>
              {message.text}
            </ReactMarkdown>
            {Array.isArray(message.products) && message.products.length > 0 && (
              <div style={{ marginTop: "8px", width:"100%" }}>
                {message.products.map((p) => (
                  <div key={p.id} style={styles.productCard} onClick={() => handleProductClick(p)}>
                    <strong>{p.name}</strong>
                    <div>💰 {p.price ? Number(p.price).toLocaleString("vi-VN") + " VND" : "Chưa có giá"}</div>
                    <div>🏷️ {p.brand}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      );
    }

    return null;
  };


  // Khi mở chat, hiển thị greeting nếu có user
  useEffect(() => {
    if (isOpen && currentUser && messages.length === 0) {
      setMessages([{ id: 'intro', sender: 'bot', text: `Xin chào ${displayName}! Mình là trợ lý AI của Vinsaky, sẵn sàng hỗ trợ bạn 24/7.` }]);
    }
  }, [isOpen]);

  const renderQuickActions = () => {
    if (!showQuickActions) return null;

    return (
      <div style={styles.quickActions}>
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              style={styles.quickActionButton}
              onClick={() => handleQuickAction(action.action)}
              className="quick-action-button"
            >
              <Icon size={14} />
              {action.text}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div style={styles.container} className="chat-widget-container">
      {/* Chat Icon */}
      <button
        style={styles.iconButton}
        onClick={toggleChat}
        className="chat-widget-icon"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Container */}
      {isOpen && (
        <div style={styles.chatContainer} className="chat-container">
          {/* Header */}
          <div style={styles.header} className="chat-header">
            <h3 style={styles.headerTitle} className="chat-header-title">
              {`Vinsaky Shop AI`}
            </h3>
            <div style={{ display: "flex", alignItems: "center" }}>
              {isLoggedIn && (
                <button
                  style={styles.clearButton}
                  onClick={clearSavedMessages}
                  title="Xóa lịch sử chat"
                >
                  Xóa
                </button>
              )}
              <button
                style={styles.closeButton}
                onClick={toggleChat}
                className="chat-close-button"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div style={styles.messagesContainer} className="chat-messages-container">
            <>
                {messages.map(renderMessage)}
                {isBotTyping && (
                  <div style={styles.messageRow}>
                    <div style={styles.botBubble}>
                      <div style={styles.iconContainer}>
                        <Bot size={16} />
                      </div>
                      <div style={styles.typingIndicator} className="chat-typing-text">
                        AI đang trả lời...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
          </div>

          {/* Input Area */}
          <div style={styles.inputArea} className="chat-input-area">
              {renderQuickActions()}
              <div style={styles.inputContainer} className="chat-input-container">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  style={styles.input}
                  className="chat-input"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isBotTyping}
                  style={{
                    ...styles.sendButton,
                    opacity: !inputValue.trim() || isBotTyping ? 0.5 : 1,
                  }}
                  className="chat-send-button"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}

