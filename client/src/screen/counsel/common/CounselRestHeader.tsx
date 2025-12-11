import React, { useState, useEffect } from 'react';
import './CounselMainHeader.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { recoilCustomerInfoFormData } from '../../../RecoilStore';
import logoImage from '../../images/counsel/logo.png';
import { IoMdClose } from 'react-icons/io';
import { IoIosArrowForward } from 'react-icons/io';
import CustomerInfoModal from '../CustomerInfoModal';

const CounselRestHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const customerInfoFormData = useRecoilValue(recoilCustomerInfoFormData);

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
    if (path === '/counsel/rest') {
      // 기본 경로는 정확히 일치할 때만 활성화
      return location.pathname === '/counsel/rest' || location.pathname === '/counsel/rest/';
    }
    return location.pathname.startsWith(path);
  };

  const formatTravelInfo = () => {
    const customer1 = customerInfoFormData.customer1Name;
    const customer2 = customerInfoFormData.customer2Name;
    const travelPeriod = customerInfoFormData.travelPeriod;
    
    if (!customer1 && !customer2 && !travelPeriod) {
      return '';
    }
    
    // 고객명 처리 (둘 다 있으면 ", "로 구분, 하나만 있으면 그대로 사용)
    let customerText = '';
    if (customer1 && customer2) {
      customerText = `${customer1}, ${customer2}`;
    } else if (customer1) {
      customerText = customer1;
    } else if (customer2) {
      customerText = customer2;
    }
    
    // 여행기간이 있으면 고객명과 함께 표시, 없으면 고객명만 표시
    if (travelPeriod) {
      return customerText ? `${customerText}, ${travelPeriod}` : travelPeriod;
    }
    
    return customerText;
  };

  // 네비게이션 메뉴 항목
  const navMenuItems = [
    { id: 'trip', name: '여행상품', path: '/counsel/rest' },
    { id: 'hotel', name: '호텔', path: '/counsel/rest/hotel' },
    { id: 'schedule', name: '일정', path: '/counsel/rest/schedule' },
    { id: 'flight', name: '항공', path: '/counsel/rest/flight' },
    { id: 'estimate', name: '견적', path: '/counsel/rest/estimate' },
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
          {(customerInfoFormData.customer1Name || customerInfoFormData.customer2Name || customerInfoFormData.travelPeriod) && (
            <div className="header-travel-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>{formatTravelInfo()}</span>
              <button
                onClick={() => setIsCustomerModalOpen(true)}
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  color: '#333',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                변경
              </button>
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

      {/* 고객 정보 수정 모달 */}
      {isCustomerModalOpen && (
        <CustomerInfoModal
          onStart={() => {
            setIsCustomerModalOpen(false);
          }}
          onClose={() => {
            setIsCustomerModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default CounselRestHeader;
