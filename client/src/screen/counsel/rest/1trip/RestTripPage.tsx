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

  const locationType = '휴양지'
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${AdminURL}/ceylontour/getcitylist/${locationType}`);
      
      if (!response.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();


      // API 응답 데이터를 Destination 형식으로 변환
      const formattedDestinations: Destination[] = Array.isArray(data) 
        ? data
            .filter((item: any) => {
              // isView가 'true'이고 schedule이 존재하며 빈 배열이 아닌 것만 필터링
              return item.isView === 'true' && 
                     item.schedule && 
                     Array.isArray(item.schedule) && 
                     item.schedule.length > 0;
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

              // schedule 개수 계산
              const scheduleCount = Array.isArray(item.schedule) ? item.schedule.length : 0;

              return {
                id: String(item.id),
                name: item.cityKo || item.nation || '',
                image: imageUrl,
                selected: false,
                departure: ['인천', '김포'], // API에 없으므로 기본값
                airTime: '7시간 30분', // API에 없으므로 기본값
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
          // 같은 이름이 있으면 scheduleCount가 더 많은 것으로 교체
          if (current.scheduleCount > acc[existingIndex].scheduleCount) {
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
    <div className="trip-page-wrapper">
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
                      <div className='nation-departure'>인천출발ㅣ부산출발</div>
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
                  {/* <button
                    type="button"
                    className={`tab-button text-wrapper-tab-highlight ${activeTab === 'highlight' ? 'active' : ''}`}
                    onClick={() => setActiveTab('highlight')}
                  >
                    하이라이트
                  </button> */}
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
                    {selectedCityData?.timeDifference && (
                      <div className="info-item">
                        <div className="info-label">시차</div>
                        <div className="info-value">
                          <span className="info-strong">{selectedCityData.timeDifference}</span>
                        </div>
                      </div>
                    )}

                    {selectedCityData?.visa && (
                      <div className="info-item">
                        <div className="info-label">비자</div>
                        <div className="info-value">
                          {selectedCityData.visa}
                        </div>
                      </div>
                    )}

                    {selectedCityData?.language && (
                      <div className="info-item">
                        <div className="info-label">언어</div>
                        <div className="info-value">{selectedCityData.language}</div>
                      </div>
                    )}

                    {selectedCityData?.roaming && (
                      <div className="info-item">
                        <div className="info-label">로밍</div>
                        <div className="info-value">
                          {selectedCityData.roaming}
                        </div>
                      </div>
                    )}

                    {selectedCityData?.currency && (
                      <div className="info-item">
                        <div className="info-label">화폐</div>
                        <div className="info-value">
                          {selectedCityData.currency}
                        </div>
                      </div>
                    )}

                    {selectedCityData?.tipManner && (
                      <div className="info-item">
                        <div className="info-label">팁매너</div>
                        <div className="info-value">
                          {selectedCityData.tipManner}
                        </div>
                      </div>
                    )}

                    {selectedCityData?.voltage && (
                      <div className="info-item">
                        <div className="info-label">전압</div>
                        <div className="info-value">{selectedCityData.voltage}</div>
                      </div>
                    )}

                    {selectedCityData?.weather && (
                      <div className="info-item">
                        <div className="info-label">날씨</div>
                        <div className="info-value info-multiline">
                          {selectedCityData.weather.split('\n').map((line: string, index: number) => (
                            <React.Fragment key={index}>
                              {line}
                              {index < selectedCityData.weather.split('\n').length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCityData?.precautions && (
                      <div className="info-item">
                        <div className="info-label">주의사항</div>
                        <div className="info-multiline">
                          {selectedCityData.precautions.split('\n').map((line: string, index: number) => (
                            <p key={index} className="info-text">{line}</p>
                          ))}
                        </div>
                      </div>
                    )}
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
                    if (selectedCityData?.inputImage) {
                      try {
                        const images = JSON.parse(selectedCityData.inputImage || '[]');
                        if (Array.isArray(images) && images.length > 0) {
                          return images.slice(0, 4).map((image: string, index: number) => (
                            <div key={index} className="highlight-card">
                              <div className="highlight-image-wrap">
                                <img src={`${AdminURL}/images/nationimages/${image}`} alt={`${selectedCity} 하이라이트 ${index + 1}`} />
                              </div>
                              {selectedCityData?.highlightTitles && Array.isArray(selectedCityData.highlightTitles) && selectedCityData.highlightTitles[index] ? (
                                <div className="highlight-title">{selectedCityData.highlightTitles[index]}</div>
                              ) : (
                                <div className="highlight-title">{selectedCity} 하이라이트 {index + 1}</div>
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


