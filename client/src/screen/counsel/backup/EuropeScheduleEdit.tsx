import React, { useState, useEffect } from 'react';
import './EuropeScheduleEdit.scss';
import '../2city/EuropeCityDetail.scss';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { recoilCityCart, CityCartItem, recoilProductName, recoilScheduleInfo, recoilSelectedScheduleProduct } from '../../../RecoilStore';
import { IoIosArrowBack } from 'react-icons/io';
import { AdminURL } from '../../../MainURL';
import axios from 'axios';

export default function EuropeScheduleEdit() {
  const navigate = useNavigate();
  const cityCart = useRecoilValue(recoilCityCart);
  const setCityCart = useSetRecoilState(recoilCityCart);
  const setSavedProductName = useSetRecoilState(recoilProductName);
  
  const [cityDetails, setCityDetails] = useState<Array<{
    id: number;
    cityKo: string;
    cityEn?: string;
    nation?: string;
    nights: number;
  }>>([]);
  const [selectedNights, setSelectedNights] = useState<{ [key: number]: number }>({});
  const [productName, setProductName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [nation, setNation] = useState<string>('');
  const [scheduleFilter, setScheduleFilter] = useState<string>('전체');
  const [scheduleSearch, setScheduleSearch] = useState<string>('');
  const setSelectedScheduleProduct = useSetRecoilState(recoilSelectedScheduleProduct);

  useEffect(() => {
    const fetchCityDetails = async () => {
      if (cityCart.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const details = await Promise.all(
          cityCart.map(async (item) => {
            try {
              const res = await axios.get(`${AdminURL}/ceylontour/getcityinfobyid/${item.id}`);
              if (res.data && res.data.length > 0) {
                const city = res.data[0];
                return {
                  id: item.id,
                  cityKo: city.cityKo || item.cityKo,
                  cityEn: city.cityEn,
                  nation: city.nation || item.nation,
                  nights: item.nights || 2
                };
              }
              return {
                id: item.id,
                cityKo: item.cityKo,
                nation: item.nation,
                nights: item.nights || 2
              };
            } catch (error) {
              console.error(`도시 ${item.id} 정보 가져오기 오류:`, error);
              return {
                id: item.id,
                cityKo: item.cityKo,
                nation: item.nation,
                nights: item.nights || 2
              };
            }
          })
        );

        setCityDetails(details);
        
        // 국가 정보 설정 (첫 번째 도시의 국가 사용)
        const firstNation = details[0]?.nation || '';
        setNation(firstNation);
        
        // 초기 박수 설정
        const initialNights: { [key: number]: number } = {};
        details.forEach((city) => {
          initialNights[city.id] = city.nights;
        });
        setSelectedNights(initialNights);

        // 상품명 생성
        const nameParts = details.map((city) => {
          const nights = initialNights[city.id] || 2;
          return `${city.cityKo} ${nights}박`;
        });
        setProductName(nameParts.join(' + '));
      } catch (error) {
        console.error('도시 정보 가져오기 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCityDetails();
  }, [cityCart]);

  // 국가별 상품 리스트 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      if (!nation) return;

      try {
        const response = await axios.get(`${AdminURL}/ceylontour/getschedulenation/${nation}`);
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
  }, [nation]);

  // 박수 변경 시 상품명 업데이트
  useEffect(() => {
    if (cityDetails.length > 0) {
      const nameParts = cityDetails.map((city) => {
        const nights = selectedNights[city.id] || city.nights || 2;
        return `${city.cityKo} ${nights}박`;
      });
      setProductName(nameParts.join(' + '));
    }
  }, [selectedNights, cityDetails]);

  const handleNightsChange = (cityId: number, delta: number) => {
    setSelectedNights((prev) => {
      const currentNights = prev[cityId] || cityDetails.find(c => c.id === cityId)?.nights || 2;
      const newNights = Math.max(1, currentNights + delta);
      return {
        ...prev,
        [cityId]: newNights
      };
    });
  };

  const handleSave = async () => {
    if (cityDetails.length === 0) {
      alert('도시 정보가 없습니다.');
      return;
    }

    try {
      // 장바구니의 박수 업데이트
      const updatedCart = cityCart.map((item) => {
        const nights = selectedNights[item.id] || item.nights || 2;
        return {
          ...item,
          nights: nights
        };
      });
      setCityCart(updatedCart);

      // 각 도시의 상세 정보를 가져와서 selectedCities 형식으로 변환
      const selectedCities = await Promise.all(
        cityDetails.map(async (city, index) => {
          try {
            const res = await axios.get(`${AdminURL}/ceylontour/getcityinfobyid/${city.id}`);
            const cityDetail = res.data && res.data.length > 0 ? res.data[0] : null;
            if (cityDetail) {
              const nights = selectedNights[city.id] || city.nights || 2;
              
              return {
                index: index,
                city: cityDetail,
                nights: nights
              };
            }
            return null;
          } catch (error) {
            console.error(`도시 ${city.id} 정보 가져오기 오류:`, error);
            return null;
          }
        })
      );

      // null 값 제거
      const validSelectedCities = selectedCities.filter((city): city is NonNullable<typeof city> => city !== null);

      if (validSelectedCities.length === 0) {
        alert('도시 정보를 가져올 수 없습니다.');
        return;
      }

      // 첫 번째 도시 정보 가져오기
      const firstCity = validSelectedCities[0].city;
      if (!firstCity) {
        alert('도시 정보를 가져올 수 없습니다.');
        return;
      }

      // 국가별 첫 번째 상품 가져오기 (없으면 null)
      let productInfo = null;
      if (nation) {
        try {
          const response = await axios.get(`${AdminURL}/ceylontour/getschedulenation/${nation}`);
          if (response.data && response.data.length > 0) {
            productInfo = response.data[0];
          }
        } catch (error) {
          console.error('상품 정보 가져오기 오류:', error);
        }
      }

      // 상품명을 RecoilStore에 저장
      setSavedProductName(productName);

      // 도시와 박수를 기반으로 새로운 일정 데이터 생성
      const customScheduleInfo = createScheduleFromCities(validSelectedCities);

      // productScheduleData 생성 (도시 탭 표시를 위해 필요)
      const productScheduleData = validSelectedCities.map((cityItem) => ({
        city: cityItem.city?.cityKo || cityItem.city?.city || '',
        dayNight: `${cityItem.nights}박`
      }));

      // EuropeScheduleCost로 이동
      navigate('/counsel/europe/schedulerecommend', {
        state: {
          selectedCities: validSelectedCities.map(sc => sc.city),
          cityCart: updatedCart,
          productInfo: productInfo,
          nation: nation,
          isFromMakeButton: true, // '만들기' 버튼에서 온 것임을 표시
          customScheduleInfo: customScheduleInfo, // 도시 기반 일정 데이터
          productScheduleData: JSON.stringify(productScheduleData) // 도시 탭 표시를 위한 데이터
        }
      });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 도시와 박수를 기반으로 일정 데이터 생성
  const createScheduleFromCities = (cities: Array<{ index: number; city: any; nights: number }>) => {
    let currentDay = 1;
    const scheduleDetailData: any[] = [];

    cities.forEach((cityItem) => {
      const nights = cityItem.nights || 2;
      const cityName = cityItem.city?.cityKo || '';

      // 각 박수만큼 일정 일자 생성
      for (let i = 0; i < nights; i++) {
        scheduleDetailData.push({
          breakfast: '',
          lunch: '',
          dinner: '',
          hotel: '',
          score: '',
          scheduleDetail: [
            {
              id: 0,
              idx: 0,
              st: 'location',
              isViewLocation: true,
              locationIcon: '',
              location: `${currentDay}일차 - ${cityName}`,
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

  // productScheduleData를 파싱하여 도시명 생성
  const getProductNameFromSchedule = (product: any): string => {
    if (!product.productScheduleData) {
      return product.productName || product.scheduleName || '';
    }

    try {
      const scheduleData = JSON.parse(product.productScheduleData);
      if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        return product.productName || product.scheduleName || '';
      }

      // 장바구니의 도시들을 사용하여 상품명 생성
      const cityNightsMap: { [key: string]: { cityName: string; nights: number } } = {};
      
      for (let i = 0; i < scheduleData.length && i < cityDetails.length; i++) {
        const item = scheduleData[i];
        const city = cityDetails[i];
        const dayNight = item.dayNight || '';
        const nights = dayNight ? parseInt(dayNight.replace(/[^0-9]/g, ''), 10) || 0 : (selectedNights[city.id] || city.nights || 2);
        
        if (city) {
          const key = `city_${city.id}`;
          if (cityNightsMap[key]) {
            cityNightsMap[key].nights += nights;
          } else {
            cityNightsMap[key] = {
              cityName: city.cityKo,
              nights: nights
            };
          }
        }
      }

      const parts: string[] = [];
      for (const { cityName, nights } of Object.values(cityNightsMap)) {
        if (nights > 0) {
          parts.push(`${cityName} ${nights}박`);
        } else {
          parts.push(cityName);
        }
      }

      return parts.length > 0 ? parts.join(' + ') : (product.productName || product.scheduleName || '');
    } catch (e) {
      console.error('productScheduleData 파싱 오류:', e);
      return product.productName || product.scheduleName || '';
    }
  };

  // schedule 데이터 파싱 및 그룹화 (장바구니 도시의 국가 기준, EuropeCityDetail과 동일한 로직)
  const getGroupedSchedules = () => {
    // 장바구니에 담긴 도시의 국가 사용 (첫 번째 도시의 국가)
    const selectedNation = nation || (cityDetails.length > 0 ? cityDetails[0]?.nation : '');
    if (!selectedNation || !products || products.length === 0) return {};

    const schedules = products.map((item: any) => {
      let nations: string[] = [];
      try {
        // nation이 이미 배열인 경우와 문자열인 경우 모두 처리
        if (Array.isArray(item.nation)) {
          nations = item.nation;
        } else if (typeof item.nation === 'string') {
          nations = JSON.parse(item.nation || '[]');
        } else {
          nations = [];
        }
      } catch (e) {
        nations = [];
      }
      
      // 배열이 아닌 경우 빈 배열로 설정
      if (!Array.isArray(nations)) {
        nations = [];
      }

      let periodData = { periodNight: '', periodDay: '' };
      try {
        if (typeof item.tourPeriodData === 'string') {
          periodData = JSON.parse(item.tourPeriodData || '{}');
        } else if (item.tourPeriodData && typeof item.tourPeriodData === 'object') {
          periodData = item.tourPeriodData;
        }
      } catch (e) {
        periodData = { periodNight: '', periodDay: '' };
      }

      return {
        ...item, // 모든 필드 포함
        id: item.id || 0,
        nation: nations, // 배열로 보장된 nation 사용
        tourPeriodData: periodData,
        tourmapImage: item.tourmapImage || '',
        productScheduleData: item.productScheduleData || '',
        productName: item.productName || '',
        headerText: item.headerText || '',
        badgeType: item.badgeType || 'recommend',
        badgeText: item.badgeText || '추천상품',
        landCompany: item.landCompany || ''
      };
    });

    // 필터링 (EuropeCityDetail과 동일한 로직)
    let filtered = schedules;
    
    // 검색 필터
    if (scheduleSearch.trim()) {
      filtered = filtered.filter((s: any) => 
        s.productName.toLowerCase().includes(scheduleSearch.toLowerCase())
      );
    }

    // 탭 필터 (EuropeCityDetail과 동일한 로직, 국가명으로 비교)
    if (!selectedNation) return {};
    
    filtered = filtered.filter((s: any) => {
      // nation이 배열인지 확인하고, 배열이 아니면 배열로 변환
      const nationArray = Array.isArray(s.nation) 
        ? s.nation 
        : (typeof s.nation === 'string' ? [s.nation] : []);
      
      if (scheduleFilter.includes('온니')) {
        return nationArray.length === 1 && nationArray[0] === selectedNation;
      } else if (scheduleFilter.includes('외 1개국')) {
        return nationArray.length === 2 && nationArray.includes(selectedNation);
      } else if (scheduleFilter.includes('외 2개국')) {
        return nationArray.length === 3 && nationArray.includes(selectedNation);
      } else if (scheduleFilter.includes('외 3개국')) {
        return nationArray.length === 4 && nationArray.includes(selectedNation);
      }
      return true; // '전체'인 경우
    });

    // 그룹화 (nation 배열을 기준으로, EuropeCityDetail과 동일)
    const grouped: { [key: string]: any[] } = {};
    filtered.forEach((schedule: any) => {
      // nation이 배열인지 확인하고, 배열이 아니면 배열로 변환
      const nationArray = Array.isArray(schedule.nation) 
        ? schedule.nation 
        : (typeof schedule.nation === 'string' ? [schedule.nation] : []);
      
      const key = nationArray.join(' + ');
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(schedule);
    });

    return grouped;
  };

  // productScheduleData를 파싱하여 선택된 도시 정보 생성
  const getSelectedCitiesFromSchedule = async (product: any): Promise<Array<{ index: number; city: any; nights: number }>> => {
    if (!product.productScheduleData) {
      // productScheduleData가 없으면 장바구니의 도시들 사용
      const selectedCities = await Promise.all(
        cityDetails.map(async (city, index) => {
          try {
            const res = await axios.get(`${AdminURL}/ceylontour/getcityinfobyid/${city.id}`);
            const cityDetail = res.data && res.data.length > 0 ? res.data[0] : null;
            if (cityDetail) {
              const nights = selectedNights[city.id] || city.nights || 2;
              return {
                index: index,
                city: cityDetail,
                nights: nights
              };
            }
            return null;
          } catch (error) {
            console.error(`도시 ${city.id} 정보 가져오기 오류:`, error);
            return null;
          }
        })
      );
      return selectedCities.filter((city): city is NonNullable<typeof city> => city !== null);
    }

    try {
      const scheduleData = JSON.parse(product.productScheduleData);
      if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        return [];
      }

      const selectedCities: Array<{ index: number; city: any; nights: number }> = [];
      const usedCityIds = new Set<string | number>();

      for (let i = 0; i < scheduleData.length && i < cityDetails.length; i++) {
        const item = scheduleData[i];
        const city = cityDetails[i];
        const dayNight = item.dayNight || '';
        const nights = dayNight ? parseInt(dayNight.replace(/[^0-9]/g, ''), 10) || 0 : (selectedNights[city.id] || city.nights || 2);

        if (city && !usedCityIds.has(city.id)) {
          try {
            const res = await axios.get(`${AdminURL}/ceylontour/getcityinfobyid/${city.id}`);
            const cityDetail = res.data && res.data.length > 0 ? res.data[0] : null;
            if (cityDetail) {
              usedCityIds.add(city.id);
              selectedCities.push({
                index: i,
                city: cityDetail,
                nights: nights
              });
            }
          } catch (error) {
            console.error(`도시 ${city.id} 정보 가져오기 오류:`, error);
          }
        }
      }

      return selectedCities;
    } catch (e) {
      console.error('productScheduleData 파싱 오류:', e);
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="europe-schedule-edit">
        <div className="loading-message">로딩 중...</div>
      </div>
    );
  }

  if (cityCart.length === 0) {
    return (
      <div className="europe-schedule-edit">
        <div className="empty-message">장바구니에 도시가 없습니다.</div>
        <button onClick={() => navigate('/counsel/europe/city')} className="back-button">
          도시 선택하러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="europe-schedule-edit">
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
            {cityDetails.map((city) => {
              const nights = selectedNights[city.id] || city.nights || 2;
              return `${city.cityKo} ${nights}박`;
            }).join(' + ')}
          </div>
        </div>

        {/* 도시 리스트 */}
        <div className="city-cards-section">
          <div className="section-title">담은 도시</div>
          <div className="city-cards">
            {cityDetails.map((city, index) => {
              const nights = selectedNights[city.id] || city.nights || 2;
              
              return (
                <div key={city.id} className="city-card">
                  <div className="city-card-day">{index + 1}일차</div>
                  <div className="city-card-header">
                    <div className="city-card-badge">
                      {city.nation || ''}
                    </div>
                    <div className="city-card-title">{city.cityKo}</div>
                  </div>
                  <div className="city-card-content">
                    <div className="city-card-nights-control">
                      <button
                        className="nights-btn"
                        onClick={() => handleNightsChange(city.id, -1)}
                        disabled={nights <= 1}
                      >
                        -
                      </button>
                      <span className="nights-value">{nights}박</span>
                      <button
                        className="nights-btn"
                        onClick={() => handleNightsChange(city.id, 1)}
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

        
        {/* 상품 리스트 섹션 - EuropeCityDetail과 동일한 UI */}
        <div className="schedule-list-container">
          {/* 국가 제목 */}
          <h2 className="selected-nation-title">{nation || (cityDetails.length > 0 ? cityDetails[0]?.nation : '')}</h2>

          {/* 탭 네비게이션 */}
          <div className="schedule-tabs">
            {(() => {
              const selectedNation = nation || (cityDetails.length > 0 ? cityDetails[0]?.nation : '');
              return ['전체', `${selectedNation}온니`, `${selectedNation}외 1개국`, `${selectedNation}외 2개국`, `${selectedNation}외 3개국`].map((tab) => (
                <button
                  key={tab}
                  className={`schedule-tab ${scheduleFilter === tab ? 'active' : ''}`}
                  onClick={() => setScheduleFilter(tab)}
                >
                  {tab}
                </button>
              ));
            })()}
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
                    const periodText = schedule.tourPeriodData?.periodNight && schedule.tourPeriodData?.periodDay
                      ? `${schedule.tourPeriodData.periodNight} ${schedule.tourPeriodData.periodDay}`
                      : '';
                    
                    // nation이 배열인지 확인하고, 배열이 아니면 배열로 변환
                    const nationArray = Array.isArray(schedule.nation) 
                      ? schedule.nation 
                      : (typeof schedule.nation === 'string' ? [schedule.nation] : []);
                    
                    // 상세 정보는 productName에서 추출하거나 nation 배열을 기반으로 생성
                    const detailText = schedule.productName || nationArray.join(' + ');

                    return (
                      <div 
                        key={index} 
                        className="schedule-item"
                        onClick={() => {
                          if (schedule.id) {
                            // 상품명을 RecoilStore에 저장
                            const productNameToSave = schedule.productName || nationArray.join(' + ') + (schedule.tourPeriodData?.periodNight && schedule.tourPeriodData?.periodDay ? ` ${schedule.tourPeriodData.periodNight} ${schedule.tourPeriodData.periodDay}` : '');
                            setSavedProductName(productNameToSave);
                            
                            // 전체 일정 정보를 RecoilStore에 저장
                            setSelectedScheduleProduct(schedule);
                            
                            navigate(`/counsel/europe/schedulerecommend`, { state: schedule });
                            window.scrollTo(0, 0);
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="schedule-item-content">
                          <h4 className="schedule-item-title">
                           {nationArray.join(' + ')} {periodText}
                          </h4>
                          <p className="schedule-item-detail">{detailText}</p>
                        </div>
                        {index === 0 && groupKey === (nation || (cityDetails.length > 0 ? cityDetails[0]?.nation : '')) && (
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
  );
}
