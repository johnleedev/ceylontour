import React from 'react';
import './EuropeCityDetail.scss';
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import rectangle580 from '../../../lastimages/counselrest/hotel/detail/rectangle-580.png';
import { useEffect } from 'react';
import { AdminURL } from '../../../../MainURL';
import axios from 'axios';
import Image_morisus from '../../../lastimages/counselrest/trip/mapimage.png';
import GoogleMap from '../../../common/GoogleMap';
import RatingBoard from '../../../common/RatingBoard';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { recoilProductName, recoilSelectedScheduleProduct, recoilCityCart, CityCartItem } from '../../../../RecoilStore';


export default function EuropeCityDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const ID = queryParams.get("id");
  const NATION = queryParams.get("nation");
  const fromDetail = queryParams.get("fromDetail") === 'true';
  const fromGo = queryParams.get("fromGo") === 'true';
  const setProductName = useSetRecoilState(recoilProductName);
  const setSelectedScheduleProduct = useSetRecoilState(recoilSelectedScheduleProduct);
  const setCityCart = useSetRecoilState(recoilCityCart);
  const cityCart = useRecoilValue(recoilCityCart);
  const setSavedProductName = useSetRecoilState(recoilProductName);

  const [cityInfo, setCityInfo] = React.useState<any | null>(null);
  const [selectedCityTab, setSelectedCityTab] = React.useState<number | null>(null);
  const [cityDetails, setCityDetails] = React.useState<Array<{
    id: number;
    cityKo: string;
    cityEn?: string;
    nation?: string;
    nights: number;
  }>>([]);
  const [selectedNights, setSelectedNights] = React.useState<{ [key: number]: number }>({});
  const [imageNotice, setImageNotice] = React.useState<any[]>([]); // 소개
  const [imageGuide, setImageGuide] = React.useState<any[]>([]); // 가이드투어
  const [imageEnt, setImageEnt] = React.useState<any[]>([]); // 입장/체험
  const [imageEvent, setImageEvent] = React.useState<any[]>([]); // 경기/공연
  const [imageCafe, setImageCafe] = React.useState<any[]>([]); // 레스토랑/카페
  const [imageMainPoint, setImageMainPoint] = React.useState<any[]>([]);
  const [imageBenefit, setImageBenefit] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);



  useEffect(() => {
    // fromGo=true일 때는 장바구니 도시 일정을 가져오는 별도 로직 사용
    if (fromGo) return;
    
    const fetchHotelInfo = async () => {
      if (!ID) return;
      
      try {
        const res = await axios.get(`${AdminURL}/ceylontour/getcityinfobyid/${ID}`);
        if (res.data) {
          const copy = [...res.data][0];
          console.log(copy);
          setCityInfo(copy);
          
          // 핵심 포인트 이미지 파싱
          if (copy.imageNamesMainPoint) {
            try {
              const parsedMainPoint = JSON.parse(copy.imageNamesMainPoint);
              if (Array.isArray(parsedMainPoint) && parsedMainPoint.length > 0) {
                setImageMainPoint(parsedMainPoint);
              } else {
                setImageMainPoint([]);
              }
            } catch (e) {
              console.error('핵심 포인트 이미지 파싱 오류:', e);
              setImageMainPoint([]);
            }
          } else {
            setImageMainPoint([]);
          }
          
          // 베네핏 이미지 파싱
          if (copy.imageNamesBenefit) {
            try {
              const parsedBenefit = JSON.parse(copy.imageNamesBenefit);
              if (Array.isArray(parsedBenefit) && parsedBenefit.length > 0) {
                setImageBenefit(parsedBenefit);
              } else {
                setImageBenefit([]);
              }
            } catch (e) {
              console.error('베네핏 이미지 파싱 오류:', e);
              setImageBenefit([]);
            }
          } else {
            setImageBenefit([]);
          }
        } else {
          setCityInfo(null);
          setImageMainPoint([]);
          setImageBenefit([]);
        }
        const response = await axios.get(`${AdminURL}/ceylontour/getschedulenation/${NATION}`);
        if (response.data) {
          const copy = [...response.data];
          setProducts(copy);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error('나라별 여행상품을 가져오는 중 오류 발생:', error);
        setCityInfo(null);
        setImageMainPoint([]);
        setImageBenefit([]);
        setProducts([]);
      }
    };

    fetchHotelInfo();
  }, [ID, NATION, fromGo]);

  // 장바구니에서 도시 목록 가져오기 (GO 버튼으로 진입한 경우)
  useEffect(() => {
    const fetchCityDetails = async () => {
      if (fromDetail || !fromGo || cityCart.length === 0) {
        return;
      }

      try {
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
                cityEn: item.cityEn,
                nation: item.nation,
                nights: item.nights || 2
              };
            } catch (error) {
              console.error(`도시 ${item.id} 정보 가져오기 오류:`, error);
              return {
                id: item.id,
                cityKo: item.cityKo,
                cityEn: item.cityEn,
                nation: item.nation,
                nights: item.nights || 2
              };
            }
          })
        );

        setCityDetails(details);
        
        // 초기 박수 설정
        const initialNights: { [key: number]: number } = {};
        details.forEach((city) => {
          initialNights[city.id] = city.nights;
        });
        setSelectedNights(initialNights);
        
        // 첫 번째 도시를 기본 선택 (현재 ID와 일치하는 도시가 있으면 그것을 선택)
        const currentCityIndex = details.findIndex(c => c.id === Number(ID));
        if (currentCityIndex !== -1) {
          setSelectedCityTab(currentCityIndex);
          // 첫 번째 도시 정보를 cityInfo에 설정
          const firstCity = details[currentCityIndex];
          const res = await axios.get(`${AdminURL}/ceylontour/getcityinfobyid/${firstCity.id}`);
          if (res.data && res.data.length > 0) {
            const city = res.data[0];
            setCityInfo(city);
            
            // 핵심 포인트 이미지 파싱
            if (city.imageNamesMainPoint) {
              try {
                const parsedMainPoint = JSON.parse(city.imageNamesMainPoint);
                if (Array.isArray(parsedMainPoint) && parsedMainPoint.length > 0) {
                  setImageMainPoint(parsedMainPoint);
                } else {
                  setImageMainPoint([]);
                }
              } catch (e) {
                console.error('핵심 포인트 이미지 파싱 오류:', e);
                setImageMainPoint([]);
              }
            } else {
              setImageMainPoint([]);
            }
            
            // 베네핏 이미지 파싱
            if (city.imageNamesBenefit) {
              try {
                const parsedBenefit = JSON.parse(city.imageNamesBenefit);
                if (Array.isArray(parsedBenefit) && parsedBenefit.length > 0) {
                  setImageBenefit(parsedBenefit);
                } else {
                  setImageBenefit([]);
                }
              } catch (e) {
                console.error('베네핏 이미지 파싱 오류:', e);
                setImageBenefit([]);
              }
            } else {
              setImageBenefit([]);
            }
          }
        } else if (details.length > 0) {
          setSelectedCityTab(0);
          // 첫 번째 도시 정보를 cityInfo에 설정
          const firstCity = details[0];
          const res = await axios.get(`${AdminURL}/ceylontour/getcityinfobyid/${firstCity.id}`);
          if (res.data && res.data.length > 0) {
            const city = res.data[0];
            setCityInfo(city);
            
            // 핵심 포인트 이미지 파싱
            if (city.imageNamesMainPoint) {
              try {
                const parsedMainPoint = JSON.parse(city.imageNamesMainPoint);
                if (Array.isArray(parsedMainPoint) && parsedMainPoint.length > 0) {
                  setImageMainPoint(parsedMainPoint);
                } else {
                  setImageMainPoint([]);
                }
              } catch (e) {
                console.error('핵심 포인트 이미지 파싱 오류:', e);
                setImageMainPoint([]);
              }
            } else {
              setImageMainPoint([]);
            }
            
            // 베네핏 이미지 파싱
            if (city.imageNamesBenefit) {
              try {
                const parsedBenefit = JSON.parse(city.imageNamesBenefit);
                if (Array.isArray(parsedBenefit) && parsedBenefit.length > 0) {
                  setImageBenefit(parsedBenefit);
                } else {
                  setImageBenefit([]);
                }
              } catch (e) {
                console.error('베네핏 이미지 파싱 오류:', e);
                setImageBenefit([]);
              }
            } else {
              setImageBenefit([]);
            }
          }
        }
        
        // 장바구니에 담은 모든 도시들의 국가 목록 추출
        const cartNations = Array.from(new Set(details.map(city => city.nation).filter(Boolean) as string[]));
        
        // 모든 국가의 일정 가져오기
        const allProducts: any[] = [];
        for (const nation of cartNations) {
          try {
            const response = await axios.get(`${AdminURL}/ceylontour/getschedulenation/${nation}`);
            if (response.data && Array.isArray(response.data)) {
              allProducts.push(...response.data);
            }
          } catch (error) {
            console.error(`${nation} 국가 일정 가져오기 오류:`, error);
          }
        }
        console.log('allProducts', allProducts);
        
        // 중복 제거 (같은 id를 가진 일정은 하나만 유지)
        const uniqueProducts = allProducts.reduce((acc: any[], current: any) => {
          const exists = acc.find(item => item.id === current.id);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        setProducts(uniqueProducts);
        
        // fromGo=true일 때는 탭 필터를 '전체'로 설정
        setScheduleFilter('전체');
        
        // 첫 번째 도시를 기본 선택 (스케줄 필터링용)
        if (details.length > 0) {
          setSelectedCityForSchedule(details[0].id);
        }
      } catch (error) {
        console.error('도시 정보 가져오기 오류:', error);
      }
    };

    fetchCityDetails();
  }, [cityCart, ID, fromDetail, fromGo]);

  // 선택된 도시 탭에 따라 도시 정보 업데이트 (fromGo=true일 때는 이미지 정보만 업데이트, 일정은 변경하지 않음)
  useEffect(() => {
    if (fromDetail || !fromGo || cityDetails.length === 0 || selectedCityTab === null) {
      return;
    }

    const selectedCity = cityDetails[selectedCityTab];
    if (!selectedCity) return;

    const fetchSelectedCityInfo = async () => {
      try {
        const res = await axios.get(`${AdminURL}/ceylontour/getcityinfobyid/${selectedCity.id}`);
        if (res.data && res.data.length > 0) {
          const city = res.data[0];
          setCityInfo(city);
          
          // 도시 이미지 파싱 (일정은 변경하지 않음 - 이미 장바구니 모든 도시의 일정을 가져왔으므로)
          try {
            const noticeImages = JSON.parse(city.imageNamesNotice || '[]');
            setImageNotice(Array.isArray(noticeImages) ? noticeImages : []);
          } catch (e) {
            setImageNotice([]);
          }

          try {
            const guideImages = JSON.parse(city.imageNamesGuide || '[]');
            setImageGuide(Array.isArray(guideImages) ? guideImages : []);
          } catch (e) {
            setImageGuide([]);
          }

          try {
            const entImages = JSON.parse(city.imageNamesEnt || '[]');
            setImageEnt(Array.isArray(entImages) ? entImages : []);
          } catch (e) {
            setImageEnt([]);
          }

          try {
            const eventImages = JSON.parse(city.imageNamesEvent || '[]');
            setImageEvent(Array.isArray(eventImages) ? eventImages : []);
          } catch (e) {
            setImageEvent([]);
          }

          try {
            const cafeImages = JSON.parse(city.imageNamesCafe || '[]');
            setImageCafe(Array.isArray(cafeImages) ? cafeImages : []);
          } catch (e) {
            setImageCafe([]);
          }
          
          // 핵심 포인트 이미지 파싱
          if (city.imageNamesMainPoint) {
            try {
              const parsedMainPoint = JSON.parse(city.imageNamesMainPoint);
              if (Array.isArray(parsedMainPoint) && parsedMainPoint.length > 0) {
                setImageMainPoint(parsedMainPoint);
              } else {
                setImageMainPoint([]);
              }
            } catch (e) {
              console.error('핵심 포인트 이미지 파싱 오류:', e);
              setImageMainPoint([]);
            }
          } else {
            setImageMainPoint([]);
          }
          
          // 베네핏 이미지 파싱
          if (city.imageNamesBenefit) {
            try {
              const parsedBenefit = JSON.parse(city.imageNamesBenefit);
              if (Array.isArray(parsedBenefit) && parsedBenefit.length > 0) {
                setImageBenefit(parsedBenefit);
              } else {
                setImageBenefit([]);
              }
            } catch (e) {
              console.error('베네핏 이미지 파싱 오류:', e);
              setImageBenefit([]);
            }
          } else {
            setImageBenefit([]);
          }
          
          // fromGo=true일 때는 일정을 다시 가져오지 않음 (이미 장바구니 모든 도시의 일정을 가져왔으므로)
        }
      } catch (error) {
        console.error('선택된 도시 정보 가져오기 오류:', error);
      }
    };

    fetchSelectedCityInfo();
  }, [selectedCityTab, cityDetails, fromDetail, fromGo]);

  // schedule 데이터 파싱 및 그룹화 (도시 기준, EuropeTripPage와 동일한 로직)
  const getGroupedSchedules = () => {
    if (!products || products.length === 0) return {};

    const schedules = products.map((item: any) => {
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
      filtered = filtered.filter((s: any) => 
        s.productName.toLowerCase().includes(scheduleSearch.toLowerCase())
      );
    }

    // fromGo=true일 때는 장바구니에 담은 도시들에 해당하는 스케줄만 표시
    if (fromGo && cityDetails.length > 0) {
      // 전체 장바구니 도시 이름 목록 추출 (매칭 개수 계산용)
      const allCartCityNames = cityDetails.map(city => city.cityKo).filter(Boolean);
      
      // 선택된 도시가 있으면 해당 도시가 포함된 스케줄만 필터링
      const selectedCityName = selectedCityForSchedule 
        ? cityDetails.find(city => city.id === selectedCityForSchedule)?.cityKo
        : null;
      
      // 각 스케줄에 포함된 장바구니 도시 개수를 계산하고 필터링
      filtered = filtered.map((s: any) => {
        // productScheduleData에서 도시 정보 추출
        let scheduleCities: string[] = [];
        try {
          if (s.productScheduleData && s.productScheduleData !== '[]' && s.productScheduleData.trim() !== '') {
            const parsed = JSON.parse(s.productScheduleData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              scheduleCities = parsed.map((item: any) => {
                // item이 객체면 city 필드, 문자열이면 그대로 사용
                if (typeof item === 'string') {
                  return item;
                } else if (item && typeof item === 'object') {
                  return item.city || item.cityKo || '';
                }
                return '';
              }).filter(Boolean);
            }
          }
        } catch (e) {
          // 파싱 실패 시 무시하고 productName에서 추출 시도
        }
        
        // productScheduleData에서 도시를 추출하지 못했으면 productName에서 추출
        if (scheduleCities.length === 0 && s.productName) {
          // productName에서 도시 이름 추출 (예: "루체른 1박 + 인터라켄 2박" 또는 "파리 4박")
          const nameParts = s.productName.split('+').map((part: string) => {
            // 숫자와 "박", "일" 제거하고 도시 이름만 추출
            // 예: "파리 4박" -> "파리", "루체른 1박" -> "루체른"
            return part.trim().replace(/\s*\d+\s*(박|일)\s*/g, '').trim();
          });
          scheduleCities = nameParts.filter(Boolean);
        }
        
        // 장바구니 도시 중 스케줄에 포함된 도시 개수 계산 (전체 장바구니 기준)
        let matchedCityCount = 0;
        if (scheduleCities.length > 0) {
          // 각 스케줄 도시가 장바구니 도시 중 하나와 매칭되는지 확인
          matchedCityCount = allCartCityNames.filter(cartCity => 
            scheduleCities.some(scheduleCity => {
              // 정확히 일치하거나 서로 포함 관계인지 확인
              const scheduleCityTrimmed = scheduleCity.trim();
              const cartCityTrimmed = cartCity.trim();
              return scheduleCityTrimmed === cartCityTrimmed || 
                     scheduleCityTrimmed.includes(cartCityTrimmed) || 
                     cartCityTrimmed.includes(scheduleCityTrimmed);
            })
          ).length;
        }
        
        // 선택된 도시가 있으면 해당 도시가 포함된 스케줄인지 확인
        let hasSelectedCity = false;
        if (selectedCityName && scheduleCities.length > 0) {
          hasSelectedCity = scheduleCities.some(scheduleCity => {
            const scheduleCityTrimmed = scheduleCity.trim();
            const selectedCityTrimmed = selectedCityName.trim();
            return scheduleCityTrimmed === selectedCityTrimmed || 
                   scheduleCityTrimmed.includes(selectedCityTrimmed) || 
                   selectedCityTrimmed.includes(scheduleCityTrimmed);
          });
        }
        
        // 디버깅을 위한 로그
        // console.log(`[스케줄 ID: ${s.id}] 상품명: ${s.productName}, 추출된 도시: [${scheduleCities.join(', ')}], 장바구니 도시: [${cartCityNames.join(', ')}], 매칭된 도시 수: ${matchedCityCount}`);
        
        // 포함된 장바구니 도시 개수와 선택된 도시 포함 여부를 스케줄 객체에 추가
        return {
          ...s,
          matchedCityCount: matchedCityCount,
          hasSelectedCity: hasSelectedCity
        };
      }).filter((s: any) => {
        // 선택된 도시가 있으면 해당 도시가 포함된 스케줄만 표시
        // 선택된 도시가 없으면 2개 이상 포함된 스케줄만 필터링
        if (selectedCityForSchedule) {
          return s.hasSelectedCity && s.matchedCityCount >= 2;
        }
        return s.matchedCityCount >= 2;
      });
    } else if (fromDetail || (!fromGo && cityInfo)) {
      // fromDetail=true일 때는 기존 로직 (현재 도시의 국가 기준으로 필터링)
      const selectedNation = cityInfo?.nation || '';
      if (!selectedNation) return {};
      
      // 탭 필터 (EuropeTripPage와 동일한 로직, 국가명으로 비교)
      if (scheduleFilter !== '전체') {
        if (scheduleFilter.includes('온니')) {
          filtered = filtered.filter((s: any) => s.nation.length === 1 && s.nation[0] === selectedNation);
        } else if (scheduleFilter.includes('외 1개국')) {
          filtered = filtered.filter((s: any) => s.nation.length === 2 && s.nation.includes(selectedNation));
        } else if (scheduleFilter.includes('외 2개국')) {
          filtered = filtered.filter((s: any) => s.nation.length === 3 && s.nation.includes(selectedNation));
        } else if (scheduleFilter.includes('외 3개국')) {
          filtered = filtered.filter((s: any) => s.nation.length === 4 && s.nation.includes(selectedNation));
        }
      }
    }

    // 그룹화
    let grouped: { [key: string]: any[] } = {};
    
    if (fromGo && cityDetails.length > 0) {
      // 선택된 도시가 있으면 포함된 도시 개수에 따라 그룹화 (4개 이상 > 3개 이상 > 2개 이상)
      if (selectedCityForSchedule) {
        filtered.forEach((schedule: any) => {
          const matchedCount = schedule.matchedCityCount || 0;
          let key = '';
          if (matchedCount >= 4) {
            key = '4개 이상 포함';
          } else if (matchedCount >= 3) {
            key = '3개 이상 포함';
          } else if (matchedCount >= 2) {
            key = '2개 이상 포함';
          }
          
          if (key) {
            if (!grouped[key]) {
              grouped[key] = [];
            }
            grouped[key].push(schedule);
          }
        });
        
        // 그룹 키를 포함된 도시 개수 순서로 정렬 (4개 이상 > 3개 이상 > 2개 이상)
        const sortedGroupKeys = ['4개 이상 포함', '3개 이상 포함', '2개 이상 포함'].filter(key => grouped[key]);
        
        // 정렬된 순서대로 새로운 그룹 객체 생성
        const sortedGrouped: { [key: string]: any[] } = {};
        sortedGroupKeys.forEach(key => {
          sortedGrouped[key] = grouped[key];
        });
        
        return sortedGrouped;
      }
      
      // 선택된 도시가 없으면 포함된 도시 개수에 따라 그룹화 (4개 > 3개 > 2개 순서)
      filtered.forEach((schedule: any) => {
        const matchedCount = schedule.matchedCityCount || 0;
        if (matchedCount >= 2) {
          const key = `${matchedCount}개 도시 포함`;
          if (!grouped[key]) {
            grouped[key] = [];
          }
          grouped[key].push(schedule);
        }
      });
      
      // 그룹 키를 포함된 도시 개수 순서로 정렬 (4개 > 3개 > 2개)
      const sortedGroupKeys = Object.keys(grouped).sort((a, b) => {
        const countA = parseInt(a.replace('개 도시 포함', ''));
        const countB = parseInt(b.replace('개 도시 포함', ''));
        return countB - countA; // 내림차순
      });
      
      // 정렬된 순서대로 새로운 그룹 객체 생성
      const sortedGrouped: { [key: string]: any[] } = {};
      sortedGroupKeys.forEach(key => {
        sortedGrouped[key] = grouped[key];
      });
      
      return sortedGrouped;
    } else {
      // 기존 로직: nation 배열을 기준으로 그룹화
      filtered.forEach((schedule: any) => {
        const key = schedule.nation.join(' + ');
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(schedule);
      });
    }

    return grouped;
  };

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

  // 선택된 도시 정보를 일차별로 파싱하여 반환 (일정 데이터에 도시 정보 입력용)
  // 예: "루체른 1박 + 인터라켄 2박" -> day1: 루체른, day2,3: 인터라켄
  const getCityInfoPerDay = (cities: Array<{ index: number; city: any; nights: number }>) => {
    const cityInfoPerDay: Array<{ dayIndex: number; cityName: string }> = [];
    let currentDay = 0;

    cities.forEach((cityItem) => {
      const nights = cityItem.nights || 2;
      const cityName = cityItem.city?.cityKo || cityItem.city?.city || '';

      // 각 박수만큼 일정 일자에 도시 정보 추가
      for (let i = 0; i < nights; i++) {
        cityInfoPerDay.push({
          dayIndex: currentDay,
          cityName: cityName
        });
        currentDay++;
      }
    });

    return cityInfoPerDay;
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
      const firstNation = cityDetails[0]?.nation || NATION || '';
      if (firstNation) {
        try {
          const response = await axios.get(`${AdminURL}/ceylontour/getschedulenation/${firstNation}`);
          if (response.data && response.data.length > 0) {
            productInfo = response.data[0];
          }
        } catch (error) {
          console.error('상품 정보 가져오기 오류:', error);
        }
      }

      // 상품명 생성
      const nameParts = cityDetails.map((city) => {
        const nights = selectedNights[city.id] || city.nights || 2;
        return `${city.cityKo} ${nights}박`;
      });
      const productName = nameParts.join(' + ');

      // 상품명을 RecoilStore에 저장
      setSavedProductName(productName);

      // 도시와 박수를 기반으로 새로운 일정 데이터 생성
      const customScheduleInfo = createScheduleFromCities(validSelectedCities);

      // productScheduleData 생성 (도시 탭 표시를 위해 필요)
      const productScheduleData = validSelectedCities.map((cityItem) => ({
        city: cityItem.city?.cityKo || cityItem.city?.city || '',
        dayNight: `${cityItem.nights}박`
      }));

      // 일차별 도시 정보 파싱
      const cityInfoPerDay = getCityInfoPerDay(validSelectedCities);

      // EuropeScheduleCost로 이동
      navigate('/counsel/europe/schedulerecommend', {
        state: {
          selectedCities: validSelectedCities.map(sc => sc.city),
          cityCart: updatedCart,
          productInfo: productInfo,
          nation: firstNation,
          isFromMakeButton: true, // '만들기' 버튼에서 온 것임을 표시
          customScheduleInfo: customScheduleInfo, // 도시 기반 일정 데이터
          productScheduleData: JSON.stringify(productScheduleData), // 도시 탭 표시를 위한 데이터
          cityInfoPerDay: cityInfoPerDay // 일차별 도시 정보
        }
      });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const btnSolids = [
    { text: '소개' },
    { text: '하이라이트' },
    { text: '입장/체험' },
    { text: '경기/공연' },
    { text: '레스토랑/카페' }
  ];

  const [activeTab, setActiveTab] = React.useState(0);
  const [activeRightTab, setActiveRightTab] = React.useState<'info' | 'product' | 'custom'>('product');
  const [showRightPanel, setShowRightPanel] = React.useState(false);
  const [selectedMainImageIndex, setSelectedMainImageIndex] = React.useState(0);
  const [scheduleFilter, setScheduleFilter] = React.useState('전체');
  const [scheduleSearch, setScheduleSearch] = React.useState('');
  const [selectedCityForSchedule, setSelectedCityForSchedule] = React.useState<number | null>(null); // fromGo=true일 때 선택된 도시 ID
  const [showTopButton, setShowTopButton] = React.useState(false);
  const thumbnailContainerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  useEffect(() => {
    if (cityInfo) {
      
      // 도시 이미지 파싱 (탭별로 분리)
      try {
        const noticeImages = JSON.parse(cityInfo.imageNamesNotice || '[]');
        setImageNotice(Array.isArray(noticeImages) ? noticeImages : []);
      } catch (e) {
        setImageNotice([]);
      }

      try {
        const guideImages = JSON.parse(cityInfo.imageNamesGuide || '[]');
        setImageGuide(Array.isArray(guideImages) ? guideImages : []);
      } catch (e) {
        setImageGuide([]);
      } 

      try {
        const entImages = JSON.parse(cityInfo.imageNamesEnt || '[]');
        setImageEnt(Array.isArray(entImages) ? entImages : []);
      } catch (e) {
        setImageEnt([]);
      }

      try {
        const eventImages = JSON.parse(cityInfo.imageNamesEvent || '[]');
        setImageEvent(Array.isArray(eventImages) ? eventImages : []);
      } catch (e) {
        setImageEvent([]);
      }

      try {
        const cafeImages = JSON.parse(cityInfo.imageNamesCafe || '[]');
        setImageCafe(Array.isArray(cafeImages) ? cafeImages : []);
      } catch (e) {
        setImageCafe([]);
      }

      // 도시 관련 상품 가져오기
      if (cityInfo.city) {
        // fetchCityProducts(cityInfo.city);
      }
    }
  }, [cityInfo]);

  // 탭 변경 시 선택된 메인 이미지를 첫번째로 리셋
  useEffect(() => {
    setSelectedMainImageIndex(0);
  }, [activeTab]);

  // 스크롤 위치에 따라 탑 버튼 표시/숨김
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopButton(true);
      } else {
        setShowTopButton(false);
      }
    };

    // 초기 스크롤 위치 확인
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 도시 탭 변경 시 이미지 탭을 '소개'로 리셋
  useEffect(() => {
    if (selectedCityTab !== null) {
      setActiveTab(0);
    }
  }, [selectedCityTab]);

  // 데이터가 로드되지 않았다면 상세 내용을 렌더링하지 않음
  if (!cityInfo) {
    return null;
  }

  // 현재 탭에 따른 이미지 리스트
  const getCurrentImages = () => {
    if (activeTab === 0) return imageNotice;
    if (activeTab === 1) return imageGuide; 
    if (activeTab === 2) return imageEnt; 
    if (activeTab === 3) return imageEvent;
    return imageCafe;
  };

  // 파일이 동영상인지 확인
  const isVideoFile = (fileName: string) => {
    if (!fileName) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
    const lowerFileName = fileName.toLowerCase();
    return videoExtensions.some(ext => lowerFileName.endsWith(ext));
  };

  // 헤더에 사용할 첫 번째 이미지 가져오기
  const getHeaderImage = () => {
    if (imageNotice && imageNotice.length > 0) {
      const firstImage = imageNotice[0];
      const imageName = typeof firstImage === 'string' ? firstImage : firstImage.imageName;
      if (imageName) {
        return `${AdminURL}/images/cityimages/${imageName}`;
      }
    }
    return rectangle580; // 기본 이미지
  };



 
  // 핵심 포인트 아이템 생성 (데이터에서 가져온 이미지 사용)
  const highlightItems = imageMainPoint.map((item: any) => ({
    image: `${AdminURL}/images/cityimages/${item.imageName}`,
    title: item.title || '',
    notice: item.notice || '',
  }));

  // 베네핏 아이템 생성 (데이터에서 가져온 이미지 사용)
  const benefitItems = imageBenefit.map((item: any) => ({
    title: item.title || '',
    text: item.notice || '',
    image: `${AdminURL}/images/cityimages/${item.imageName}`,
  }));


  return (
    <div className="EuropeCityDetail">
      <div className="city-detail-container">
      {/* 왼쪽 상단 뒤로가기 버튼 */}
      {/* <button
        type="button"
        className="left-back-btn"
        onClick={() => navigate(-1)}
      >
        <IoIosArrowBack />
      </button> */}

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

      <div className={`city-container ${showRightPanel ? 'with-right-panel' : 'without-right-panel'}`}>
        {/* 왼쪽 영역: 기존 내용 */}
        <div className="left-section">
        
          {/* {!showRightPanel && (
            <div className="city-header-image">
              <img
                className="header-image-media"
                alt="도시 메인 이미지"
                src={getHeaderImage()}
              />
              <div className="header-image-overlay"></div>
              <div className="city-title-overlay">
                <div className="city-title-content">
                  <div className="text-title">{cityInfo?.cityKo || '도시명'}</div>
                  <div className="text-subtitle">
                    {cityInfo?.cityEn || ''}
                  </div>
                  <div className="text-location">
                    <p>{cityInfo?.nation || ''}</p>
                    <IoIosArrowForward />
                    <p>{cityInfo?.cityKo || ''}</p>
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* Breadcrumb Navigation */}
          <div className="breadcrumb-nav-wrapper">
            <div className="breadcrumb-nav">
              <span 
                className="breadcrumb-item"
                onClick={() => navigate('/counsel')}
              >
                HOME
              </span>
              <IoIosArrowForward className="breadcrumb-separator"/>
              <span 
                className="breadcrumb-item"
                onClick={() => navigate('/counsel/europe')}
              >
                유럽
              </span>
              {NATION && (
                <>
                  <IoIosArrowForward className="breadcrumb-separator"/>
                  <span 
                    className="breadcrumb-item"
                    onClick={() => navigate(-1)}
                  >
                    {NATION}
                  </span>
                </>
              )}
              {/* {cityInfo?.cityKo && (
                <>
                  <IoIosArrowForward className="breadcrumb-separator"/>
                  <span className="breadcrumb-item breadcrumb-item-current">
                    {cityInfo.cityKo}
                  </span>
                </>
              )} */}
            </div>
          </div>
          
          
          
          {/* 도시 탭 (GO 버튼으로 진입한 경우에만 표시) */}
          {!fromDetail && fromGo && cityDetails.length > 0 && (
            <div className="city-tabs-container"> 
              <div className="city-tabs-left">
                {cityDetails.map((city, index) => (
                  <button
                    key={city.id}
                    type="button"
                    className={`city-tab-button ${selectedCityTab === index ? 'active' : ''}`}
                    onClick={() => setSelectedCityTab(index)}
                  >
                    {city.cityKo}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 도시 정보 표시 */}
          <div className="city-title-top-wrapper">
            <IoIosArrowBack
              className="arrow-back"
              onClick={() => navigate(-1)}
            />
            <div className="text-title">{cityInfo?.cityKo || '도시명'}</div>
            <div className="text-subtitle">
              {cityInfo?.cityEn || ''}
            </div>
            
            <div className="text-location">
              <p>{cityInfo?.nation || ''}</p>
              <IoIosArrowForward />
              <p>{cityInfo?.cityKo || ''}</p>
            </div>
          </div>

          {/* 태그 섹션 */}
          <div className="city-tags-wrapper">
            <div className="city-tags">
              <span className="city-tag">#역사</span>
              <span className="city-tag">#문화</span>
              <span className="city-tag">#예술</span>
              <span className="city-tag">#음식</span>
              <span className="city-tag">#쇼핑</span>
              <span className="city-tag">#야경</span>
            </div>
          </div>

          
          <div className="city-center-wrapper">

            <div className="room-container-wrapper">
              <div className="room-container-left">
                {btnSolids.map(({ text }, index) => (
                  <button
                    key={text}
                    type="button"
                    className={`roomtabsort ${activeTab === index ? 'active' : ''}`}
                    onClick={() => setActiveTab(index)}
                  >
                    {text}
                  </button>
                ))}
              </div>
              <div className="room-container-right">
                {cityInfo?.weather && (
                  <span className="weather-text">{cityInfo.weather.split('\n')[0]}</span>
                )}
              </div>
            </div>

            {/* 소개 탭일 때는 도시 정보 표시, 나머지 탭은 이미지 표시 */}
            {activeTab === 0 ? (
              <>
                <div className="photo-gallery">
                  <div className="photo-main">
                    {(() => {
                      const images = getCurrentImages();
                      const hasImages = images && images.length > 0;
                      const totalImages = images ? images.length : 0;
                      
                      return (
                        <>
                          {hasImages && totalImages > 1 && (
                            <button
                              className="photo-nav-button photo-nav-prev"
                              onClick={() => {
                                setSelectedMainImageIndex((prev) => 
                                  prev === 0 ? totalImages - 1 : prev - 1
                                );
                              }}
                              aria-label="이전 이미지"
                            >
                              <IoIosArrowBack />
                            </button>
                          )}
                          
                          {hasImages ? (
                            (() => {
                              const main = images[selectedMainImageIndex];
                              const imageName = typeof main === 'string' ? main : main.imageName;
                              const isVideo = isVideoFile(imageName);
                              
                              if (isVideo) {
                                return (
                                  <video
                                    className="photo-main-image"
                                    controls
                                    src={`${AdminURL}/images/cityimages/${imageName}`}
                                  >
                                    브라우저가 비디오 태그를 지원하지 않습니다.
                                  </video>
                                );
                              }
                              
                              return (
                                <img
                                  className="photo-main-image"
                                  alt={typeof main === 'object' && main.title ? main.title : '메인 이미지'}
                                  src={`${AdminURL}/images/cityimages/${imageName}`}
                                  draggable={false}
                                  onDragStart={(e) => e.preventDefault()}
                                />
                              );
                            })()
                          ) : (
                            <img
                              className="photo-main-image"
                              alt="메인 이미지"
                              src={rectangle580}
                              draggable={false}
                              onDragStart={(e) => e.preventDefault()}
                            />
                          )}
                          
                          {hasImages && totalImages > 1 && (
                            <button
                              className="photo-nav-button photo-nav-next"
                              onClick={() => {
                                setSelectedMainImageIndex((prev) => 
                                  prev === totalImages - 1 ? 0 : prev + 1
                                );
                              }}
                              aria-label="다음 이미지"
                            >
                              <IoIosArrowForward />
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div 
                    className="photo-thumbnails"
                    ref={thumbnailContainerRef}
                    onMouseDown={(e) => {
                      if (!thumbnailContainerRef.current) return;
                      setIsDragging(true);
                      setStartX(e.pageX - thumbnailContainerRef.current.offsetLeft);
                      setScrollLeft(thumbnailContainerRef.current.scrollLeft);
                    }}
                    onMouseLeave={() => {
                      setIsDragging(false);
                    }}
                    onMouseUp={() => {
                      setIsDragging(false);
                    }}
                    onMouseMove={(e) => {
                      if (!isDragging || !thumbnailContainerRef.current) return;
                      e.preventDefault();
                      const x = e.pageX - thumbnailContainerRef.current.offsetLeft;
                      const walk = (x - startX) * 2; // 스크롤 속도 조절
                      thumbnailContainerRef.current.scrollLeft = scrollLeft - walk;
                    }}
                  >
                    {getCurrentImages().map((img: any, index: number) => {
                      const imageName = typeof img === 'string' ? img : img.imageName;
                      const isVideo = isVideoFile(imageName);
                      return (
                        <div
                          className={`photo-thumbnail ${selectedMainImageIndex === index ? 'active' : ''} ${isVideo ? 'video-thumbnail' : ''}`}
                          key={index}
                          onClick={(e) => {
                            // 드래그 중일 때는 클릭 이벤트 방지
                            if (isDragging) {
                              e.preventDefault();
                              return;
                            }
                            setSelectedMainImageIndex(index);
                          }}
                          onMouseDown={(e) => {
                            // 썸네일 클릭 시 드래그 시작을 방지하지 않음
                          }}
                        >
                          {isVideo ? (
                            <div className="thumbnail-video-wrapper">
                              <video
                                className="thumbnail-video"
                                src={`${AdminURL}/images/cityimages/${imageName}`}
                                muted
                                preload="metadata"
                              />
                              <div className="video-play-icon">▶</div>
                            </div>
                          ) : (
                            <img
                              src={`${AdminURL}/images/cityimages/${imageName}`}
                              alt={typeof img === 'object' && img.title ? img.title : `썸네일 ${index + 1}`}
                              draggable={false}
                              onDragStart={(e) => e.preventDefault()}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 도시 소개 섹션 */}
                <div className="city-intro-section">
                  <div className="city-intro-tagline">
                    유럽의 아름다운 문화와 역사를 경험할 수 있는 최고의 여행지
                  </div>
                  <div className="city-intro-name">
                    {cityInfo?.cityEn || cityInfo?.cityKo || '도시명'}
                  </div>
                  <div className="city-intro-description">
                    <p>중세 시대의 건축물과 현대적인 시설이 조화롭게 어우러져 있어 방문객들에게 잊을 수 없는 추억을 선사합니다.</p>
                    <p>특히 구시가지는 유네스코 세계문화유산으로 지정되어 있어 역사적 가치가 높습니다.</p>
                    <p>다양한 문화 행사와 축제가 연중 개최되어 활기찬 분위기를 자랑합니다.</p>
                  </div>
                </div>

                {highlightItems.length > 0 && (
                  <div className="highlight-section">
                    <div className="section-title">핵심 포인트</div>
                    <div className="highlight-list">
                      {highlightItems.map(({ image, title, notice }, index) => (
                        <div className="highlight-item" key={`${title}-${index}`}>
                          <div className="highlight-image-wrap">
                            <img src={image} alt={title} />
                          </div>
                          <div className="highlight-item-title">{title}</div>
                          <div className="highlight-item-desc">
                            {
                              notice.length > 40 ? (
                                notice.slice(0, 40) + '...'
                              ) : (
                                notice
                              )
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {benefitItems.length > 0 && (
                  <div className={`benefit-section`}>
                    <div className="section-title">베네핏 & 포함사항</div>
                    <div className="benefit-items">
                      {benefitItems.map(({ title, text, image }, index) => (
                        <div key={`${title}-${index}`} className="benefit-item">
                          <img className="rectangle" alt="Rectangle" src={image} />
                          <div className={`benefit-card benefit-card-${index + 1}`}>
                            <div className="benefit-title">{title}</div>
                            <div className="benefit-text">{text}</div>
                          </div>
                          <div className={`benefit-ribbon benefit-ribbon-${index + 1}`}>
                            실론투어
                            <br />
                            단독특전2
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* <div className="location-info-section">
                  <div className="section-title">위치</div>
                  <div className="location-content-wrapper">
                     <div className="location-map-placeholder">
                        <GoogleMap />
                      </div>
                  </div>
                </div> */}

                <div className="city-basic-images">
                  <img src={`${AdminURL}/images/citymapinfo/${cityInfo.courseImage}`} alt={cityInfo.cityKo} />
                </div>

                {/* imageNotice 이미지 전부 표시 */}
                <div className="tab-preview-images">
                  {imageNotice && imageNotice.length > 0 ? (
                    imageNotice.map((img: any, index: number) => {
                      console.log(img);
                      const imageName = typeof img === 'string' ? img : img.imageName;
                      const title = typeof img === 'object' && img.title ? img.title : '';
                      const isVideo = isVideoFile(imageName);
                      return (
                        <div key={`notice-${index}`} className="preview-image-item">
                          <div className="preview-image-wrapper">
                            {isVideo ? (
                              <video
                                className="preview-image"
                                controls
                                src={`${AdminURL}/images/cityimages/${imageName}`}
                              >
                                브라우저가 비디오 태그를 지원하지 않습니다.
                              </video>
                            ) : (
                              <img
                                className="preview-image"
                                alt={title || `소개 이미지 ${index + 1}`}
                                src={`${AdminURL}/images/cityimages/${imageName}`}
                              />
                            )}
                          </div>
                          <div className="preview-image-title">{title}</div>
                          <div className="preview-image-notice">{img.notice}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '400px',
                      color: '#999',
                      fontSize: '16px',
                      fontWeight: 400,
                      width: '100%'
                    }}>
                      이미지가 없습니다.
                    </div>
                  )}
                </div>

              </>
            ) : (
              <div className="photo-gallery">
                {(() => {
                  // 현재 탭에 맞는 이미지 가져오기
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
                          <div className="photo-main-title">{title}</div>
                          <div className="photo-main-notice">{img.notice}</div>
                        </div>
                      );
                    });
                  }
                  // 이미지가 없을 때 메시지 표시
                  return (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '400px',
                      color: '#999',
                      fontSize: '16px',
                      fontWeight: 400
                    }}>
                      이미지가 없습니다.
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <div className="related-products-btn-wrapper">
           

            <button 
              className="related-products-btn"
              onClick={() => {
                setShowRightPanel(true);
                setActiveRightTab('product');
              }}
            >
              관련 상품 보기
            </button>

             {/* 탑 버튼 */}
             <div className="top-button-wrapper">
              <button
                className="top-button"
                onClick={() => {
                  const leftSection = document.querySelector('.EuropeCityDetail .left-section');
                  if (leftSection) {
                    leftSection.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                title="맨 위로"
              >
                ↑
              </button>
            </div>
          </div>
        </div>

        {/* 오른쪽 영역: 실론투어 베네핏 및 상품 목록 */}
        {showRightPanel && (
          <div className="right-section">
            {/* 탭 컨텐츠 */}
            <div className="right-tab-content">
              {/* 닫기 버튼 */}
              <button
                type="button"
                className="right-panel-close-btn"
                onClick={() => setShowRightPanel(false)}
              >
                <IoMdClose />
              </button>

              {/* 탭 컨테이너 */}
              <div className="right-tab-container">
                <div className="right-tab-left">
                  {/* <button
                    type="button"
                    className={`right-tab-button right-tab-info ${activeRightTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveRightTab('info')}
                  >
                    도시정보
                  </button> */}
                  <button
                    type="button"
                    className={`right-tab-button right-tab-product ${activeRightTab === 'product' ? 'active' : ''}`}
                    onClick={() => setActiveRightTab('product')}
                  >
                    여행상품
                  </button>
                  <button
                    type="button"
                    className={`right-tab-button right-tab-custom ${activeRightTab === 'custom' ? 'active' : ''}`}
                    onClick={() => setActiveRightTab('custom')}
                  >
                    일정만들기
                  </button>
                  
                </div>
              </div>
              {/* {activeRightTab === 'info' && (
                <div className="detail-info-content">
                  <div className="detail-main-image">
                    {(() => {
                      // basicinfoImage 우선, 없으면 inputImage의 첫 번째 이미지 사용
                      if (cityInfo?.basicinfoImage) {
                        return <img className="image-detail-main" alt={cityInfo?.cityKo || 'Image'} src={`${AdminURL}/images/citymapinfo/${cityInfo.basicinfoImage}`} />;
                      }
                      if (cityInfo?.inputImage) {
                        try {
                          const images = JSON.parse(cityInfo.inputImage || '[]');
                          const mainImage = Array.isArray(images) && images.length > 0 ? images[0] : Image_morisus;
                          return <img className="image-detail-main" alt={cityInfo?.cityKo || 'Image'} src={`${AdminURL}/images/cityimages/${mainImage}`} />;
                        } catch (e) {
                          return <img className="image-detail-main" alt={cityInfo?.cityKo || 'Image'} src={Image_morisus} />;
                        }
                      }
                      return <img className="image-detail-main" alt={cityInfo?.cityKo || 'Image'} src={Image_morisus} />;
                    })()}
                  </div>
                  <div className="detail-info-grid">
                    {(() => {
                      // timezoneInfo 파싱
                      try {
                        const timezoneInfo = cityInfo?.timezoneInfo ? JSON.parse(cityInfo.timezoneInfo) : null;
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
                        const visaInfo = cityInfo?.visaInfo ? JSON.parse(cityInfo.visaInfo) : null;
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
                        const languageInfo = cityInfo?.languageInfo ? JSON.parse(cityInfo.languageInfo) : null;
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
                        const additionalInfo = cityInfo?.additionalInfo ? JSON.parse(cityInfo.additionalInfo) : null;
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
                        const exrateInfo = cityInfo?.exrateInfo ? JSON.parse(cityInfo.exrateInfo) : null;
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
                        const tipInfo = cityInfo?.tipInfo ? JSON.parse(cityInfo.tipInfo) : null;
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
                        const plugInfo = cityInfo?.plugInfo ? JSON.parse(cityInfo.plugInfo) : null;
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
                        const priceInfo = cityInfo?.priceInfo ? JSON.parse(cityInfo.priceInfo) : null;
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
                        const weatherInfo = cityInfo?.weatherInfo ? JSON.parse(cityInfo.weatherInfo) : null;
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
                      if (cityInfo?.caution && cityInfo.caution.trim() !== '') {
                        return (
                          <div className="info-item">
                            <div className="info-label">주의사항</div>
                            <div className="info-multiline">
                              {cityInfo.caution.split('\n').map((line: string, index: number) => (
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
                        const additionalInfo = cityInfo?.additionalInfo ? JSON.parse(cityInfo.additionalInfo) : null;
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
                </div>
              )} */}

              {activeRightTab === 'product' && (
                <div className="schedule-list-container">
                  {/* 국가 제목 */}
                  {fromGo && cityDetails.length > 0 ? (
                    <h2 className="selected-nation-title">
                      {cityDetails.map(city => city.cityKo).join(' + ')}
                    </h2>
                  ) : (
                    <h2 className="selected-nation-title">{cityInfo?.nation || cityInfo?.cityKo || ''}</h2>
                  )}

                  {/* 탭 네비게이션 */}
                  <div className="schedule-tabs">
                    {(() => {
                      if (fromGo && cityDetails.length > 0) {
                        // fromGo=true일 때는 장바구니 도시들을 기반으로 탭 표시하지 않음 (전체만 표시)
                        return ['전체'].map((tab) => (
                          <button
                            key={tab}
                            className={`schedule-tab ${scheduleFilter === tab ? 'active' : ''}`}
                            onClick={() => setScheduleFilter(tab)}
                          >
                            {tab}
                          </button>
                        ));
                      } else {
                        // fromDetail=true일 때는 기존 로직 (현재 도시의 국가 기준)
                        const selectedNation = cityInfo?.nation || '';
                        return ['전체', `${selectedNation}온니`, `${selectedNation}외 1개국`, `${selectedNation}외 2개국`, `${selectedNation}외 3개국`].map((tab) => (
                          <button
                            key={tab}
                            className={`schedule-tab ${scheduleFilter === tab ? 'active' : ''}`}
                            onClick={() => setScheduleFilter(tab)}
                          >
                            {tab}
                          </button>
                        ));
                      }
                    })()}
                  </div>

                  {/* fromGo=true일 때는 도시 탭, 그 외에는 검색바 */}
                  {fromGo && cityDetails.length > 0 ? (
                    <div className="schedule-city-tabs" style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      marginBottom: '20px',
                      flexWrap: 'wrap'
                    }}>
                      {cityDetails.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => setSelectedCityForSchedule(city.id)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            backgroundColor: selectedCityForSchedule === city.id ? '#333' : '#fff',
                            color: selectedCityForSchedule === city.id ? '#fff' : '#333',
                            fontSize: '14px',
                            fontWeight: selectedCityForSchedule === city.id ? '600' : '400',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedCityForSchedule !== city.id) {
                              e.currentTarget.style.backgroundColor = '#f5f5f5';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedCityForSchedule !== city.id) {
                              e.currentTarget.style.backgroundColor = '#fff';
                            }
                          }}
                        >
                          {city.cityKo}
                        </button>
                      ))}
                    </div>
                  ) : (
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
                  )}

                  {/* Schedule 리스트 */}
                  <div className="schedule-sections">
                    {(() => {
                      const groupedSchedules = getGroupedSchedules();
                      // console.log('=== getGroupedSchedules() 결과 ===');
                      // console.log('그룹화된 스케줄:', groupedSchedules);
                      // console.log('그룹 키 목록:', Object.keys(groupedSchedules));
                      Object.entries(groupedSchedules).forEach(([groupKey, schedules]) => {
                        // console.log(`\n[${groupKey}] 그룹 (${schedules.length}개):`);
                        schedules.forEach((schedule: any, index: number) => {
                          // console.log(`  ${index + 1}. ID: ${schedule.id}, 국가: ${schedule.nation.join(' + ')}, 상품명: ${schedule.productName || 'N/A'}, 매칭된 도시 수: ${schedule.matchedCityCount || 'N/A'}`);
                        });
                      });
                      // console.log('=====================================\n');
                      
                      return Object.keys(groupedSchedules).length === 0 ? (
                        <div className="no-schedules">일정이 없습니다.</div>
                      ) : (
                        Object.entries(groupedSchedules).map(([groupKey, schedules]) => (
                        <div key={groupKey} className="schedule-section">
                          <div className="schedule-section-header">{groupKey}</div>
                          {schedules.map((schedule: any, index) => {
                            const periodText = schedule.tourPeriodData.periodNight && schedule.tourPeriodData.periodDay
                              ? `${schedule.tourPeriodData.periodNight} ${schedule.tourPeriodData.periodDay}`
                              : '';
                            
                            // 장바구니 도시 목록 가져오기 (cityCart에서 직접 가져오기)
                            const cartCityNames = cityCart.length > 0 
                              ? cityCart.map(item => item.cityKo).filter(Boolean)
                              : [];

                            // 스케줄의 도시 정보 추출 (productScheduleData 또는 productName에서)
                            let scheduleCities: string[] = [];
                            try {
                              if (schedule.productScheduleData && schedule.productScheduleData !== '[]' && schedule.productScheduleData.trim() !== '') {
                                const parsed = JSON.parse(schedule.productScheduleData);
                                if (Array.isArray(parsed) && parsed.length > 0) {
                                  scheduleCities = parsed.map((item: any) => {
                                    if (typeof item === 'string') {
                                      return item;
                                    } else if (item && typeof item === 'object') {
                                      return item.city || item.cityKo || '';
                                    }
                                    return '';
                                  }).filter(Boolean);
                                }
                              }
                            } catch (e) {
                              // 파싱 실패 시 무시
                            }
                            
                            // productScheduleData에서 도시를 추출하지 못했으면 productName에서 추출
                            if (scheduleCities.length === 0 && schedule.productName) {
                              const nameParts = schedule.productName.split('+').map((part: string) => {
                                return part.trim().replace(/\s*\d+\s*(박|일)\s*/g, '').trim();
                              });
                              scheduleCities = nameParts.filter(Boolean);
                            }

                            // 장바구니에 담긴 도시인지 확인하는 함수
                            const isCityInCart = (cityName: string) => {
                              if (cartCityNames.length === 0) return false;
                              const cityTrimmed = cityName.trim();
                              return cartCityNames.some(cartCity => {
                                const cartCityTrimmed = cartCity.trim();
                                return cityTrimmed === cartCityTrimmed || 
                                       cityTrimmed.includes(cartCityTrimmed) || 
                                       cartCityTrimmed.includes(cityTrimmed);
                              });
                            };

                            // 도시명을 개별적으로 렌더링하여 장바구니 도시와 매칭되는 경우 색상 표시
                            const renderCityDetail = () => {
                              // 도시 정보가 있고 장바구니에 도시가 있을 때만 색상 표시
                              if (scheduleCities.length > 0 && cartCityNames.length > 0) {
                                return scheduleCities.map((city: string, cityIndex: number) => {
                                  const isHighlighted = isCityInCart(city);
                                  
                                  return (
                                    <span key={cityIndex}>
                                      {cityIndex > 0 && <span> + </span>}
                                      <span style={{
                                        color: isHighlighted ? '#5fb7ef' : '#666',
                                        fontWeight: isHighlighted ? '600' : '400',
                                        backgroundColor: isHighlighted ? 'rgba(95, 183, 239, 0.1)' : 'transparent',
                                        padding: isHighlighted ? '2px 4px' : '0',
                                        borderRadius: isHighlighted ? '4px' : '0'
                                      }}>
                                        {city}
                                      </span>
                                    </span>
                                  );
                                });
                              } else {
                                // 도시명이 없거나 장바구니가 비어있으면 기본 표시
                            const detailText = schedule.productName || schedule.nation.join(' + ');
                                return detailText;
                              }
                            };

                            return (
                              <div 
                                key={index} 
                                className="schedule-item"
                                onClick={async () => {
                                  if (schedule.id) {
                                    try {
                                      // 원본 products 배열에서 해당 스케줄의 전체 데이터 찾기
                                      const originalProduct = products.find((p: any) => p.id === schedule.id);
                                      
                                      // 원본 데이터가 있으면 그것을 사용, 없으면 schedule 객체 사용
                                      const productDataToSend = originalProduct || schedule;
                                      
                                      // 상품명을 RecoilStore에 저장
                                      const productNameToSave = productDataToSend.productName || schedule.productName || schedule.nation.join(' + ') + (schedule.tourPeriodData.periodNight && schedule.tourPeriodData.periodDay ? ` ${schedule.tourPeriodData.periodNight} ${schedule.tourPeriodData.periodDay}` : '');
                                      setProductName(productNameToSave);
                                      
                                      // 전체 일정 정보를 RecoilStore에 저장 (원본 데이터 사용)
                                      setSelectedScheduleProduct(productDataToSend);
                                    
                                      // 페이지 전환 (원본 데이터 전달)
                                      navigate(`/counsel/europe/schedulerecommend`, { state: productDataToSend });
                                      window.scrollTo(0, 0);
                                    } catch (error) {
                                      console.error('일정 선택 중 오류 발생:', error);
                                      alert('일정을 불러오는 중 오류가 발생했습니다.');
                                    }
                                  }
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="schedule-item-content">
                                  <h4 className="schedule-item-title">
                                   {schedule.nation.join(' + ')} {periodText}
                                  </h4>
                                  <p className="schedule-item-detail">{renderCityDetail()}</p>
                                </div>
                                {index === 0 && groupKey === (cityInfo?.nation || '') && (
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
                      );
                    })()}
                  </div>
                </div>
              )}

              {activeRightTab === 'custom' && (
                <div className="benefit-card-section">
                  <div className="city-cards-section">
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
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>

      </div>
    </div>
  );
};

