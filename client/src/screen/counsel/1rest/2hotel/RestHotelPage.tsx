import React, { useState, useEffect, useMemo } from 'react';
import './RestHotelPage.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminURL } from '../../../../MainURL';
import axios from 'axios';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { recoilHotelCart, HotelCartItem } from '../../../../RecoilStore';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';

export default function RestHotelPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;
  const selectedCity = stateProps?.city || '';
  const hotelCart = useRecoilValue(recoilHotelCart);
  const setHotelCart = useSetRecoilState(recoilHotelCart);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [hotels, setHotels] = useState<any[]>([]);
  const [originalHotels, setOriginalHotels] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const addToCart = (hotel: any) => {
    setHotelCart((prevCart) => {
      // 이미 장바구니에 있는지 확인
      const existingIndex = prevCart.findIndex(item => item.id === hotel.id);
      if (existingIndex === -1) {
        // 장바구니에 없으면 추가 (기본 박수: 2박)
        const newItem: HotelCartItem = {
          id: hotel.id,
          hotelNameKo: hotel.hotelNameKo,
          city: selectedCity || hotel.city || '',
          nights: 2 // 기본값 2박
        };
        return [...prevCart, newItem];
      } else {
        // 이미 있으면 제거
        return prevCart.filter((item) => item.id !== hotel.id);
      }
    });
  };


  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${AdminURL}/ceylontour/gethotelsbycity`, { city: selectedCity });
      if (response.data !== false) {
        const copy = [...response.data];
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



  // const areaFilters = [
  //   { label: '전체', active: true },
  //   { label: '쿠타', active: false },
  //   { label: '스미냑', active: false },
  //   { label: '우붓', active: false },
  //   { label: '짱구', active: false },
  // ];

  // const typeFilters = [
  //   { label: '전체', active: true },
  //   { label: '선투숙', active: false },
  //   { label: '풀빌라', active: false },
  //   { label: '평점순', active: false },
  //   { label: '가격순', active: false },
  //   { label: '예약순', active: false },
  // ];

  return (
    <div className="RestHotelPage">
      <div className="hotel-header-container">
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

              // 장바구니에 있는지 확인하여 하트 상태 결정
              const isFavorite = hotelCart.some(item => item.id === hotel.id);

              return (
                <div
                  key={hotel.id}
                  className="div-wrapper"
                  onClick={() => {
                    navigate(`/counsel/rest/hoteldetail?id=${hotel.id}&city=${selectedCity}`);
                    window.scrollTo(0, 0);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-image-wrap">
                    <img
                      className="card-image"
                      alt={hotel.hotelNameKo}
                      src={mainImage || ''}
                    />
                    <button
                      type="button"
                      className={`card-heart-button ${isFavorite ? 'favorite' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(hotel);
                      }}
                    >
                      {isFavorite ? (
                        <AiFillHeart className="heart-icon filled" />
                      ) : (
                        <AiOutlineHeart className="heart-icon outline" />
                      )}
                    </button>
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
    </div>
  );
};


