import React, { useState, useEffect } from 'react';
import './RestTripPage.scss';
import { AdminURL } from '../../../../MainURL';
import { useNavigate } from 'react-router-dom';
import Image_bali from '../../../lastimages/counselrest/trip/image.png';
import Image_phuket from '../../../lastimages/counselrest/trip/image-1.png';
import Image_guam from '../../../lastimages/counselrest/trip/image-2.png';
import Image_maldives from '../../../lastimages/counselrest/trip/image-3.png';
import Image_morisus from '../../../lastimages/counselrest/trip/mapimage.png';
import DetailMapImage from '../../../lastimages/counselrest/trip/detailmap.jpg';
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


export default function RestTripPage () {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCityData, setSelectedCityData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'highlight' | 'entry'>('info');
  const [isSingleCity, setIsSingleCity] = useState(true);
  const [isMultiCity, setIsMultiCity] = useState(false);
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);
  const [isDetailMapOpen, setIsDetailMapOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<'recommend' | 'create'>('recommend');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  
  const highlightItems = [
    { id: 1, title: '포토스팟에서 인생샷', image: Image_bali },
    { id: 2, title: '일출보기 투어', image: Image_phuket },
    { id: 3, title: '우붓 명소 맞춤 투어', image: Image_guam },
    { id: 4, title: '우붓 정글탐험', image: Image_maldives },
  ];

  
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${AdminURL}/ceylontour/getcitylistrest`);
      
      if (!response.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('data', data);


      // API 응답 데이터를 Destination 형식으로 변환
      const formattedDestinations: Destination[] = Array.isArray(data) 
        ? data
            .filter((item: any) => {
              // isView가 'true'이고 locationType이 '휴양지'인 것만 필터링
              return item.isView === 'true' && 
                     item.locationType === '휴양지';
            })
            .map((item: any) => {
              // inputImage 파싱 (JSON 배열 문자열)
              let imageUrl = require('../../../lastimages/nations/img_aus.png'); // 기본 이미지
              try {
                const images = JSON.parse(item.inputImage || '[]');
                if (Array.isArray(images) && images.length > 0 && images[0]) {
                  imageUrl = images[0];
                }
              } catch (e) {
                // 파싱 실패 시 기본 이미지 사용
              }

              // airlineInfo에서 출발지와 비행시간 추출
              let departure: string[] = ['인천', '김포']; // 기본값
              let airTime: string = '7시간 30분'; // 기본값
              
              try {
                if (item.airlineInfo) {
                  const airlineInfo = JSON.parse(item.airlineInfo);
                  if (airlineInfo.departure?.city) {
                    departure = [airlineInfo.departure.city];
                  }
                  if (airlineInfo.duration) {
                    airTime = airlineInfo.duration;
                  }
                }
              } catch (e) {
                // 파싱 실패 시 기본값 사용
              }

              // trafficCode에서 추가 출발지 정보 추출
              try {
                if (item.trafficCode) {
                  const trafficCode = JSON.parse(item.trafficCode);
                  if (trafficCode.airplane && Array.isArray(trafficCode.airplane)) {
                    // airplane 정보가 있으면 사용 (departure는 airlineInfo 우선)
                  }
                }
              } catch (e) {
                // 파싱 실패 시 무시
              }

              // scheduleCount는 0으로 설정 (제공된 데이터에 schedule 필드가 없음)
              const scheduleCount = 0;

              return {
                id: String(item.id),
                name: item.cityKo || item.nation || '',
                image: imageUrl,
                selected: false,
                departure: departure,
                airTime: airTime,
                scheduleCount: scheduleCount,
                rawData: item // 원본 데이터 저장
              };
            })
        : [];
      
      // 중복 제거: 같은 이름(cityKo 또는 nation)을 가진 항목 중 첫 번째 것만 유지
      const uniqueDestinations = formattedDestinations.reduce((acc: Destination[], current: Destination) => {
        const existingIndex = acc.findIndex(item => item.name === current.name);
        if (existingIndex === -1) {
          // 같은 이름이 없으면 추가
          acc.push(current);
        } else {
          // 같은 이름이 있으면 id가 더 작은 것으로 교체 (더 오래된 데이터 우선)
          if (parseInt(current.id) < parseInt(acc[existingIndex].id)) {
            acc[existingIndex] = current;
          }
        }
        return acc;
      }, []);
      
      setDestinations(uniqueDestinations);
    } catch (error) {
      console.error('도시 리스트를 가져오는 중 오류 발생:', error);
      // 에러 발생 시 빈 배열 설정
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);


  return (
    <div className="rest-trip-page-wrapper">
      <div className={`trip-container ${selectedCity ? 'detail-open' : ''}`}>
        {/* 왼쪽 영역: 헤더 + 나라 리스트 */}
        <div className="left-section">
          {/* 헤더 영역 */}
          <div className="trip-header">
            <div className="header-buttons">
              <button 
                className={`btn-tap ${activeButton === 'recommend' ? 'active' : ''}`}
                onClick={() => setActiveButton('recommend')}
              >
                추천일정
              </button>
              <button 
                className={`btn-tap ${activeButton === 'create' ? 'active' : ''}`}
                onClick={() => setActiveButton('create')}
              >
                일정만들기
              </button>
            </div>
            <div className="header-filters">
              <div className="filter-left">
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={isSingleCity}
                    onChange={(e) => {
                      setIsSingleCity(e.target.checked);
                      if (e.target.checked) setIsMultiCity(false);
                    }}
                  />
                  <span className="filter-item">싱글시티</span>
                </label>
                <label className="filter-checkbox">
                  <input 
                    type="checkbox" 
                    checked={isMultiCity}
                    onChange={(e) => {
                      setIsMultiCity(e.target.checked);
                      if (e.target.checked) setIsSingleCity(false);
                    }}
                  />
                  <span className="filter-item">멀티시티</span>
                </label>
              </div>
              <div className="filter-right">
                <button
                  type="button"
                  className="worldmap-button"
                  onClick={() => setIsWorldMapOpen(true)}
                >
                  세계지도 보기
                </button>
              </div>
            </div>
          </div>

          {/* 나라 리스트 */}
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
                    className={`nation-card ${selectedCity === city.name ? 'selected' : ''}`}
                    onClick={() => {
                      console.log(city.rawData);
                      if (selectedCity === city.name) {
                        setSelectedCity(null);
                        setSelectedCityData(null);
                      } else {
                        setSelectedCity(city.name);
                        setSelectedCityData(city.rawData);
                        setActiveTab('info'); // 기본정보 탭 자동 선택
                      }
                    }}
                  >
                    <div className="nation-image-container">
                      <img className="image" alt={city.name} src={`${AdminURL}/images/cityimages/${city.image}`} />
                    </div>
                    <div className="nation-info">
                      <div className='nation-name'>{city.name}</div>
                      <p className='nation-airTime'>
                        <span className="text-wrapper-airtime-label">비행시간 약 </span>
                        <span className="text-wrapper-airtime-value">{city.airTime}</span>
                      </p>
                      <div className='nation-departure'>
                        {city.departure.length > 0 
                          ? city.departure.map((dep, idx) => `${dep}출발`).join('ㅣ')
                          : '인천출발ㅣ부산출발'
                        }
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 영역: 상세 정보 */}
        {selectedCity && (
          <div className="right-section">
            <div className="detail-section">
          <div className="detail-card">
            <div className="detail-header">
              <h2 className="detail-title">{selectedCityData?.cityKo || selectedCityData?.nation || selectedCity || '도시 정보'}</h2>
              <div className="detail-subtitle">{selectedCityData?.cityEn || selectedCityData?.nation || ''}</div>
              {/* <p className="detail-description">
                에메랄드빛 바다와 신비로운 사원이 어우러진 휴양지, 발리.
                <br />
                자연과 예술, 힐링이 함께하는 천상의 섬으로 특별한 여행을 선사합니다.
              </p> */}
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
                    className={`tab-button text-wrapper-tab-highlight ${activeTab === 'highlight' ? 'active' : ''}`}
                    onClick={() => setActiveTab('highlight')}
                  >
                    하이라이트
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
                    onClick={() => setIsDetailMapOpen(true)}
                  >
                    상세지도
                  </button>
                  <button type="button" className="tab-product-button"
                    onClick={() => navigate(`/counsel/rest/hotel`, { state : {city: selectedCity}})}
                  >
                    상품보기
                  </button>
                </div>
              </div>
            </div>

            <div className="detail-content">
              {activeTab === 'info' && (
                <>
                  <div className="detail-main-image">
                    {(() => {
                      // basicinfoImage 우선, 없으면 inputImage의 첫 번째 이미지 사용
                      if (selectedCityData?.basicinfoImage) {
                        return <img className="image-detail-main" alt={selectedCity || 'Image'} src={`${AdminURL}/images/citymapinfo/${selectedCityData.basicinfoImage}`} />;
                      }
                      if (selectedCityData?.inputImage) {
                        try {
                          const images = JSON.parse(selectedCityData.inputImage || '[]');
                          const mainImage = Array.isArray(images) && images.length > 0 ? images[0] : Image_morisus;
                          return <img className="image-detail-main" alt={selectedCity || 'Image'} src={`${AdminURL}/images/citymapinfo/${mainImage}`} />;
                        } catch (e) {
                          return <img className="image-detail-main" alt={selectedCity || 'Image'} src={Image_morisus} />;
                        }
                      }
                      return <img className="image-detail-main" alt={selectedCity || 'Image'} src={Image_morisus} />;
                    })()}
                  </div>
                  <div className="detail-info-grid">
                    {(() => {
                      // timezoneInfo 파싱
                      try {
                        const timezoneInfo = selectedCityData?.timezoneInfo ? JSON.parse(selectedCityData.timezoneInfo) : null;
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
                        const visaInfo = selectedCityData?.visaInfo ? JSON.parse(selectedCityData.visaInfo) : null;
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
                        const languageInfo = selectedCityData?.languageInfo ? JSON.parse(selectedCityData.languageInfo) : null;
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
                        const additionalInfo = selectedCityData?.additionalInfo ? JSON.parse(selectedCityData.additionalInfo) : null;
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
                        const exrateInfo = selectedCityData?.exrateInfo ? JSON.parse(selectedCityData.exrateInfo) : null;
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
                        const tipInfo = selectedCityData?.tipInfo ? JSON.parse(selectedCityData.tipInfo) : null;
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
                        const plugInfo = selectedCityData?.plugInfo ? JSON.parse(selectedCityData.plugInfo) : null;
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
                        const priceInfo = selectedCityData?.priceInfo ? JSON.parse(selectedCityData.priceInfo) : null;
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
                        const weatherInfo = selectedCityData?.weatherInfo ? JSON.parse(selectedCityData.weatherInfo) : null;
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
                      if (selectedCityData?.caution && selectedCityData.caution.trim() !== '') {
                        return (
                          <div className="info-item">
                            <div className="info-label">주의사항</div>
                            <div className="info-multiline">
                              {selectedCityData.caution.split('\n').map((line: string, index: number) => (
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
                        const additionalInfo = selectedCityData?.additionalInfo ? JSON.parse(selectedCityData.additionalInfo) : null;
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
                    onClick={() => navigate(`/counsel/rest/hotel`, { state : {city: selectedCity}})}
                  >
                    <div className="group-product-button">
                      <div className="text-wrapper-product-button">상품보기</div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'entry' && (
                <div className="entry-guide">
                  <div className="entry-section">
                    {selectedCityData?.airport && (
                      <div className="entry-row">
                        <div className="entry-label">공항</div>
                        <div className="entry-value">{selectedCityData.airport}</div>
                      </div>
                    )}
                    {selectedCityData?.flightTime && (
                      <div className="entry-row">
                        <div className="entry-label">비행시간</div>
                        <div className="entry-value">{selectedCityData.flightTime}</div>
                      </div>
                    )}
                    {selectedCityData?.timeDifference && (
                      <div className="entry-row">
                        <div className="entry-label">시차</div>
                        <div className="entry-value">{selectedCityData.timeDifference}</div>
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
                    const allImages: Array<{imageName: string, title: string, notice: string}> = [];
                    
                    // 각 이미지 필드에서 이미지 수집
                    const imageFields = [
                      'imageNamesNotice',
                      'imageNamesGuide',
                      'imageNamesEnt',
                      'imageNamesEvent',
                      'imageNamesCafe',
                      'imageNamesMainPoint'
                    ];
                    
                    imageFields.forEach((field) => {
                      if (selectedCityData?.[field]) {
                        try {
                          const parsed = JSON.parse(selectedCityData[field] || '[]');
                          if (Array.isArray(parsed)) {
                            parsed.forEach((item: any) => {
                              if (item.imageName) {
                                allImages.push({
                                  imageName: item.imageName,
                                  title: item.title || '',
                                  notice: item.notice || ''
                                });
                              }
                            });
                          }
                        } catch (e) {
                          console.error(`파싱 에러 (${field}):`, e);
                        }
                      }
                    });
                    
                    // 이미지가 있으면 표시 (모든 이미지)
                    if (allImages.length > 0) {
                      return allImages.map((item, index) => (
                        <div key={index} className="highlight-card">
                          <div className="highlight-image-wrap">
                            <img 
                              src={`${AdminURL}/images/cityimages/${item.imageName}`} 
                              alt={item.title || `${selectedCity} 하이라이트 ${index + 1}`} 
                            />
                          </div>
                          {/* {item.title && (
                            <div className="highlight-title">
                              {item.title}
                            </div>
                          )} */}
                        </div>
                      ));
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

      {isDetailMapOpen && (
        <div
          className="worldmap-modal-overlay"
          onClick={() => setIsDetailMapOpen(false)}
        >
          <div
            className="worldmap-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="worldmap-close"
              onClick={() => setIsDetailMapOpen(false)}
            >
              ×
            </button>
            {selectedCityData?.detailmapImage ? (
              <img src={`${AdminURL}/images/citymapinfo/${selectedCityData.detailmapImage}`} alt={`${selectedCity} 상세 지도`} />
            ) : (
              <img src={DetailMapImage} alt="상세 지도" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};


