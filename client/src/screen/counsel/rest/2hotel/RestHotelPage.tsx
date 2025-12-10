import React, { useState, useEffect, useMemo } from 'react';
import './RestHotelPage.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import rectangle42 from '../../../lastimages/counselrest/hotel/rectangle-42.png';
import rectangle42_3 from '../../../lastimages/counselrest/hotel/rectangle-42-3.png';
import rectangle42_5 from '../../../lastimages/counselrest/hotel/rectangle-42-5.png';
import rectangle42_6 from '../../../lastimages/counselrest/hotel/rectangle-42-6.png';
import rectangle42_8 from '../../../lastimages/counselrest/hotel/rectangle-42-8.png';
import rectangle42_9 from '../../../lastimages/counselrest/hotel/rectangle-42-9.png';
import rectangle42_11 from '../../../lastimages/counselrest/hotel/rectangle-42-11.png';
import rectangle42_12 from '../../../lastimages/counselrest/hotel/rectangle-42-12.png';
import rectangle42_14 from '../../../lastimages/counselrest/hotel/rectangle-42-14.png';
import rectangle42_15 from '../../../lastimages/counselrest/hotel/rectangle-42-15.png';
import { AdminURL } from '../../../../MainURL';
import axios from 'axios';

export default function RestHotelPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;
  const selectedCity = stateProps?.city || '';
  console.log('selectedCity', selectedCity);
  const [loading, setLoading] = useState<boolean>(true);
  const [hotels, setHotels] = useState<any[]>([]);


  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${AdminURL}/ceylontour/gethotelsbycity`, { city: selectedCity });
      if (response.data !== false) {
        const copy = [...response.data];
        console.log('copy', copy);
        setHotels(copy);
      } else {
        setHotels([]);
      }
    } catch (error) {
      console.error('나라 리스트를 가져오는 중 오류 발생:', error);
      // 에러 발생 시 빈 배열 설정
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);



  const areaFilters = [
    { label: '전체', active: true },
    { label: '쿠타', active: false },
    { label: '스미냑', active: false },
    { label: '우붓', active: false },
    { label: '짱구', active: false },
  ];

  const typeFilters = [
    { label: '전체', active: true },
    { label: '선투숙', active: false },
    { label: '풀빌라', active: false },
    { label: '평점순', active: false },
    { label: '가격순', active: false },
    { label: '예약순', active: false },
  ];

  return (
    <div className="div-wrapper-screen">
      <div className="hotel-header">
        <div className="hotel-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="hotel-header-title">{selectedCity || '휴양지'}</h1>
          </div>
          <p className="hotel-header-subtitle">
            단순한 숙박지가 아니라 머무는 것 자체가 여행입니다
          </p>
        </div>

        <div className="hotel-header-search">
          <form className="hotel-search-form">
            <input
              className="hotel-search-input"
              type="text"
            />
            <button type="submit" className="hotel-search-button">
              <span className="hotel-search-icon">🔍</span>
            </button>
          </form>
        </div>
      </div>

      {/* <div className="navbar-wrapper">
        <div className="navbar">
          {areaFilters.map((item, index) => (
            <React.Fragment key={`area-${item.label}`}>
              <button
                type="button"
                className={`nav-item ${item.active ? 'active' : ''}`}
              >
                {item.label}
              </button>
              {index < areaFilters.length - 1 && <span className="nav-separator" />}
            </React.Fragment>
          ))}
        </div>

        <div className="navbar-2">
          {typeFilters.map((item, index) => (
            <React.Fragment key={`type-${item.label}`}>
              <button
                type="button"
                className={`nav-item ${item.active ? 'active' : ''}`}
              >
                {item.label}
              </button>
              {index < typeFilters.length - 1 && (
                <span className="nav-separator" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div> */}

      

      <div className="hotel-card-grid">
        {loading ? (
          <div className="loading-message">로딩 중...</div>
        ) : hotels.length === 0 ? (
          <div className="empty-message">데이터가 없습니다.</div>
        ) : (
          hotels.map((hotel: any, index: number) => {
            let mainImage: string | null = null;
            const imageCopy = JSON.parse(hotel.imageNamesAllView);
            mainImage = `${AdminURL}/images/hotelimages/${imageCopy[0]?.imageName || ''}`;

            const stars =
              hotel.hotelLevel && !isNaN(parseInt(hotel.hotelLevel, 10))
                ? '★'.repeat(parseInt(hotel.hotelLevel, 10))
                : '★★★★★';

            return (
              <div
                key={hotel.id}
                className="div-wrapper"
                onClick={() => {
                  navigate(`/counsel/rest/hoteldetail`, { state : {hotelInfo: hotel, city: selectedCity}});
                  window.scrollTo(0, 0);
                }}
              >
                <div className="card-image-wrap">
                  <img
                    className="card-image"
                    alt={hotel.hotelNameKo}
                    src={mainImage || ''}
                  />
                </div>
                <div className="card-body">
                  <div className="hotel-name">{hotel.hotelNameKo}</div>
                  <div className="hotel-location-row">
                    <span className="hotel-location">
                      {hotel.city}/{hotel.hotelLocation}
                    </span>
                    <span className="hotel-stars">{stars}</span>
                  </div>
                  <p className="promo-text">
                    {hotel.hotelBadge && hotel.hotelBadge !== '[]'
                      ? JSON.parse(hotel.hotelBadge).join(', ')
                      : '[프로모션 기간 2024년 12월 31일까지]'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="text-wrapper-nav-destination">여행지</div>

      <div className="text-wrapper-nav-schedule">일정</div>

      <div className="text-wrapper-nav-hotel">호텔</div>

      <div className="text-wrapper-nav-estimate">견적</div>

      <div className="text-wrapper-nav-flight">항공</div>

      <div className="rectangle-nav-indicator" />
    </div>
  );
};


