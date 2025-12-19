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
import RatingBoard from '../../../common/RatingBoard';
import { useEffect } from 'react';
import { AdminURL } from '../../../../MainURL';
import axios from 'axios';


export default function RestHotelDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateProps = location.state;


  const [hotelInfo, setHotelInfo] = React.useState<any | null>(null);
  const [imageAllView, setImageAllView] = React.useState<any[]>([]);
  const [imageRoomView, setImageRoomView] = React.useState<any[]>([]);
  const [imageEtcView, setImageEtcView] = React.useState<any[]>([]);
  const [roomTypes, setRoomTypes] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);

  // 호텔 리스트 가져오기 (NewPriceHotelSelected.tsx 참조)
  const fetchHotels = async () => {
    try {
      let hotels: any[] = [];
      
      // 도시가 있으면 해당 도시의 호텔만 가져오기
      if (stateProps?.city) {
        const res = await axios.get(`${AdminURL}/hotel/gethotelcity/${stateProps.city}`);
        if (res.data && res.data !== false) {
          hotels = Array.isArray(res.data) ? res.data : [res.data];
        }
      } else {
        // 도시가 없으면 전체 호텔 가져오기
        const res = await axios.get(`${AdminURL}/hotel/gethotelsall`);
        if (res.data && res.data !== false) {
          hotels = Array.isArray(res.data) ? res.data : [res.data];
        }
      }

      setAllHotels(hotels);
    } catch (error) {
      console.error('호텔 리스트 가져오기 오류:', error);
      setAllHotels([]);
    }
  };


  // productScheduleData를 파싱하여 선택된 호텔 정보 생성 (RestHotelCost.tsx로 전달용)
  const getSelectedHotelsFromSchedule = async (product: any): Promise<Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>> => {
    const currentHotelType = stateProps?.hotelInfo?.hotelType || stateProps?.hotelInfo?.hotelSort;
    const currentHotel = stateProps?.hotelInfo;

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
                  currentHotel.hotelNameKo && stateProps?.city) {
                try {
                  const hotelName = encodeURIComponent(currentHotel.hotelNameKo);
                  const city = encodeURIComponent(stateProps.city);
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
                selectedHotel.hotelNameKo && stateProps?.city) {
              try {
                const hotelName = encodeURIComponent(selectedHotel.hotelNameKo);
                const city = encodeURIComponent(stateProps.city);
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
                  currentHotel.hotelNameKo && stateProps?.city) {
                try {
                  const hotelName = encodeURIComponent(currentHotel.hotelNameKo);
                  const city = encodeURIComponent(stateProps.city);
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

      const currentHotelType = stateProps?.hotelInfo?.hotelType || stateProps?.hotelInfo?.hotelSort;
      const currentHotel = stateProps?.hotelInfo;

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

  // 선택된 나라의 관련 여행상품(일정) 조회
  const fetchNationProducts = async (nationCopy:string) => {
    try {
      const response = await axios.post(`${AdminURL}/ceylontour/getcityschedule`, { city: stateProps.city });
      if (response.data) {
        const copy = [...response.data];
        setProducts(copy);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('나라별 여행상품을 가져오는 중 오류 발생:', error);
      setProducts([]);
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
    { text: '전경' },
    { text: '객실' },
    { text: '부대시설' }
  ];

  const [activeTab, setActiveTab] = React.useState(0);
  const [activeRightTab, setActiveRightTab] = React.useState<'benefit' | 'schedule'>('schedule');
  const [showRightPanel, setShowRightPanel] = React.useState(false);
  const [selectedMainImageIndex, setSelectedMainImageIndex] = React.useState(0);
  const [allHotels, setAllHotels] = React.useState<any[]>([]);

  useEffect(() => {
    fetchNationProducts(stateProps.nation);
    fetchHotels();
    setHotelInfo(stateProps.hotelInfo);
    const imageCopy = JSON.parse(stateProps.hotelInfo.imageNamesAllView);
    setImageAllView(imageCopy);
    const imageRoomCopy = JSON.parse(stateProps.hotelInfo.imageNamesRoomView);
    setImageRoomView(imageRoomCopy);
    const imageEtcCopy = JSON.parse(stateProps.hotelInfo.imageNamesEtcView);
    setImageEtcView(imageEtcCopy);
    const roomTypesCopy = JSON.parse(stateProps.hotelInfo.hotelRoomTypes);
    setRoomTypes(roomTypesCopy);
  }, []);

  // 탭 변경 시 선택된 메인 이미지를 첫번째로 리셋
  useEffect(() => {
    setSelectedMainImageIndex(0);
  }, [activeTab]);

  // 데이터가 로드되지 않았다면 상세 내용을 렌더링하지 않음
  if (!hotelInfo) {
    return null;
  }

  // MORNING 섹션의 베네핏 옵션 데이터
  const morningBenefitOptions = [
    {
      type: 'main',
      label: '메인제안',
      optionImage: rectangle600,
      optionImageAlt: '레스토랑 점심',
      firstTitle: '리조트 내 레스토랑 점심',
      scheduleImage: rectangle601,
      scheduleImageAlt: '아침 루틴 1',
      secondTitle: '메뉴 예시, 분위기 설명',
    },
    {
      type: 'select',
      label: '선택 옵션',
      optionImage: rectangle673,
      optionImageAlt: '룸서비스 런치',
      firstTitle: '룸서비스 런치',
      scheduleImage: rectangle674,
      scheduleImageAlt: '아침 루틴 2',
      secondTitle: '주변 유명 맛집 픽업 포함(고객 선택 시 추가 요금)',
    },
  ];

  // LUNCH 섹션의 경험 아이템 데이터
  const experienceItems = [
    {
      image: rectangle675,
      imageAlt: '핵심 경험 1',
      title: '스파 60~90min',
    },
    {
      image: rectangle676,
      imageAlt: '핵심 경험 2',
      title: '시그니처 트리트먼트 설명',
    },
    {
      image: rectangle677,
      imageAlt: '핵심 경험 3',
      title: '프라이빗 풀빌라 투숙 시 에프터눈 티 서빙',
    },
  ];

  // 현재 탭에 따른 이미지 리스트 (전경 / 객실 / 부대시설)
  const getCurrentImages = () => {
    if (activeTab === 0) return imageAllView; // 전경
    if (activeTab === 1) return imageRoomView; // 객실
    return imageEtcView; // 수영장/다이닝/기타 → 부대시설 이미지 공통 사용
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

  const reviewItems = [
    {
      id: 1,
      title: '후기제목을 적는 곳입니다',
      rating: 5.0,
      image: reviewimage,
      text: `발리 누사두아의 황금빛 비치에 위치한 세인트 레지스 발리 리조트는 124개의
스위트 및 빌라와 함께 프라이빗 라군풀, 전담 버틀러 서비스 등의 초호화
설비를 갖춘 다섯 성급 리조트입니다.
전면 백사장과 맞닿은 비치프런트 위치에 더해, 라군 빌라에서는 객실 문을
열자마자 행복....`
    },
    {
      id: 2,
      title: '후기제목을 적는 곳입니다',
      rating: 5.0,
      image: reviewimage,
      text: `발리 누사두아의 황금빛 비치에 위치한 세인트 레지스 발리 리조트는 124개의
스위트 및 빌라와 함께 프라이빗 라군풀, 전담 버틀러 서비스 등의 초호화
설비를 갖춘 다섯 성급 리조트입니다.
전면 백사장과 맞닿은 비치프런트 위치에 더해, 라군 빌라에서는 객실 문을
열자마자 행복....`
    },
  ];

  return (
    <div className="RestHotelDetail">
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
            <div className="hotel-title-wrapper">
              <IoIosArrowBack
                className="arrow-back"
                onClick={() => navigate(-1)}
              />
              <div className="hotel-title">
                <div className="text-title">{hotelInfo?.hotelNameKo || '호텔명'}</div>
                <div className="text-subtitle">
                  {hotelInfo?.hotelNameEn || ''}
                </div>
                <RatingBoard
                  rating={
                    hotelInfo && (hotelInfo.tripAdviser || hotelInfo.customerScore)
                      ? parseFloat(hotelInfo.tripAdviser || hotelInfo.customerScore)
                      : 0
                  }
                />

                <div className="text-location">
                  <p>{hotelInfo?.nation || ''}</p>
                  <IoIosArrowForward />
                  <p>{hotelInfo?.city || ''}</p>
                </div>
              </div>
            </div>

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

            {/* <div className="photo-gallery">
              <div className="photo-main">
                {(() => {
                  const images = getCurrentImages();
                  if (images && images.length > 0) {
                    const main = images[selectedMainImageIndex];
                    const isVideo = isVideoFile(main.imageName);
                    
                    if (isVideo) {
                      return (
                        <video
                          className="photo-main-image"
                          controls
                          src={`${AdminURL}/images/hotelimages/${main.imageName}`}
                        >
                          브라우저가 비디오 태그를 지원하지 않습니다.
                        </video>
                      );
                    }
                    
                    return (
                      <img
                        className="photo-main-image"
                        alt={main.title || '메인 이미지'}
                        src={`${AdminURL}/images/hotelimages/${main.imageName}`}
                      />
                    );
                  }
                  return (
                    <img
                      className="photo-main-image"
                      alt="메인 이미지"
                      src={rectangle580}
                    />
                  );
                })()}
              </div>

              <div className="photo-thumbnails">
                {getCurrentImages().map((img: any, index: number) => {
                  const isVideo = isVideoFile(img.imageName);
                  return (
                    <div
                      className={`photo-thumbnail ${selectedMainImageIndex === index ? 'active' : ''} ${isVideo ? 'video-thumbnail' : ''}`}
                      key={index}
                      onClick={() => setSelectedMainImageIndex(index)}
                    >
                      {isVideo ? (
                        <div className="thumbnail-video-wrapper">
                          <video
                            className="thumbnail-video"
                            src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                            muted
                            preload="metadata"
                          />
                          <div className="video-play-icon">▶</div>
                        </div>
                      ) : (
                        <img
                          src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                          alt={img.title || `썸네일 ${index + 1}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div> */}


            <div className="location-info">
              <div className="section-titlebox">
                <span className="location-title">호텔위치</span>
                <span className="text-wrapper-11">호텔 위치 보기</span>
              </div>

              <p className="text-wrapper-10">
                {hotelInfo?.hotelAddress || ''}
              </p>

              <div className="flexcontainer">
                <p className="text">
                  <span className="span">누사두아 게이티드 지역의 고급 라인업</span>
                </p>

                <p className="text">
                  <span className="span">공항 → 20~25분</span>
                </p>

                <p className="text">
                  <span className="span">발리 컬렉션 쇼핑센터 → 차량 5분</span>
                </p>

                <p className="text">
                  <span className="span">
                    주변: 무려프 비치클럽·워터블로우·BTDC 산책로
                  </span>
                </p>
              </div>
            </div>

            <div className="highlight-section">
              <div className="highlight-title">핵심 포인트</div>
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
              <div className="div-wrapper">
                <div className="text-wrapper">베네핏 & 포함사항</div>
              </div>
      
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

            <div className='component'>
              {/* 후기 및 평점 섹션 */}
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
                            <RatingBoard rating={review.rating} />
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

            </div>
          </div>
        </div>

        {/* 오른쪽 영역: 실론투어 베네핏 및 하루 일정 */}
        {showRightPanel && (
          <div className="right-section">
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

            {/* 탭 컨텐츠 */}
            <div className="right-tab-content">
              {activeRightTab === 'benefit' && (
                <div className="benefit-card-section">
                  {/* 실론투어 베네핏 탭은 현재 별도 콘텐츠 없음 */}
                </div>
              )}

              {activeRightTab === 'schedule' && (
                <div className="product-section">
                  <h2 className="section-title">여행상품</h2>
                  
                  <div className="product-list">
                    {products.length === 0 ? (
                      <div className="empty-message">연관된 여행상품이 없습니다.</div>
                    ) : (
                      products.map((product: any) => {
                        // 헤더 텍스트
                        const headerText =
                          product.headerText ||
                          `${product.nation || stateProps.nation || ''} 추천상품`;
                        
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
                                  city: stateProps?.city,
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

