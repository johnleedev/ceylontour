import React, { useState, useEffect } from 'react';
import './EuropeTripPage.scss';
import { AdminURL } from '../../../../MainURL';
import { useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt } from 'react-icons/fa';
import Image_bali from '../../../lastimages/counselrest/trip/image.png';
import Image_phuket from '../../../lastimages/counselrest/trip/image-1.png';
import Image_guam from '../../../lastimages/counselrest/trip/image-2.png';
import Image_maldives from '../../../lastimages/counselrest/trip/image-3.png';
import Image_morisus from '../../../lastimages/counselrest/trip/mapimage.png';
import WorldMapImage from '../../../images/counsel/worldmap.jpg';
import axios from 'axios';


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

interface ScheduleItem {
  id: number;
  nation: string[];
  tourPeriodData: {
    periodNight: string;
    periodDay: string;
  };
  productName: string;
  tourmapImage?: string;
  productScheduleData?: string;
}


export default function EuropeTripPage () {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedNation, setSelectedNation] = useState<string | null>(null);
  const [selectedNationData, setSelectedNationData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'product' | 'highlight' | 'entry'>('info');
  const [isSingleCity, setIsSingleCity] = useState(true);
  const [isMultiCity, setIsMultiCity] = useState(false);
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<'recommend' | 'create'>('recommend');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [scheduleDataMap, setScheduleDataMap] = useState<{ [key: string]: any }>({}); // 국가명을 키로 하는 스케줄 데이터 맵
  const [scheduleFilter, setScheduleFilter] = useState('전체');
  const [scheduleSearch, setScheduleSearch] = useState('');
  
  // 일정만들기 모드용 상태
  const [selectedCities, setSelectedCities] = useState<{ [key: string]: string[] }>({}); // 국가명: [도시명들]
  const [createScheduleDays, setCreateScheduleDays] = useState(1);
  const [regionFilter, setRegionFilter] = useState('전체');
  
  const highlightItems = [
    { id: 1, title: '포토스팟에서 인생샷', image: Image_bali },
    { id: 2, title: '일출보기 투어', image: Image_phuket },
    { id: 3, title: '우붓 명소 맞춤 투어', image: Image_guam },
    { id: 4, title: '우붓 정글탐험', image: Image_maldives },
  ];

   const fetchDestinations = async () => {
    try {
      setLoading(true);
      
      // 두 개의 API를 병렬로 호출
      const locationType = '유럽';
      const [scheduleResponse, nationResponse] = await Promise.all([
        fetch(`${AdminURL}/ceylontour/getschedulelisttour/${locationType}`),
        fetch(`${AdminURL}/ceylontour/getnationlisttour/${locationType}`)
      ]);
      
      if (!scheduleResponse.ok || !nationResponse.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다.');
      }
      
      const scheduleData = await scheduleResponse.json();
      const nationData = await nationResponse.json();
     
      // schedule 데이터를 국가명을 키로 하는 맵으로 저장
      const scheduleMap: { [key: string]: any } = {};
      if (Array.isArray(scheduleData)) {
        scheduleData.forEach((item: any) => {
          if (item.isView === 'true' && item.nationKo && item.schedule && Array.isArray(item.schedule) && item.schedule.length > 0) {
            scheduleMap[item.nationKo] = item;
          }
        });
      }
      setScheduleDataMap(scheduleMap);

      // nation 데이터를 Destination 형식으로 변환 (초기 리스트용)
      const nationDestinations: Destination[] = Array.isArray(nationData) 
        ? nationData
            .filter((nation: any) => {
              // isView가 'true'인 국가만 필터링
              return nation.isView === 'true';
            })
            .map((nation: any) => {
              // 국가의 inputImage 사용
              let imageUrl = require('../../../lastimages/nations/img_aus.png'); // 기본 이미지
              try {
                const nationImages = JSON.parse(nation.inputImage || '[]');
                if (Array.isArray(nationImages) && nationImages.length > 0 && nationImages[0]) {
                  imageUrl = nationImages[0];
                }
              } catch (e) {
                // 파싱 실패 시 기본 이미지 사용
              }

              // 비행시간 기본값
              let airTime = '7시간 30분'; // 기본값
              if (nation.cities && Array.isArray(nation.cities) && nation.cities.length > 0) {
                try {
                  const firstCity = nation.cities[0];
                  const trafficCode = JSON.parse(firstCity.trafficCode || '{}');
                  if (trafficCode.airplane && Array.isArray(trafficCode.airplane) && trafficCode.airplane.length > 0) {
                    // 비행시간 정보가 있다면 사용
                  }
                } catch (e) {
                  // 파싱 실패 시 기본값 사용
                }
              }

              // 국가 정보를 rawData로 저장 (필드명 매핑 포함)
              const nationDataObj = {
                ...nation,
                // 필드명 매핑 (기존 코드와 호환)
                timeDifference: nation.timeDiff,
                precautions: nation.caution,
                // cities 정보도 포함
                cities: nation.cities || [],
              };

              return {
                id: String(nation.id),
                name: nation.nationKo || '',
                image: imageUrl,
                selected: false,
                departure: ['인천', '김포'], // API에 없으므로 기본값
                airTime: airTime,
                scheduleCount: scheduleMap[nation.nationKo]?.schedule?.length || 0, // schedule 데이터에서 개수 가져오기
                rawData: nationDataObj // 국가 정보 저장
              };
            })
        : [];
      
      // 가나다순 정렬
      const sortedDestinations = nationDestinations.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
      
      setDestinations(sortedDestinations);
    } catch (error) {
      console.error('나라 리스트를 가져오는 중 오류 발생:', error);
      // 에러 발생 시 빈 배열 설정
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // schedule 데이터 파싱 및 그룹화
  const getGroupedSchedules = () => {
    if (!selectedNation) return {};
    
    // scheduleDataMap에서 선택된 국가의 스케줄 데이터 가져오기
    const scheduleData = scheduleDataMap[selectedNation];
    if (!scheduleData || !scheduleData.schedule || !Array.isArray(scheduleData.schedule)) {
      return {};
    }

    const schedules: ScheduleItem[] = scheduleData.schedule.map((item: any) => {
      let nations: string[] = [];
      try {
        nations = JSON.parse(item.nation || '[]');
      } catch (e) {
        nations = [];
      }

      let periodData = { periodNight: '', periodDay: '' };
      try {
        periodData = JSON.parse(item.tourPeriodData || '{}');
      } catch (e) {
        periodData = { periodNight: '', periodDay: '' };
      }

      return {
        id: item.id || 0,
        nation: nations,
        tourPeriodData: periodData,
        tourmapImage: item.tourmapImage || '',
        productScheduleData: item.productScheduleData || '',
        productName: item.productName || ''
      };
    });

    // 필터링
    let filtered = schedules;
    
    // 검색 필터
    if (scheduleSearch.trim()) {
      filtered = filtered.filter(s => 
        s.productName.toLowerCase().includes(scheduleSearch.toLowerCase())
      );
    }

    // 탭 필터
    if (!selectedNation) return {};
    
    if (scheduleFilter.includes('온니')) {
      filtered = filtered.filter(s => s.nation.length === 1 && s.nation[0] === selectedNation);
    } else if (scheduleFilter.includes('외 1개국')) {
      filtered = filtered.filter(s => s.nation.length === 2 && s.nation.includes(selectedNation));
    } else if (scheduleFilter.includes('외 2개국')) {
      filtered = filtered.filter(s => s.nation.length === 3 && s.nation.includes(selectedNation));
    } else if (scheduleFilter.includes('외 3개국')) {
      filtered = filtered.filter(s => s.nation.length === 4 && s.nation.includes(selectedNation));
    }

    // 그룹화 (nation 배열을 기준으로)
    const grouped: { [key: string]: ScheduleItem[] } = {};
    filtered.forEach(schedule => {
      const key = schedule.nation.join(' + ');
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(schedule);
    });

    return grouped;
  };

  console.log('selectedNationData', selectedNationData);

  return (
    <div className="trip-page-wrapper">
      <div className={`trip-container ${selectedNation ? 'detail-open' : ''}`}>
        {/* 왼쪽 영역: 헤더 + 나라 리스트 */}
        <div className="left-section">
          {/* 헤더 영역 */}
          <div className="trip-header">
            <button 
              className={`btn-tap ${activeButton === 'recommend' ? 'active' : ''}`}
              onClick={() => {
                setActiveButton('recommend');
                setSelectedNation(null);
                setSelectedNationData(null);
                setSelectedCities({});
              }}
            >
              추천일정
            </button>
            <button
              type="button"
              className="worldmap-button"
              onClick={() => setIsWorldMapOpen(true)}
            >
              세계지도 보기
            </button>
          </div>

          {/* 나라 리스트 */}
          {activeButton === 'recommend' && (
            <div className="nation-list-section">
              <div className="nation-grid">
                {loading ? (
                  <div className="loading-message">로딩 중...</div>
                ) : destinations.length === 0 ? (
                  <div className="empty-message">데이터가 없습니다.</div>
                ) : (
                  destinations.map((city) => (
                    <div 
                      key={city.id} 
                      className={`nation-card ${selectedNation === city.name ? 'selected' : ''}`}
                      onClick={() => {
                        console.log(city.rawData);
                        if (selectedNation === city.name) {
                          setSelectedNation(null);
                          setSelectedNationData(null);
                        } else {
                          setSelectedNation(city.name);
                          setSelectedNationData(city.rawData);
                          console.log('city.rawData', city.rawData);
                          setActiveTab('info'); // 기본정보 탭 자동 선택
                        }
                      }}
                    >
                      <div className="nation-image-container">
                        <img className="image" alt={city.name} src={`${AdminURL}/images/nationimages/${city.image}`} />
                      </div>
                      <div className="nation-info">
                        <div className='nation-name'>{city.name}</div>
                        <p className='nation-airTime'>
                          <span className="text-wrapper-airtime-label">비행시간 약 </span>
                          <span className="text-wrapper-airtime-value">{city.airTime}</span>
                        </p>
                        <div className='nation-departure'>인천출발ㅣ부산출발</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 일정만들기 모드: 여행지 선택 */}
          {activeButton === 'create' && (
            <div className="create-mode-content">
              {/* 지역 필터 탭 */}
              <div className="region-tabs" style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                padding: '0 20px'
              }}>
                {['전체', '서유럽', '동유럽', '북유럽'].map((region) => (
                  <button
                    key={region}
                    className={`region-tab ${regionFilter === region ? 'active' : ''}`}
                    onClick={() => setRegionFilter(region)}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      backgroundColor: regionFilter === region ? '#333' : '#fff',
                      color: regionFilter === region ? '#fff' : '#666',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      transition: 'all 0.2s'
                    }}
                  >
                    {region}
                  </button>
                ))}
              </div>

              {/* 여행지 카드 그리드 */}
              <div className="create-destinations-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
                padding: '0 20px'
              }}>
                {loading ? (
                  <div className="loading-message" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center' }}>로딩 중...</div>
                ) : destinations.length === 0 ? (
                  <div className="empty-message" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center' }}>데이터가 없습니다.</div>
                ) : (
                  destinations.map((destination) => {
                    // 도시 목록 (rawData에서 cities 정보 가져오기)
                    const cities: string[] = [];
                    if (destination.rawData?.cities && Array.isArray(destination.rawData.cities)) {
                      destination.rawData.cities.forEach((city: any) => {
                        if (city.cityName) {
                          cities.push(city.cityName);
                        }
                      });
                    }
                    // 도시 정보가 없으면 기본값 사용
                    if (cities.length === 0) {
                      cities.push('파리', '베르사이유', '니스');
                    }
                    const selectedCitiesForCountry = selectedCities[destination.name] || [];

                    return (
                      <div key={destination.id} className="create-destination-card" style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <div className="create-card-image" style={{
                          width: '100%',
                          height: '150px',
                          overflow: 'hidden'
                        }}>
                          <img 
                            src={`${AdminURL}/images/nationimages/${destination.image}`} 
                            alt={destination.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                        <div className="create-card-content" style={{ padding: '12px' }}>
                          <h3 className="create-card-country" style={{
                            margin: '0 0 12px 0',
                            fontSize: '16px',
                            fontWeight: 700
                          }}>{destination.name}</h3>
                          <div className="create-card-cities" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            {cities.map((city, index) => {
                              const isChecked = selectedCitiesForCountry.includes(city);
                              return (
                                <label key={index} className="city-checkbox-label" style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer'
                                }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const newSelectedCities = { ...selectedCities };
                                      if (!newSelectedCities[destination.name]) {
                                        newSelectedCities[destination.name] = [];
                                      }
                                      if (e.target.checked) {
                                        newSelectedCities[destination.name] = [
                                          ...newSelectedCities[destination.name],
                                          city
                                        ];
                                      } else {
                                        newSelectedCities[destination.name] = newSelectedCities[destination.name].filter(c => c !== city);
                                      }
                                      setSelectedCities(newSelectedCities);
                                    }}
                                  />
                                  <span className="city-name" style={{ fontSize: '14px' }}>{city}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽 영역: 상세 정보 (추천일정 모드) */}
        {activeButton === 'recommend' && selectedNation && (
          <div className="right-section">
            <div className="detail-section">
          <div className="detail-card">
            <div className="detail-header">
              <h2 className="detail-title">{selectedNationData?.nationKo || selectedNation || '국가 정보'}</h2>
              <div className="detail-subtitle">{selectedNationData?.nationEn || ''}</div>
            </div>

            <div className="detail-tabs">
              <div className="tab-container">
                <div className="tab-left">
                  <button
                    type="button"
                    className={`tab-button text-wrapper-tab-info ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                  >
                    기본정보
                  </button>
                 
                  <button
                    type="button"
                    className={`tab-button text-wrapper-tab-entry ${activeTab === 'entry' ? 'active' : ''}`}
                    onClick={() => setActiveTab('entry')}
                  >
                    입출국 안내
                  </button>
                </div>
                <div className="tab-right">
                  <button
                    type="button"
                    className="tab-map-button"
                    onClick={() => setActiveTab('product')}
                  >
                    여행상품
                  </button>
                  <button
                    type="button"
                    className="tab-map-button"
                    onClick={() => navigate(`/counsel/europe/city`, { state : {cityData: selectedNationData.cities}})}
                  >
                    도시보기
                  </button>
                </div>
              </div>
            </div>

            <div className="detail-content">
              {activeTab === 'info' && (
                <>
                  <div className="detail-main-image">
                   <img className="image-detail-main" alt={selectedNation || 'Image'} src={`${AdminURL}/images/nationcustomimage/${selectedNationData.noticeImage}`} />
                  </div>
                  <div className="detail-info-grid">
                    {(() => {
                      // timezoneInfo 파싱
                      try {
                        const timezoneInfo = selectedNationData?.timezoneInfo ? JSON.parse(selectedNationData.timezoneInfo) : null;
                        if (timezoneInfo?.timeDifference) {
                          return (
                            <div className="info-item">
                              <div className="info-label">시차</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="info-value">
                                  <span className="info-strong">{timezoneInfo.timeDifference}</span>
                                </div>
                                {timezoneInfo.description && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {timezoneInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // visaInfo 파싱
                      try {
                        const visaInfo = selectedNationData?.visaInfo ? JSON.parse(selectedNationData.visaInfo) : null;
                        if (visaInfo?.info) {
                          return (
                            <div className="info-item">
                              <div className="info-label">비자</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="info-value">
                                  {visaInfo.info}
                                </div>
                                {visaInfo.description && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {visaInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // languageInfo 파싱
                      try {
                        const languageInfo = selectedNationData?.languageInfo ? JSON.parse(selectedNationData.languageInfo) : null;
                        if (languageInfo?.languages && Array.isArray(languageInfo.languages) && languageInfo.languages.length > 0) {
                          return (
                            <div className="info-item">
                              <div className="info-label">언어</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="info-value">{languageInfo.languages.join(', ')}</div>
                                {languageInfo.description && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {languageInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // additionalInfo에서 로밍 정보 파싱
                      try {
                        const additionalInfo = selectedNationData?.additionalInfo ? JSON.parse(selectedNationData.additionalInfo) : null;
                        if (additionalInfo?.휴대폰 && Array.isArray(additionalInfo.휴대폰) && additionalInfo.휴대폰.length > 0) {
                          return (
                            <div className="info-item">
                              <div className="info-label">로밍</div>
                              <div className="info-value">
                                {additionalInfo.휴대폰[0]}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // exrateInfo 파싱
                      try {
                        const exrateInfo = selectedNationData?.exrateInfo ? JSON.parse(selectedNationData.exrateInfo) : null;
                        if (exrateInfo?.exchangeRate) {
                          return (
                            <div className="info-item">
                              <div className="info-label">화폐</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="info-value">
                                  {exrateInfo.exchangeRate}
                                </div>
                                {exrateInfo.description && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {exrateInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // tipInfo 파싱
                      try {
                        const tipInfo = selectedNationData?.tipInfo ? JSON.parse(selectedNationData.tipInfo) : null;
                        if (tipInfo?.info) {
                          return (
                            <div className="info-item">
                              <div className="info-label">팁매너</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="info-value">
                                  {tipInfo.info}
                                </div>
                                {tipInfo.description && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {tipInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // plugInfo 파싱
                      try {
                        const plugInfo = selectedNationData?.plugInfo ? JSON.parse(selectedNationData.plugInfo) : null;
                        if (plugInfo?.voltage) {
                          return (
                            <div className="info-item">
                              <div className="info-label">전압</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="info-value">{plugInfo.voltage}</div>
                                {plugInfo.description && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {plugInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // priceInfo 파싱
                      try {
                        const priceInfo = selectedNationData?.priceInfo ? JSON.parse(selectedNationData.priceInfo) : null;
                        if (priceInfo?.priceLevel) {
                          return (
                            <div className="info-item">
                              <div className="info-label">물가</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div className="info-value">
                                  {priceInfo.priceLevel}
                                </div>
                                {priceInfo.description && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {priceInfo.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}

                    {(() => {
                      // weatherInfo 파싱
                      try {
                        const weatherInfo = selectedNationData?.weatherInfo ? JSON.parse(selectedNationData.weatherInfo) : null;
                        if (weatherInfo && (weatherInfo.minTemp || weatherInfo.maxTemp || (weatherInfo.details && Array.isArray(weatherInfo.details) && weatherInfo.details.length > 0))) {
                          return (
                            <div className="info-item">
                              <div className="info-label">날씨</div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                {(weatherInfo.minTemp || weatherInfo.maxTemp) && (
                                  <div className="info-value">
                                    최저 : {weatherInfo.minTemp || '-'}, 최고 : {weatherInfo.maxTemp || '-'}
                                  </div>
                                )}
                                {weatherInfo.details && Array.isArray(weatherInfo.details) && weatherInfo.details.length > 0 && (
                                  <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
                                    {weatherInfo.details.map((line: string, index: number) => (
                                      <React.Fragment key={index}>
                                        {line}
                                        {index < weatherInfo.details.length - 1 && <br />}
                                      </React.Fragment>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}


                    {(() => {
                      // caution 또는 additionalInfo에서 주의사항 파싱
                      if (selectedNationData?.caution && selectedNationData.caution.trim() !== '') {
                        return (
                          <div className="info-item">
                            <div className="info-label">주의사항</div>
                            <div className="info-multiline">
                              {selectedNationData.caution.split('\n').map((line: string, index: number) => (
                                <p key={index} className="info-text">{line}</p>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {(() => {
                      // additionalInfo 파싱
                      try {
                        const additionalInfo = selectedNationData?.additionalInfo ? JSON.parse(selectedNationData.additionalInfo) : null;
                        if (!additionalInfo) return null;

                        const sections: Array<{ title: string; content: string[] }> = [];

                        // 영업시간
                        if (additionalInfo.businessHours && Array.isArray(additionalInfo.businessHours) && additionalInfo.businessHours.length > 0) {
                          sections.push({ title: '영업시간', content: additionalInfo.businessHours });
                        }

                        // 가격 정보
                        if (additionalInfo.prices && Array.isArray(additionalInfo.prices) && additionalInfo.prices.length > 0) {
                          sections.push({ title: '가격 정보', content: additionalInfo.prices });
                        }

                        // 물
                        if (additionalInfo.물 && Array.isArray(additionalInfo.물) && additionalInfo.물.length > 0) {
                          sections.push({ title: '물', content: additionalInfo.물 });
                        }

                        // 인터넷 사용
                        if (additionalInfo['인터넷 사용'] && Array.isArray(additionalInfo['인터넷 사용']) && additionalInfo['인터넷 사용'].length > 0) {
                          sections.push({ title: '인터넷 사용', content: additionalInfo['인터넷 사용'] });
                        }

                        // 전화 사용
                        if (additionalInfo.phone && Array.isArray(additionalInfo.phone) && additionalInfo.phone.length > 0) {
                          sections.push({ title: '전화 사용', content: additionalInfo.phone });
                        }

                        // 우편
                        if (additionalInfo.우편 && Array.isArray(additionalInfo.우편) && additionalInfo.우편.length > 0) {
                          sections.push({ title: '우편', content: additionalInfo.우편 });
                        }

                        // ATM
                        if (additionalInfo.atm && Array.isArray(additionalInfo.atm) && additionalInfo.atm.length > 0) {
                          sections.push({ title: 'ATM', content: additionalInfo.atm });
                        }

                        // 카드/현금 사용
                        if (additionalInfo.cardCashUsage && Array.isArray(additionalInfo.cardCashUsage) && additionalInfo.cardCashUsage.length > 0) {
                          sections.push({ title: '카드/현금 사용', content: additionalInfo.cardCashUsage });
                        }

                        // 화장실
                        if (additionalInfo.restroom && Array.isArray(additionalInfo.restroom) && additionalInfo.restroom.length > 0) {
                          sections.push({ title: '화장실', content: additionalInfo.restroom });
                        }

                        // 흡연/음주
                        if (additionalInfo.smokingDrinking && Array.isArray(additionalInfo.smokingDrinking) && additionalInfo.smokingDrinking.length > 0) {
                          sections.push({ title: '흡연/음주', content: additionalInfo.smokingDrinking });
                        }

                        // 예절
                        if (additionalInfo.etiquette && Array.isArray(additionalInfo.etiquette) && additionalInfo.etiquette.length > 0) {
                          sections.push({ title: '예절', content: additionalInfo.etiquette });
                        }

                        if (sections.length === 0) return null;

                        return (
                          <div className="info-item">
                            <div className="info-label">추가정보</div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              {sections.map((section, sectionIndex) => (
                                <div key={sectionIndex}>
                                  <div className="info-value" style={{ marginBottom: '4px' }}>
                                    {section.title}
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#999' }}>
                                    {section.content.map((item: string, itemIndex: number) => (
                                      <div key={itemIndex} style={{ marginBottom: itemIndex < section.content.length - 1 ? '8px' : '0' }}>
                                        {item.split('\\n').map((line: string, lineIndex: number) => (
                                          <React.Fragment key={lineIndex}>
                                            {line}
                                            {lineIndex < item.split('\\n').length - 1 && <br />}
                                          </React.Fragment>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      } catch (e) {
                        // 파싱 실패 시 무시
                        return null;
                      }
                    })()}
                  </div>

                  <div
                    className="detail-button"
                    onClick={() => navigate(`/counsel/europe/city`, { state : {nationData: selectedNationData, nationName: selectedNation}})}
                  >
                    <div className="group-product-button">
                      <div className="text-wrapper-product-button">상품보기</div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'product' && (
                <div className="schedule-list-container">
                  {/* 나라 제목 */}
                  <h2 className="selected-nation-title">{selectedNation}</h2>

                  {/* 탭 네비게이션 */}
                  <div className="schedule-tabs">
                    {['전체', `${selectedNation}온니`, `${selectedNation}외 1개국`, `${selectedNation}외 2개국`, `${selectedNation}외 3개국`].map((tab) => (
                      <button
                        key={tab}
                        className={`schedule-tab ${scheduleFilter === tab ? 'active' : ''}`}
                        onClick={() => setScheduleFilter(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* 검색바 */}
                  <div className="schedule-search">
                    <input
                      type="text"
                      placeholder="상품검색"
                      value={scheduleSearch}
                      onChange={(e) => setScheduleSearch(e.target.value)}
                      className="schedule-search-input"
                    />
                    <button className="schedule-search-btn">🔍</button>
                  </div>

                  {/* Schedule 리스트 */}
                  <div className="schedule-sections">
                    {Object.keys(getGroupedSchedules()).length === 0 ? (
                      <div className="no-schedules">일정이 없습니다.</div>
                    ) : (
                      Object.entries(getGroupedSchedules()).map(([groupKey, schedules]) => (
                        <div key={groupKey} className="schedule-section">
                          <div className="schedule-section-header">{groupKey}</div>
                          {schedules.map((schedule: any, index) => {
                            const periodText = schedule.tourPeriodData.periodNight && schedule.tourPeriodData.periodDay
                              ? `${schedule.tourPeriodData.periodNight} ${schedule.tourPeriodData.periodDay}`
                              : '';
                            
                            // 상세 정보는 productName에서 추출하거나 nation 배열을 기반으로 생성
                            const detailText = schedule.productName || schedule.nation.join(' + ');

                            return (
                              <div 
                                key={index} 
                                className="schedule-item"
                                onClick={() => {
                                  if (schedule.id) {
                                    navigate(`/counsel/europe/schedulerecommend`, { state: schedule });
                                    window.scrollTo(0, 0);
                                  }
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="schedule-item-content">
                                  <h4 className="schedule-item-title">
                                   {schedule.nation.join(' + ')} {periodText}
                                  </h4>
                                  <p className="schedule-item-detail">{detailText}</p>
                                </div>
                                {index === 0 && groupKey === selectedNation && (
                                  <button className="schedule-item-badge recommend">추천상품</button>
                                )}
                                {index === 0 && groupKey.includes('스위스') && (
                                  <button className="schedule-item-badge special">특가상품</button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'entry' && (
                <div className="entry-guide">
                  <div className="entry-section">
                    {(() => {
                      // cities 배열의 첫 번째 도시에서 trafficCode 추출
                      try {
                        if (selectedNationData?.cities && Array.isArray(selectedNationData.cities) && selectedNationData.cities.length > 0) {
                          const firstCity = selectedNationData.cities[0];
                          const trafficCode = JSON.parse(firstCity.trafficCode || '{}');
                          if (trafficCode.airplane && Array.isArray(trafficCode.airplane) && trafficCode.airplane.length > 0) {
                            const airports = trafficCode.airplane.map((airport: any) => 
                              `${airport.airport} (${airport.code})`
                            ).join(', ');
                            return (
                              <div className="entry-row">
                                <div className="entry-label">공항</div>
                                <div className="entry-value">{airports}</div>
                              </div>
                            );
                          }
                        }
                      } catch (e) {
                        // 파싱 실패 시 무시
                      }
                      return null;
                    })()}
                    {selectedNationData?.timeDifference && (
                      <div className="entry-row">
                        <div className="entry-label">시차</div>
                        <div className="entry-value">{selectedNationData.timeDifference}</div>
                      </div>
                    )}
                  </div>
                  <div className="entry-section">
                    <div className="entry-section-title">입국 전 준비사항</div>
                    <div className="entry-row">
                      <div className="entry-label">여권</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">비자</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">백신/건강</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                  </div>

                  <div className="entry-section">
                    <div className="entry-section-title">사전 입출국 신청방법</div>
                    <div className="entry-row">
                      <div className="entry-label">비자</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">입국신고서</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">검역신고</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">세관신고</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                  </div>

                  <div className="entry-section">
                    <div className="entry-section-title">현지 입국 절차</div>
                    <div className="entry-row">
                      <div className="entry-label">입국심사/검역</div>
                      <div className="entry-value">
                        입국심사 / 세관신고서 작성 (한국인/기내/입국장)
                      </div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">입국장 동선</div>
                      <div className="entry-value">
                        입국심사 후 수하물 찾기 → 세관검사 → 출구
                      </div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">수하물 수령</div>
                      <div className="entry-value">
                        현지 입국 안내 오디오 또는 가이드 안내에 따라 이동
                      </div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">현지 가이드 미팅</div>
                      <div className="entry-value">
                        입국장으로 나와 가이드 미팅 후 이동
                      </div>
                    </div>
                  </div>

                  <div className="entry-section">
                    <div className="entry-section-title">세관신고 면세범위</div>
                    <div className="entry-row">
                      <div className="entry-label">주류</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">담배</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">현금</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">중요서류 등</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                  </div>

                  <div className="entry-section">
                    <div className="entry-section-title">귀국 절차</div>
                    <div className="entry-row">
                      <div className="entry-label">탑승수속, 출국심사</div>
                      <div className="entry-value">
                        출국시간 2시간~3시간 전 공항 도착 후 진행
                      </div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">면세 환급</div>
                      <div className="entry-value">내용을 적는 곳입니다.</div>
                    </div>
                    <div className="entry-row">
                      <div className="entry-label">휴대품 신고</div>
                      <div className="entry-value">
                        입국 시 800달러, 주류 1병, 담배 200개비, 향수 60ml
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'highlight' && (
                <div className="highlight-grid">
                  {(() => {
                    // API에서 하이라이트 이미지 가져오기
                    if (selectedNationData?.inputImage) {
                      try {
                        const images = JSON.parse(selectedNationData.inputImage || '[]');
                        if (Array.isArray(images) && images.length > 0) {
                          return images.slice(0, 4).map((image: string, index: number) => (
                            <div key={index} className="highlight-card">
                              <div className="highlight-image-wrap">
                                <img src={`${AdminURL}/images/nationimages/${image}`} alt={`${selectedNation} 하이라이트 ${index + 1}`} />
                              </div>
                              {selectedNationData?.highlightTitles && Array.isArray(selectedNationData.highlightTitles) && selectedNationData.highlightTitles[index] ? (
                                <div className="highlight-title">{selectedNationData.highlightTitles[index]}</div>
                              ) : (
                                <div className="highlight-title">{selectedNation} 하이라이트 {index + 1}</div>
                              )}
                            </div>
                          ));
                        }
                      } catch (e) {
                        // 파싱 실패 시 기본 하이라이트 표시
                      }
                    }
                    // 기본 하이라이트 표시
                    return highlightItems.map((item) => (
                      <div key={item.id} className="highlight-card">
                        <div className="highlight-image-wrap">
                          <img src={item.image} alt={item.title} />
                        </div>
                        <div className="highlight-title">{item.title}</div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
          </div>
        )}

        {/* 일정만들기 모드: 일정 구성 패널 */}
        {activeButton === 'create' && (
          <div className="right-section create-schedule-panel">
            <div className="detail-section">
              <div className="detail-card">
                <div className="create-schedule-container" style={{ padding: '20px' }}>
                  {/* 여행기간 입력 */}
                  <div className="travel-period-section" style={{ marginBottom: '30px' }}>
                    <div className="travel-period-input-wrapper" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px'
                    }}>
                      <FaRegCalendarAlt style={{ fontSize: '20px', color: '#666' }} />
                      <input
                        type="number"
                        className="travel-period-input"
                        placeholder="여행기간"
                        value={createScheduleDays}
                        onChange={(e) => setCreateScheduleDays(parseInt(e.target.value) || 1)}
                        style={{
                          border: 'none',
                          outline: 'none',
                          fontSize: '16px',
                          flex: 1
                        }}
                      />
                      <span style={{ color: '#666', fontSize: '14px' }}>일</span>
                    </div>
                  </div>

                  {/* 선택된 도시 목록 */}
                  <div className="selected-cities-section" style={{ marginBottom: '30px' }}>
                    <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>선택된 도시</h3>
                    {Object.values(selectedCities).flat().length === 0 ? (
                      <div className="no-selected-cities" style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#999',
                        border: '1px dashed #e0e0e0',
                        borderRadius: '4px'
                      }}>선택된 도시가 없습니다</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.values(selectedCities).flat().map((city, index) => (
                          <div key={index} className="selected-city-card" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px'
                          }}>
                            <span className="city-name" style={{ fontSize: '14px', fontWeight: 500 }}>{city}</span>
                            <button
                              type="button"
                              onClick={() => {
                                // 도시 제거
                                const newSelectedCities = { ...selectedCities };
                                Object.keys(newSelectedCities).forEach(country => {
                                  newSelectedCities[country] = newSelectedCities[country].filter(c => c !== city);
                                });
                                setSelectedCities(newSelectedCities);
                              }}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: '18px',
                                color: '#999',
                                padding: '0',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 다음 버튼 */}
                  <div className="create-next-button-wrapper">
                    <button
                      className="create-next-button"
                      onClick={() => {
                        // 다음 단계로 이동
                        const allSelectedCities = Object.values(selectedCities).flat();
                        if (allSelectedCities.length > 0) {
                          navigate(`/counsel/europe/schedulecustom`, {
                            state: {
                              selectedCities: allSelectedCities,
                              selectedCitiesByCountry: selectedCities,
                              createScheduleDays: createScheduleDays
                            }
                          });
                        }
                      }}
                      disabled={Object.values(selectedCities).flat().length === 0}
                      style={{
                        width: '100%',
                        padding: '14px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: Object.values(selectedCities).flat().length === 0 ? '#e0e0e0' : '#333',
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: Object.values(selectedCities).flat().length === 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      다음
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isWorldMapOpen && (
        <div
          className="worldmap-modal-overlay"
          onClick={() => setIsWorldMapOpen(false)}
        >
          <div
            className="worldmap-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="worldmap-close"
              onClick={() => setIsWorldMapOpen(false)}
            >
              ×
            </button>
            <img src={WorldMapImage} alt="세계 지도" />
          </div>
        </div>
      )}

    </div>
  );
};


