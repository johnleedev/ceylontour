import React, { useState, useEffect } from 'react';
import './AmericaHotelPage.scss';
import { AdminURL } from '../../../../MainURL';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useSetRecoilState } from 'recoil';
import { recoilSelectedHotelData } from '../../../../RecoilStore';

// 호텔 페이지 이미지
import HotelImage1 from '../../../lastimages/counseltour/hotel/image.png';
import StarIcon from '../../../lastimages/counseltour/hotel/star-4-5.svg';
import LocationIcon from '../../../lastimages/counseltour/hotel/vector-301-5.svg';
import VectorIcon364 from '../../../lastimages/counseltour/hotel/vector-364.svg';
import VectorIcon367 from '../../../lastimages/counseltour/hotel/vector-367.svg';
import SearchIcon from '../../../lastimages/counseltour/hotel/vector.svg';

// 오른쪽 패널 상세 정보 이미지
import StarIconDetail from '../../../lastimages/counseltour/hotel/rightsection/star-4.svg';
import LocationIconDetail from '../../../lastimages/counseltour/hotel/rightsection/vector-301.svg';
import DropdownIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-302.svg';
import DateIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-337.svg';
import WifiIcon from '../../../lastimages/counseltour/hotel/rightsection/vector.svg';
import PoolIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-1.svg';
import FitnessIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-2.svg';
import ShuttleIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-3.svg';
import MediaImage from '../../../lastimages/counseltour/hotel/rightsection/rectangle-585.png';
import VideoIcon from '../../../lastimages/counseltour/hotel/rightsection/vector-235.svg';
import PhotoIcon1 from '../../../lastimages/counseltour/hotel/rightsection/vector-236.svg';
import PhotoIcon2 from '../../../lastimages/counseltour/hotel/rightsection/vector-237.svg';


interface Destination {
  id: string;
  name: string;
  image: string;
  selected: boolean;
  departure: string[];
  airTime: string;
  scheduleCount: number;
  rawData?: any;
}


