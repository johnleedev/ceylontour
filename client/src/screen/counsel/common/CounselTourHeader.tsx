import React, { useState, useEffect } from 'react';
import './CounselMainHeader.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { recoilCounselFormData } from '../../../RecoilStore';
import logoImage from '../../images/counsel/logo.png';
import { IoMdClose } from 'react-icons/io';
import { IoIosArrowForward } from 'react-icons/io';

const CounselTourHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const counselFormData = useRecoilValue(recoilCounselFormData);

  const toggleMenu = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    // 메뉴가 열릴 때 body 스크롤 막기
    if (newMenuState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);


  const isActiveMenu = (path: string) => {
    if (path === '/counsel/tour') {
      // 기본 경로는 정확히 일치할 때만 활성화
      return location.pathname === '/counsel/tour' || location.pathname === '/counsel/tour/';
    }
    return location.pathname.startsWith(path);
  };

  const formatTravelInfo = () => {
    if (!counselFormData.customerName && !counselFormData.destination) {
      return '';
    }
    
    const customer = counselFormData.customerName || '고객';
    const theme = counselFormData.theme || '허니문';
    const destination = counselFormData.destination || '목적지';
    const date = counselFormData.travelDate || '';
    const duration = counselFormData.duration ? ` (${counselFormData.duration})` : '';
    
    return `${customer}, ${destination} ${theme} ${date}${duration}`;
  };

  // 네비게이션 메뉴 항목
  const navMenuItems = [
    { id: 'trip', name: '여행상품', path: '/counsel/tour' },
    { id: 'schedule', name: '일정', path: '/counsel/tour/schedule' },
    { id: 'hotel', name: '호텔', path: '/counsel/tour/hotel' },
    { id: 'flight', name: '항공', path: '/counsel/tour/flight' },
    { id: 'estimate', name: '견적', path: '/counsel/tour/estimate' },
  ];

  // 여행지 목록 데이터
  const travelDestinations = [
    { id: 'bali', name: '발리' },
    { id: 'maldives', name: '몰디브' },
    { id: 'cancun', name: '칸쿤' },
    { id: 'hawaii', name: '하와이' },
    { id: 'samui', name: '사무이' },
    { id: 'phuket', name: '푸켓' },
    { id: 'khaolak', name: '카오락' },
    { id: 'nhatrang', name: '나트랑' },
    { id: 'phuquoc', name: '푸꾸옥' },
    { id: 'cebu', name: '세부' },
    { id: 'guam', name: '괌' },
    { id: 'mauritius', name: '모리셔스' },
    { id: 'dubai', name: '두바이' },
  ];

  const menuItems = [
    { id: 'rest', name: '휴양지', path: '/counsel/rest' },
    { id: 'tour', name: '유럽', path: '/counsel/tour' },
    { id: 'america', name: '미주', path: '/counsel' },
    { id: 'australia', name: '호주', path: '/counsel' },
    { id: 'estimate', name: '견적내기', path: '/counsel' },
    { id: 'list', name: '리스트', path: '/counsel' },
    { id: 'account', name: '계정', path: '/counsel' },
  ];

  return (
    <div className="counsel-header">
      <div className="header-container">

        <div className="header-left">
          {/* 로고 */}
          <div className="header-logo" onClick={() => navigate('/counsel')}>
            <img src={logoImage} alt="CEYLON TOUR" />
          </div>

          {/* 여행 정보 표시 */}
          {counselFormData.customerName && (
            <div className="header-travel-info">
              {formatTravelInfo()}
            </div>
          )}
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="header-nav-menu">
          {navMenuItems.map((item) => (
            <div
              key={item.id}
              className={`nav-menu-item ${isActiveMenu(item.path) ? 'active' : ''}`}
              onClick={() => {
                // navigate(item.path)
              }}
            >
              {item.name}
            </div>
          ))}
        </nav>

        {/* 햄버거버튼 */}
        <button 
          className={`header-hamburger ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
       
      </div>

      {/* 전체 화면 모달 */}
      <div className={`fullscreen-modal ${isMenuOpen ? 'open' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-logo-wrapper">
              <div className="modal-logo" onClick={() => { navigate('/counsel'); closeMenu(); }}>
                <div className="logo-text">
                  <span className="logo-main">CEYLON TOUR</span>
                </div>
                <div className="logo-tagline">honeymoon and vacation</div>
              </div>
            </div>
            <button className="modal-close" onClick={closeMenu}>
              <IoMdClose />
            </button>
          </div>

          <div className="modal-body">
            <div className="modal-sidebar">
              <nav className="sidebar-nav">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className={`sidebar-nav-item ${isActiveMenu(item.path) ? 'active' : ''}`}
                    onClick={() => { 
                      navigate(item.path);
                      closeMenu();
                    }}
                  >
                    <span className="nav-item-text">{item.name}</span>
                    {isActiveMenu(item.path) && (
                      <IoIosArrowForward className="nav-arrow" />
                    )}
                  </div>
                ))}
              </nav>
            </div>

            <div className="modal-main-content">
              <div className="destinations-grid">
                {travelDestinations.map((destination) => (
                  <div
                    key={destination.id}
                    className="destination-item"
                    onClick={() => {
                      // 여행지 클릭 시 처리
                      closeMenu();
                    }}
                  >
                    <div className="destination-image">
                      {/* 이미지는 나중에 추가 가능 */}
                      <div className="destination-placeholder">
                        {destination.name}
                      </div>
                    </div>
                    <div className="destination-name">{destination.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselTourHeader;
