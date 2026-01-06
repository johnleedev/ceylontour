import React, { useState, useEffect } from 'react';
import './CounselMainHeader.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { recoilCustomerInfoFormData, recoilHotelCart } from '../../../RecoilStore';
import logoImage from '../../images/counsel/logo.png';
import { IoMdClose } from 'react-icons/io';
import { IoIosArrowForward } from 'react-icons/io';
import CustomerInfoModal from '../CustomerInfoModal';
import axios from 'axios';
import { AdminURL } from '../../../MainURL';

const CounselRestHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
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

  // 완료 버튼 클릭 시 RestHotelCost로 이동
  const handleComplete = async () => {
    if (hotelCart.length === 0) return;

    try {
      setIsLoadingComplete(true);
      
      // 첫 번째 호텔 정보 가져오기
      const firstHotel = hotelCart[0];
      const hotelRes = await axios.get(`${AdminURL}/ceylontour/gethotelinfobyid/${firstHotel.id}`);
      
      if (!hotelRes.data || hotelRes.data.length === 0) {
        alert('호텔 정보를 가져올 수 없습니다.');
        setIsLoadingComplete(false);
        return;
      }

      const hotelInfo = hotelRes.data[0];
      const city = firstHotel.city || hotelInfo.city || '';

      // 도시별 상품 리스트 가져오기
      const productRes = await axios.post(`${AdminURL}/ceylontour/getcityschedule`, { city });
      
      if (!productRes.data || productRes.data.length === 0) {
        alert('해당 도시의 여행상품이 없습니다.');
        setIsLoadingComplete(false);
        return;
      }

      // 첫 번째 상품 선택
      const productInfo = productRes.data[0];

      // 담은 모든 호텔들을 selectedHotels 형식으로 변환
      const selectedHotels = await Promise.all(
        hotelCart.map(async (cartItem, index) => {
          try {
            // 각 호텔의 상세 정보 가져오기
            const hotelDetailRes = await axios.get(`${AdminURL}/ceylontour/gethotelinfobyid/${cartItem.id}`);
            const hotelDetail = hotelDetailRes.data && hotelDetailRes.data.length > 0 ? hotelDetailRes.data[0] : null;
            
            if (hotelDetail) {
              return {
                index: index,
                hotelSort: hotelDetail.hotelType || hotelDetail.hotelSort || '리조트',
                dayNight: '3', // 기본값
                hotel: hotelDetail
              };
            }
            return null;
          } catch (error) {
            console.error(`호텔 ${cartItem.id} 정보 가져오기 오류:`, error);
            return null;
          }
        })
      );

      // null 값 제거
      const validSelectedHotels = selectedHotels.filter((hotel): hotel is NonNullable<typeof hotel> => hotel !== null);

      // RestHotelCost로 이동
      navigate('/counsel/rest/hotelcost', {
        state: {
          hotelInfo: hotelInfo,
          productInfo: productInfo,
          city: city,
          selectedHotels: validSelectedHotels
        }
      });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('완료 처리 중 오류 발생:', error);
      alert('호텔 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingComplete(false);
    }
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

          {/* 호텔 장바구니 표시 */}
          {hotelCart.length > 0 && (() => {
            // 현재 보고 있는 호텔 ID 확인
            const queryParams = new URLSearchParams(location.search);
            const currentHotelId = queryParams.get('id');
            const isOnDetailPage = location.pathname.startsWith('/counsel/rest/hoteldetail');
            const currentId = isOnDetailPage && currentHotelId ? parseInt(currentHotelId, 10) : null;

            return (
              <div className="header-hotel-cart" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '20px' }}>
                <span style={{ fontSize: '14px', color: '#333' }}>
                  담은 호텔: {hotelCart.length}개
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {hotelCart.map((item, index) => {
                    const isCurrentHotel = currentId !== null && item.id === currentId;
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
                          backgroundColor: isCurrentHotel ? '#4da9ff' : '#f0f0f0',
                          color: isCurrentHotel ? '#fff' : '#333',
                          borderRadius: '4px',
                          fontSize: '16px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                          border: isCurrentHotel ? '1px solid #4da9ff' : 'none',
                          fontWeight: isCurrentHotel ? '600' : '400'
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrentHotel) {
                            e.currentTarget.style.backgroundColor = '#e0e0e0';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrentHotel) {
                            e.currentTarget.style.backgroundColor = '#f0f0f0';
                          } else {
                            e.currentTarget.style.backgroundColor = '#4da9ff';
                          }
                        }}
                      >
                        <span>{item.hotelNameKo}</span>
                        {item.city && <span style={{ color: isCurrentHotel ? 'rgba(255, 255, 255, 0.8)' : '#666' }}>({item.city})</span>}
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
                            color: isCurrentHotel ? 'rgba(255, 255, 255, 0.8)' : '#999'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              <button
                onClick={handleComplete}
                disabled={isLoadingComplete}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#fff',
                  cursor: isLoadingComplete ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  opacity: isLoadingComplete ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isLoadingComplete) {
                    e.currentTarget.style.backgroundColor = '#555';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoadingComplete) {
                    e.currentTarget.style.backgroundColor = '#fff';
                    e.currentTarget.style.color = '#333';
                  }
                }}
              >
                {isLoadingComplete ? '로딩 중...' : '완료'}
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
