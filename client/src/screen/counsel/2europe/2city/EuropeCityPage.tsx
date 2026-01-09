import React, { useState, useEffect } from 'react';
import './EuropeCityPage.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminURL } from '../../../../MainURL';
import { useSetRecoilState } from 'recoil';
import { recoilCityCart, CityCartItem } from '../../../../RecoilStore';

export default function EuropeCityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;
  const setCityCart = useSetRecoilState(recoilCityCart);
  
  const cityData = stateProps?.cityData || null;
  
  
  const [loading, setLoading] = useState<boolean>(true);
  const [cities, setCities] = useState<any[]>([]);
  const [originalCities, setOriginalCities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      }
      return prevCart;
    });
  };

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
      <div className="hotel-header">
        <div className="hotel-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="hotel-header-title">{cityData[0].nation || '유럽 도시 선택'}</h1>
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

            return (
              <div
                key={city.id}
                className="div-wrapper"
              >
                <div className="card-image-wrap">
                  <img
                    className="card-image"
                    alt={city.cityKo}
                    src={mainImage || `${AdminURL}/images/cityimages/${city.inputImage}`}
                  />
                  <div className="card-hover-buttons">
                    <button
                      type="button"
                      className="hover-button hover-button-add"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(city);
                        console.log(city)
                      }}
                    >
                      담기
                    </button>
                    <button
                      type="button"
                      className="hover-button hover-button-detail"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/counsel/europe/citydetail?id=${city.id}&nation=${city.nation}&fromDetail=true`);
                        window.scrollTo(0, 0);
                      }}
                    >
                      상세보기
                    </button>
                  </div>
                </div>
                <div 
                  className="card-body"
                  onClick={() => {
                    navigate(`/counsel/europe/citydetail?id=${city.id}&nation=${city.nation}`);
                    window.scrollTo(0, 0);
                  }}
                  style={{ cursor: 'pointer' }}
                >
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
                  {city.tourNotice && (
                    <p className="promo-text" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {city.tourNotice}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
    </div>
  );
};


