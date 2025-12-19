import React, { useState, useEffect } from 'react';
import './EuropeTripPage.scss';
import { AdminURL } from '../../../../MainURL';
import { useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt } from 'react-icons/fa';

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

interface DestinationInfo {
  name: string;
  mainImage: string;
  timeDifference: string;
  currency: string;
  visa: string;
  voltage: string;
  language: string;
  weather: string;
  precautions: string;
  highlights: string[];
  regionalInfo: {
    region: string;
    description: string;
    attractions: string[];
    images: string[];
  }[];
  entryExitInfo: {
    title: string;
    content: string;
  }[];
}

interface ScheduleItem {
  id: number;
  nation: string[];
  tourPeriodData: {
    periodNight: string;
    periodDay: string;
  };
  productName: string;
}

const EuropeTripPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'recommend' | 'create'>('recommend');
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [selectedDestinationData, setSelectedDestinationData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('기본정보');
  const [isSingleCity, setIsSingleCity] = useState(true);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleFilter, setScheduleFilter] = useState('전체');
  const [scheduleSearch, setScheduleSearch] = useState('');
  
  // 일정만들기 모드용 상태
  const [selectedDestinationsForCreate, setSelectedDestinationsForCreate] = useState<string[]>([]);
  const [createScheduleDays, setCreateScheduleDays] = useState(1);
  const [regionFilter, setRegionFilter] = useState('전체');
  const [selectedCities, setSelectedCities] = useState<{ [key: string]: string[] }>({}); // 국가명: [도시명들]


  const locationType = '관광지'
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${AdminURL}/ceylontour/getnationlisteurope`);
      
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
                name: item.nationKo || '',
                image: imageUrl,
                selected: false,
                departure: ['인천', '김포'], // API에 없으므로 기본값
                airTime: '7시간 30분', // API에 없으므로 기본값
                scheduleCount: scheduleCount,
                rawData: item // 원본 데이터 저장
              };
            })
        : [];
      
      // 중복 제거: 같은 이름(nationKo)을 가진 항목 중 첫 번째 것만 유지
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

  const destinationInfo: DestinationInfo = {
    name: '발리',
    mainImage: require('../../../lastimages/nations/img_aus.png'),
    timeDifference: '-1시간 (한국: 3시 → 발리:2시)',
    currency: '화폐단위는 루피아(RP) / 1루피아= 약 1,000원',
    visa: '도착비자 (VOS : Visa On Arrival) : $ 35',
    voltage: '220V',
    language: '인도네시아어, 발리어',
    weather: '발리의 1년 평균기온은 24~34℃정도의 고온다습한 열대몬순 기후이다. 건기는 4월~9월, 우기는 10월~3월이지만 스콜이 한두번 지나가는 정도이고 쾌적하고 휴양하기 좋은 시기이다. ※자외선 차단제(선크림 등) 꼭 준비해야함.',
    precautions: '주의사항에 대해서 적는 곳입니다. 주의사항에 대해서 적는 곳입니다. 주의사항에 대해서 적는 곳입니다.',
    highlights: [
      '세미냑 해변의 아름다운 일몰',
      '우붓의 전통 발리 문화 체험',
      '루루투르 화산의 장관',
      '발리 전통 마사지와 스파',
      '테갈랄랑 라이스 테라스',
      '울루와투 사원의 케차크 댄스'
    ],
    regionalInfo: [
      {
        region: '스미냑',
        description: '이 지역을 소개하는 곳입니다.',
        attractions: ['지도보기'],
        images: [
          // require('../../lastimages/nations/img_france.jpeg'),
          // require('../../lastimages/nations/img_france.jpeg'),
          // require('../../lastimages/nations/img_france.jpeg'),
          // require('../../lastimages/nations/img_france.jpeg'),
          // require('../../lastimages/nations/img_france.jpeg'),
          // require('../../lastimages/nations/img_france.jpeg')
        ]
      },
      {
        region: '우붓',
        description: '이 지역을 소개하는 곳입니다.',
        attractions: ['지도보기'],
        images: [
          // require('../../lastimages/nations/img_swiss.jpg'),
          // require('../../lastimages/nations/img_swiss.jpg'),
          // require('../../lastimages/nations/img_swiss.jpg'),
          // require('../../lastimages/nations/img_swiss.jpg'),
          // require('../../lastimages/nations/img_swiss.jpg'),
          // require('../../lastimages/nations/img_swiss.jpg')
        ]
      },
      {
        region: '이태리',
        description: '이 지역을 소개하는 곳입니다.',
        attractions: ['지도보기'],
        images: [
          // require('../../lastimages/nations/img_italy.jpg'),
          // require('../../lastimages/nations/img_italy.jpg'),
          // require('../../lastimages/nations/img_italy.jpg'),
          // require('../../lastimages/nations/img_italy.jpg'),
          // require('../../lastimages/nations/img_italy.jpg'),
          // require('../../lastimages/nations/img_italy.jpg')
        ]
      }
    ],
    entryExitInfo: [
      {
        title: '공항',
        content: '웅우라라이 공항'
      },
      {
        title: '비행시간',
        content: '7시간 30분'
      },
      {
        title: '시차',
        content: '한국보다 2시간 느림'
      },
      {
        title: '입국 전 준비사항',
        content: '여권: 내용을 적는 곳입니다\n비자: 내용을 적는 곳입니다\n백신/건강: 내용을 적는 곳입니다'
      },
      {
        title: '현지 입국 절차',
        content: '진행순서: 사전 출입국 작성시-자동 입국출구로이동-여권스캔후 통과-수화물 수령-세관 신고서 제시-입국장으로 나오기\n입국카드작성: 내용을 적는 곳입니다\n작성방법: 내용을 적는 곳입니다'
      }
    ]
  };

  const handleDestinationClick = (destination: Destination) => {
    if (mode === 'recommend') {
      // 추천일정 모드: 기존 로직
      if (selectedDestination === destination.name) {
        setSelectedDestination(null);
        setSelectedDestinationData(null);
      } else {
        setSelectedDestination(destination.name);
        const destinationData = destinations.find(d => d.id === destination.id);
        if (destinationData && (destinationData as any).rawData) {
          setSelectedDestinationData((destinationData as any).rawData);
        }
      }
    } else {
      // 일정만들기 모드: 다중 선택
      if (selectedDestinationsForCreate.includes(destination.name)) {
        setSelectedDestinationsForCreate(selectedDestinationsForCreate.filter(name => name !== destination.name));
      } else {
        setSelectedDestinationsForCreate([...selectedDestinationsForCreate, destination.name]);
      }
    }
  };

  // schedule 데이터 파싱 및 그룹화
  const getGroupedSchedules = () => {
    if (!selectedDestinationData || !selectedDestinationData.schedule) return [];

    const schedules: ScheduleItem[] = selectedDestinationData.schedule.map((item: any) => {
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
        productScheduleData : item.productScheduleData || '',
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
    if (!selectedDestination) return {};
    
    if (scheduleFilter.includes('온니')) {
      filtered = filtered.filter(s => s.nation.length === 1 && s.nation[0] === selectedDestination);
    } else if (scheduleFilter.includes('외 1개국')) {
      filtered = filtered.filter(s => s.nation.length === 2 && s.nation.includes(selectedDestination));
    } else if (scheduleFilter.includes('외 2개국')) {
      filtered = filtered.filter(s => s.nation.length === 3 && s.nation.includes(selectedDestination));
    } else if (scheduleFilter.includes('외 3개국')) {
      filtered = filtered.filter(s => s.nation.length === 4 && s.nation.includes(selectedDestination));
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

  const tabs = ['기본정보', '하이라이트', '지역별 정보', '입출국 안내'];

  const renderTabContent = () => {
    switch (activeTab) {
      case '기본정보':
        return (
          <div className="destination-details">
            <div className="detail-item">
              <div className="detail-content">
                <h4>시차</h4>
                <p>{destinationInfo.timeDifference}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-content">
                <h4>화폐</h4>
                <p>{destinationInfo.currency}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-content">
                <h4>비자</h4>
                <p>{destinationInfo.visa}</p>
              </div>
            </div>

            <div className="detail-item">   
              <div className="detail-content">
                <h4>전압</h4>
                <p>{destinationInfo.voltage}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-content">
                <h4>언어</h4>
                <p>{destinationInfo.language}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-content">
                <h4>날씨</h4>
                <p>{destinationInfo.weather}</p>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-content">
                <h4>주의사항</h4>
                <p>{destinationInfo.precautions}</p>
              </div>
            </div>
          </div>
        );

      case '하이라이트':
        return (
          <div className="highlights-content">
            <div className="highlights-grid">
              {destinationInfo.highlights.map((highlight, index) => (
                <div key={index} className="highlight-item">
                  <div className="highlight-number">{index + 1}</div>
                  <p>{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case '지역별 정보':
        return (
          <div className="regional-content">
            {destinationInfo.regionalInfo.map((region, index) => (
              <div key={index} className="region-item">
                <div className="region-header">
                  <h3>{region.region}</h3>
                  <button className="map-btn">지도보기</button>
                </div>
                <p className="region-description">{region.description}</p>
                <div className="region-images">
                  <div className="image-grid">
                    {region.images.map((image, idx) => (
                      <div key={idx} className="image-item">
                        <img src={image} alt={`${region.region} ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case '입출국 안내':
        return (
          <div className="entry-exit-content">
            {destinationInfo.entryExitInfo.map((info, index) => (
              <div key={index} className={`info-item ${index >= 3 ? 'highlighted' : ''}`}>
                <h3>{info.title}</h3>
                <p>{info.content.split('\n').map((line, idx) => (
                  <span key={idx}>
                    {line}
                    {idx < info.content.split('\n').length - 1 && <br />}
                  </span>
                ))}</p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="trip-page">

      {/* 메인 컨텐츠 */}
      <div className={`trip-main ${mode === 'recommend' ? (selectedDestination ? 'has-selection' : '') : 'has-selection'}`}>
        {/* 좌측 패널 - 여행지 선택 */}
        <div className="left-panel">
          <div className="panel-content">
            {/* 패널 헤더 */}
            <div className="panel-header">
              <div className="action-buttons">
                <button 
                  className={`btn-primary ${mode === 'recommend' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('recommend');
                    setSelectedDestination(null);
                    setSelectedDestinationData(null);
                    setSelectedDestinationsForCreate([]);
                  }}
                >
                  추천일정
                </button>
                <button 
                  className={`btn-secondary ${mode === 'create' ? 'active' : ''}`}
                  onClick={() => {
                    setMode('create');
                    setSelectedDestination(null);
                    setSelectedDestinationData(null);
                    setSelectedDestinationsForCreate([]);
                  }}
                >
                  일정만들기
                </button>
              </div>
            </div>

            {/* 필터 옵션 */}
            {/* <div className="filter-options">
              <button 
                className={`filter-btn ${isSingleCity ? 'active' : ''}`}
                onClick={() => setIsSingleCity(true)}
              >
                싱글시티
              </button>
              <button 
                className={`filter-btn ${!isSingleCity ? 'active' : ''}`}
                onClick={() => setIsSingleCity(false)}
              >
                멀티시티
              </button>
            </div> */}

            {/* 추천일정 모드: 여행지 그리드 */}
            {mode === 'recommend' && (
              <div className={`destinations-grid ${selectedDestination ? 'has-selection' : 'no-selection'}`}>
                {loading ? (
                  <div className="loading-message">로딩 중...</div>
                ) : destinations.length === 0 ? (
                  <div className="empty-message">데이터가 없습니다.</div>
                ) : (
                  destinations.map((destination) => {

                    return (
                      <div 
                        key={destination.id}
                        className={`destination-card ${selectedDestination === destination.name ? 'selected' : ''}`}
                        onClick={() => handleDestinationClick(destination)}
                      >
                        <div className="card-image">
                          <img src={`${AdminURL}/images/nationimages/${destination.image}`} alt={destination.name} />
                          {selectedDestination === destination.name && (
                            <div className="selection-indicator">
                              ✓
                            </div>
                          )}
                        </div>
                        <div className="card-text-content">
                          <div className="card-name-group">
                            <h3 className="card-name">{destination.name}</h3>
                            <span className="card-schedule-count">({destination.scheduleCount}개)</span>
                          </div>
                          <span className="card-plus-icon">+</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* 일정만들기 모드: 여행지 선택 */}
            {mode === 'create' && (
              <div className="create-mode-content">
                {/* 지역 필터 탭 */}
                <div className="region-tabs">
                  {['전체', '서유럽', '동유럽', '북유럽'].map((region) => (
                    <button
                      key={region}
                      className={`region-tab ${regionFilter === region ? 'active' : ''}`}
                      onClick={() => setRegionFilter(region)}
                    >
                      {region}
                    </button>
                  ))}
                </div>

                {/* 여행지 카드 그리드 */}
                <div className="create-destinations-grid">
                  {loading ? (
                    <div className="loading-message">로딩 중...</div>
                  ) : destinations.length === 0 ? (
                    <div className="empty-message">데이터가 없습니다.</div>
                  ) : (
                    destinations.map((destination) => {
                      // 도시 목록 (실제 데이터가 있으면 사용, 없으면 기본값)
                      const cities = ['파리', '베르사이유', '니스']; // 기본값, 실제로는 API에서 가져와야 함
                      const selectedCitiesForCountry = selectedCities[destination.name] || [];

                      
                      return (
                        <div key={destination.id} className="create-destination-card">
                          <div className="create-card-image">
                            <img src={`${AdminURL}/images/nationimages/${destination.image}`} alt={destination.name} />
                          </div>
                          <div className="create-card-content">
                            <h3 className="create-card-country">{destination.name}</h3>
                            <div className="create-card-cities">
                              {cities.map((city, index) => {
                                const isChecked = selectedCitiesForCountry.includes(city);
                                return (
                                  <label key={index} className="city-checkbox-label">
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
                                    <span className="city-name">{city}</span>
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
        </div>

        {/* 우측 패널 */}
        {/* 추천일정 모드: Schedule 리스트 */}
        {mode === 'recommend' && selectedDestination && (
          <div className="right-panel">
            <div className="panel-content">
              <div className="schedule-list-container">
                {/* 나라 제목 */}
                <h2 className="selected-nation-title">{selectedDestination}</h2>

                {/* 탭 네비게이션 */}
                <div className="schedule-tabs">
                  {['전체', `${selectedDestination}온니`, `${selectedDestination}외 1개국`, `${selectedDestination}외 2개국`, `${selectedDestination}외 3개국`].map((tab) => (
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
                              {index === 0 && groupKey === selectedDestination && (
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
            </div>
          </div>
        )}

        {/* 일정만들기 모드: 일정 구성 패널 */}
        {mode === 'create' && (
          <div className="right-panel create-schedule-panel">
            <div className="panel-content">
              <div className="create-schedule-container">
                {/* 여행기간 입력 */}
                <div className="travel-period-section">
                  <div className="travel-period-input-wrapper">
                    <FaRegCalendarAlt className="calendar-icon" />
                    <input
                      type="text"
                      className="travel-period-input"
                      placeholder="여행기간"
                      value={createScheduleDays}
                      onChange={(e) => setCreateScheduleDays(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>


                {/* 선택된 도시 목록 */}
                <div className="selected-cities-section">
                  {Object.values(selectedCities).flat().length === 0 ? (
                    <div className="no-selected-cities">선택된 도시가 없습니다</div>
                  ) : (
                    Object.values(selectedCities).flat().map((city, index) => (
                      <div key={index} className="selected-city-card">
                        <span className="city-name">{city}</span>
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => {
                            // 체크박스 해제 시 도시 제거
                            const newSelectedCities = { ...selectedCities };
                            Object.keys(newSelectedCities).forEach(country => {
                              newSelectedCities[country] = newSelectedCities[country].filter(c => c !== city);
                            });
                            setSelectedCities(newSelectedCities);
                          }}
                          className="city-checkbox"
                        />
                      </div>
                    ))
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
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EuropeTripPage;
