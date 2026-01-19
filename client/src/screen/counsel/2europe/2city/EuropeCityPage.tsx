import React, { useState, useEffect } from 'react';
import './EuropeCityPage.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminURL } from '../../../../MainURL';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { recoilCityCart, CityCartItem } from '../../../../RecoilStore';
import axios from 'axios';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';

export default function EuropeCityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;
  const cityCart = useRecoilValue(recoilCityCart);
  const setCityCart = useSetRecoilState(recoilCityCart);
  
  const cityData = stateProps?.cityData || null;
  
  
  const [loading, setLoading] = useState<boolean>(true);
  const [cities, setCities] = useState<any[]>([]);
  const [originalCities, setOriginalCities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [nations, setNations] = useState<any[]>([]);
  const [selectedNation, setSelectedNation] = useState<string>('');

  const addToCart = (city: any) => {
    setCityCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.id === city.id);
      if (existingIndex === -1) {
        // 도시 정보의 모든 필드를 개별적으로 저장
        const newItem: CityCartItem = {
          id: city.id,
          cityKo: city.cityKo || '',
          nation: city.nation || '',
          nights: 2, // 기본값 2박
          isView: city.isView,
          locationType: city.locationType,
          cityEn: city.cityEn,
          trafficCode: city.trafficCode,
          tourNotice: city.tourNotice,
          eventExpo: city.eventExpo,
          resortCategory: city.resortCategory,
          scheduleCategory: city.scheduleCategory,
          hotelCategory: city.hotelCategory,
          serviceCategory: city.serviceCategory,
          taxRefundPlace: city.taxRefundPlace,
          inputImage: city.inputImage,
          courseImage: city.courseImage,
          basicinfoImage: city.basicinfoImage,
          detailmapImage: city.detailmapImage,
          tourPreviewImage: city.tourPreviewImage,
          airlineInfo: city.airlineInfo,
          visaInfo: city.visaInfo,
          exrateInfo: city.exrateInfo,
          plugInfo: city.plugInfo,
          weatherInfo: city.weatherInfo,
          languageInfo: city.languageInfo,
          timezoneInfo: city.timezoneInfo,
          tipInfo: city.tipInfo,
          priceInfo: city.priceInfo,
          additionalInfo: city.additionalInfo,
          imageNamesNotice: city.imageNamesNotice,
          imageNamesGuide: city.imageNamesGuide,
          imageNamesEnt: city.imageNamesEnt,
          imageNamesEvent: city.imageNamesEvent,
          imageNamesCafe: city.imageNamesCafe,
          imageNamesMainPoint: city.imageNamesMainPoint,
          // 기타 모든 필드도 포함
          ...city
        };
        return [...prevCart, newItem];
      } else {
        // 이미 있으면 제거
        return prevCart.filter((item) => item.id !== city.id);
      }
    });
  };

  // 국가 리스트 가져오기
  useEffect(() => {
    const fetchNations = async () => {
      try {
        const locationType = '유럽';
        const response = await axios.get(`${AdminURL}/ceylontour/getnationlisttour/${locationType}`);
        if (response.data && Array.isArray(response.data)) {
          const nationList = response.data
            .filter((nation: any) => nation.isView === 'true')
            .map((nation: any) => ({
              id: nation.id,
              name: nation.nationKo || '',
              rawData: nation
            }));
          setNations(nationList);
          
          // 현재 도시 데이터의 국가를 기본 선택으로 설정
          if (cityData && cityData.length > 0 && cityData[0].nation) {
            const currentNation = nationList.find((n: any) => n.name === cityData[0].nation);
            if (currentNation) {
              setSelectedNation(currentNation.name);
            }
          }
        }
      } catch (error) {
        console.error('국가 리스트를 가져오는 중 오류 발생:', error);
      }
    };
    
    fetchNations();
  }, []);

  useEffect(() => {
    if (cityData) {
      // 국가 데이터에서 도시 리스트 추출
      const citiesList = cityData.filter((city: any) => city.isView === 'true');
      setCities(citiesList);
      setOriginalCities(citiesList);
      setLoading(false);
    } else {
      setCities([]);
      setOriginalCities([]);
      setLoading(false);
    }
  }, [cityData]);

  // 검색어에 따라 도시 리스트 필터링
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setCities(originalCities);
    } else {
      const filtered = originalCities.filter((city) => {
        const query = searchQuery.toLowerCase();
        return city.cityKo?.toLowerCase().includes(query) || 
               city.cityEn?.toLowerCase().includes(query);
      });
      setCities(filtered);
    }
  }, [searchQuery, originalCities]);



  return (
    <div className="div-wrapper-screen">
      <div className="hotel-citypage-container">
        <div className="hotel-header">
          <div className="hotel-header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', justifyContent: 'space-between' }}>
              <h1 className="hotel-header-title">{cityData && cityData.length > 0 ? cityData[0].nation : '유럽 도시 선택'}</h1>
              {nations.length > 0 && (
                <select
                  value={selectedNation}
                  onChange={async (e) => {
                    const selectedNationName = e.target.value;
                    setSelectedNation(selectedNationName);
                    
                    // 선택된 국가의 도시 데이터 가져오기
                    try {
                      const selectedNationData = nations.find((n: any) => n.name === selectedNationName);
                      if (selectedNationData && selectedNationData.rawData && selectedNationData.rawData.cities) {
                        // 해당 국가의 도시 데이터로 페이지 전환
                        navigate(`/counsel/europe/city`, {
                          state: {
                            cityData: selectedNationData.rawData.cities,
                            nationData: selectedNationData.rawData,
                            nationName: selectedNationName
                          },
                          replace: true
                        });
                        window.scrollTo(0, 0);
                      }
                    } catch (error) {
                      console.error('도시 데이터를 가져오는 중 오류 발생:', error);
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    backgroundColor: '#fff',
                    color: '#333',
                    cursor: 'pointer',
                    minWidth: '150px',
                    outline: 'none'
                  }}
                >
                  <option value="">국가 선택</option>
                  {nations.map((nation: any) => (
                    <option key={nation.id} value={nation.name}>
                      {nation.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p className="hotel-header-subtitle">
              방문하고 싶은 도시를 선택해주세요
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
                placeholder="도시명으로 검색"
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
          ) : cities.length === 0 ? (
            <div className="empty-message">도시 데이터가 없습니다.</div>
          ) : (
            cities.map((city: any) => {
              // 도시의 inputImage 파싱
              let mainImage: string | null = null;
              try {
                const images = JSON.parse(city.inputImage || '[]');
                if (Array.isArray(images) && images.length > 0 && images[0]) {
                  mainImage = `${AdminURL}/images/cityimages/${images[0]}`;
                }
              } catch (e) {
                // 파싱 실패 시 기본 이미지
              }
              // trafficCode에서 공항 정보 추출
              let airportInfo = '';
              try {
                const trafficCode = JSON.parse(city.trafficCode || '{}');
                if (trafficCode.airplane && Array.isArray(trafficCode.airplane) && trafficCode.airplane.length > 0) {
                  airportInfo = trafficCode.airplane.map((airport: any) => 
                    `${airport.airport} (${airport.code})`
                  ).join(', ');
                }
              } catch (e) {
                // 파싱 실패 시 무시
              }

              // 장바구니에 있는지 확인하여 하트 상태 결정
              const isFavorite = cityCart.some(item => item.id === city.id);

              return (
                <div
                  key={city.id}
                  className="div-wrapper"
                  onClick={() => {
                    navigate(`/counsel/europe/citydetail?id=${city.id}&nation=${city.nation}`);
                    window.scrollTo(0, 0);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-image-wrap">
                    <img
                      className="card-image"
                      alt={city.cityKo}
                      src={mainImage || `${AdminURL}/images/cityimages/${city.inputImage}`}
                    />
                    <button
                      type="button"
                      className={`card-heart-button ${isFavorite ? 'favorite' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(city);
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
                    <div className="hotel-name">{city.cityKo}</div>
                    <div className="hotel-location-row">
                      <span className="hotel-location">
                        {city.cityEn || ''}
                      </span>
                    </div>
                    {airportInfo && (
                      <p className="promo-text" style={{ fontSize: '12px', color: '#666' }}>
                        공항: {airportInfo}
                      </p>
                    )}
                    {city.weather && (
                      <p className="promo-text" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {city.weather.split('\n')[0]}
                      </p>
                    )}
                    {/* {city.tourNotice && (
                      <p className="promo-text" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {city.tourNotice}
                      </p>
                    )} */}
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


