import React, { useState, useEffect, useMemo, useRef } from 'react';
import './EuropeScheduleRecommend.scss';
import { AdminURL } from '../../../../MainURL';
import { useNavigate, useLocation } from 'react-router-dom';
import { ImLocation } from 'react-icons/im';
import { IoIosArrowBack } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import RatingBoard from '../../../common/RatingBoard';
import ScheduleRederBox from '../../../common/ScheduleRederBox';
import ScheduleRederCustom from '../../../common/ScheduleRederCustom';
import axios from 'axios';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { recoilSelectedScheduleData, recoilCustomerInfoFormData } from '../../../../RecoilStore';

// 일정표 우측 패널 카드용 이미지 (투어 전용)
import scheduleImg1 from '../../../lastimages/counseltour/schedule/image1.png';

const EuropeScheduleRecommend: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;
  console.log('stateProps', stateProps);
  
  const customerInfo = useRecoilValue(recoilCustomerInfoFormData);
  const setSelectedScheduleData = useSetRecoilState(recoilSelectedScheduleData);
  
  const [mainTab, setMainTab] = useState<string>('여행도시');
  const [activeRightTab, setActiveRightTab] = React.useState<'benefit' | 'schedule'>('schedule');
  const [summaryMainTab, setSummaryMainTab] = React.useState<'상세일정' | '항공' | '식사' | '계약특전'>('상세일정');
  const [summarySubTab, setSummarySubTab] = React.useState<'전체' | '호텔베네핏' | '익스커션' | '강습/클래스' | '스파마사지' | '식사/다이닝' | '바/클럽' | '스냅촬영' | '차량/가이드' | '편의사항' | '기타'>('전체');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [productName, setProductName] = useState<string>('');
  const [scheduleDetail, setScheduleDetail] = useState<any>(null);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<number>(0);
  const [scheduleList, setScheduleList] = useState<any[]>([]);
  const [showRightPanel, setShowRightPanel] = useState<boolean>(true);
  const [cityInfoMap, setCityInfoMap] = useState<Record<string, any>>({});
  const [loadingCityInfo, setLoadingCityInfo] = useState<boolean>(false);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  
  // 도시 이미지 탭 관련 상태
  const [cityImageTab, setCityImageTab] = useState<number>(0); // 0: 소개, 1: 가이드투어, 2: 입장/체험, 3: 경기/공연, 4: 레스토랑/카페
  const [imageNotice, setImageNotice] = useState<any[]>([]); // 소개
  const [imageGuide, setImageGuide] = useState<any[]>([]); // 가이드투어
  const [imageEnt, setImageEnt] = useState<any[]>([]); // 입장/체험
  const [imageEvent, setImageEvent] = useState<any[]>([]); // 경기/공연
  const [imageCafe, setImageCafe] = useState<any[]>([]); // 레스토랑/카페
  
  // 일정표 토글
  const [showScheduleBox, setShowScheduleBox] = React.useState<boolean>(false);
  const [showScheduleEdit, setShowScheduleEdit] = React.useState<boolean>(false);
  const [scheduleProductId, setScheduleProductId] = React.useState<string | null>(
    stateProps?.id ? String(stateProps.id) : null
  );
  
  // 상세일정 탭의 상세일정 리스트 데이터
  const [scheduleDetailList, setScheduleDetailList] = React.useState<any[]>([]);
  const [isLoadingScheduleDetail, setIsLoadingScheduleDetail] = React.useState<boolean>(false);
  
  // 우측 패널 탭 상태
  const [rightPanelTopTab, setRightPanelTopTab] = React.useState<'예약하기' | '수정하기'>('예약하기');
  const [rightPanelSubTab, setRightPanelSubTab] = React.useState<'여행도시' | '여행루트' | '일정' | '예약정보'>('예약정보');
  
  // 예약하기 폼 상태
  const [reservationForm, setReservationForm] = React.useState({
    name: '',
    travelType: '',
    productName: '',
    travelPeriod: '',
    airline: '',
    hotel: '',
    pricePerPerson: '',
    totalPrice: ''
  });
  
  // 각 탭별 데이터 개수 계산
  const tabCounts = React.useMemo(() => {
    const counts: { [key: string]: number } = {};
    const definedTabs = ['호텔베네핏', '익스커션', '강습/클래스', '스파마사지', '식사/다이닝', '바/클럽', '스냅촬영', '차량/가이드', '편의사항'];
    
    // 전체 개수
    counts['전체'] = scheduleDetailList.length;
    
    // 각 정의된 탭별 개수
    definedTabs.forEach(tab => {
      counts[tab] = scheduleDetailList.filter((item: any) => item.sort === tab).length;
    });
    
    // 기타: 정의된 탭에 속하지 않는 항목들
    counts['기타'] = scheduleDetailList.filter((item: any) => {
      return !definedTabs.includes(item.sort);
    }).length;
    
    return counts;
  }, [scheduleDetailList]);
  
  // 필터링된 상세일정 리스트
  const filteredScheduleDetailList = React.useMemo(() => {
    if (summarySubTab === '전체') {
      return scheduleDetailList;
    }
    if (summarySubTab === '기타') {
      const definedTabs = ['호텔베네핏', '익스커션', '강습/클래스', '스파마사지', '식사/다이닝', '바/클럽', '스냅촬영', '차량/가이드', '편의사항'];
      return scheduleDetailList.filter((item: any) => !definedTabs.includes(item.sort));
    }
    return scheduleDetailList.filter((item: any) => item.sort === summarySubTab);
  }, [scheduleDetailList, summarySubTab]);
  
  // productScheduleData에서 도시 목록 추출
  const cities = React.useMemo(() => {
    if (!stateProps?.productScheduleData) return [];
    try {
      const scheduleData = JSON.parse(stateProps.productScheduleData);
      if (Array.isArray(scheduleData)) {
        const cityList = scheduleData
          .map((item: any) => item.city)
          .filter((city: string) => city && city.trim() !== '');
        // 중복 제거
        return Array.from(new Set(cityList));
      }
    } catch (e) {
      console.error('productScheduleData 파싱 오류:', e);
    }
    return [];
  }, [stateProps?.productScheduleData]);

  // productScheduleData에서 도시 정보 (도시명, 여행기간, 박수) 추출
  const citiesWithInfo = React.useMemo(() => {
    if (!stateProps?.productScheduleData) return [];
    try {
      const scheduleData = JSON.parse(stateProps.productScheduleData);
      if (!Array.isArray(scheduleData)) return [];

      // 시작 날짜 계산
      let startDate: Date | null = null;
      if (customerInfo.travelPeriod) {
        const travelPeriod = customerInfo.travelPeriod.trim();
        if (travelPeriod.includes('~')) {
          const parts = travelPeriod.split('~').map(part => part.trim());
          if (parts.length === 2) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(parts[0])) {
              startDate = new Date(parts[0]);
            }
          }
        } else {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(travelPeriod)) {
            startDate = new Date(travelPeriod);
          }
        }
      }
      
      if (!startDate) {
        startDate = new Date();
      }

      let currentDate = new Date(startDate);

      return scheduleData.map((item: any) => {
        const city = item.city || '';
        const dayNight = item.dayNight || '';
        const nights = dayNight ? parseInt(dayNight.replace(/[^0-9]/g, ''), 10) || 0 : 0;
        
        const arrivalDate = new Date(currentDate);
        const departureDate = new Date(currentDate);
        
        if (nights > 0) {
          departureDate.setDate(departureDate.getDate() + nights);
        }
        
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };
        
        const travelPeriod = `${formatDate(arrivalDate)} ~ ${formatDate(departureDate)}`;
        
        currentDate = new Date(departureDate);
        
        return {
          city,
          travelPeriod,
          nights
        };
      });
    } catch (e) {
      console.error('productScheduleData 파싱 오류:', e);
      return [];
    }
  }, [stateProps?.productScheduleData, customerInfo.travelPeriod]);

  // 각 도시 정보 가져오기
  const fetchCityInfo = async (cityName: string) => {
    try {
      const response = await axios.get(`${AdminURL}/ceylontour/getcityinfobycity/${cityName}`);
      if (response.data && response.data !== false && response.data.length > 0) {
        // 첫 번째 항목을 도시 정보로 사용
        console.log('response.data[0]', response.data[0]);
        return response.data[0];
      }
      return null;
    } catch (error) {
      console.error(`${cityName} 도시 정보를 가져오는 중 오류 발생:`, error);
      return null;
    }
  };

  // 모든 도시 정보 가져오기
  useEffect(() => {
    const fetchAllCityInfo = async () => {
      if (cities.length === 0) return;
      
      setLoadingCityInfo(true);
      const cityInfoPromises = cities.map(async (city: string) => {
        const info = await fetchCityInfo(city);
        return { city, info };
      });

      try {
        const results = await Promise.all(cityInfoPromises);
        const infoMap: Record<string, any> = {};
        results.forEach(({ city, info }) => {
          if (info) {
            infoMap[city] = info;
          }
        });
        setCityInfoMap(infoMap);
      } catch (error) {
        console.error('도시 정보를 가져오는 중 오류 발생:', error);
      } finally {
        setLoadingCityInfo(false);
      }
    };

    fetchAllCityInfo();
  }, [cities]);

  // 첫 번째 도시를 기본값으로 설정
  const [selectedCity, setSelectedCity] = useState<string>('');

  // stateProps가 변경되면 첫 번째 도시를 선택
  useEffect(() => {
    if (stateProps?.productScheduleData && cities.length > 0) {
      setSelectedCity(cities[0]);
    }
  }, [stateProps?.productScheduleData, cities]);

  // 도시 탭 변경 시 이미지 최상단으로 스크롤
  useEffect(() => {
    if (previewContentRef.current) {
      previewContentRef.current.scrollTop = 0;
    }
  }, [selectedCity]);

  // 선택된 도시의 정보
  const selectedCityInfo = React.useMemo(() => {
    return selectedCity ? cityInfoMap[selectedCity] : null;
  }, [selectedCity, cityInfoMap]);

  // 선택된 도시의 이미지 파싱
  useEffect(() => {
    if (selectedCityInfo) {
      // 소개 이미지 파싱
      try {
        const noticeImages = JSON.parse(selectedCityInfo.imageNamesNotice || '[]');
        setImageNotice(Array.isArray(noticeImages) ? noticeImages : []);
      } catch (e) {
        setImageNotice([]);
      }

      // 가이드투어 이미지 파싱
      try {
        const guideImages = JSON.parse(selectedCityInfo.imageNamesGuide || '[]');
        setImageGuide(Array.isArray(guideImages) ? guideImages : []);
      } catch (e) {
        setImageGuide([]);
      }

      // 입장/체험 이미지 파싱
      try {
        const entImages = JSON.parse(selectedCityInfo.imageNamesEnt || '[]');
        setImageEnt(Array.isArray(entImages) ? entImages : []);
      } catch (e) {
        setImageEnt([]);
      }

      // 경기/공연 이미지 파싱
      try {
        const eventImages = JSON.parse(selectedCityInfo.imageNamesEvent || '[]');
        setImageEvent(Array.isArray(eventImages) ? eventImages : []);
      } catch (e) {
        setImageEvent([]);
      }

      // 레스토랑/카페 이미지 파싱
      try {
        const cafeImages = JSON.parse(selectedCityInfo.imageNamesCafe || '[]');
        setImageCafe(Array.isArray(cafeImages) ? cafeImages : []);
      } catch (e) {
        setImageCafe([]);
      }
    } else {
      setImageNotice([]);
      setImageGuide([]);
      setImageEnt([]);
      setImageEvent([]);
      setImageCafe([]);
    }
  }, [selectedCityInfo]);

  // 이미지 탭 변경 시 스크롤 리셋
  useEffect(() => {
    if (previewContentRef.current) {
      previewContentRef.current.scrollTop = 0;
    }
  }, [cityImageTab]);

  // 상세일정 데이터 조회 (도시 기준)
  const fetchScheduleDetailList = React.useCallback(async () => {
    try {
      if (!selectedCity) {
        setScheduleDetailList([]);
        return;
      }

      setIsLoadingScheduleDetail(true);
      const response = await axios.post(`${AdminURL}/ceylontour/getdetailboxbycity`, { city: selectedCity });
      console.log('response', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setScheduleDetailList(response.data);
      } else {
        setScheduleDetailList([]);
      }
    } catch (error) {
      console.error('상세일정 데이터를 가져오는 중 오류 발생:', error);
      setScheduleDetailList([]);
    } finally {
      setIsLoadingScheduleDetail(false);
    }
  }, [selectedCity]);

  // 상세일정 데이터 로드
  useEffect(() => {
    if (selectedCity) {
      fetchScheduleDetailList();
    }
  }, [selectedCity, fetchScheduleDetailList]);

  // 상세일정 아이템 클릭 핸들러
  const handleScheduleDetailItemClick = (item: any) => {
    // 선택된 영역이 있는지 확인
    const addFunction = (window as any).__addDetailItemToSelectedLocation;
    if (addFunction && typeof addFunction === 'function') {
      addFunction(item);
    } else {
      alert('먼저 일정표에서 "변경" 버튼을 클릭하여 추가할 위치를 선택해주세요.');
    }
  };

  // 도시간 이동 교통 정보 렌더링 함수
  const renderTransportSection = () => {
    if (!stateProps?.productScheduleData) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          일정 데이터가 없습니다.
        </div>
      );
    }
    try {
      const scheduleData = JSON.parse(stateProps.productScheduleData);
      if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        return (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            일정 데이터가 없습니다.
          </div>
        );
      }

      // 시작 날짜 계산
      let startDate: Date | null = null;
      if (customerInfo.travelPeriod) {
        const travelPeriod = customerInfo.travelPeriod.trim();
        if (travelPeriod.includes('~')) {
          const parts = travelPeriod.split('~').map(part => part.trim());
          if (parts.length === 2) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(parts[0])) {
              startDate = new Date(parts[0]);
            }
          }
        } else {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(travelPeriod)) {
            startDate = new Date(travelPeriod);
          }
        }
      }
      
      // 시작 날짜가 없으면 현재 날짜 사용
      if (!startDate) {
        startDate = new Date();
      }

      let currentDate = new Date(startDate);

      return (
        <div className="transport-section">
          <div className="transport-header">
            <h3>도시간 이동 교통</h3>
          </div>
          <div className="transport-list">
            {scheduleData.map((item: any, index: number) => {
              const city = item.city || '';
              const dayNight = item.dayNight || '';
              const nights = dayNight ? parseInt(dayNight.replace(/[^0-9]/g, ''), 10) || 0 : 0;
              
              // 첫 번째 도시는 시작 날짜, 이후 도시는 이전 도시의 출발 날짜
              const arrivalDate = new Date(currentDate);
              const departureDate = new Date(currentDate);
              
              // 박수가 있으면 출발 날짜 계산
              if (nights > 0) {
                departureDate.setDate(departureDate.getDate() + nights);
              }
              
              const formatDate = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                const weekday = weekdays[date.getDay()];
                return `${year}-${month}-${day}(${weekday})`;
              };
              
              // 다음 도시의 도착 날짜는 현재 도시의 출발 날짜
              currentDate = new Date(departureDate);
              
              // 이동 수단 (API에서 가져오거나 기본값)
              const transportType = item.transportType || item.traffic || (index < scheduleData.length - 1 ? ['버스', '국내선', '기차'][index % 3] : '');
              const transportIcon = transportType === '버스' ? '🚌' : transportType === '국내선' ? '✈️' : transportType === '기차' ? '🚂' : '';
              
              // 도착/출발 시간 (API에서 가져오거나 기본값)
              const arrivalTime = item.arrivalTime || (index === 0 ? '17:00' : '11:00');
              const departureTime = item.departureTime || '09:00';
              
              return (
                <React.Fragment key={index}>
                  <div className="transport-city-card">
                    <div className="transport-city-header">
                      <div className="transport-city-name">{city}</div>
                      <div className="transport-city-nights">
                        <span className="nights-value">{nights}박</span>
                      </div>
                    </div>
                    <div className="transport-city-details">
                      <div className="transport-detail-row">
                        <span className="transport-label">도착</span>
                        <span className="transport-value arrival">{formatDate(arrivalDate)} {arrivalTime}</span>
                      </div>
                      <div className="transport-detail-row">
                        <span className="transport-label">출발</span>
                        <span className="transport-value departure">{formatDate(departureDate)} {departureTime}</span>
                      </div>
                    </div>
                  </div>
                  {index < scheduleData.length - 1 && (
                    <div className="transport-connector">
                      <div className="transport-line"></div>
                      <div className="transport-icon">{transportIcon}</div>
                      <div className="transport-type">{transportType}</div>
                      <div className="transport-line"></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="transport-footer" style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '20px',
            paddingTop: '20px'
          }}>
            <button 
              className="add-destination-btn"
              style={{
                padding: '8px 16px',
                border: '1px solid #333',
                borderRadius: '4px',
                backgroundColor: '#fff',
                color: '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              여행지 추가 +
            </button>
          </div>
        </div>
      );
    } catch (e) {
      console.error('일정 데이터 파싱 오류:', e);
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          일정 데이터를 불러올 수 없습니다.
        </div>
      );
    }
  };

  // 파일이 동영상인지 확인
  const isVideoFile = (fileName: string) => {
    if (!fileName) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
    const lowerFileName = fileName.toLowerCase();
    return videoExtensions.some(ext => lowerFileName.endsWith(ext));
  };

  // 현재 탭에 따른 이미지 리스트
  const getCurrentImages = () => {
    if (cityImageTab === 0) return imageNotice; // 소개
    if (cityImageTab === 1) return imageGuide; // 가이드투어
    if (cityImageTab === 2) return imageEnt; // 입장/체험
    if (cityImageTab === 3) return imageEvent; // 경기/공연
    return imageCafe; // 레스토랑/카페
  };

  const btnSolids = [
    { text: '소개' },
    { text: '가이드투어' },
    { text: '입장/체험' },
    { text: '경기/공연' },
    { text: '레스토랑/카페' }
  ];

  return (
    <div className="schedule-page">
      {/* 오른쪽 패널 토글 버튼 */}
      {!showRightPanel && (
        <button
          type="button"
          className="right-panel-toggle-btn"
          onClick={() => setShowRightPanel(true)}
        >
          <IoIosArrowBack />
        </button>
      )}

      {/* 메인 컨텐츠 */}
      <div className={`schedule-main ${showRightPanel ? 'with-right-panel' : 'without-right-panel'}`}>
        {/* 좌측 패널 - 도시 정보 */}
        <div className="left-panel">
          <div className="panel-content">
            {/* 패널 헤더 */}
            <div className="panel-header">
              <IoIosArrowBack
                className="arrow-back"
                onClick={() => navigate(-1)}
              />
              <h2>{stateProps?.productName} - {stateProps?.tourPeriodData?.periodNight} {stateProps?.tourPeriodData?.periodDay}</h2>
            </div>

            {/* 메인 탭 버튼들 */}
            <div className="main-tab-buttons" style={{ marginBottom: '20px' }}>
              <button 
                className={`btn-tap ${mainTab === '여행도시' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('여행도시');
                  setRightPanelSubTab('여행도시');
                }}
              >
                여행도시
              </button>
              <button 
                className={`btn-tap ${mainTab === '여행루트' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('여행루트');
                  setRightPanelSubTab('여행루트');
                }}
              >
                여행루트
              </button>
              <button 
                className={`btn-tap ${mainTab === '일정표' ? 'active' : ''}`}
                onClick={() => {
                  setMainTab('일정표');
                  setRightPanelSubTab('일정');
                }}
              >
                일정표
              </button>
            </div>

            {/* 탭별 콘텐츠 렌더링 */}
            {mainTab === '여행도시' && (
              <>
                {/* 도시 탭 버튼들 */}
                {cities.length > 0 && (
                  <div className="city-tab-buttons-left" style={{ marginBottom: '20px' }}>
                    {cities.map((city: string) => (
                      <button
                        key={city}
                        className={`city-tab-btn-left ${selectedCity === city ? 'active' : ''}`}
                        onClick={() => setSelectedCity(city)}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}

                {/* 이미지 탭 버튼들 */}
                <div className="room-container-wrapper" style={{ marginBottom: '20px' }}>
                  <div className="room-container-left">
                    {btnSolids.map(({ text }, index) => (
                      <button
                        key={text}
                        type="button"
                        className={`roomtabsort ${cityImageTab === index ? 'active' : ''}`}
                        onClick={() => setCityImageTab(index)}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="photo-gallery">
                  {(() => {
                    const images = getCurrentImages();
                    if (images && images.length > 0) {
                      return images.map((img: any, index: number) => {
                        const imageName = typeof img === 'string' ? img : img.imageName;
                        const title = typeof img === 'object' && img.title ? img.title : '';
                        const isVideo = isVideoFile(imageName);
                        
                        if (isVideo) {
                          return (
                            <div key={index} className="photo-main">
                              <video
                                className="photo-main-image"
                                controls
                                src={`${AdminURL}/images/cityimages/${imageName}`}
                              >
                                브라우저가 비디오 태그를 지원하지 않습니다.
                              </video>
                            </div>
                          );
                        }
                        
                        return (
                          <div key={index} className="photo-main">
                            <img
                              className="photo-main-image"
                              alt={title || `도시 이미지 ${index + 1}`}
                              src={`${AdminURL}/images/cityimages/${imageName}`}
                            />
                          </div>
                        );
                      });
                    }
                    return (
                      <div className="preview-no-image">
                        이미지가 없습니다
                      </div>
                    );
                  })()}
                </div>

                {/* 도시 위치 정보 */}
                {selectedCityInfo && (
                  <div className="location-info" style={{ marginTop: '40px' }}>
                    <div className="section-titlebox">
                      <span className="location-title">도시위치</span>
                    </div>
                    <p className="text-wrapper-10">
                      {selectedCityInfo.cityAddress || selectedCityInfo.address || ''}
                    </p>
                  </div>
                )}
              </>
            )}

            {mainTab === '여행루트' && (
              <div className="route-content">
                <img 
                  src={`${AdminURL}/images/tourmapinfo/${stateProps?.tourmapImage}`} 
                  alt="여행 루트" 
                  className="route-image"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px'
                  }}
                />
              </div>
            )}

            {mainTab === '일정표' && (
              <div style={{ marginTop: '20px', position: 'relative' }}>
                {showScheduleEdit ? (
                  <ScheduleRederCustom
                    id={scheduleProductId}
                    productInfo={stateProps}
                  />
                ) : (
                  <ScheduleRederBox 
                    id={scheduleProductId}
                    onSelectedScheduleChange={(schedule, index) => {
                      setSelectedSchedule(schedule);
                      setSelectedScheduleIndex(index);
                    }}
                  />
                )}
                <button 
                  onClick={() => {
                    setShowScheduleEdit(!showScheduleEdit);
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: '1px solid #333',
                    backgroundColor: '#333',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {showScheduleEdit ? '일정보기' : '일정수정하기'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 우측 패널 */}
        {showRightPanel && (
          <div className="right-panel-wrapper">
          <div className="right-panel">
            {/* 닫기 버튼 */}
            <button
              type="button"
              className="right-panel-close-btn"
              onClick={() => setShowRightPanel(false)}
            >
              <IoMdClose />
            </button>
            
            <div className="panel-content">
              {/* 최상단 탭: 예약하기 / 수정하기 */}
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
                marginBottom: '20px'
              }}>
                <button
                  type="button"
                  onClick={() => setRightPanelTopTab('예약하기')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: '1px solid #333',
                    backgroundColor: rightPanelTopTab === '예약하기' ? '#333' : '#fff',
                    color: rightPanelTopTab === '예약하기' ? '#fff' : '#333',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  예약하기
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanelTopTab('수정하기')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    border: '1px solid #ddd',
                    backgroundColor: rightPanelTopTab === '수정하기' ? '#333' : '#fff',
                    color: rightPanelTopTab === '수정하기' ? '#fff' : '#333',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                >
                  수정하기
                </button>
              </div>

              {/* 하위 탭: 여행도시 / 여행루트 / 일정 / 예약정보 */}
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px'
              }}>
                {['예약정보','여행도시', '여행루트', '일정'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setRightPanelSubTab(tab as typeof rightPanelSubTab);
                      // 우측 패널 탭이 변경되면 좌측 패널 탭도 업데이트 (예약정보 제외)
                      if (tab === '여행도시') {
                        setMainTab('여행도시');
                      } else if (tab === '여행루트') {
                        setMainTab('여행루트');
                      } else if (tab === '일정') {
                        setMainTab('일정표');
                      }
                      // 예약정보 탭은 좌측 패널 탭 변경 없음
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      backgroundColor: rightPanelSubTab === tab ? '#333' : '#fff',
                      color: rightPanelSubTab === tab ? '#fff' : '#666',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* 탭별 컨텐츠 */}
              {rightPanelSubTab === '여행도시' && (
                <div style={{ marginTop: '20px' }}>
                  <div className="selected-cities-section" style={{ marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>여행 도시</h3>
                    {citiesWithInfo.length === 0 ? (
                      <div className="no-selected-cities" style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#999',
                        border: '1px dashed #e0e0e0',
                        borderRadius: '4px'
                      }}>여행 도시가 없습니다</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {citiesWithInfo.map((cityInfo, index) => (
                          <div key={index} className="selected-city-card" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '20px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '10px',
                            boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)'
                          }}>
                            <span className="city-name" style={{ fontSize: '14px', fontWeight: 500 }}>{cityInfo.city}</span>
                            <span className="travel-period" style={{ fontSize: '14px', color: '#666', flex: 1, textAlign: 'center' }}>{cityInfo.travelPeriod}</span>
                            <span className="nights" style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>{cityInfo.nights}박</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}


              {rightPanelSubTab === '여행루트' && (
                <div style={{ marginTop: '20px' }}>
                  <div className="selected-cities-section" style={{ marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>여행 루트</h3>
                    {(() => {
                      if (!stateProps?.productScheduleData) {
                        return (
                          <div className="no-selected-cities" style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: '#999',
                            border: '1px dashed #e0e0e0',
                            borderRadius: '4px'
                          }}>여행 도시가 없습니다</div>
                        );
                      }
                      try {
                        const scheduleData = JSON.parse(stateProps.productScheduleData);
                        if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
                          return (
                            <div className="no-selected-cities" style={{
                              padding: '40px',
                              textAlign: 'center',
                              color: '#999',
                              border: '1px dashed #e0e0e0',
                              borderRadius: '4px'
                            }}>여행 도시가 없습니다</div>
                          );
                        }

                        // 시작 날짜 계산
                        let startDate: Date | null = null;
                        if (customerInfo.travelPeriod) {
                          const travelPeriod = customerInfo.travelPeriod.trim();
                          if (travelPeriod.includes('~')) {
                            const parts = travelPeriod.split('~').map(part => part.trim());
                            if (parts.length === 2) {
                              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                              if (dateRegex.test(parts[0])) {
                                startDate = new Date(parts[0]);
                              }
                            }
                          } else {
                            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                            if (dateRegex.test(travelPeriod)) {
                              startDate = new Date(travelPeriod);
                            }
                          }
                        }
                        
                        if (!startDate) {
                          startDate = new Date();
                        }

                        let currentDate = new Date(startDate);

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {scheduleData.map((item: any, index: number) => {
                              const city = item.city || '';
                              const dayNight = item.dayNight || '';
                              const nights = dayNight ? parseInt(dayNight.replace(/[^0-9]/g, ''), 10) || 0 : 0;
                              
                              const arrivalDate = new Date(currentDate);
                              const departureDate = new Date(currentDate);
                              
                              if (nights > 0) {
                                departureDate.setDate(departureDate.getDate() + nights);
                              }
                              
                              const formatDate = (date: Date) => {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                                const weekday = weekdays[date.getDay()];
                                return `${year}-${month}-${day}(${weekday})`;
                              };
                              
                              currentDate = new Date(departureDate);
                              
                              const arrivalTime = item.arrivalTime || (index === 0 ? '17:00' : '11:00');
                              const departureTime = item.departureTime || '09:00';
                              
                              // 이동 수단
                              const transportType = item.transportType || item.traffic || (index < scheduleData.length - 1 ? ['버스', '국내선', '기차'][index % 3] : '');
                              const transportIcon = transportType === '버스' ? '🚌' : transportType === '국내선' ? '✈️' : transportType === '기차' ? '🚂' : '';

                              return (
                                <React.Fragment key={index}>
                                  <div className="selected-city-card" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px 20px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    marginBottom: index < scheduleData.length - 1 ? '0' : '0'
                                  }}>
                                    <span className="city-name" style={{ fontSize: '14px', fontWeight: 500, minWidth: '80px' }}>{city}</span>
                                    <span className="nights" style={{ fontSize: '14px', fontWeight: 500, color: '#333', minWidth: '40px' }}>{nights}박</span>
                                    <span className="arrival-time" style={{ fontSize: '14px', color: '#666', minWidth: '120px' }}>{formatDate(arrivalDate)} {arrivalTime}</span>
                                    <span className="departure-time" style={{ fontSize: '14px', color: '#666', minWidth: '120px', textAlign: 'right' }}>{formatDate(departureDate)} {departureTime}</span>
                                  </div>
                                  {index < scheduleData.length - 1 && (
                                    <div className="transport-connector" style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      margin: '12px 0',
                                      padding: '0 24px'
                                    }}>
                                      <div style={{
                                        flex: 1,
                                        height: 0,
                                        borderTop: '2px dashed #ccc'
                                      }}></div>
                                      <div style={{
                                        fontSize: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '44px',
                                        height: '44px',
                                        backgroundColor: '#fff',
                                        borderRadius: '50%',
                                        border: '1px solid #ddd',
                                        flexShrink: 0
                                      }}>{transportIcon}</div>
                                      <div style={{
                                        fontSize: '13px',
                                        color: '#333',
                                        padding: '6px 12px',
                                        backgroundColor: '#f5f5f5',
                                        borderRadius: '8px',
                                        whiteSpace: 'nowrap',
                                        fontWeight: 400
                                      }}>{transportType}</div>
                                      <div style={{
                                        flex: 1,
                                        height: 0,
                                        borderTop: '2px dashed #ccc'
                                      }}></div>
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        );
                      } catch (e) {
                        console.error('일정 데이터 파싱 오류:', e);
                        return (
                          <div className="no-selected-cities" style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: '#999',
                            border: '1px dashed #e0e0e0',
                            borderRadius: '4px'
                          }}>여행 도시가 없습니다</div>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}

              {rightPanelSubTab === '일정' && (
                <>
                  {/* 도시 탭 버튼들 */}
                  {cities.length > 0 && (
                    <div className="city-tab-buttons" style={{ marginBottom: '20px' }}>
                      {cities.map((city: string) => (
                        <button
                          key={city}
                          className={`city-tab-btn ${selectedCity === city ? 'active' : ''}`}
                          onClick={() => setSelectedCity(city)}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 상세일정 그리드 */}
                  <div className="schedule-summary-content" style={{ marginTop: '20px' }}>
                    <div className="summary-card">
                      <div className="summary-header">
                        <div className="summary-sub-tabs" style={{
                          display: 'flex',
                          gap: '12px',
                          marginTop: '12px',
                          flexWrap: 'wrap'
                        }}>
                          {['전체','호텔베네핏','익스커션','강습/클래스','스파마사지','식사/다이닝','바/클럽','스냅촬영','차량/가이드','편의사항','기타'].map(label => (
                            <span
                              key={label}
                              className={`sub-tab ${summarySubTab === label ? 'active' : ''}`}
                              onClick={() => setSummarySubTab(label as typeof summarySubTab)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '4px',
                                backgroundColor: summarySubTab === label ? '#333' : '#f5f5f5',
                                color: summarySubTab === label ? '#fff' : '#666',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>
                              <span style={{ fontSize: '14px' }}>
                                {tabCounts[label] || 0}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="summary-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '16px',
                        marginTop: '20px'
                      }}>
                        {isLoadingScheduleDetail ? (
                          <div style={{ padding: '40px', textAlign: 'center', color: '#888', gridColumn: '1 / -1' }}>
                            로딩 중...
                          </div>
                        ) : filteredScheduleDetailList.length === 0 ? (
                          <div style={{ padding: '40px', textAlign: 'center', color: '#888', gridColumn: '1 / -1' }}>
                            상세일정이 없습니다.
                          </div>
                        ) : (
                          filteredScheduleDetailList.map((item: any) => {
                            // inputImage가 JSON 배열 문자열인 경우 파싱
                            let imageUrl = scheduleImg1; // 기본 이미지
                            if (item.inputImage) {
                              try {
                                const imageArray = JSON.parse(item.inputImage);
                                if (Array.isArray(imageArray) && imageArray.length > 0) {
                                  imageUrl = `${AdminURL}/images/scheduledetailboximages/${imageArray[0]}`;
                                }
                              } catch (e) {
                                // 파싱 실패 시 기본 이미지 사용
                                console.error('이미지 파싱 오류:', e);
                              }
                            }
                            
                            return (
                              <div
                                key={item.id}
                                className="summary-item"
                                style={{
                                  border: '1px solid #e0e0e0',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onClick={() => handleScheduleDetailItemClick(item)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#5fb7ef';
                                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(95, 183, 239, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = '#e0e0e0';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <img className="summary-item-image" alt={item.productName || '상세일정'} src={imageUrl} style={{
                                  width: '100%',
                                  height: '150px',
                                  objectFit: 'cover'
                                }} />
                                <div className="summary-item-content" style={{ padding: '12px' }}>
                                  <p className="summary-item-title" style={{
                                    margin: '0 0 8px 0',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: '#333',
                                    lineHeight: '1.4'
                                  }}>
                                    {item.productName || '-'}
                                  </p>
                                  <div className="summary-item-rating" style={{
                                    marginBottom: '8px',
                                    fontSize: '13px',
                                    color: '#ff6b00'
                                  }}>★ {item.scores || '5.0'}</div>
                                  <div className="summary-item-price-row" style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '4px'
                                  }}>
                                    <span className="summary-item-price" style={{
                                      fontSize: '16px',
                                      fontWeight: 'bold',
                                      color: '#333'
                                    }}>가격 문의</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}


              {rightPanelSubTab === '예약정보' && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* 성명 */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333'
                      }}>
                        성명 *
                      </label>
                      <input
                        type="text"
                        value={reservationForm.name}
                        onChange={(e) => setReservationForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="성명을 입력하세요"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* 여행형태 */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333'
                      }}>
                        여행형태 *
                      </label>
                      <input
                        type="text"
                        value={reservationForm.travelType}
                        onChange={(e) => setReservationForm(prev => ({ ...prev, travelType: e.target.value }))}
                        placeholder="여행형태를 입력하세요"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* 상품명 */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333'
                      }}>
                        상품명 *
                      </label>
                      <input
                        type="text"
                        value={reservationForm.productName}
                        onChange={(e) => setReservationForm(prev => ({ ...prev, productName: e.target.value }))}
                        placeholder="상품명을 입력하세요"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* 여행기간 */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333'
                      }}>
                        여행기간 *
                      </label>
                      <input
                        type="text"
                        value={reservationForm.travelPeriod}
                        onChange={(e) => setReservationForm(prev => ({ ...prev, travelPeriod: e.target.value }))}
                        placeholder="여행기간을 입력하세요 (예: 2024-01-01 ~ 2024-01-05)"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* 이용항공 */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333'
                      }}>
                        이용항공 *
                      </label>
                      <input
                        type="text"
                        value={reservationForm.airline}
                        onChange={(e) => setReservationForm(prev => ({ ...prev, airline: e.target.value }))}
                        placeholder="이용항공을 입력하세요"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* 이용호텔 */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333'
                      }}>
                        이용호텔 *
                      </label>
                      <input
                        type="text"
                        value={reservationForm.hotel}
                        onChange={(e) => setReservationForm(prev => ({ ...prev, hotel: e.target.value }))}
                        placeholder="이용호텔을 입력하세요"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* 1인상품가 */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333'
                      }}>
                        1인상품가 *
                      </label>
                      <input
                        type="text"
                        value={reservationForm.pricePerPerson}
                        onChange={(e) => setReservationForm(prev => ({ ...prev, pricePerPerson: e.target.value }))}
                        placeholder="1인상품가를 입력하세요 (예: 1,500,000)"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* 총요금 */}
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#333'
                      }}>
                        총요금 *
                      </label>
                      <input
                        type="text"
                        value={reservationForm.totalPrice}
                        onChange={(e) => setReservationForm(prev => ({ ...prev, totalPrice: e.target.value }))}
                        placeholder="총요금을 입력하세요 (예: 3,000,000)"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 하단 버튼 */}
          <div className="cost-schedule-btn-wrapper">
            <button className="cost-schedule-btn"
              onClick={() => {
                if (!selectedSchedule) {
                  alert('일정을 선택해주세요.');
                  return;
                }

                // 선택된 일정의 정보 추출
                const airlineData = selectedSchedule.airlineData;
                const scheduleDetailData = selectedSchedule.scheduleDetailData || [];

                setSelectedScheduleData({
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
                  scheduleDetails: {
                    airlineData: airlineData,
                    scheduleList: [selectedSchedule],
                    selectedIndex: selectedScheduleIndex
                  },
                  selectedSchedule: selectedSchedule,
                  selectedItems: [],
                  totalPrice: 0,
                  guestCount: 2
                });
                alert('일정이 담겼습니다.');
              }}
            >일정담기</button>
            <button className="cost-schedule-btn"
              onClick={() => {
                navigate('/counsel/europe/hotel', { state: stateProps });
                window.scrollTo(0, 0);
              }}
            >호텔바로가기</button>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EuropeScheduleRecommend;
