import React from 'react';
import './RestHotelDetail.scss';
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import rectangle78 from '../../../lastimages/counselrest/hotel/detail/rectangle-78.png';
import rectangle76 from '../../../lastimages/counselrest/hotel/detail/rectangle-76.png';
import rectangle665 from '../../../lastimages/counselrest/hotel/detail/rectangle-665.png';
import rectangle664 from '../../../lastimages/counselrest/hotel/detail/rectangle-664.png';
import rectangle663 from '../../../lastimages/counselrest/hotel/detail/rectangle-663.png';
import rectangle580 from '../../../lastimages/counselrest/hotel/detail/rectangle-580.png';
import rectangle662 from '../../../lastimages/counselrest/hotel/detail/rectangle-662.png';
import rectangle661 from '../../../lastimages/counselrest/hotel/detail/rectangle-661.png';
import rectangle619 from '../../../lastimages/counselrest/hotel/detail/rectangle-619.png';
import rectangle600 from '../../../lastimages/counselrest/hotel/detail/rectangle-600.png';
import rectangle601 from '../../../lastimages/counselrest/hotel/detail/rectangle-601.png';
import rectangle673 from '../../../lastimages/counselrest/hotel/detail/rectangle-673.png';
import rectangle674 from '../../../lastimages/counselrest/hotel/detail/rectangle-674.png';
import rectangle675 from '../../../lastimages/counselrest/hotel/detail/rectangle-675.png';
import rectangle676 from '../../../lastimages/counselrest/hotel/detail/rectangle-676.png';
import rectangle677 from '../../../lastimages/counselrest/hotel/detail/rectangle-677.png';
import vector105 from '../../../lastimages/counselrest/hotel/detail/vector-105.svg';
import reviewimage from '../../../lastimages/counselrest/hotel/detail/review.png';
import hotelmain from '../../../images/counsel/rest/hotel/hotelmain.png';
import RatingBoard from '../../../common/RatingBoard';
import { useEffect } from 'react';
import { AdminURL } from '../../../../MainURL';
import axios from 'axios';
import GoogleMap from '../../../common/GoogleMap';


