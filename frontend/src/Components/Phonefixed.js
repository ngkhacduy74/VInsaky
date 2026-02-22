import React from 'react';

const PhoneFixed = () => {
  const handleClick = () => {
    // Ẩn widget chat khi bấm vào phone fixed
    const chatWidgetElement = document.querySelector('.chat-widget-container');
    if (chatWidgetElement) {
      chatWidgetElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      chatWidgetElement.style.opacity = '0';
      chatWidgetElement.style.transform = 'translateY(20px)';
      setTimeout(() => {
        chatWidgetElement.style.display = 'none';
      }, 300);
    }
    
    // Kiểm tra thiết bị di động
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      // Mở cuộc gọi điện thoại
      window.open('tel:0903242748');
    } else {
      // Mở Zalo trên desktop
      window.open('https://zalo.me/0903242748', '_blank');
    }
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .phone-fixed {
              bottom: 15px !important;
              padding: 8px 16px !important;
              font-size: 13px !important;
              border-radius: 20px !important;
            }
          }
          @media (max-width: 480px) {
            .phone-fixed {
              bottom: 10px !important;
              padding: 6px 12px !important;
              font-size: 11px !important;
              border-radius: 18px !important;
              left: 30px !important;
              right: 30px !important;
              transform: none !important;
              justify-content: center !important;
              display: flex !important;
              align-items: center !important;
              gap: 6px !important;
            }
          }
        `}
      </style>
      <div 
        className="phone-fixed"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: '#ffffff',
          border: '1px solid #ddd',
          padding: '10px 20px',
          fontSize: '14px',
          borderRadius: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={handleClick}
      >
        <span>📞</span>
        <span>Hotline: 0903 242 748</span>
      </div>
    </>
  );
};

export default PhoneFixed;
