import React, { useState, useEffect } from 'react';
import './EuropeCityPage.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminURL } from '../../../../MainURL';

export default function EuropeCityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;
  
  const nationData = stateProps?.nationData || null;
  const nationName = stateProps?.nationName || '';
  const [loading, setLoading] = useState<boolean>(true);
  const [cities, setCities] = useState<any[]>([]);
  const [originalCities, setOriginalCities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (nationData && nationData.cities) {
      // 국가 데이터에서 도시 리스트 추출
      const citiesList = nationData.cities.filter((city: any) => city.isView === 'true');
      setCities(citiesList);
      setOriginalCities(citiesList);
      setLoading(false);
    } else {
      setCities([]);
      setOriginalCities([]);
      setLoading(false);
    }
  }, [nationData]);

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
            <h1 className="hotel-header-title">{nationName || '도시 선택'}</h1>
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
                mainImage = `${AdminURL}/images/citycustomimages/${images[0]}`;
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
                onClick={() => {
                  navigate(`/counsel/europe/citydetail`, { state : {city: city.cityKo, cityData: city, nationName: nationName}});
                  window.scrollTo(0, 0);
                }}
              >
                <div className="card-image-wrap">
                  <img
                    className="card-image"
                    alt={city.cityKo}
                    src={mainImage || `${AdminURL}/images/citycustomimages/default.png`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `${AdminURL}/images/citycustomimages/default.png`;
                    }}
                  />
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