export default function RestHotelDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const ID = urlParams.get("id");
  const CITY = urlParams.get("city");
  

  const [hotelInfo, setHotelInfo] = React.useState<any | null>(null);
  const [imageAllView, setImageAllView] = React.useState<any[]>([]);
  const [imageRoomView, setImageRoomView] = React.useState<any[]>([]);
  const [imageEtcView, setImageEtcView] = React.useState<any[]>([]);
  const [roomTypes, setRoomTypes] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [logoImageError, setLogoImageError] = React.useState<boolean>(false);

  useEffect(() => {
    const fetchHotelInfo = async () => {
      if (!ID) return;
      
      // 호텔 정보가 변경될 때 로고 이미지 에러 상태 초기화
      setLogoImageError(false);
      
      try {
        const res = await axios.get(`${AdminURL}/ceylontour/gethotelinfobyid/${ID}`);
        if (res.data) {
          const copy = [...res.data][0];
          setHotelInfo(copy);
          const imageNamesAllViewCopy = copy.imageNamesAllView ? JSON.parse(copy.imageNamesAllView) : [];
          setImageAllView(imageNamesAllViewCopy);
          const imageNamesRoomViewCopy = copy.imageNamesRoomView ? JSON.parse(copy.imageNamesRoomView) : [];
          setImageRoomView(imageNamesRoomViewCopy);
          const imageNamesEtcViewCopy = copy.imageNamesEtcView ? JSON.parse(copy.imageNamesEtcView) : [];
          setImageEtcView(imageNamesEtcViewCopy);
        } else {
          setHotelInfo(null);
          setImageAllView([]);
          setImageRoomView([]);
          setImageEtcView([]);
        }
        const response = await axios.post(`${AdminURL}/ceylontour/getcityschedule`, { city: CITY });
        if (response.data) {
          const copy = [...response.data];
          setProducts(copy);
        } else {
          setProducts([]);
        }
        if (CITY) {
          const res = await axios.get(`${AdminURL}/hotel/gethotelcity/${CITY}`);
          if (res.data && res.data !== false) {
            setAllHotels(Array.isArray(res.data) ? res.data : [res.data]);
          }
        } else {
          // 도시가 없으면 전체 호텔 가져오기
          const res = await axios.get(`${AdminURL}/hotel/gethotelsall`);
          if (res.data && res.data !== false) {
            setAllHotels(Array.isArray(res.data) ? res.data : [res.data]);
          }
        }
      } catch (error) {
        console.error('나라별 여행상품을 가져오는 중 오류 발생:', error);
        setHotelInfo(null);
        setImageAllView([]);
        setImageRoomView([]);
        setImageEtcView([]);
        setProducts([]);
      }
    };

    fetchHotelInfo();
  }, [ID, CITY]);



  // productScheduleData를 파싱하여 선택된 호텔 정보 생성 (RestHotelCost.tsx로 전달용)
  const getSelectedHotelsFromSchedule = async (product: any): Promise<Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>> => {
    const currentHotelType = hotelInfo?.hotelType || hotelInfo?.hotelSort;
    const currentHotel = hotelInfo;

    // 미니멈스테이인 경우 productScheduleData가 없어도 현재 호텔을 선택
    if (!product.productScheduleData) {
      if (product.costType === '미니멈스테이' && currentHotel) {
        // 현재 호텔의 타입이 리조트나 호텔인 경우에만 선택
        const hotelSort = currentHotelType || '리조트';
        if (hotelSort === '리조트' || hotelSort === '호텔') {
          // 이미지 데이터가 없으면 allHotels에서 다시 찾기
          let hotelWithImages = currentHotel;
          if (currentHotel.id) {
            const hasImages = currentHotel.imageNamesAllView && 
                             currentHotel.imageNamesAllView !== '[]' && 
                             currentHotel.imageNamesAllView !== '';
            
            if (!hasImages) {
              let hotelWithFullData = allHotels.find((h: any) => h.id === currentHotel.id);
              
              // allHotels에도 이미지 데이터가 없으면 API로 전체 호텔 데이터 가져오기
              if ((!hotelWithFullData || !hotelWithFullData.imageNamesAllView || hotelWithFullData.imageNamesAllView === '[]') && 
                  currentHotel.hotelNameKo && CITY) {
                try {
                  const hotelName = encodeURIComponent(currentHotel.hotelNameKo);
                  const city = encodeURIComponent(CITY);
                  const res = await axios.get(`${AdminURL}/hotel/gethoteldata/${city}/${hotelName}`);
                  if (res.data && res.data !== false) {
                    const hotelData = Array.isArray(res.data) ? res.data[0] : res.data;
                    if (hotelData && hotelData.imageNamesAllView && hotelData.imageNamesAllView !== '[]') {
                      hotelWithFullData = hotelData;
                    }
                  }
                } catch (error) {
                  console.error('호텔 데이터 가져오기 오류:', error);
                }
              }
              
              if (hotelWithFullData && hotelWithFullData.imageNamesAllView && hotelWithFullData.imageNamesAllView !== '[]') {
                hotelWithImages = hotelWithFullData;
              }
            }
          }

          hotelWithImages = {
            ...hotelWithImages,
            imageNamesAllView: hotelWithImages.imageNamesAllView || '[]',
            imageNamesRoomView: hotelWithImages.imageNamesRoomView || '[]',
            imageNamesEtcView: hotelWithImages.imageNamesEtcView || '[]',
            hotelRoomTypes: hotelWithImages.hotelRoomTypes || '[]'
          };

          return [{
            index: 0,
            hotelSort: hotelSort,
            dayNight: '3',
            hotel: hotelWithImages
          }];
        }
      }
      return [];
    }

    try {
      const scheduleData = JSON.parse(product.productScheduleData);
      if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        // 미니멈스테이인 경우 빈 배열이어도 현재 호텔을 선택
        if (product.costType === '미니멈스테이' && currentHotel) {
          const hotelSort = currentHotelType || '리조트';
          if (hotelSort === '리조트' || hotelSort === '호텔') {
            // 이미지 데이터가 없으면 allHotels에서 다시 찾기
            let hotelWithImages = currentHotel;
            if (currentHotel.id) {
              const hasImages = currentHotel.imageNamesAllView && 
                               currentHotel.imageNamesAllView !== '[]' && 
                               currentHotel.imageNamesAllView !== '';
              
              if (!hasImages) {
                const hotelWithFullData = allHotels.find((h: any) => h.id === currentHotel.id);
                if (hotelWithFullData && hotelWithFullData.imageNamesAllView && hotelWithFullData.imageNamesAllView !== '[]') {
                  hotelWithImages = hotelWithFullData;
                }
              }
            }

            hotelWithImages = {
              ...hotelWithImages,
              imageNamesAllView: hotelWithImages.imageNamesAllView || '[]',
              imageNamesRoomView: hotelWithImages.imageNamesRoomView || '[]',
              imageNamesEtcView: hotelWithImages.imageNamesEtcView || '[]',
              hotelRoomTypes: hotelWithImages.hotelRoomTypes || '[]'
            };

            return [{
              index: 0,
              hotelSort: hotelSort,
              dayNight: '3',
              hotel: hotelWithImages
            }];
          }
        }
        return [];
      }

      // '리조트 + 풀빌라' 조합인지 확인 (리조트와 풀빌라가 모두 포함되어 있는지 확인)
      const hasResort = scheduleData.some((item: any) => item.hotelSort === '리조트');
      const hasPoolVilla = scheduleData.some((item: any) => item.hotelSort === '풀빌라');
      const isResortPoolVilla = scheduleData.length >= 2 && hasResort && hasPoolVilla;

      // 이미 사용된 호텔 ID를 추적 (중복 방지)
      const usedHotelIds = new Set<string | number>();
      // 현재 페이지의 호텔이 사용될 인덱스 (마지막에 해당하는 항목)
      let currentHotelUsedIndex: number | null = null;

      // 먼저 뒤에서부터 순회하여 현재 페이지의 호텔과 일치하는 마지막 항목 찾기
      for (let i = scheduleData.length - 1; i >= 0; i--) {
        const item = scheduleData[i];
        const hotelSort = item.hotelSort || '';
        
        if (currentHotelType === hotelSort && currentHotel && currentHotelUsedIndex === null) {
          currentHotelUsedIndex = i;
          if (currentHotel.id !== null && currentHotel.id !== undefined) {
            usedHotelIds.add(currentHotel.id);
          }
          break;
        }
      }

      const selectedHotels: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }> = [];
      
      for (let i = 0; i < scheduleData.length && i < 4; i++) {
        const item = scheduleData[i];
        const hotelSort = item.hotelSort || '';
        const dayNight = item.dayNight || '';

        let selectedHotel: any | null = null;

        // 현재 페이지의 호텔이 사용될 인덱스이고, 타입이 일치하면 현재 호텔 사용
        if (i === currentHotelUsedIndex && currentHotelType === hotelSort && currentHotel) {
          selectedHotel = currentHotel;
        } else if (isResortPoolVilla && currentHotelType === '풀빌라' && hotelSort === '리조트') {
          // '리조트 + 풀빌라' 조합이고 현재 호텔이 '풀빌라'인 경우, '리조트'를 자동으로 선택
          const matchingHotels = allHotels.filter((hotel: any) => {
            const hotelType = hotel.hotelType || hotel.hotelSort;
            return (hotelType === '리조트' || 
                   (hotel.hotelType && hotel.hotelType.split(' ').includes('리조트'))) &&
                   !usedHotelIds.has(hotel.id); // 이미 사용된 호텔 제외
          });

          if (matchingHotels.length > 0) {
            selectedHotel = matchingHotels[0];
            if (selectedHotel.id !== null && selectedHotel.id !== undefined) {
              usedHotelIds.add(selectedHotel.id);
            }
          }
        } else {
          // 그렇지 않으면 해당 타입의 호텔을 찾되, 이미 사용된 호텔은 제외
          const matchingHotels = allHotels.filter((hotel: any) => {
            const hotelType = hotel.hotelType || hotel.hotelSort;
            return (hotelType === hotelSort || 
                   (hotel.hotelType && hotel.hotelType.split(' ').includes(hotelSort))) &&
                   !usedHotelIds.has(hotel.id); // 이미 사용된 호텔 제외
          });

          if (matchingHotels.length > 0) {
            selectedHotel = matchingHotels[0];
            if (selectedHotel.id !== null && selectedHotel.id !== undefined) {
              usedHotelIds.add(selectedHotel.id);
            }
          }
        }

        // 호텔 객체에 이미지 데이터가 포함되어 있는지 확인
        let hotelWithImages = selectedHotel;
        
        if (selectedHotel && selectedHotel.id) {
          // 이미지 데이터가 없거나 빈 배열인 경우 allHotels에서 다시 찾기
          const hasImages = selectedHotel.imageNamesAllView && 
                           selectedHotel.imageNamesAllView !== '[]' && 
                           selectedHotel.imageNamesAllView !== '';
          
          if (!hasImages) {
            // allHotels에서 해당 호텔 ID로 다시 찾기
            let hotelWithFullData = allHotels.find((h: any) => h.id === selectedHotel.id);
            
            // allHotels에도 이미지 데이터가 없으면 API로 전체 호텔 데이터 가져오기
            if ((!hotelWithFullData || !hotelWithFullData.imageNamesAllView || hotelWithFullData.imageNamesAllView === '[]') && 
                selectedHotel.hotelNameKo && CITY) {
              try {
                const hotelName = encodeURIComponent(selectedHotel.hotelNameKo);
                const city = encodeURIComponent(CITY);
                const res = await axios.get(`${AdminURL}/hotel/gethoteldata/${city}/${hotelName}`);
                if (res.data && res.data !== false) {
                  const hotelData = Array.isArray(res.data) ? res.data[0] : res.data;
                  if (hotelData && hotelData.imageNamesAllView && hotelData.imageNamesAllView !== '[]') {
                    hotelWithFullData = hotelData;
                  }
                }
              } catch (error) {
                console.error('호텔 데이터 가져오기 오류:', error);
              }
            }
            
            if (hotelWithFullData && hotelWithFullData.imageNamesAllView && hotelWithFullData.imageNamesAllView !== '[]') {
              hotelWithImages = hotelWithFullData;
            }
          }
        }

        // 이미지 데이터가 없으면 기본값 설정
        if (hotelWithImages) {
          hotelWithImages = {
            ...hotelWithImages,
            imageNamesAllView: hotelWithImages.imageNamesAllView || '[]',
            imageNamesRoomView: hotelWithImages.imageNamesRoomView || '[]',
            imageNamesEtcView: hotelWithImages.imageNamesEtcView || '[]',
            hotelRoomTypes: hotelWithImages.hotelRoomTypes || '[]'
          };
        }

        selectedHotels.push({
          index: i,
          hotelSort: hotelSort,
          dayNight: dayNight,
          hotel: hotelWithImages
        });
      }

      return selectedHotels;
    } catch (e) {
      console.error('productScheduleData 파싱 오류:', e);
      // 미니멈스테이인 경우 파싱 오류가 발생해도 현재 호텔을 선택
      if (product.costType === '미니멈스테이' && currentHotel) {
        const hotelSort = currentHotelType || '리조트';
        if (hotelSort === '리조트' || hotelSort === '호텔') {
          // 이미지 데이터가 없으면 allHotels에서 다시 찾기
          let hotelWithImages = currentHotel;
          if (currentHotel.id) {
            const hasImages = currentHotel.imageNamesAllView && 
                             currentHotel.imageNamesAllView !== '[]' && 
                             currentHotel.imageNamesAllView !== '';
            
            if (!hasImages) {
              let hotelWithFullData = allHotels.find((h: any) => h.id === currentHotel.id);
              
              // allHotels에도 이미지 데이터가 없으면 API로 전체 호텔 데이터 가져오기
              if ((!hotelWithFullData || !hotelWithFullData.imageNamesAllView || hotelWithFullData.imageNamesAllView === '[]') && 
                  currentHotel.hotelNameKo && CITY) {
                try {
                  const hotelName = encodeURIComponent(currentHotel.hotelNameKo);
                  const city = encodeURIComponent(CITY);
                  const res = await axios.get(`${AdminURL}/hotel/gethoteldata/${city}/${hotelName}`);
                  if (res.data && res.data !== false) {
                    const hotelData = Array.isArray(res.data) ? res.data[0] : res.data;
                    if (hotelData && hotelData.imageNamesAllView && hotelData.imageNamesAllView !== '[]') {
                      hotelWithFullData = hotelData;
                    }
                  }
                } catch (error) {
                  console.error('호텔 데이터 가져오기 오류:', error);
                }
              }
              
              if (hotelWithFullData && hotelWithFullData.imageNamesAllView && hotelWithFullData.imageNamesAllView !== '[]') {
                hotelWithImages = hotelWithFullData;
              }
            }
          }

          hotelWithImages = {
            ...hotelWithImages,
            imageNamesAllView: hotelWithImages.imageNamesAllView || '[]',
            imageNamesRoomView: hotelWithImages.imageNamesRoomView || '[]',
            imageNamesEtcView: hotelWithImages.imageNamesEtcView || '[]',
            hotelRoomTypes: hotelWithImages.hotelRoomTypes || '[]'
          };

          return [{
            index: 0,
            hotelSort: hotelSort,
            dayNight: '3',
            hotel: hotelWithImages
          }];
        }
      }
      return [];
    }
  };

  // productScheduleData를 파싱하여 호텔명 생성
  const getProductNameFromSchedule = (product: any): string => {
    if (!product.productScheduleData) {
      // productScheduleData가 없으면 기존 방식 사용
      return product.productName || product.scheduleName || product.hotelNameKo || '';
    }

    try {
      const scheduleData = JSON.parse(product.productScheduleData);
      if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
        return product.productName || product.scheduleName || product.hotelNameKo || '';
      }

      const currentHotelType = hotelInfo?.hotelType || hotelInfo?.hotelSort;
      const currentHotel = hotelInfo;

      // '리조트 + 풀빌라' 조합인지 확인 (리조트와 풀빌라가 모두 포함되어 있는지 확인)
      const hasResort = scheduleData.some((item: any) => item.hotelSort === '리조트');
      const hasPoolVilla = scheduleData.some((item: any) => item.hotelSort === '풀빌라');
      const isResortPoolVilla = scheduleData.length >= 2 && hasResort && hasPoolVilla;

      // 이미 사용된 호텔 ID를 추적 (중복 방지)
      const usedHotelIds = new Set<string | number>();
      // 현재 페이지의 호텔이 사용될 인덱스 (마지막에 해당하는 항목)
      let currentHotelUsedIndex: number | null = null;

      // 먼저 뒤에서부터 순회하여 현재 페이지의 호텔과 일치하는 마지막 항목 찾기
      for (let i = scheduleData.length - 1; i >= 0; i--) {
        const item = scheduleData[i];
        const hotelSort = item.hotelSort || '';
        
        if (currentHotelType === hotelSort && currentHotel && currentHotelUsedIndex === null) {
          currentHotelUsedIndex = i;
          if (currentHotel.id !== null && currentHotel.id !== undefined) {
            usedHotelIds.add(currentHotel.id);
          }
          break;
        }
      }

      // 호텔 ID별로 박수를 합산하기 위한 맵 (같은 호텔 객체인 경우에만 합산)
      const hotelNightsMap: { [key: string]: { hotelName: string; nights: number } } = {};
      
      for (let i = 0; i < scheduleData.length; i++) {
        const item = scheduleData[i];
        const hotelSort = item.hotelSort || '';
        const dayNight = item.dayNight || '';
        
        // 박수 추출 (예: "2박" -> 2)
        const nights = dayNight ? parseInt(dayNight.replace(/[^0-9]/g, ''), 10) || 0 : 0;

        let hotelName = hotelSort; // 기본값은 hotelSort
        let hotelId: string | number | null = null;

        // 현재 페이지의 호텔이 사용될 인덱스이고, 타입이 일치하면 현재 호텔 사용
        if (i === currentHotelUsedIndex && currentHotelType === hotelSort && currentHotel) {
          hotelName = currentHotel.hotelNameKo || hotelSort;
          hotelId = currentHotel.id;
        } else if (isResortPoolVilla && currentHotelType === '풀빌라' && hotelSort === '리조트') {
          // '리조트 + 풀빌라' 조합이고 현재 호텔이 '풀빌라'인 경우, '리조트'를 자동으로 선택
          const matchingHotels = allHotels.filter((hotel: any) => {
            const hotelType = hotel.hotelType || hotel.hotelSort;
            return (hotelType === '리조트' || 
                   (hotel.hotelType && hotel.hotelType.split(' ').includes('리조트'))) &&
                   !usedHotelIds.has(hotel.id); // 이미 사용된 호텔 제외
          });

          if (matchingHotels.length > 0) {
            hotelName = matchingHotels[0].hotelNameKo || hotelSort;
            hotelId = matchingHotels[0].id;
            if (hotelId !== null) {
              usedHotelIds.add(hotelId);
            }
          }
        } else {
          // 그렇지 않으면 해당 타입의 호텔을 찾되, 이미 사용된 호텔은 제외
          const matchingHotels = allHotels.filter((hotel: any) => {
            const hotelType = hotel.hotelType || hotel.hotelSort;
            return (hotelType === hotelSort || 
                   (hotel.hotelType && hotel.hotelType.split(' ').includes(hotelSort))) &&
                   !usedHotelIds.has(hotel.id); // 이미 사용된 호텔 제외
          });

          if (matchingHotels.length > 0) {
            hotelName = matchingHotels[0].hotelNameKo || hotelSort;
            hotelId = matchingHotels[0].id;
            if (hotelId !== null) {
              usedHotelIds.add(hotelId);
            }
          }
        }

        // 호텔 ID를 키로 사용 (같은 호텔 객체인 경우에만 합산)
        // 호텔 ID가 없으면 인덱스를 포함하여 구분
        const key = hotelId !== null ? `hotel_${hotelId}` : `item_${i}`;

        if (hotelNightsMap[key]) {
          // 같은 호텔 객체인 경우 박수 합산
          hotelNightsMap[key].nights += nights;
        } else {
          // 다른 호텔 객체이거나 호텔 ID가 없는 경우 새로 추가
          hotelNightsMap[key] = {
            hotelName: hotelName,
            nights: nights
          };
        }
      }

      // 맵을 배열로 변환하여 "호텔명 박수" 형태로 조합
      const parts: string[] = [];
      for (const { hotelName, nights } of Object.values(hotelNightsMap)) {
        if (nights > 0) {
          parts.push(`${hotelName} ${nights}박`);
        } else {
          parts.push(hotelName);
        }
      }

      return parts.join(' + ');
    } catch (e) {
      console.error('productScheduleData 파싱 오류:', e);
      return product.productName || product.scheduleName || product.hotelNameKo || '';
    }
  };


  const divWrappers = [
    { text: '#누사두아 최고급리조트' },
    { text: '#버틀러 서비스' },
    { text: '#프라이빗 비치' },
    { text: '#허니문' },
    { text: '#가족 모두 만족도 1위급' },
  ];

  const btnSolids = [
    { text: '소개' },
    { text: '전경' },
    { text: '객실' },
    { text: '부대시설' }
  ];

  const [activeTab, setActiveTab] = React.useState(0);
  const [activeRightTab, setActiveRightTab] = React.useState<'benefit' | 'schedule'>('schedule');
  const [showRightPanel, setShowRightPanel] = React.useState(false);
  const [selectedMainImageIndex, setSelectedMainImageIndex] = React.useState(0);
  const [allHotels, setAllHotels] = React.useState<any[]>([]);

  
  // 탭 변경 시 선택된 메인 이미지를 첫번째로 리셋
  useEffect(() => {
    setSelectedMainImageIndex(0);
  }, [activeTab]);

  // 데이터가 로드되지 않았다면 상세 내용을 렌더링하지 않음
  if (!hotelInfo) {
    return null;
  }


  // 현재 탭에 따른 이미지 리스트 (소개 / 전경 / 객실 / 부대시설)
  const getCurrentImages = () => {
    if (activeTab === 0) return []; // 소개 탭은 이미지 없음
    if (activeTab === 1) return imageAllView; // 전경
    if (activeTab === 2) return imageRoomView; // 객실
    return imageEtcView; // 부대시설
  };

  // 파일이 동영상인지 확인
  const isVideoFile = (fileName: string) => {
    if (!fileName) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
    const lowerFileName = fileName.toLowerCase();
    return videoExtensions.some(ext => lowerFileName.endsWith(ext));
  };

  const highlightItems = [
    { image: rectangle76, title: '초럭셔리 체험' },
    { image: rectangle78, title: '버틀러 시스템' },
    { image: rectangle76, title: '프라이빗 비치' },
    { image: rectangle78, title: '턴다운 서비스' },
    { image: rectangle76, title: '허니문 인기' },
  ];

  const benefitItems = [
    {
      title: '초럭셔리 체험',
      text: '세계적 평가의 St. Regis 브랜드 & 발리 최고급 서비스',
      image: rectangle76,
    },
    {
      title: '버틀러 시스템',
      text: '짐 언패킹, 패킹, 커피/티 서비스 예약대행',
      image: rectangle78,
    },
    {
      title: '턴다운 서비스',
      text: '매일 밤 방을 편안하게 정리해주는 감동 포인트',
      image: rectangle76,
    },
    {
      title: '프라이빗 비치',
      text: '게이티드 누사두아의 조용하고 품격 높은 해변',
      image: rectangle619,
    },
  ];


  // 헤더에 사용할 첫 번째 이미지 가져오기
  const getHeaderImage = () => {
    if (imageAllView && imageAllView.length > 0) {
      const firstImage = imageAllView[0];
      const imageName = typeof firstImage === 'string' ? firstImage : firstImage.imageName;
      if (imageName) {
        return `${AdminURL}/images/hotelimages/${imageName}`;
      }
    }
    return hotelmain; // 기본 이미지
  };

  return (
    <div className="RestHotelDetail">
      {/* 상단 헤더 이미지 */}
      <div className="hotel-header-image">
        <img
          className="header-image-media"
          alt="호텔 메인 이미지"
          src={getHeaderImage()}
        />
        {/* 어두운 overlay */}
        <div className="header-image-overlay"></div>
        {/* 호텔 제목 정보 (이미지 중앙에 표시) */}
        <div className="hotel-title-overlay">
          <div className="hotel-title-content">
            <div className="text-title">{hotelInfo?.hotelNameKo || '호텔명'}</div>
            <div className="text-subtitle">
              {hotelInfo?.hotelNameEn || ''}
            </div>
            <div className="text-rating">
              <RatingBoard
                ratingSize={20}
                rating={
                  hotelInfo && hotelInfo.hotelLevel
                    ? Math.max(0, Math.min(5, parseInt(String(hotelInfo.hotelLevel), 10) || 0))
                    : 0
                }
              />
            </div>
            <div className="text-location">
              <p>{hotelInfo?.nation || ''}</p>
              <IoIosArrowForward />
              <p>{hotelInfo?.city || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 왼쪽 상단 뒤로가기 버튼 */}
      <button
        type="button"
        className="left-back-btn"
        onClick={() => navigate(-1)}
      >
        <IoIosArrowBack />
      </button>

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

      <div className={`hotel-container ${showRightPanel ? 'with-right-panel' : 'without-right-panel'}`}>
        {/* 왼쪽 영역: 기존 내용 */}
        <div className="left-section">
          <div className="hotel-center-wrapper">

            {/* <div className="tag-wrapper-container">
              {divWrappers.map(({ text }, index) => (
                <div key={index} className="tag-wrapper">
                  <div>{text}</div>
                </div>
              ))}
            </div> */}

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
                {/* {roomTypes.map((room: any, index: number) => (
                  <React.Fragment key={room.roomTypeName || index}>
                    <span className="roomtype-text">{room.roomTypeName}</span>
                    {index < roomTypes.length - 1 && (
                      <span className="roomtype-separator"></span>
                    )}
                  </React.Fragment>
                ))} */}
                 <button
                    type="button"
                    className="video-button"
                    onClick={() => {}}
                  >
                    동영상보기
                  </button>
              </div>
            </div>

            {/* 소개 탭일 때는 호텔 정보 표시, 나머지 탭은 이미지 표시 */}
            {activeTab === 0 ? (
              <>
                {/* 호텔 소개 섹션 */}
                <div className="hotel-intro-section">
                  <div className="hotel-intro-rating">
                    <RatingBoard
                      ratingSize={30}
                      rating={
                        hotelInfo && hotelInfo.hotelLevel
                          ? Math.max(0, Math.min(5, parseInt(String(hotelInfo.hotelLevel), 10) || 0))
                          : 0
                      }
                    />
                  </div>
                  <div className="hotel-intro-tagline">
                    프라이빗 비치와 세심한 서비스가 완성하는 품격있는 휴식
                  </div>
                  {hotelInfo?.logoImage && !logoImageError && (
                    <div className="hotel-intro-logo">
                      <img 
                        src={`${AdminURL}/images/hotellogos/${hotelInfo.logoImage}`} 
                        alt="호텔 로고"
                        onError={() => setLogoImageError(true)}
                      />
                    </div>
                  )}
                  <div className="hotel-intro-entitle">
                    <p>{hotelInfo?.hotelNameEn || ''}</p>
                  </div>
                  <div className="hotel-intro-description">
                    <p>정교한 설계와 세심한 서비스는 허니문 동안 럭셔리 그 자체를 선사합니다.</p>
                    <p>2017년 새롭게 단장을 마치고 모던 럭셔리를 지향하는 호텔로 거듭났습니다.</p>
                    <p>모든 객실에 자쿠지와 개인용 풀장이 설치되어 있는 것이 특징입니다.</p>
                  </div>
                </div>

                <div className="highlight-section">
                  <div className="section-title">핵심 포인트</div>
                  <div className="highlight-list">
                    {highlightItems.map(({ image, title }) => (
                      <div className="highlight-item" key={title}>
                        <div className="highlight-image-wrap">
                          <img src={image} alt={title} />
                        </div>
                        <div className="highlight-item-title">{title}</div>
                        <div className="highlight-item-desc">
                          세계적 평가의 St. Regis 브랜드 &amp; 발리 최고급 서비스
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`benefit-section`}>
                  <div className="section-title">베네핏 & 포함사항</div>
                  <div className="benefit-items">
                    {benefitItems.map(({ title, text, image }, index) => (
                      <div key={title} className="benefit-item">
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

                {/* 후기 및 평점 섹션 */}
                {/* <div className='component'>
                 
                  <div className="review-section">
                    <h2 className="section-title">후기 및 평점</h2>
                    
                    <div className="review-list">
                      {reviewItems.map((review) => (
                        <div key={review.id} className="review-item">
                          <img className="review-image" alt="후기 이미지" src={review.image} />
                          <div className="review-content">
                            <div className="review-header">
                              <h3 className="review-title">{review.title}</h3>
                              <div className="review-rating">
                                <RatingBoard rating={review.rating} ratingSize={20} />
                              </div>
                            </div>
                            
                            <p className="review-text">
                              {review.text.split('\n').map((line, index, arr) => (
                                <React.Fragment key={index}>
                                  {line}
                                  {index < arr.length - 1 && <br />}
                                </React.Fragment>
                              ))}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div> */}

                <div className="location-info-section">
                  <div className="section-title">호텔위치</div>
                  <div className="location-content-wrapper">
                    <div className="location-text-panel">
                      <div className="location-address">
                        {hotelInfo?.hotelAddress || ''}
                      </div>
                      <div className="location-nearby-list">
                        <div className="location-nearby-item">
                          <span className="location-icon">◎</span>
                          <span className="location-name">발리 국립 골프 클럽</span>
                          <span className="location-time">도보 5분</span>
                        </div>
                        <div className="location-nearby-item">
                          <span className="location-icon">◎</span>
                          <span className="location-name">게러그비치</span>
                          <span className="location-time">도보 12분</span>
                        </div>
                        <div className="location-nearby-item">
                          <span className="location-icon">◎</span>
                          <span className="location-name">발리 컬렉션 쇼핑센터</span>
                          <span className="location-time">도보 17분</span>
                        </div>
                        <div className="location-nearby-item">
                          <span className="location-icon">◎</span>
                          <span className="location-name">웅우라라이 국제공항</span>
                          <span className="location-time">차로 20분</span>
                        </div>
                      </div>
                    </div>
                    <div className="location-map-panel">
                      <div className="location-map-placeholder">
                        <GoogleMap />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 각 탭의 첫 번째 이미지 미리보기 */}
                <div className="tab-preview-images">
                  {/* 전경 탭 첫 번째 이미지 */}
                  {imageAllView && imageAllView.length > 0 && (() => {
                    const firstImage = imageAllView[0];
                    const isVideo = isVideoFile(firstImage.imageName);
                    return (
                      <div key="all-view" className="preview-image-item">
                        <div className="preview-image-wrapper">
                          {isVideo ? (
                            <video
                              className="preview-image"
                              controls
                              src={`${AdminURL}/images/hotelimages/${firstImage.imageName}`}
                            >
                              브라우저가 비디오 태그를 지원하지 않습니다.
                            </video>
                          ) : (
                            <img
                              className="preview-image"
                              alt={firstImage.title || '전경 이미지'}
                              src={`${AdminURL}/images/hotelimages/${firstImage.imageName}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 객실 탭 첫 번째 이미지 */}
                  {imageRoomView && imageRoomView.length > 0 && (() => {
                    const firstImage = imageRoomView[0];
                    const isVideo = isVideoFile(firstImage.imageName);
                    return (
                      <div key="room-view" className="preview-image-item">
                        <div className="preview-image-wrapper">
                          {isVideo ? (
                            <video
                              className="preview-image"
                              controls
                              src={`${AdminURL}/images/hotelimages/${firstImage.imageName}`}
                            >
                              브라우저가 비디오 태그를 지원하지 않습니다.
                            </video>
                          ) : (
                            <img
                              className="preview-image"
                              alt={firstImage.title || '객실 이미지'}
                              src={`${AdminURL}/images/hotelimages/${firstImage.imageName}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 부대시설 탭 첫 번째 이미지 */}
                  {imageEtcView && imageEtcView.length > 0 && (() => {
                    const firstImage = imageEtcView[0];
                    const isVideo = isVideoFile(firstImage.imageName);
                    return (
                      <div key="etc-view" className="preview-image-item">
                        <div className="preview-image-wrapper">
                          {isVideo ? (
                            <video
                              className="preview-image"
                              controls
                              src={`${AdminURL}/images/hotelimages/${firstImage.imageName}`}
                            >
                              브라우저가 비디오 태그를 지원하지 않습니다.
                            </video>
                          ) : (
                            <img
                              className="preview-image"
                              alt={firstImage.title || '부대시설 이미지'}
                              src={`${AdminURL}/images/hotelimages/${firstImage.imageName}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </>
            ) : (
              <div className="photo-gallery">
                {(() => {
                  const images = getCurrentImages();
                  if (images && images.length > 0) {
                    return images.map((img: any, index: number) => {
                      const isVideo = isVideoFile(img.imageName);
                      
                      if (isVideo) {
                        return (
                          <div key={index} className="photo-main">
                            <video
                              className="photo-main-image"
                              controls
                              src={`${AdminURL}/images/hotelimages/${img.imageName}`}
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
                            alt={img.title || `이미지 ${index + 1}`}
                            src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                          />
                        </div>
                      );
                    });
                  }
                  return (
                    <div className="photo-main">
                      <img
                        className="photo-main-image"
                        alt="메인 이미지"
                        src={rectangle580}
                      />
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽 영역: 실론투어 베네핏 및 하루 일정 */}
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
                  <button
                    type="button"
                    className={`right-tab-button right-tab-schedule ${activeRightTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => setActiveRightTab('schedule')}
                  >
                    상품보기
                  </button>
                  <button
                    type="button"
                    className={`right-tab-button right-tab-benefit ${activeRightTab === 'benefit' ? 'active' : ''}`}
                    onClick={() => setActiveRightTab('benefit')}
                  >
                    실론투어 베네핏
                  </button>
                </div>
              </div>
              {activeRightTab === 'benefit' && (
                <div className="benefit-card-section">
                  {/* 실론투어 베네핏 탭은 현재 별도 콘텐츠 없음 */}
                </div>
              )}

              {activeRightTab === 'schedule' && (
                <div className="product-section">
                  
                  <div className="product-list">
                    {products.length === 0 ? (
                      <div className="empty-message">연관된 여행상품이 없습니다.</div>
                    ) : (
                      products.map((product: any) => {
                        // 헤더 텍스트
                        const headerText =
                          product.headerText ||
                          `${product.nation || ''} 추천상품`;
                        
                        // 상품명 (productScheduleData 기반으로 생성)
                        const productName = getProductNameFromSchedule(product);

                        const badgeType = product.badgeType || 'recommend';
                        const badgeText = product.badgeText || '추천상품';

                        return (
                          <div
                            key={product.id}
                            className="product-item"
                            onClick={async () => {
                              // productScheduleData를 기반으로 선택된 호텔 정보 생성
                              const selectedHotels = await getSelectedHotelsFromSchedule(product);
                              
                              navigate('/counsel/rest/hotelcost', { 
                                state: {
                                  hotelInfo: hotelInfo,
                                  productInfo: product,
                                  city: CITY,
                                  selectedHotels: selectedHotels
                                }
                              });
                              window.scrollTo(0, 0);

                            }}
                          >
                            <div className="product-header">
                              <span className="product-header-text">{headerText}</span>
                            </div>
                            <div className="product-content">
                              <p className="product-name">
                                {productName}
                              </p>
                              <div className="product-badge-wrapper">
                                <div className={`product-badge badge-${badgeType}`}>
                                  <span>{badgeText}</span>
                                </div>
                                <p className="product-land-company">{product.landCompany}</p>
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
        )}
        
      </div>
    </div>
  );
};

