import React, { useState, useEffect } from 'react';
import './RestHotelScheduleEdit.scss';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { recoilHotelCart, HotelCartItem, recoilProductName } from '../../../../RecoilStore';
import { IoIosArrowBack } from 'react-icons/io';
import { AdminURL } from '../../../../MainURL';
import axios from 'axios';

export default function RestHotelScheduleEdit() {
  const navigate = useNavigate();
  const hotelCart = useRecoilValue(recoilHotelCart);
  const setHotelCart = useSetRecoilState(recoilHotelCart);
  const setSavedProductName = useSetRecoilState(recoilProductName);
  
  const [hotelDetails, setHotelDetails] = useState<Array<{
    id: number;
    hotelNameKo: string;
    hotelNameEn?: string;
    hotelType?: string;
    hotelSort?: string;
    city?: string;
    nights: number;
  }>>([]);
  const [selectedNights, setSelectedNights] = useState<{ [key: number]: number }>({});
  const [productName, setProductName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [allHotels, setAllHotels] = useState<any[]>([]);
  const [city, setCity] = useState<string>('');

  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (hotelCart.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const details = await Promise.all(
          hotelCart.map(async (item) => {
            try {
              const res = await axios.get(`${AdminURL}/ceylontour/gethotelinfobyid/${item.id}`);
              if (res.data && res.data.length > 0) {
                const hotel = res.data[0];
                return {
                  id: item.id,
                  hotelNameKo: hotel.hotelNameKo || item.hotelNameKo,
                  hotelNameEn: hotel.hotelNameEn,
                  hotelType: hotel.hotelType,
                  hotelSort: hotel.hotelSort,
                  city: hotel.city || item.city,
                  nights: item.nights || 1
                };
              }
              return {
                id: item.id,
                hotelNameKo: item.hotelNameKo,
                city: item.city,
                nights: item.nights || 1
              };
            } catch (error) {
              console.error(`호텔 ${item.id} 정보 가져오기 오류:`, error);
              return {
                id: item.id,
                hotelNameKo: item.hotelNameKo,
                city: item.city,
                nights: item.nights || 1
              };
            }
          })
        );

        setHotelDetails(details);
        
        // 도시 정보 설정 (첫 번째 호텔의 도시 사용)
        const firstCity = details[0]?.city || '';
        setCity(firstCity);
        
        // 초기 박수 설정
        const initialNights: { [key: number]: number } = {};
        details.forEach((hotel) => {
          initialNights[hotel.id] = hotel.nights;
        });
        setSelectedNights(initialNights);

        // 상품명 생성
        const nameParts = details.map((hotel) => {
          const nights = initialNights[hotel.id] || 1;
          return `${hotel.hotelNameKo} ${nights}박`;
        });
        setProductName(nameParts.join(' + '));
      } catch (error) {
        console.error('호텔 정보 가져오기 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotelDetails();
  }, [hotelCart]);

  // 도시별 상품 리스트 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      if (!city) return;

      try {
        const response = await axios.post(`${AdminURL}/ceylontour/getcityschedule`, { city });
        if (response.data) {
          setProducts(Array.isArray(response.data) ? response.data : [response.data]);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('상품 리스트 가져오기 오류:', error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [city]);

  // 전체 호텔 리스트 가져오기
  useEffect(() => {
    const fetchAllHotels = async () => {
      if (!city) return;

      try {
        const res = await axios.get(`${AdminURL}/hotel/gethotelcity/${city}`);
        if (res.data && res.data !== false) {
          setAllHotels(Array.isArray(res.data) ? res.data : [res.data]);
        }
      } catch (error) {
        console.error('전체 호텔 리스트 가져오기 오류:', error);
      }
    };

    fetchAllHotels();
  }, [city]);

  // 박수 변경 시 상품명 업데이트
  useEffect(() => {
    if (hotelDetails.length > 0) {
      const nameParts = hotelDetails.map((hotel) => {
        const nights = selectedNights[hotel.id] || hotel.nights || 1;
        return `${hotel.hotelNameKo} ${nights}박`;
      });
      setProductName(nameParts.join(' + '));
    }
  }, [selectedNights, hotelDetails]);

  const handleNightsChange = (hotelId: number, delta: number) => {
    setSelectedNights((prev) => {
      const currentNights = prev[hotelId] || hotelDetails.find(h => h.id === hotelId)?.nights || 1;
      const newNights = Math.max(1, currentNights + delta);
      return {
        ...prev,
        [hotelId]: newNights
      };
    });
  };

  const handleSave = async () => {
    if (hotelDetails.length === 0) {
      alert('호텔 정보가 없습니다.');
      return;
    }

    try {
      // 장바구니의 박수 업데이트
      const updatedCart = hotelCart.map((item) => {
        const nights = selectedNights[item.id] || item.nights || 1;
        return {
          ...item,
          nights: nights
        };
      });
      setHotelCart(updatedCart);

      // 각 호텔의 상세 정보를 가져와서 selectedHotels 형식으로 변환
      const selectedHotels = await Promise.all(
        hotelDetails.map(async (hotel, index) => {
          try {
            const res = await axios.get(`${AdminURL}/ceylontour/gethotelinfobyid/${hotel.id}`);
            const hotelDetail = res.data && res.data.length > 0 ? res.data[0] : null;
            if (hotelDetail) {
              const nights = selectedNights[hotel.id] || hotel.nights || 1;
              const hotelSort = hotelDetail.hotelType || hotelDetail.hotelSort || hotel.hotelType || hotel.hotelSort || '리조트';
              
              return {
                index: index,
                hotelSort: hotelSort,
                dayNight: String(nights),
                hotel: {
                  ...hotelDetail,
                  imageNamesAllView: hotelDetail.imageNamesAllView || '[]',
                  imageNamesRoomView: hotelDetail.imageNamesRoomView || '[]',
                  imageNamesEtcView: hotelDetail.imageNamesEtcView || '[]',
                  hotelRoomTypes: hotelDetail.hotelRoomTypes || '[]'
                }
              };
            }
            return null;
          } catch (error) {
            console.error(`호텔 ${hotel.id} 정보 가져오기 오류:`, error);
            return null;
          }
        })
      );

      // null 값 제거
      const validSelectedHotels = selectedHotels.filter((hotel): hotel is NonNullable<typeof hotel> => hotel !== null);

      if (validSelectedHotels.length === 0) {
        alert('호텔 정보를 가져올 수 없습니다.');
        return;
      }

      // 첫 번째 호텔 정보 가져오기
      const firstHotel = validSelectedHotels[0].hotel;
      if (!firstHotel) {
        alert('호텔 정보를 가져올 수 없습니다.');
        return;
      }

      // 도시별 첫 번째 상품 가져오기 (없으면 null)
      let productInfo = null;
      if (city) {
        try {
          const response = await axios.post(`${AdminURL}/ceylontour/getcityschedule`, { city });
          if (response.data && response.data.length > 0) {
            productInfo = response.data[0];
          }
        } catch (error) {
          console.error('상품 정보 가져오기 오류:', error);
        }
      }

      // 상품명을 RecoilStore에 저장
      setSavedProductName(productName);

      // 호텔과 박수를 기반으로 새로운 일정 데이터 생성
      const customScheduleInfo = createScheduleFromHotels(validSelectedHotels);

      // RestHotelCost로 이동
      navigate('/counsel/rest/hotelcost', {
        state: {
          hotelInfo: firstHotel,
          productInfo: productInfo,
          city: city,
          selectedHotels: validSelectedHotels,
          isFromMakeButton: true, // '만들기' 버튼에서 온 것임을 표시
          customScheduleInfo: customScheduleInfo // 호텔 기반 일정 데이터
        }
      });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 호텔과 박수를 기반으로 일정 데이터 생성
  const createScheduleFromHotels = (hotels: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>) => {
    let currentDay = 1;
    const scheduleDetailData: any[] = [];

    hotels.forEach((hotelItem) => {
      const nights = parseInt(hotelItem.dayNight || '1', 10);
      const hotelName = hotelItem.hotel?.hotelNameKo || hotelItem.hotelSort || '';

      // 각 박수만큼 일정 일자 생성
      for (let i = 0; i < nights; i++) {
        scheduleDetailData.push({
          breakfast: '',
          lunch: '',
          dinner: '',
          hotel: hotelName,
          score: '',
          scheduleDetail: [
            {
              id: 0,
              idx: 0,
              st: 'location',
              isViewLocation: true,
              locationIcon: '',
              location: `${currentDay}일차`,
              isUseContent: false,
              locationContent: '',
              locationDetail: [{
                subLocation: '',
                subLocationContent: '',
                subLocationDetail: [],
                isUseContent: false
              }],
              airlineData: null
            }
          ]
        });
        currentDay++;
      }
    });

    return {
      airlineData: {
        sort: '',
        airlineCode: []
      },
      scheduleDetailData: scheduleDetailData
    };
  };

  // productScheduleData를 파싱하여 호텔명 생성
  const getProductNameFromSchedule = (product: any): string => {
    if (!product.productScheduleData) {
      return product.productName || product.scheduleName || '';
    }

    try {
      const scheduleData = JSON.parse(product.productScheduleData);
      if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        return product.productName || product.scheduleName || '';
      }

      // 장바구니의 호텔들을 사용하여 상품명 생성
      const hotelNightsMap: { [key: string]: { hotelName: string; nights: number } } = {};
      
      for (let i = 0; i < scheduleData.length && i < hotelDetails.length; i++) {
        const item = scheduleData[i];
        const hotel = hotelDetails[i];
        const dayNight = item.dayNight || '';
        const nights = dayNight ? parseInt(dayNight.replace(/[^0-9]/g, ''), 10) || 0 : (selectedNights[hotel.id] || hotel.nights || 1);
        
        if (hotel) {
          const key = `hotel_${hotel.id}`;
          if (hotelNightsMap[key]) {
            hotelNightsMap[key].nights += nights;
          } else {
            hotelNightsMap[key] = {
              hotelName: hotel.hotelNameKo,
              nights: nights
            };
          }
        }
      }

      const parts: string[] = [];
      for (const { hotelName, nights } of Object.values(hotelNightsMap)) {
        if (nights > 0) {
          parts.push(`${hotelName} ${nights}박`);
        } else {
          parts.push(hotelName);
        }
      }

      return parts.length > 0 ? parts.join(' + ') : (product.productName || product.scheduleName || '');
    } catch (e) {
      console.error('productScheduleData 파싱 오류:', e);
      return product.productName || product.scheduleName || '';
    }
  };

  // productScheduleData를 파싱하여 선택된 호텔 정보 생성
  const getSelectedHotelsFromSchedule = async (product: any): Promise<Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>> => {
    if (!product.productScheduleData) {
      // productScheduleData가 없으면 장바구니의 호텔들 사용
      const selectedHotels = await Promise.all(
        hotelDetails.map(async (hotel, index) => {
          try {
            const res = await axios.get(`${AdminURL}/ceylontour/gethotelinfobyid/${hotel.id}`);
            const hotelDetail = res.data && res.data.length > 0 ? res.data[0] : null;
            if (hotelDetail) {
              const nights = selectedNights[hotel.id] || hotel.nights || 1;
              return {
                index: index,
                hotelSort: hotelDetail.hotelType || hotelDetail.hotelSort || '리조트',
                dayNight: String(nights),
                hotel: {
                  ...hotelDetail,
                  imageNamesAllView: hotelDetail.imageNamesAllView || '[]',
                  imageNamesRoomView: hotelDetail.imageNamesRoomView || '[]',
                  imageNamesEtcView: hotelDetail.imageNamesEtcView || '[]',
                  hotelRoomTypes: hotelDetail.hotelRoomTypes || '[]'
                }
              };
            }
            return null;
          } catch (error) {
            console.error(`호텔 ${hotel.id} 정보 가져오기 오류:`, error);
            return null;
          }
        })
      );
      return selectedHotels.filter((hotel): hotel is NonNullable<typeof hotel> => hotel !== null);
    }

    try {
      const scheduleData = JSON.parse(product.productScheduleData);
      if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        return [];
      }

      const selectedHotels: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }> = [];
      const usedHotelIds = new Set<string | number>();

      for (let i = 0; i < scheduleData.length && i < hotelDetails.length; i++) {
        const item = scheduleData[i];
        const hotel = hotelDetails[i];
        const hotelSort = item.hotelSort || '';
        const dayNight = item.dayNight || '';
        const nights = dayNight ? parseInt(dayNight.replace(/[^0-9]/g, ''), 10) || 0 : (selectedNights[hotel.id] || hotel.nights || 1);

        if (hotel && !usedHotelIds.has(hotel.id)) {
          try {
            const res = await axios.get(`${AdminURL}/ceylontour/gethotelinfobyid/${hotel.id}`);
            const hotelDetail = res.data && res.data.length > 0 ? res.data[0] : null;
            if (hotelDetail) {
              usedHotelIds.add(hotel.id);
              selectedHotels.push({
                index: i,
                hotelSort: hotelSort || hotelDetail.hotelType || hotelDetail.hotelSort || '리조트',
                dayNight: String(nights),
                hotel: {
                  ...hotelDetail,
                  imageNamesAllView: hotelDetail.imageNamesAllView || '[]',
                  imageNamesRoomView: hotelDetail.imageNamesRoomView || '[]',
                  imageNamesEtcView: hotelDetail.imageNamesEtcView || '[]',
                  hotelRoomTypes: hotelDetail.hotelRoomTypes || '[]'
                }
              });
            }
          } catch (error) {
            console.error(`호텔 ${hotel.id} 정보 가져오기 오류:`, error);
          }
        }
      }

      return selectedHotels;
    } catch (e) {
      console.error('productScheduleData 파싱 오류:', e);
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="rest-hotel-schedule-edit">
        <div className="loading-message">로딩 중...</div>
      </div>
    );
  }

  if (hotelCart.length === 0) {
    return (
      <div className="rest-hotel-schedule-edit">
        <div className="empty-message">장바구니에 호텔이 없습니다.</div>
        <button onClick={() => navigate('/counsel/rest/hotel')} className="back-button">
          호텔 선택하러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="rest-hotel-schedule-edit">
      <div className="schedule-edit-container">
        {/* 헤더 */}
        <div className="schedule-edit-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <IoIosArrowBack />
          </button>
          <h1 className="page-title">일정 만들기</h1>
        </div>

        {/* 상품명 섹션 */}
        <div className="product-name-section">
          <label className="product-name-label">상품명</label>
          <div className="product-name-input-wrapper">  
            {productName}</div>
        </div>

        <div className="product-name-section">
          <label className="product-name-label">구분</label>
          <div className="product-name-input-wrapper">  
            {hotelDetails.map((hotel) => {
              const nights = selectedNights[hotel.id] || hotel.nights || 1;
              const hotelType = hotel.hotelType || hotel.hotelSort || '리조트';
              return `${hotelType} ${nights}박`;
            }).join(' + ')}
          </div>
        </div>

        {/* 호텔 리스트 */}
        <div className="hotel-cards-section">
          <div className="section-title">담은 호텔</div>
          <div className="hotel-cards">
            {hotelDetails.map((hotel, index) => {
              const nights = selectedNights[hotel.id] || hotel.nights || 1;
              const hotelSort = hotel.hotelType || hotel.hotelSort || '리조트';
              
              return (
                <div key={hotel.id} className="hotel-card">
                  <div className="hotel-card-day">{index + 1}일차</div>
                  <div className="hotel-card-header">
                    <div className="hotel-card-badge">
                      {hotelSort}
                    </div>
                    <div className="hotel-card-title">{hotel.hotelNameKo}</div>
                  </div>
                  <div className="hotel-card-content">
                    <div className="hotel-card-nights-control">
                      <button
                        className="nights-btn"
                        onClick={() => handleNightsChange(hotel.id, -1)}
                        disabled={nights <= 1}
                      >
                        -
                      </button>
                      <span className="nights-value">{nights}박</span>
                      <button
                        className="nights-btn"
                        onClick={() => handleNightsChange(hotel.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="save-button-section">
          <button className="save-button" onClick={handleSave}>
            만들기
          </button>
        </div>

        
        {/* 상품 리스트 섹션 */}
        <div className="product-section">
          <div className="section-title">연관 여행상품</div>
          <div className="product-list">
            {products.length === 0 ? (
              <div className="empty-message">연관된 여행상품이 없습니다.</div>
            ) : (
              products.map((product: any) => {
                // 헤더 텍스트
                const headerText =
                  product.headerText ||
                  `${product.nation || ''} 추천상품`;
                
                // 상품명 (productScheduleData 기반으로 생성)
                const productName = getProductNameFromSchedule(product);

                const badgeType = product.badgeType || 'recommend';
                const badgeText = product.badgeText || '추천상품';

                return (
                  <div
                    key={product.id}
                    className="product-item"
                    onClick={async () => {
                      // productScheduleData를 기반으로 선택된 호텔 정보 생성
                      const selectedHotels = await getSelectedHotelsFromSchedule(product);
                      
                      // 첫 번째 호텔 정보 가져오기
                      const firstHotel = hotelDetails[0];
                      let hotelInfo = null;
                      if (firstHotel) {
                        try {
                          const res = await axios.get(`${AdminURL}/ceylontour/gethotelinfobyid/${firstHotel.id}`);
                          if (res.data && res.data.length > 0) {
                            hotelInfo = res.data[0];
                          }
                        } catch (error) {
                          console.error('호텔 정보 가져오기 오류:', error);
                        }
                      }
                      
                      // 상품명을 RecoilStore에 저장
                      const productNameFromSchedule = getProductNameFromSchedule(product);
                      setSavedProductName(productNameFromSchedule);
                      
                      navigate('/counsel/rest/hotelcost', { 
                        state: {
                          hotelInfo: hotelInfo,
                          productInfo: product,
                          city: city,
                          selectedHotels: selectedHotels
                        }
                      });
                      window.scrollTo(0, 0);
                    }}
                  >
                    <div className="product-header">
                      <span className="product-header-text">{headerText}</span>
                    </div>
                    <div className="product-content">
                      <p className="product-name">
                        {productName}
                      </p>
                      <div className="product-badge-wrapper">
                        <div className={`product-badge badge-${badgeType}`}>
                          <span>{badgeText}</span>
                        </div>
                        <p className="product-land-company">{product.landCompany}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        
      </div>
    </div>
  );
}
