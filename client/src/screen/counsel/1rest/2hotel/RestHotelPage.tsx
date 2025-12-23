import React, { useState, useEffect, useMemo } from 'react';
import './RestHotelPage.scss';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [originalHotels, setOriginalHotels] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');


  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${AdminURL}/ceylontour/gethotelsbycity`, { city: selectedCity });
      if (response.data !== false) {
        const copy = [...response.data];
        console.log('copy', copy);
        setHotels(copy);
        setOriginalHotels(copy);
      } else {
        setHotels([]);
        setOriginalHotels([]);
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

  // 검색어에 따라 호텔 리스트 필터링
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setHotels(originalHotels);
    } else {
      const filtered = originalHotels.filter((hotel) => {
        const query = searchQuery.toLowerCase();
        return hotel.hotelNameKo?.toLowerCase().includes(query);
      });
      setHotels(filtered);
    }
  }, [searchQuery, originalHotels]);



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
          <form 
            className="hotel-search-form"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              className="hotel-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="호텔명으로 검색"
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
      
    </div>
  );
};