export default function AmericaHotelPage() {

  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;
  const setSelectedHotelData = useSetRecoilState(recoilSelectedHotelData);
  
  const productScheduleData = stateProps?.productScheduleData;
  const parsedProductScheduleData = productScheduleData ? JSON.parse(productScheduleData) : [];
  console.log('parsedProductScheduleData', parsedProductScheduleData);

  const [loading, setLoading] = useState<boolean>(true);
  const [hotels, setHotels] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [showPhotoGallery, setShowPhotoGallery] = useState<boolean>(false);
  const [activePhotoTab, setActivePhotoTab] = useState<number>(0);
  const [selectedMainImageIndex, setSelectedMainImageIndex] = useState<number>(0);

  // 일정에 포함된 도시별로 호텔 리스트를 API에서 가져오기
  useEffect(() => {
    const fetchHotelsByNation = async () => {
      try {
        if (!parsedProductScheduleData || parsedProductScheduleData.length === 0) {
          setHotels([]);
          setLoading(false);
          return;
        }

        setLoading(true);

        // 일정 배열에서 city 값만 추출 후 중복 제거
        const cityList: string[] = Array.from(
          new Set(
            parsedProductScheduleData
              .map((item: any) => item.city)
              .filter((c: any) => typeof c === 'string' && c.trim() !== '')
          )
        );

        if (cityList.length === 0) {
          setHotels([]);
          setLoading(false);
          return;
        }

        // 탭에 사용할 도시 목록 저장
        setCities(cityList);
        if (!activeCity && cityList.length > 0) {
          setActiveCity(cityList[0]);
        }

        const requests = cityList.map((city) =>
          axios.post(`${AdminURL}/ceylontour/gethotelsbycity`, { city })
        );

        const responses = await Promise.all(requests);

        const merged: any[] = [];
        responses.forEach((response, index) => {
          const city = cityList[index];
          if (response.data && response.data !== false) {
            response.data.forEach((hotel: any) => {
              merged.push({
                ...hotel,
                _cityFromSchedule: city,
              });
            });
          }
        });

        setHotels(merged);
      } catch (error) {
        console.error('투어 호텔 리스트를 가져오는 중 오류 발생:', error);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelsByNation();
  }, [productScheduleData, activeCity]);

  // 도시/호텔 목록 변경 시, 현재 도시의 첫 번째 호텔을 자동 선택
  useEffect(() => {
    if (!hotels || hotels.length === 0) {
      setSelectedHotel(null);
      return;
    }

    const filtered =
      activeCity
        ? hotels.filter(
            (hotel: any) =>
              hotel.city === activeCity ||
              hotel._cityFromSchedule === activeCity
          )
        : hotels;

    setSelectedHotel(filtered[0] || null);
  }, [hotels, activeCity]);

  // 호텔 이미지 배열 상태
  const [imageAllView, setImageAllView] = useState<any[]>([]);
  const [imageRoomView, setImageRoomView] = useState<any[]>([]);
  const [imageEtcView, setImageEtcView] = useState<any[]>([]);

  // 선택된 호텔의 이미지 데이터 파싱
  useEffect(() => {
    if (!selectedHotel) {
      setImageAllView([]);
      setImageRoomView([]);
      setImageEtcView([]);
      return;
    }

    try {
      if (selectedHotel.imageNamesAllView) {
        const parsed = JSON.parse(selectedHotel.imageNamesAllView);
        setImageAllView(Array.isArray(parsed) ? parsed : []);
      } else {
        setImageAllView([]);
      }
    } catch (e) {
      console.error('전경 이미지 파싱 오류:', e);
      setImageAllView([]);
    }

    try {
      if (selectedHotel.imageNamesRoomView) {
        const parsed = JSON.parse(selectedHotel.imageNamesRoomView);
        setImageRoomView(Array.isArray(parsed) ? parsed : []);
      } else {
        setImageRoomView([]);
      }
    } catch (e) {
      console.error('객실 이미지 파싱 오류:', e);
      setImageRoomView([]);
    }

    try {
      if (selectedHotel.imageNamesEtcView) {
        const parsed = JSON.parse(selectedHotel.imageNamesEtcView);
        setImageEtcView(Array.isArray(parsed) ? parsed : []);
      } else {
        setImageEtcView([]);
      }
    } catch (e) {
      console.error('부대시설 이미지 파싱 오류:', e);
      setImageEtcView([]);
    }
  }, [selectedHotel]);

  // 현재 탭에 따른 이미지 리스트 (전경 / 객실 / 부대시설)
  const getCurrentImages = () => {
    if (activePhotoTab === 0) return imageAllView; // 전경
    if (activePhotoTab === 1) return imageRoomView; // 객실
    return imageEtcView; // 부대시설
  };

  // 파일이 동영상인지 확인
  const isVideoFile = (fileName: string) => {
    if (!fileName) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
    const lowerFileName = fileName.toLowerCase();
    return videoExtensions.some(ext => lowerFileName.endsWith(ext));
  };

  // 탭 변경 시 선택된 메인 이미지를 첫번째로 리셋
  useEffect(() => {
    setSelectedMainImageIndex(0);
  }, [activePhotoTab]);

  // 사진 갤러리 탭 버튼
  const photoTabButtons = [
    { text: '전경' },
    { text: '객실' },
    { text: '부대시설' },
  ];

  return (
    <div className="tour-hotel-page-wrapper">
      <div className="tour-hotel-container detail-open">
        {/* 왼쪽 영역: 헤더 + 나라 리스트 */}
        <div className="left-section">
          <div className="hotel-list-wrapper">
            {/* 헤더 */}
            <div className="hotel-header">
              <h1 className="element">{stateProps?.productName} &nbsp;&nbsp; {stateProps?.tourPeriodData.periodNight} {stateProps?.tourPeriodData.periodDay}</h1>

              {/* 카테고리 필터 */}
              {/* <div className="frame">
                {categoryFilters.map((filter, index) => (
                  <React.Fragment key={filter.id}>
                    {index > 0 && <div className="rectangle" />}
                    <div className={filter.id === 'all' ? 'text-wrapper' : 'div'}>
                      {filter.label}
                    </div>
                  </React.Fragment>
                ))}
              </div> */}
            </div>

            {!showPhotoGallery ? (
              <>
                {/* 검색 영역 */}
                <div className="search-section">
                  <div className="search-input-wrapper">
                    <img className="search-icon" alt="Search" src={SearchIcon} />
                    <input type="text" className="search-input" placeholder="Search" />
                    <div className="search-divider" />
                  </div>
                </div>

                {/* 지역 필터 탭 - 일정에서 가져온 도시 기준 */}
                <div className="region-tabs">
                  {cities.map((city) => (
                    <div
                      key={city}
                      className={`region-tab ${activeCity === city ? 'active' : ''}`}
                      onClick={() => setActiveCity(city)}
                    >
                      {city}
                    </div>
                  ))}
                </div>

                {/* 호텔 카드 리스트 */}
            <div className="hotel-cards-list">
              {loading ? (
                <div className="loading-message">로딩 중...</div>
              ) : (
                ((): JSX.Element => {
                  const filteredHotels =
                    activeCity
                      ? hotels.filter(
                          (hotel: any) =>
                            hotel.city === activeCity ||
                            hotel._cityFromSchedule === activeCity
                        )
                      : hotels;

                  if (!filteredHotels || filteredHotels.length === 0) {
                    return <div className="empty-message">호텔이 없습니다.</div>;
                  }

                  return (
                    <>
                      {filteredHotels.map((hotel: any, index: number) => {
                  // 메인 이미지 (전경) - RestHotelPage 와 동일 로직
                  let mainImage: string | null = null;
                  if (hotel.imageNamesAllView) {
                    try {
                      const imageCopy = JSON.parse(hotel.imageNamesAllView);
                      mainImage = `${AdminURL}/images/hotelimages/${imageCopy[0]?.imageName || ''}`;
                    } catch (e) {
                      console.error('투어 호텔 이미지 파싱 오류:', e);
                    }
                  }

                        // 별점
                        const levelNum =
                          hotel.hotelLevel && !isNaN(parseInt(hotel.hotelLevel, 10))
                            ? parseInt(hotel.hotelLevel, 10)
                            : 4;

                        const isSelected =
                          selectedHotel && selectedHotel.id === hotel.id;

                        // 가격 텍스트 (있으면 사용, 없으면 기본 문구)
                        const priceText = hotel.lowestPrice
                          ? `${Number(hotel.lowestPrice).toLocaleString()}원~`
                          : '문의요청';

                        return (
                          <div
                            key={hotel.id}
                            className={`hotel-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedHotel(hotel)}
                          >
                      <img
                        className="hotel-image"
                        alt={hotel.hotelNameKo}
                        src={mainImage || HotelImage1}
                      />
                      
                      <div className="hotel-card-content">
                        <div className="hotel-card-content-left">
                        <h3 className="hotel-title">{hotel.hotelNameKo}</h3>

                          <div className="hotel-info">

                            <div className="hotel-location">
                              <span className="location-text">
                                {(hotel.nation || hotel._nationFromSchedule || '')}
                              </span>
                              <img
                                className="location-icon"
                                alt="Location"
                                src={LocationIcon}
                              />
                              <span className="location-text">
                                {hotel.city}
                              </span>
                            </div>
                            <div className="hotel-rating">
                              {Array.from({ length: levelNum }).map((_, i) => (
                                <img
                                  key={i}
                                  className="star-icon"
                                  alt="Star"
                                  src={StarIcon}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <p className="hotel-description">
                            {hotel.hotelIntro ||
                              '호텔의 특징을 적는 곳입니다.호텔의 특징을 적는 곳입니다.'}
                          </p>
                        

                         
                        </div>

                        <div className="hotel-card-content-right">
                          <div className="hotel-price">{priceText}</div>
                        </div>

                       

                        
                      </div>
                    </div>
                        );
                      })}
                    </>
                  );
                })()
              )}
            </div>
              </>
            ) : (
              <>
                {/* 호텔 사진 갤러리 */}
                {selectedHotel ? (
                  <>
                    <div className="room-container-wrapper">
                      <div className="room-container-left">
                        {photoTabButtons.map(({ text }, index) => (
                          <button
                            key={text}
                            type="button"
                            className={`roomtabsort ${activePhotoTab === index ? 'active' : ''}`}
                            onClick={() => setActivePhotoTab(index)}
                          >
                            {text}
                          </button>
                        ))}
                      </div>
                      <div className="room-container-right">
                        {selectedHotel.hotelRoomTypes && 
                         JSON.parse(selectedHotel.hotelRoomTypes || '[]').length > 0 ? (
                          JSON.parse(selectedHotel.hotelRoomTypes).map((room: any, index: number, arr: any[]) => (
                            <React.Fragment key={room.roomTypeName || index}>
                              <span className="roomtype-text">{room.roomTypeName}</span>
                              {index < arr.length - 1 && (
                                <span className="roomtype-separator"></span>
                              )}
                            </React.Fragment>
                          ))
                        ) : null}
                      </div>
                    </div>

                    <div className="photo-gallery">
                      <div className="photo-main">
                        {(() => {
                          const images = getCurrentImages();
                          if (images && images.length > 0) {
                            const main = images[selectedMainImageIndex];
                            const isVideo = isVideoFile(main.imageName);
                            
                            if (isVideo) {
                              return (
                                <video
                                  className="photo-main-image"
                                  controls
                                  src={`${AdminURL}/images/hotelimages/${main.imageName}`}
                                >
                                  브라우저가 비디오 태그를 지원하지 않습니다.
                                </video>
                              );
                            }
                            
                            return (
                              <img
                                className="photo-main-image"
                                alt={main.title || '메인 이미지'}
                                src={`${AdminURL}/images/hotelimages/${main.imageName}`}
                              />
                            );
                          }
                          return (
                            <img
                              className="photo-main-image"
                              alt="메인 이미지"
                              src={MediaImage}
                            />
                          );
                        })()}
                      </div>

                      <div className="photo-thumbnails">
                        {getCurrentImages().map((img: any, index: number) => {
                          const isVideo = isVideoFile(img.imageName);
                          return (
                            <div
                              className={`photo-thumbnail ${selectedMainImageIndex === index ? 'active' : ''} ${isVideo ? 'video-thumbnail' : ''}`}
                              key={index}
                              onClick={() => setSelectedMainImageIndex(index)}
                            >
                              {isVideo ? (
                                <div className="thumbnail-video-wrapper">
                                  <video
                                    className="thumbnail-video"
                                    src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                                    muted
                                    preload="metadata"
                                  />
                                  <div className="video-play-icon">▶</div>
                                </div>
                              ) : (
                                <img
                                  src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                                  alt={img.title || `썸네일 ${index + 1}`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-message">호텔을 선택하면 사진을 볼 수 있습니다.</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 오른쪽 영역: 상세 정보 */}
        <div className="right-section">
          <div className="hotel-detail-wrapper">
            {selectedHotel ? (
              <>
                {/* 호텔 헤더 */}
                <div className="hotel-detail-header">
                  <div className="hotel-header-left">
                    <div className="hotel-detail-title">
                      {selectedHotel.hotelNameKo || '선택된 호텔'}
                    </div>
                    
                    <div className="hotel-detail-rating">
                      {Array.from(
                        {
                          length:
                            selectedHotel.hotelLevel &&
                            !isNaN(parseInt(selectedHotel.hotelLevel, 10))
                              ? parseInt(selectedHotel.hotelLevel, 10)
                              : 4,
                        },
                        (_, i) => (
                          <img
                            key={i}
                            className="star"
                            alt="Star"
                            src={StarIconDetail}
                          />
                        )
                      )}
                    </div>

                    <div className="hotel-detail-location">
                      <span>
                        {(selectedHotel.nation || selectedHotel._cityFromSchedule || '')}
                        &nbsp;&gt;&nbsp;
                        {selectedHotel.city}
                      </span>
                    </div>
                  </div>

                  <div className="hotel-header-right">
                    <button className="media-button-header">
                      <img className="media-icon" alt="Vector" src={VideoIcon} />
                      <span>동영상보기</span>
                    </button>
                    <button 
                      className="media-button-header"
                      onClick={() => setShowPhotoGallery(!showPhotoGallery)}
                    >
                      <div className="media-icon-group">
                        <img className="media-icon" alt="Vector" src={PhotoIcon1} />
                        <img className="media-icon" alt="Vector" src={PhotoIcon2} />
                      </div>
                      <span>{showPhotoGallery ? '호텔목록보기' : '호텔사진보기'}</span>
                    </button>
                  </div>
                </div>

                {/* 호텔 메인 이미지 */}
                <div className="media-section">
                  <img
                    className="media-image"
                    alt={selectedHotel.hotelNameKo || 'Hotel'}
                    src={(() => {
                      if (selectedHotel.imageNamesAllView) {
                        try {
                          const imageCopy = JSON.parse(selectedHotel.imageNamesAllView);
                          return `${AdminURL}/images/hotelimages/${imageCopy[0]?.imageName || ''}`;
                        } catch (e) {
                          console.error('선택 호텔 이미지 파싱 오류:', e);
                        }
                      }
                      return MediaImage;
                    })()}
                  />
                </div>

                {/* 호텔 위치 */}
                <div className="location-section">
                  <button className="location-button">
                    <span>호텔 위치 보기</span>
                  </button>
                  <p className="location-address">
                    {selectedHotel.hotelAddress ||
                      '상세 주소는 추후 제공될 예정입니다.'}
                  </p>
                  <div className="location-distances">
                    <p>
                      {selectedHotel.hotelLocation ||
                        `${selectedHotel.city || '도시'} 주변 대표 관광지 정보는 추후 입력될 예정입니다.`}
                    </p>
                  </div>
                </div>

                {/* 호텔 소개 */}
                <div className="description-section">
                  <p className="description-text">
                    {selectedHotel.hotelNotice
                      ? selectedHotel.hotelNotice
                      : selectedHotel.hotelIntro
                      ? selectedHotel.hotelIntro
                      : (
                        <>
                          선택된 호텔의 상세 소개가 들어갈 영역입니다.
                          <br />
                          관리자 페이지에서 호텔 소개 문구를 등록하면 이곳에 노출됩니다.
                        </>
                      )}
                  </p>
                </div>

                {/* 추천포인트 */}
                <div className="recommendations-section">
                  <div className="recommendations-title">추천 포인트</div>
                  <p className="recommendations-text">
                    {selectedHotel.hotelRecommendPoint
                      ? selectedHotel.hotelRecommendPoint
                      : '여행 중 특별한 휴식을 즐길 수 있는 추천 포인트가 들어갈 영역입니다.'}
                  </p>
                </div>

                {/* 부대시설 */}
                <div className="facilities-section">
                  {(() => {
                    let convenienceList: string[] = [];
                    try {
                      if (selectedHotel.hotelConvenience && selectedHotel.hotelConvenience !== '[]') {
                        convenienceList = JSON.parse(selectedHotel.hotelConvenience);
                      }
                    } catch (e) {
                      console.error('호텔 부대시설 파싱 오류:', e);
                    }

                    if (!convenienceList || convenienceList.length === 0) {
                      return null;
                    }

                    const getIconByIndex = (index: number) => {
                      const icons = [WifiIcon, PoolIcon, FitnessIcon, ShuttleIcon];
                      return icons[index % icons.length];
                    };

                    return (
                      <div className="facilities-grid">
                        {convenienceList.map((item, index) => (
                          <div className="facility-item" key={`${item}-${index}`}>
                            <img
                              className="facility-icon"
                              alt={item}
                              src={getIconByIndex(index)}
                            />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* 예약 카드 */}
                <div className="booking-card">
                  <div className="booking-field">
                    <div className="booking-label">날짜</div>
                    <div className="booking-input">
                      <img className="date-icon" alt="Calendar" src={DateIcon} />
                    </div>
                  </div>

                  <div className="booking-field">
                    <div className="booking-label">룸타입</div>
                    <div className="booking-input">
                      <span className="booking-input-text">룸타입</span>
                      <img className="booking-option-icon" alt="Vector" src={DropdownIcon} />
                    </div>
                  </div>

                  <div className="booking-field">
                    <div className="booking-label">인원</div>
                    <div className="booking-counter">
                      <button className="counter-btn">-</button>
                      <span className="counter-value">2명</span>
                      <button className="counter-btn">+</button>
                    </div>
                  </div>

                  <div className="booking-price-info">
                    <span className="price-per-night">
                      {selectedHotel.lowestPrice
                        ? `${Number(selectedHotel.lowestPrice).toLocaleString()}원 /1박`
                        : '요금은 문의해 주세요'}
                    </span>
                  </div>

                  <div className="booking-field">
                    <div className="booking-label">박수</div>
                    <div className="booking-counter">
                      <button className="counter-btn">-</button>
                      <span className="counter-value">
                        {stateProps?.tourPeriodData?.periodNight || '1박'}
                      </span>
                      <button className="counter-btn">+</button>
                    </div>
                  </div>

                  <div className="booking-total">
                    <div className="total-label">총요금</div>
                    <div className="total-amount">
                      {selectedHotel.lowestPrice
                        ? `₩${Number(selectedHotel.lowestPrice).toLocaleString()}`
                        : '문의요청'}
                    </div>
                  </div>
                  <div className="select-button-wrapper">  
                    <button className="select-button"
                    onClick={() => {
                      if (!selectedHotel) {
                        alert('호텔을 선택해주세요.');
                        return;
                      }

                      // 일정에서 도시별 호텔 정보 추출
                      const scheduleCards: any[] = [];
                      if (parsedProductScheduleData && Array.isArray(parsedProductScheduleData)) {
                        parsedProductScheduleData.forEach((scheduleItem: any) => {
                          if (scheduleItem.city === selectedHotel.city || scheduleItem.city === selectedHotel._cityFromSchedule) {
                            scheduleCards.push({
                              title: selectedHotel.hotelNameKo || '',
                              nights: stateProps?.tourPeriodData?.periodNight || '1박',
                              city: scheduleItem.city || selectedHotel.city
                            });
                          }
                        });
                      }

                      // 포함/제외 항목 추출
                      const includeItems = stateProps?.includeNote ? stateProps.includeNote.split('\n').filter((item: string) => item.trim()) : [];
                      const excludeItems = stateProps?.notIncludeNote ? stateProps.notIncludeNote.split('\n').filter((item: string) => item.trim()) : [];

                      setSelectedHotelData({
                        hotelInfo: selectedHotel,
                        productInfo: {
                          id: stateProps?.id,
                          productName: stateProps?.productName,
                          scheduleSort: stateProps?.scheduleSort,
                          costType: stateProps?.costType,
                          tourPeriodData: stateProps?.tourPeriodData,
                          includeNote: stateProps?.includeNote,
                          notIncludeNote: stateProps?.notIncludeNote,
                          productScheduleData: stateProps?.productScheduleData
                        },
                        scheduleCards: scheduleCards,
                        periodText: stateProps?.tourPeriodData?.periodNight ? `${stateProps.tourPeriodData.periodNight} ${stateProps.tourPeriodData.periodDay}` : '',
                        includeItems: includeItems,
                        excludeItems: excludeItems,
                        priceInfo: {
                          pricePerPerson: selectedHotel.lowestPrice ? Number(selectedHotel.lowestPrice) : 0,
                          totalPrice: selectedHotel.lowestPrice ? Number(selectedHotel.lowestPrice) * 2 : 0,
                          guestCount: 2
                        }
                      });
                      alert('호텔이 담겼습니다.');
                    }}
                    >호텔담기</button>
                    <button className="select-button"
                    onClick={() => navigate('/counsel/europe/flight', { state: { schedule: parsedProductScheduleData, hotel: selectedHotel } })}
                    >다음</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hotel-detail-empty">
                호텔을 선택하면 상세 정보가 이곳에 표시됩니다.
              </div>
            )}
          </div>
        </div>
      </div>
    
    </div>
  );
};


