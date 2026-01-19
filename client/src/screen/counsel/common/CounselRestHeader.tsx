import React, { useState, useEffect } from 'react';
import './CounselMainHeader.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { recoilCustomerInfoFormData, recoilHotelCart } from '../../../RecoilStore';
import logoImage from '../../images/counsel/logo.png';
import CustomerInfoModal from '../CustomerInfoModal';
import CounselMenuModal from './CounselMenuModal';
import axios from 'axios';
import { AdminURL } from '../../../MainURL';

const CounselRestHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const customerInfoFormData = useRecoilValue(recoilCustomerInfoFormData);
  const hotelCart = useRecoilValue(recoilHotelCart);
  const setHotelCart = useSetRecoilState(recoilHotelCart);

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
    } else if (path === '/counsel/rest/hotel') {
      // 호텔 경로: /counsel/rest/hotel 또는 /counsel/rest/hoteldetail로 시작하는 경우
      return location.pathname.startsWith('/counsel/rest/hotel') && 
             !location.pathname.startsWith('/counsel/rest/hotelcost');
    } else if (path === '/counsel/rest/hotelcost') {
      // 일정 경로: /counsel/rest/hotelcost로 시작하는 경우
      return location.pathname.startsWith('/counsel/rest/hotelcost');
    }
    return location.pathname.startsWith(path);
  };

  const formatTravelInfo = () => {
    const customer1 = customerInfoFormData.customer1Name;
    const customer2 = customerInfoFormData.customer2Name;
    const travelPeriodStart = customerInfoFormData.travelPeriodStart;
    const travelPeriodEnd = customerInfoFormData.travelPeriodEnd;
    
    if (!customer1 && !customer2 && !travelPeriodStart && !travelPeriodEnd) {
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
    if (travelPeriodStart && travelPeriodEnd) {
      return customerText ? `${customerText}, ${travelPeriodStart} ~ ${travelPeriodEnd}` : `${travelPeriodStart} ~ ${travelPeriodEnd}`;
    }
    
    return customerText;
  };

  // GO 버튼 클릭 시 RestHotelDetail로 이동 (첫 번째 호텔)
  const handleScheduleEdit = () => {
    if (hotelCart.length === 0) {
      alert('장바구니에 호텔이 없습니다.');
      return;
    }
    // 첫 번째 호텔의 ID와 city를 사용하여 RestHotelDetail로 이동
    const firstHotel = hotelCart[0];
    navigate(`/counsel/rest/hoteldetail?id=${firstHotel.id}&city=${firstHotel.city}&fromGo=true`);
    window.scrollTo(0, 0);
  };

  // 네비게이션 메뉴 항목
  const navMenuItems = [
    { id: 'trip', name: '여행지', path: '/counsel/rest' },
    { id: 'hotel', name: '호텔', path: '/counsel/rest/hotel' },
    { id: 'schedule', name: '일정', path: '/counsel/rest/hotelcost' },
    { id: 'estimate', name: '견적', path: '/counsel/rest/estimate' },
  ];


  return (
    <div className="counsel-header">
      <div className="header-container">

        <div className="header-left">
          {/* 로고 */}
          <div className="header-logo" onClick={() => navigate('/counsel')}>
            <img src={logoImage} alt="CEYLON TOUR" />
          </div>

          <div className="header-info-wrapper">
            {/* 여행 정보 표시 */}
            {(customerInfoFormData.customer1Name || customerInfoFormData.customer2Name || customerInfoFormData.travelPeriodStart || customerInfoFormData.travelPeriodEnd) && (
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

            {/* 호텔 장바구니 표시 */}
            {hotelCart.length > 0 && (() => {
              return (
                <div className="header-hotel-cart" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '0' }}>
                <span style={{ fontSize: '14px', color: '#333' }}>
                  담은 호텔: {hotelCart.length}개
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {hotelCart.map((item, index) => {
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          const isAlreadyOnDetailPage = location.pathname.startsWith('/counsel/rest/hoteldetail');
                          navigate(`/counsel/rest/hoteldetail?id=${item.id}&city=${item.city || ''}`, {
                            replace: isAlreadyOnDetailPage
                          });
                          window.scrollTo(0, 0);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          backgroundColor: '#f0f0f0',
                          color: '#333',
                          borderRadius: '4px',
                          fontSize: '16px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                          border: 'none',
                          fontWeight: '400'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e0e0e0';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f0f0';
                        }}
                      >
                        <span>{item.hotelNameKo}</span>
                        {item.city && <span style={{ color: '#666' }}>({item.city})</span>}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setHotelCart((prev) => prev.filter((hotel) => hotel.id !== item.id));
                          }}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: '0',
                            marginLeft: '4px',
                            fontSize: '14px',
                            color: '#999'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              <button
                onClick={handleScheduleEdit}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#555';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.color = '#333';
                }}
              >
                GO
              </button>
              <button
                onClick={() => {
                  if (window.confirm('담은 호텔을 모두 삭제하시겠습니까?')) {
                    setHotelCart([]);
                  }
                }}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  color: '#666',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.borderColor = '#999';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.borderColor = '#ddd';
                }}
              >
                초기화
              </button>
            </div>
            );
          })()}
          </div>
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
      <CounselMenuModal
        isOpen={isMenuOpen}
        onClose={closeMenu}
      />

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
