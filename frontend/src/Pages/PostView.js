import React, { useState, useEffect } from 'react';
import { Heart, Phone, User, Calendar, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import apiClient from '../Services/api.service';
import ChatWidget from '../Components/WidgetChat';
const PostView = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get(`/post/${postId}`);
        setPost(res.data.data);
      } catch (err) {
        setError("Không thể tải bài viết.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const styles = {
    container: {
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    wrapper: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '0 20px'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#2c3e50',
      marginBottom: '40px',
      lineHeight: '1.2'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding: '24px',
      marginBottom: '24px'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    avatar: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '4px solid #3498db'
    },
    avatarPlaceholder: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3498db, #9b59b6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    },
    userDetails: {
      flex: 1
    },
    userName: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '1.2rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '8px'
    },
    userPhone: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#7f8c8d'
    },
    userMeta: {
      textAlign: 'right'
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '4px',
      fontSize: '0.9rem',
      color: '#7f8c8d',
      marginBottom: '4px'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#2c3e50',
      marginBottom: '16px'
    },
    description: {
      color: '#34495e',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap',
      marginBottom: '24px'
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginTop: '24px'
    },
    detailItem: {
      padding: '16px',
      borderRadius: '8px',
      fontSize: '0.95rem'
    },
    categoryDetail: {
      background: 'rgba(52, 152, 219, 0.1)',
      color: '#2980b9'
    },
    conditionDetail: {
      background: 'rgba(46, 204, 113, 0.1)',
      color: '#27ae60'
    },
    imageSection: {
      display: 'flex',
      gap: '24px',
      alignItems: 'flex-start',
      marginBottom: '24px'
    },
    mainImageCol: {
      flex: '0 0 320px',
      maxWidth: '320px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    galleryCol: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '12px',
      alignItems: 'flex-start',
    },
    mainImage: {
      width: '100%',
      maxWidth: '320px',
      height: 'auto',
      borderRadius: '8px',
      objectFit: 'cover',
      marginBottom: '12px',
      cursor: 'pointer',
    },
    galleryImage: {
      width: '100%',
      height: '80px',
      objectFit: 'cover',
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      cursor: 'pointer',
    },
    galleryVideo: {
      width: '100%',
      height: '140px',
      borderRadius: '6px',
      objectFit: 'cover',
      background: '#eee',
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '16px'
    },
    imageItem: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease'
    },
    image: {
      width: '100%',
      height: 'auto',
      borderRadius: '8px',
      objectFit: 'cover',
      transition: 'transform 0.3s ease'
    },
    noImages: {
      textAlign: 'center',
      padding: '48px 0',
      color: '#7f8c8d'
    },
    noImagesIcon: {
      width: '96px',
      height: '96px',
      margin: '0 auto 16px',
      background: '#ecf0f1',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bdc3c7'
    },
    videoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '16px',
      marginTop: '24px'
    },
    video: {
      width: '100%',
      maxHeight: '300px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    loading: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    loadingContent: {
      textAlign: 'center'
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: '4px solid #ecf0f1',
      borderTop: '4px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px'
    },
    error: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    errorContent: {
      textAlign: 'center',
      padding: '32px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      color: '#e74c3c',
      fontSize: '1.1rem'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.7)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalContent: {
      position: 'relative',
      background: 'white',
      borderRadius: '6px',
      padding: '4px',
      maxWidth: '100vw',
      maxHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalImage: {
      maxWidth: '50vw',
      maxHeight: '50vh',
      borderRadius: '6px',
      objectFit: 'contain',
      margin: 0,
      transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)',
      cursor: 'zoom-in',
    },
    modalClose: {
      position: 'absolute',
      top: 8,
      right: 8,
      background: 'rgba(0,0,0,0.5)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: 32,
      height: 32,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: 24,
      zIndex: 2,
    },
    modalNavBtn: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(0,0,0,0.4)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: 24,
      zIndex: 2,
    },
  };

  if (loading) {
    return (
      <>
        <Header />
        <div style={styles.loading}>
          <div style={styles.loadingContent}>
            <div style={styles.spinner}></div>
            <p style={{color: '#7f8c8d'}}>Đang tải bài viết...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Header />
        <div style={styles.error}>
          <div style={styles.errorContent}>
            <p>{error || 'Không thể tải bài viết hoặc bài viết không tồn tại.'}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Hàm chuyển ảnh modal sang fullscreen
  const handleImageModalFullScreen = (e) => {
    const img = e.target;
    if (img.requestFullscreen) {
      img.requestFullscreen();
    } else if (img.webkitRequestFullscreen) {
      img.webkitRequestFullscreen();
    } else if (img.msRequestFullscreen) {
      img.msRequestFullscreen();
    }
  };

  // Hàm chuyển video sang fullscreen
  const handleVideoFullScreen = (e) => {
    const video = e.target;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
    }
  };

  // Hàm nhận biết YouTube URL
  const isYouTubeUrl = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));
  // Hàm lấy embed URL cho YouTube
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1];
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
      const ampersandPosition = videoId.indexOf('&');
      if (ampersandPosition !== -1) {
        videoId = videoId.substring(0, ampersandPosition);
      }
    } else if (url.includes('youtube.com/embed/')) {
      return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <>
      <Header />
      <div className="content-wrapper">
        <div style={styles.container}>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .image-item:hover {
                transform: scale(1.05);
              }
              .image-item:hover img {
                transform: scale(1.1);
              }
              .modal-image-zoom:hover {
                transform: scale(1.1);
              }
              @media (max-width: 768px) {
                .title {
                  font-size: 2rem !important;
                }
                .user-info {
                  flex-direction: column !important;
                  text-align: center !important;
                }
                .user-meta {
                  text-align: center !important;
                }
                .image-section {
                  flex-direction: column !important;
                  gap: 16px !important;
                }
                .image-grid {
                  grid-template-columns: 1fr !important;
                }
                .video-grid {
                  grid-template-columns: 1fr !important;
                }
              }
            `}
          </style>
          <div style={styles.wrapper}>
            {/* Title - Center aligned */}
            <h1 style={styles.title} className="title">
              {post.title}
            </h1>

            {/* User Info */}
            <div style={styles.card}>
              <div style={styles.userInfo} className="user-info">
                {post.seller?.ava_img_url ? (
                  <img 
                    src={post.seller.ava_img_url} 
                    alt="Avatar" 
                    style={styles.avatar}
                  />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    <User size={32} />
                  </div>
                )}
                <div style={styles.userDetails}>
                  <div style={styles.userName}>
                    <User size={20} />
                    <span>
                      {post.seller?.fullname || 'Admin'}
                    </span>
                  </div>
                  <div style={styles.userPhone}>
                    <Phone size={16} />
                    <span>
                      {post.seller?.phone || '0903 242 748'}
                    </span>
                  </div>
                </div>
                <div style={styles.userMeta} className="user-meta">
                  <div style={styles.metaItem}>
                    <Calendar size={16} />
                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {post.user_position && (
                    <div style={styles.metaItem}>
                      <MapPin size={16} />
                      <span>{post.user_position}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div style={styles.card}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 16 }}>
                <div style={{...styles.detailItem, ...styles.categoryDetail}}>
                  <strong>Danh mục:</strong> {post.category}
                </div>
                <div style={{...styles.detailItem, ...styles.conditionDetail}}>
                  <strong>Tình trạng:</strong> {post.condition}
                </div>
              </div>
              <h2 style={styles.sectionTitle}>Nội dung sản phẩm</h2>
              {post.content && (
                <div style={styles.description}>
                  <strong>Nội dung:</strong>
                  <div>{post.content}</div>
                </div>
              )}
            </div>

            {/* Images and Likes */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Hình ảnh sản phẩm</h2>
              {post.image && post.image.length > 0 ? (
                <div style={styles.imageGrid} className="image-grid">
                  {post.image.map((img, idx) => (
                    <div key={idx} style={styles.imageItem} className="image-item">
                      <img
                        src={img}
                        alt={`Ảnh sản phẩm ${idx + 1}`}
                        style={styles.image}
                        onClick={() => {
                          setActiveImageIndex(idx);
                          setIsImageModalOpen(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.noImages}>
                  <div style={styles.noImagesIcon}>
                    <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p>Không có hình ảnh</p>
                </div>
              )}
              {/* Likes - dưới grid ảnh */}
              <div style={{...styles.likesContainer, marginTop: 12}}>
                <Heart size={20} fill="currentColor" />
                <span>
                  {post.likes ? post.likes.length : 0} lượt thích
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal xem ảnh */}
      {isImageModalOpen && post.image && post.image.length > 0 && (
        <div style={styles.modalOverlay} onClick={() => setIsImageModalOpen(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setIsImageModalOpen(false)}><X size={24} /></button>
            {post.image.length > 1 && (
              <>
                <button
                  style={{ ...styles.modalNavBtn, left: 8 }}
                  onClick={() => setActiveImageIndex((prev) => prev === 0 ? post.image.length - 1 : prev - 1)}
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  style={{ ...styles.modalNavBtn, right: 8 }}
                  onClick={() => setActiveImageIndex((prev) => prev === post.image.length - 1 ? 0 : prev + 1)}
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
            <img
              src={post.image[activeImageIndex]}
              alt={`Ảnh lớn ${activeImageIndex + 1}`}
              style={styles.modalImage}
              className="modal-image-zoom"
              onClick={handleImageModalFullScreen}
            />
            <div style={{ color: '#555', marginTop: 8 }}>{activeImageIndex + 1} / {post.image.length}</div>
          </div>
        </div>
      )}
      {/* Video Section - hiển thị lớn như ProductView */}
      {post.video && Array.isArray(post.video) && post.video.length > 0 && (
        <section style={{ margin: '40px 0', background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', padding: 24 }}>
          <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 24 }}>Video sản phẩm</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
            {post.video.map((vid, idx) => {
              const isYouTube = isYouTubeUrl(vid);
              const embedUrl = isYouTube ? getYouTubeEmbedUrl(vid) : vid;
              return (
                <div key={idx} style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
                  {isYouTube ? (
                    <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, background: '#000', borderRadius: 8 }}>
                      <iframe
                        src={embedUrl}
                        title={`Video ${idx + 1}`}
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
                      ></iframe>
                    </div>
                  ) : (
                    <video
                      controls
                      style={{ width: '100%', minHeight: 400, maxHeight: 500, background: '#000', borderRadius: 8 }}
                      src={embedUrl}
                      aria-label={`Video playback ${idx + 1}`}
                      onDoubleClick={handleVideoFullScreen}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
      <Footer />
      <ChatWidget />
    </>
  );
};

export default PostView;