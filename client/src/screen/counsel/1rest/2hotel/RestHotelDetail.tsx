import React from 'react';
import './RestHotelDetail.scss';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { useNavigate, useLocation } from 'react-router-dom';
import rectangle78 from '../../../lastimages/counselrest/hotel/detail/rectangle-78.png';
import rectangle76 from '../../../lastimages/counselrest/hotel/detail/rectangle-76.png';
import rectangle580 from '../../../lastimages/counselrest/hotel/detail/rectangle-580.png';
import rectangle619 from '../../../lastimages/counselrest/hotel/detail/rectangle-619.png';
import hotelmain from '../../../images/counsel/rest/hotel/hotelmain.png';
import RatingBoard from '../../../common/RatingBoard';
import { useEffect } from 'react';
import { AdminURL } from '../../../../MainURL';
import axios from 'axios';
import GoogleMap from '../../../common/GoogleMap';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { recoilProductName, recoilHotelCart } from '../../../../RecoilStore';
import roomIcon from '../../../images/counsel/rest/hotel/Rooms.png';
import facilityIcon from '../../../images/counsel/rest/hotel/Facilities.png';

export default function RestHotelDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const ID = urlParams.get("id");
  const CITY = urlParams.get("city");
  const fromDetail = urlParams.get("fromDetail") === 'true';
  const fromGo = urlParams.get("fromGo") === 'true';
  const setProductName = useSetRecoilState(recoilProductName);
  const hotelCart = useRecoilValue(recoilHotelCart);
  const setHotelCart = useSetRecoilState(recoilHotelCart);
  const setSavedProductName = useSetRecoilState(recoilProductName);

  const [hotelInfo, setHotelInfo] = React.useState<any | null>(null);
  const [selectedHotelTab, setSelectedHotelTab] = React.useState<number | null>(null);
  const [hotelDetails, setHotelDetails] = React.useState<Array<{
    id: number;
    hotelNameKo: string;
    hotelNameEn?: string;
    hotelType?: string;
    hotelSort?: string;
    city?: string;
    nights: number;
  }>>([]);
  const [imageAllView, setImageAllView] = React.useState<any[]>([]);
  const [imageRoomView, setImageRoomView] = React.useState<any[]>([]);
  const [imageEtcView, setImageEtcView] = React.useState<any[]>([]);
  const [imageMainPoint, setImageMainPoint] = React.useState<any[]>([]);
  const [imageBenefit, setImageBenefit] = React.useState<any[]>([]);
  const [roomTypes, setRoomTypes] = React.useState<any[]>([]);
  const [selectedRoomType, setSelectedRoomType] = React.useState<string>('');
  const [products, setProducts] = React.useState<any[]>([]);
  const [logoImageError, setLogoImageError] = React.useState<boolean>(false);
  const [selectedNights, setSelectedNights] = React.useState<{ [key: number]: number }>({});
  const [showPeriodChangeModal, setShowPeriodChangeModal] = React.useState(false);
  
  // 각 객실 타입 섹션에 대한 ref를 Map으로 관리
  const roomTypeRefs = React.useRef<Map<string, HTMLDivElement | null>>(new Map());

  useEffect(() => {
    const fetchHotelInfo = async () => {
      if (!ID) return;
      
    // 호텔 정보가 변경될 때 로고 이미지 에러 상태 초기화
      setLogoImageError(false);
      
      try {
        const res = await axios.get(`${AdminURL}/ceylontour/gethotelinfobyid/${ID}`);
        if (res.data) {
          const copy = [...res.data][0];
          console.log('copy', copy);
          setHotelInfo(copy);
          const imageNamesAllViewCopy = copy.imageNamesAllView ? JSON.parse(copy.imageNamesAllView) : [];
          setImageAllView(imageNamesAllViewCopy);
          const imageNamesRoomViewCopy = copy.imageNamesRoomView ? JSON.parse(copy.imageNamesRoomView) : [];
          setImageRoomView(imageNamesRoomViewCopy);
          const imageNamesEtcViewCopy = copy.imageNamesEtcView ? JSON.parse(copy.imageNamesEtcView) : [];
          setImageEtcView(imageNamesEtcViewCopy);
          
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
          
          // 객실 타입 파싱 및 설정
          if (copy.hotelRoomTypes) {
            try {
              const parsedRoomTypes = JSON.parse(copy.hotelRoomTypes);
              if (Array.isArray(parsedRoomTypes) && parsedRoomTypes.length > 0) {
                setRoomTypes(parsedRoomTypes);
                // 첫 번째 객실을 기본 선택
                setSelectedRoomType(parsedRoomTypes[0].roomTypeName || '');
              }
            } catch (e) {
              console.error('객실 타입 파싱 오류:', e);
              setRoomTypes([]);
            }
          } else {
            setRoomTypes([]);
          }
        } else {
          setHotelInfo(null);
          setImageAllView([]);
          setImageRoomView([]);
          setImageEtcView([]);
          setImageMainPoint([]);
          setImageBenefit([]);
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
        setImageMainPoint([]);
        setImageBenefit([]);
        setProducts([]);
      }
    };

    fetchHotelInfo();
  }, [ID, CITY]);

  // 선택된 나라의 관련 여행상품(일정) 조회
  const fetchNationProducts = async () => {
    try {
      if (!CITY) {
        setProducts([]);
        return;
      }
      const response = await axios.post(`${AdminURL}/ceylontour/getcityschedule`, { city: CITY });
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

  // 장바구니에서 호텔 목록 가져오기 (GO 버튼으로 진입한 경우)
  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (fromDetail || !fromGo || hotelCart.length === 0) {
        return;
      }

      try {
        const details = await Promise.all(
          hotelCart.map(async (item) => {
            try {
              const res = await axios.get(`${AdminURL}/ceylontour/gethotelinfobyid/${item.id}`);
              if (res.data && res.data.length > 0) {
                const hotel = res.data[0];
                return {
                  id: item.id,
                  hotelNameKo: hotel.hotelNameKo || item.hotelNameKo,
                  hotelNameEn: hotel.hotelNameEn,
                  hotelType: hotel.hotelType,
                  hotelSort: hotel.hotelSort,
                  city: hotel.city || item.city,
                  nights: item.nights || 1
                };
              }
              return {
                id: item.id,
                hotelNameKo: item.hotelNameKo,
                city: item.city,
                nights: item.nights || 1
              };
            } catch (error) {
              console.error(`호텔 ${item.id} 정보 가져오기 오류:`, error);
              return {
                id: item.id,
                hotelNameKo: item.hotelNameKo,
                city: item.city,
                nights: item.nights || 1
              };
            }
          })
        );

        setHotelDetails(details);
        
        // 초기 박수 설정
        const initialNights: { [key: number]: number } = {};
        details.forEach((hotel) => {
          initialNights[hotel.id] = hotel.nights;
        });
        setSelectedNights(initialNights);
        
        // 첫 번째 호텔을 기본 선택 (현재 ID와 일치하는 호텔이 있으면 그것을 선택)
        const currentHotelIndex = details.findIndex(h => h.id === Number(ID));
        if (currentHotelIndex !== -1) {
          setSelectedHotelTab(currentHotelIndex);
          // 첫 번째 호텔 정보를 hotelInfo에 설정
          const firstHotel = details[currentHotelIndex];
          const res = await axios.get(`${AdminURL}/ceylontour/gethotelinfobyid/${firstHotel.id}`);
          if (res.data && res.data.length > 0) {
            const hotel = res.data[0];
            setHotelInfo(hotel);
            
            // 이미지 파싱
            const imageNamesAllViewCopy = hotel.imageNamesAllView ? JSON.parse(hotel.imageNamesAllView) : [];
            setImageAllView(imageNamesAllViewCopy);
            const imageNamesRoomViewCopy = hotel.imageNamesRoomView ? JSON.parse(hotel.imageNamesRoomView) : [];
            setImageRoomView(imageNamesRoomViewCopy);
            const imageNamesEtcViewCopy = hotel.imageNamesEtcView ? JSON.parse(hotel.imageNamesEtcView) : [];
            setImageEtcView(imageNamesEtcViewCopy);
            
            // 핵심 포인트 이미지 파싱
            if (hotel.imageNamesMainPoint) {
              try {
                const parsedMainPoint = JSON.parse(hotel.imageNamesMainPoint);
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
            if (hotel.imageNamesBenefit) {
              try {
                const parsedBenefit = JSON.parse(hotel.imageNamesBenefit);
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
          setSelectedHotelTab(0);
          // 첫 번째 호텔 정보를 hotelInfo에 설정
          const firstHotel = details[0];
          const res = await axios.get(`${AdminURL}/ceylontour/gethotelinfobyid/${firstHotel.id}`);
          if (res.data && res.data.length > 0) {
            const hotel = res.data[0];
            setHotelInfo(hotel);
            
            // 이미지 파싱
            const imageNamesAllViewCopy = hotel.imageNamesAllView ? JSON.parse(hotel.imageNamesAllView) : [];
            setImageAllView(imageNamesAllViewCopy);
            const imageNamesRoomViewCopy = hotel.imageNamesRoomView ? JSON.parse(hotel.imageNamesRoomView) : [];
            setImageRoomView(imageNamesRoomViewCopy);
            const imageNamesEtcViewCopy = hotel.imageNamesEtcView ? JSON.parse(hotel.imageNamesEtcView) : [];
            setImageEtcView(imageNamesEtcViewCopy);
            
            // 핵심 포인트 이미지 파싱
            if (hotel.imageNamesMainPoint) {
              try {
                const parsedMainPoint = JSON.parse(hotel.imageNamesMainPoint);
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
            if (hotel.imageNamesBenefit) {
              try {
                const parsedBenefit = JSON.parse(hotel.imageNamesBenefit);
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
      } catch (error) {
        console.error('호텔 정보 가져오기 오류:', error);
      }
    };

    fetchHotelDetails();
  }, [hotelCart, ID, fromDetail, fromGo]);

  // 선택된 호텔 탭에 따라 호텔 정보 업데이트
  useEffect(() => {
    if (fromDetail || !fromGo || hotelDetails.length === 0 || selectedHotelTab === null) {
      return;
    }

    const selectedHotel = hotelDetails[selectedHotelTab];
    if (!selectedHotel) return;

    const fetchSelectedHotelInfo = async () => {
      try {
        const res = await axios.get(`${AdminURL}/ceylontour/gethotelinfobyid/${selectedHotel.id}`);
        if (res.data && res.data.length > 0) {
          const hotel = res.data[0];
          setHotelInfo(hotel);
          const imageNamesAllViewCopy = hotel.imageNamesAllView ? JSON.parse(hotel.imageNamesAllView) : [];
          setImageAllView(imageNamesAllViewCopy);
          const imageNamesRoomViewCopy = hotel.imageNamesRoomView ? JSON.parse(hotel.imageNamesRoomView) : [];
          setImageRoomView(imageNamesRoomViewCopy);
          const imageNamesEtcViewCopy = hotel.imageNamesEtcView ? JSON.parse(hotel.imageNamesEtcView) : [];
          setImageEtcView(imageNamesEtcViewCopy);
          
          // 객실 타입 파싱 및 설정
          if (hotel.hotelRoomTypes) {
            try {
              const parsedRoomTypes = JSON.parse(hotel.hotelRoomTypes);
              if (Array.isArray(parsedRoomTypes) && parsedRoomTypes.length > 0) {
                setRoomTypes(parsedRoomTypes);
                // 첫 번째 객실을 기본 선택
                setSelectedRoomType(parsedRoomTypes[0].roomTypeName || '');
              } else {
                setRoomTypes([]);
                setSelectedRoomType('');
              }
            } catch (e) {
              console.error('객실 타입 파싱 오류:', e);
              setRoomTypes([]);
              setSelectedRoomType('');
            }
          } else {
            setRoomTypes([]);
            setSelectedRoomType('');
          }
          
          // 핵심 포인트 이미지 파싱
          if (hotel.imageNamesMainPoint) {
            try {
              const parsedMainPoint = JSON.parse(hotel.imageNamesMainPoint);
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
          if (hotel.imageNamesBenefit) {
            try {
              const parsedBenefit = JSON.parse(hotel.imageNamesBenefit);
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
          
          // 선택된 호텔의 도시로 상품 가져오기
          if (hotel.city) {
            const response = await axios.post(`${AdminURL}/ceylontour/getcityschedule`, { city: hotel.city });
            if (response.data) {
              const copy = [...response.data];
              setProducts(copy);
            } else {
              setProducts([]);
            }
          }
        }
      } catch (error) {
        console.error('선택된 호텔 정보 가져오기 오류:', error);
      }
    };

    fetchSelectedHotelInfo();
  }, [selectedHotelTab, hotelDetails, fromDetail, fromGo]);



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

  const handleNightsChange = (hotelId: number, delta: number) => {
    setSelectedNights((prev) => {
      const currentNights = prev[hotelId] || hotelDetails.find(h => h.id === hotelId)?.nights || 1;
      const newNights = Math.max(1, currentNights + delta);
      return {
        ...prev,
        [hotelId]: newNights
      };
    });
  };

  // 선택된 호텔 정보를 일차별로 파싱하여 반환 (일정 데이터에 호텔 정보 입력용)
  // 예: 2박 2박 2박 -> day0,1: 첫번째, day2: 첫번째-두번째, day3: 두번째, day4: 두번째-세번째, day5,6: 세번째
  // 각 호텔은 nights + 1일이며, 두 번째 호텔부터는 첫 날이 이전 호텔의 마지막 날(전환일)과 겹침
  const getHotelInfoPerDay = (hotels: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>) => {
    const hotelInfoPerDay: Array<{ dayIndex: number; hotelName: string; hotelLevel: string }> = [];
    
    if (hotels.length === 0) {
      return hotelInfoPerDay;
    }

    let currentDay = 0;

    // 각 호텔에 대해 일정 생성
    hotels.forEach((hotelItem, hotelIndex) => {
      const nights = parseInt(hotelItem.dayNight || '1', 10);
      const hotelName = hotelItem.hotel?.hotelNameKo || hotelItem.hotelSort || '';
      const hotelLevel = hotelItem.hotel?.hotelLevel || '';
      const nextHotel = hotelIndex < hotels.length - 1 ? hotels[hotelIndex + 1] : null;
      const nextHotelName = nextHotel?.hotel?.hotelNameKo || nextHotel?.hotelSort || '';
      const isFirstHotel = hotelIndex === 0;

      // 첫 번째 호텔: nights일 + 전환 1일 = nights + 1일
      // 이후 호텔: (nights - 1)일 + 전환 1일 = nights일 (첫 날은 이미 전환일에 포함)
      const daysToAdd = isFirstHotel ? nights : nights - 1;
      
      // 현재 호텔의 날짜 추가
      for (let i = 0; i < daysToAdd; i++) {
        hotelInfoPerDay.push({
          dayIndex: currentDay,
          hotelName: hotelName,
          hotelLevel: hotelLevel
        });
        currentDay++;
      }

      // 다음 호텔이 있으면 전환 날 추가
      if (nextHotel) {
        hotelInfoPerDay.push({
          dayIndex: currentDay,
          hotelName: `${hotelName} - ${nextHotelName}`,
          hotelLevel: hotelLevel
        });
        currentDay++;
      } else {
        // 마지막 호텔인 경우 마지막 날 추가 (nights + 1일이므로)
        hotelInfoPerDay.push({
          dayIndex: currentDay,
          hotelName: hotelName,
          hotelLevel: hotelLevel
        });
      }
    });

    return hotelInfoPerDay;
  };

  // 호텔과 박수를 기반으로 일정 데이터 생성
  const createScheduleFromHotels = (hotels: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>) => {
    let currentDay = 1;
    const scheduleDetailData: any[] = [];

    hotels.forEach((hotelItem) => {
      const nights = parseInt(hotelItem.dayNight || '1', 10);
      const hotelName = hotelItem.hotel?.hotelNameKo || hotelItem.hotelSort || '';

      // 각 박수만큼 일정 일자 생성
      for (let i = 0; i < nights; i++) {
        scheduleDetailData.push({
          breakfast: '',
          lunch: '',
          dinner: '',
          hotel: hotelName,
          score: '',
          scheduleDetail: [
            {
              id: 0,
              idx: 0,
              st: 'location',
              isViewLocation: true,
              locationIcon: '',
              location: `${currentDay}일차`,
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
    if (hotelDetails.length === 0) {
      alert('호텔 정보가 없습니다.');
      return;
    }

    try {
      // 장바구니의 박수 업데이트
      const updatedCart = hotelCart.map((item) => {
        const nights = selectedNights[item.id] || item.nights || 1;
        return {
          ...item,
          nights: nights
        };
      });
      setHotelCart(updatedCart);

      // 각 호텔의 상세 정보를 가져와서 selectedHotels 형식으로 변환
      const selectedHotels = await Promise.all(
        hotelDetails.map(async (hotel, index) => {
          try {
            const res = await axios.get(`${AdminURL}/ceylontour/gethotelinfobyid/${hotel.id}`);
            const hotelDetail = res.data && res.data.length > 0 ? res.data[0] : null;
            if (hotelDetail) {
              const nights = selectedNights[hotel.id] || hotel.nights || 1;
              const hotelSort = hotelDetail.hotelType || hotelDetail.hotelSort || hotel.hotelType || hotel.hotelSort || '리조트';
              
              return {
                index: index,
                hotelSort: hotelSort,
                dayNight: String(nights),
                hotel: {
                  ...hotelDetail,
                  imageNamesAllView: hotelDetail.imageNamesAllView || '[]',
                  imageNamesRoomView: hotelDetail.imageNamesRoomView || '[]',
                  imageNamesEtcView: hotelDetail.imageNamesEtcView || '[]',
                  hotelRoomTypes: hotelDetail.hotelRoomTypes || '[]'
                }
              };
            }
            return null;
          } catch (error) {
            console.error(`호텔 ${hotel.id} 정보 가져오기 오류:`, error);
            return null;
          }
        })
      );

      // null 값 제거
      const validSelectedHotels = selectedHotels.filter((hotel): hotel is NonNullable<typeof hotel> => hotel !== null);

      if (validSelectedHotels.length === 0) {
        alert('호텔 정보를 가져올 수 없습니다.');
        return;
      }

      // 첫 번째 호텔 정보 가져오기
      const firstHotel = validSelectedHotels[0].hotel;
      if (!firstHotel) {
        alert('호텔 정보를 가져올 수 없습니다.');
        return;
      }

      // 도시별 첫 번째 상품 가져오기 (없으면 null)
      let productInfo = null;
      const firstCity = hotelDetails[0]?.city || CITY || '';
      if (firstCity) {
        try {
          const response = await axios.post(`${AdminURL}/ceylontour/getcityschedule`, { city: firstCity });
          if (response.data && response.data.length > 0) {
            productInfo = response.data[0];
          }
        } catch (error) {
          console.error('상품 정보 가져오기 오류:', error);
        }
      }

      // 상품명 생성
      const nameParts = hotelDetails.map((hotel) => {
        const nights = selectedNights[hotel.id] || hotel.nights || 1;
        return `${hotel.hotelNameKo} ${nights}박`;
      });
      const productName = nameParts.join(' + ');

      // 상품명을 RecoilStore에 저장
      setSavedProductName(productName);

      // 호텔과 박수를 기반으로 새로운 일정 데이터 생성
      const customScheduleInfo = createScheduleFromHotels(validSelectedHotels);

      // RestHotelCost로 이동
      navigate('/counsel/rest/hotelcost', {
        state: {
          hotelInfo: firstHotel,
          productInfo: productInfo,
          city: firstCity,
          selectedHotels: validSelectedHotels,
          isFromMakeButton: true, // '만들기' 버튼에서 온 것임을 표시
          customScheduleInfo: customScheduleInfo // 호텔 기반 일정 데이터
        }
      });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      alert('저장 중 오류가 발생했습니다.');
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
    { text: '객실' },
    { text: '부대시설' },
    { text: '베네핏' },
  ];

  const [activeTab, setActiveTab] = React.useState(0);
  const [activeRightTab, setActiveRightTab] = React.useState<'custom' | 'schedule'>('schedule');
  const [showRightPanel, setShowRightPanel] = React.useState(false);
  const [selectedMainImageIndex, setSelectedMainImageIndex] = React.useState(0);
  const [allHotels, setAllHotels] = React.useState<any[]>([]);
  const [showTopButton, setShowTopButton] = React.useState(false);
  const thumbnailContainerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  
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

  // 객실 탭이 활성화될 때 첫 번째 객실을 기본 선택
  useEffect(() => {
    if (activeTab === 1 && roomTypes.length > 0 && !selectedRoomType) {
      setSelectedRoomType(roomTypes[0].roomTypeName || '');
    }
  }, [activeTab, roomTypes, selectedRoomType]);

  // 데이터가 로드되지 않았다면 상세 내용을 렌더링하지 않음
  if (!hotelInfo) {
    return null;
  }


  // 현재 탭에 따른 이미지 리스트 (소개 / 전경 / 객실 / 부대시설)
  const getCurrentImages = () => {
    if (activeTab === 0) return imageAllView; 
    if (activeTab === 1) {
      return imageRoomView; // 객실 - 모든 이미지 반환
    }
    if (activeTab === 2) {
      return imageEtcView; // 부대시설 - 모든 이미지 반환
    }
    if (activeTab === 3) {
      return imageBenefit; // 베네핏 - 모든 이미지 반환
    }
    return [];
  };
  
  // 객실별로 이미지를 그룹화하는 함수
  const getImagesByRoomType = (roomTypeName: string) => {
    return imageRoomView.filter((img: any) => {
      return img.roomTypeName === roomTypeName || img.title === roomTypeName;
    });
  };

  // 부대시설 이미지를 title로 그룹화하는 함수
  const getFacilityGroups = () => {
    const groups: { [key: string]: any[] } = {};
    imageEtcView.forEach((img: any) => {
      const title = img.title || '기타';
      if (!groups[title]) {
        groups[title] = [];
      }
      groups[title].push(img);
    });
    return groups;
  };

  // 베네핏 이미지를 title로 그룹화하는 함수
  const getBenefitGroups = () => {
    const groups: { [key: string]: any[] } = {};
    imageBenefit.forEach((img: any) => {
      const title = img.title || '기타';
      if (!groups[title]) {
        groups[title] = [];
      }
      groups[title].push(img);
    });
    return groups;
  };

  // 파일이 동영상인지 확인
  const isVideoFile = (fileName: string) => {
    if (!fileName) return false;
    const videoExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];
    const lowerFileName = fileName.toLowerCase();
    return videoExtensions.some(ext => lowerFileName.endsWith(ext));
  };

  // 핵심 포인트 아이템 생성 (데이터에서 가져온 이미지 사용)
  const highlightItems = imageMainPoint.map((item: any) => ({
    image: `${AdminURL}/images/hotelimages/${item.imageName}`,
    title: item.title || '',
    notice: item.notice || '',
  }));

  // 베네핏 아이템 생성 (데이터에서 가져온 이미지 사용)
  const benefitItems = imageBenefit.map((item: any) => ({
    title: item.title || '',
    text: item.notice || '',
    image: `${AdminURL}/images/hotelimages/${item.imageName}`,
  }));


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
      <div className="hotel-detail-container">
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

        <div className={`hotel-container ${showRightPanel ? 'with-right-panel' : 'without-right-panel'}`}>
          {/* 왼쪽 영역: 기존 내용 */}
          <div className="left-section">
            {/* 상단 헤더 이미지 (오른쪽 패널이 닫혀있을 때만 표시, 스크롤에 포함) */}
            {/* {!showRightPanel && (
              <div className="hotel-header-image">
                <img
                  className="header-image-media"
                  alt="호텔 메인 이미지"
                  src={getHeaderImage()}
                />
                <div className="header-image-overlay"></div>
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
            )} */}

            {/* Breadcrumb Navigation */}
            <div className="breadcrumb-nav-wrapper">
              <div className="breadcrumb-nav">
                <span 
                  className="breadcrumb-item"
                  onClick={() => navigate('/')}
                >
                  HOME
                </span>
                <IoIosArrowForward className="breadcrumb-separator"/>
                <span 
                  className="breadcrumb-item"
                  onClick={() => navigate('/counsel/rest')}
                >
                  휴양지
                </span>
                {CITY && (
                  <>
                    <IoIosArrowForward className="breadcrumb-separator"/>
                    <span 
                      className="breadcrumb-item"
                      onClick={() => navigate(-1)}
                    >
                      {CITY}
                    </span>
                  </>
                )}
                {/* {hotelInfo?.hotelNameKo && (
                  <>
                    <IoIosArrowForward className="breadcrumb-separator"/>
                    <span className="breadcrumb-item breadcrumb-item-current">
                      {hotelInfo.hotelNameKo}
                    </span>
                  </>
                )} */}
              </div>
            </div>
            
            
            
            {/* 호텔 탭 (GO 버튼으로 진입한 경우에만 표시) */}
            {!fromDetail && fromGo && hotelDetails.length > 0 && (
              <div className="hotel-tabs-container">
                <div className="hotel-tabs-left">
                  {hotelDetails.map((hotel, index) => (
                    <button
                      key={hotel.id}
                      type="button"
                      className={`hotel-tab-button ${selectedHotelTab === index ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedHotelTab(index);
                        setActiveTab(0); // 호텔 탭 변경 시 '소개' 탭으로 초기화
                      }}
                    >
                      {hotel.hotelNameKo}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 호텔 정보 표시 */}
            <div className="hotel-title-top-wrapper">
             <IoIosArrowBack
                className="arrow-back"
                onClick={() => navigate(-1)}
              />
              <div className="text-title">{hotelInfo?.hotelNameKo || '호텔명'}</div>
              <div className="text-subtitle">
                {hotelInfo?.hotelNameEn || ''}
              </div>
              <div className="text-rating">
              <RatingBoard
                ratingSize={16}
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
            
            {/* 태그 섹션 */}
            <div className="hotel-tags-wrapper">
              <div className="hotel-tags">
                <span className="hotel-tag">#럭셔리</span>
                <span className="hotel-tag">#최고급리조트</span>
                <span className="hotel-tag">#프라이빗 비치</span>
                <span className="hotel-tag">#허니문</span>
                <span className="hotel-tag">#가족 모두 만족도 1위급</span>
              </div>
            </div>
            
            <div className="hotel-center-wrapper">

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
                        const isVideo = isVideoFile(img.imageName);
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
                                draggable={false}
                                onDragStart={(e) => e.preventDefault()}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

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
                  )}

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

                  {/* <div className="location-info-section">
                    <div className="section-title">호텔위치</div>
                    <div className="location-content-wrapper">
                      <div className="location-text-panel">
                        <div className="location-address">
                          {hotelInfo?.hotelAddress || ''}
                        </div>
                        <div className="location-nearby-list">
                          <div className="location-nearby-item">
                            <div className="location-nearby-item-icon-name">
                              <span className="location-icon">◎</span>
                              <span className="location-name">발리 국립 골프 클럽</span>
                            </div>
                            <span className="location-time">도보 5분</span>
                          </div>
                          <div className="location-nearby-item">
                            <div className="location-nearby-item-icon-name">
                              <span className="location-icon">◎</span>
                              <span className="location-name">게러그비치</span>
                            </div>
                            <span className="location-time">도보 12분</span>
                          </div>
                          <div className="location-nearby-item">
                            <div className="location-nearby-item-icon-name">  
                              <span className="location-icon">◎</span>
                              <span className="location-name">발리 컬렉션 쇼핑센터</span>
                            </div>
                            <span className="location-time">도보 17분</span>
                          </div>
                          <div className="location-nearby-item">
                            <div className="location-nearby-item-icon-name">  
                              <span className="location-icon">◎</span>
                              <span className="location-name">웅우라라이 국제공항</span>
                            </div>
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
                  </div> */}

                  {/* imageAllView 이미지 전부 표시 */}
                  <div className="tab-preview-images">
                    {imageAllView && imageAllView.length > 0 ? (
                      imageAllView.map((img: any, index: number) => {
                        console.log(img);
                        const imageName = typeof img === 'string' ? img : img.imageName;
                        const title = typeof img === 'object' && img.title ? img.title : '';
                        const isVideo = isVideoFile(imageName);
                        return (
                          <div key={`all-view-${index}`} className="preview-image-item">
                            <div className="preview-image-wrapper">
                              {isVideo ? (
                                <video
                                  className="preview-image"
                                  controls
                                  src={`${AdminURL}/images/hotelimages/${imageName}`}
                                >
                                  브라우저가 비디오 태그를 지원하지 않습니다.
                                </video>
                              ) : (
                                <img
                                  className="preview-image"
                                  alt={title || `전경 이미지 ${index + 1}`}
                                  src={`${AdminURL}/images/hotelimages/${imageName}`}
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
                  {activeTab === 1 && roomTypes.length > 0 ? (
                    <>
                      {/* Rooms 타이틀 */}
                      <div className="rooms-title" style={{ 
                        fontSize: '32px', 
                        fontWeight: 'bold', 
                        marginBottom: '20px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '30px'
                      }}>
                        <img src={roomIcon} alt="Rooms" style={{ height: '50px' }} />
                      </div>
                      
                      {/* 객실 타입 텍스트 표시 (클릭 가능) */}
                      <div className="room-type-tabs" style={{
                        display: 'flex',
                        marginBottom: '32px',
                        flexWrap: 'wrap',
                        paddingBottom: '16px',
                        justifyContent: 'center'
                      }}>
                        {roomTypes.map((room: any, index: number) => (
                          <span
                            key={room.roomTypeName}
                            onClick={() => {
                              const roomTypeName = room.roomTypeName;
                              const ref = roomTypeRefs.current.get(roomTypeName);
                              if (ref) {
                                ref.scrollIntoView({ 
                                  behavior: 'smooth', 
                                  block: 'start' 
                                });
                              }
                            }}
                            style={{
                              fontSize: '16px',
                              fontWeight: '400',
                              color: '#666',
                              borderBottom: index < roomTypes.length - 1 ? 'none' : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#333';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#666';
                            }}
                          >
                            <span style={{ fontSize: '16px', fontWeight: '400', color: 'inherit', marginRight: '0' }}>{room.roomTypeName}</span>
                            {index < roomTypes.length - 1 && (
                              <span style={{ color: '#ccc', margin:'0 15px' }}>|</span>
                            )}
                          </span>
                        ))}
                      </div>
                      
                      {/* 모든 객실의 이미지들을 리스트로 표시 */}
                      <div className="room-images-grid" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '48px',
                        width: '100%'
                      }}>
                        {roomTypes.map((room: any) => {
                          const roomImages = getImagesByRoomType(room.roomTypeName);
                          
                          if (roomImages.length === 0) {
                            return null;
                          }
                          
                          return (
                            <div 
                              key={room.roomTypeName} 
                              ref={(el) => {
                                if (el) {
                                  roomTypeRefs.current.set(room.roomTypeName, el);
                                } else {
                                  roomTypeRefs.current.delete(room.roomTypeName);
                                }
                              }}
                              style={{ width: '100%' }}
                            >
                              {/* 객실 이름 */}
                              <div style={{
                                fontSize: '24px',
                                fontWeight: '600',
                                marginBottom: '24px',
                                textAlign: 'center'
                              }}>
                                {room.roomTypeName}
                              </div>
                              
                              {/* 해당 객실의 이미지들 */}
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px'
                              }}>
                                {roomImages.map((img: any, imgIndex: number) => {
                                  const isVideo = isVideoFile(img.imageName);
                                  
                                  if (isVideo) {
                                    return (
                                      <div key={imgIndex} className="photo-main" style={{ width: '100%' }}>
                                        <video
                                          className="photo-main-image"
                                          controls
                                          src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                                          style={{ width: '100%' }}
                                        >
                                          브라우저가 비디오 태그를 지원하지 않습니다.
                                        </video>
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <div key={imgIndex} className="photo-main" style={{ width: '100%' }}>
                                      <img
                                        className="photo-main-image"
                                        alt={img.title || `${room.roomTypeName} 이미지 ${imgIndex + 1}`}
                                        src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                                        style={{ width: '100%' }}
                                      />
                                      {img.notice && <div className="photo-main-notice">{img.notice}</div>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : activeTab === 2 && imageEtcView.length > 0 ? (
                    <>
                      {/* 부대시설 타이틀 */}
                      <div className="rooms-title" style={{ 
                        fontSize: '32px', 
                        fontWeight: 'bold', 
                        marginBottom: '20px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '30px'
                      }}>
                        <img src={facilityIcon} alt="Facility" style={{ height: '50px' }} />
                      </div>
                      
                      {/* 부대시설 그룹 텍스트 표시 (클릭 가능) */}
                      {(() => {
                        const facilityGroups = getFacilityGroups();
                        const groupTitles = Object.keys(facilityGroups);
                        
                        if (groupTitles.length === 0) return null;
                        
                        return (
                          <div className="room-type-tabs" style={{
                            display: 'flex',
                            marginBottom: '32px',
                            flexWrap: 'wrap',
                            paddingBottom: '16px',
                            justifyContent: 'center'
                          }}>
                            {groupTitles.map((title: string, index: number) => (
                              <span
                                key={title}
                                onClick={() => {
                                  const ref = roomTypeRefs.current.get(title);
                                  if (ref) {
                                    ref.scrollIntoView({ 
                                      behavior: 'smooth', 
                                      block: 'start' 
                                    });
                                  }
                                }}
                                style={{
                                  fontSize: '16px',
                                  fontWeight: '400',
                                  color: '#666',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = '#333';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = '#666';
                                }}
                              >
                                <span style={{ fontSize: '16px', fontWeight: '400', color: 'inherit', marginRight: '0' }}>{title}</span>
                                {index < groupTitles.length - 1 && (
                                  <span style={{ color: '#ccc', margin:'0 15px' }}>|</span>
                                )}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                      
                      {/* 모든 부대시설의 이미지들을 리스트로 표시 */}
                      <div className="room-images-grid" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '48px',
                        width: '100%'
                      }}>
                        {(() => {
                          const facilityGroups = getFacilityGroups();
                          return Object.entries(facilityGroups).map(([title, images]) => {
                            if (images.length === 0) {
                              return null;
                            }
                            
                            return (
                              <div 
                                key={title} 
                                ref={(el) => {
                                  if (el) {
                                    roomTypeRefs.current.set(title, el);
                                  } else {
                                    roomTypeRefs.current.delete(title);
                                  }
                                }}
                                style={{ width: '100%' }}
                              >
                                {/* 부대시설 이름 */}
                                <div style={{
                                  fontSize: '24px',
                                  fontWeight: '600',
                                  marginBottom: '24px',
                                  textAlign: 'center'
                                }}>
                                  {title}
                                </div>
                                
                                {/* 해당 부대시설의 이미지들 */}
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '24px'
                                }}>
                                  {images.map((img: any, imgIndex: number) => {
                                    const isVideo = isVideoFile(img.imageName);
                                    
                                    if (isVideo) {
                                      return (
                                        <div key={imgIndex} className="photo-main" style={{ width: '100%' }}>
                                          <video
                                            className="photo-main-image"
                                            controls
                                            src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                                            style={{ width: '100%' }}
                                          >
                                            브라우저가 비디오 태그를 지원하지 않습니다.
                                          </video>
                                        </div>
                                      );
                                    }
                                    
                                    return (
                                      <div key={imgIndex} className="photo-main" style={{ width: '100%' }}>
                                        <img
                                          className="photo-main-image"
                                          alt={img.title || `${title} 이미지 ${imgIndex + 1}`}
                                          src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                                          style={{ width: '100%' }}
                                        />
                                        {img.notice && <div className="photo-main-notice">{img.notice}</div>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </>
                  ) : activeTab === 3 && imageBenefit.length > 0 ? (
                    <>
                      {/* 베네핏 타이틀 */}
                      <div className="rooms-title" style={{ 
                        fontSize: '32px', 
                        fontWeight: 'bold', 
                        marginBottom: '20px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '30px'
                      }}>
                        베네핏
                      </div>
                      
                      {/* 베네핏 그룹 텍스트 표시 (클릭 가능) */}
                      {(() => {
                        const benefitGroups = getBenefitGroups();
                        const groupTitles = Object.keys(benefitGroups);
                        
                        if (groupTitles.length === 0) return null;
                        
                        return (
                          <div className="room-type-tabs" style={{
                            display: 'flex',
                            marginBottom: '32px',
                            flexWrap: 'wrap',
                            paddingBottom: '16px',
                            justifyContent: 'center'
                          }}>
                            {groupTitles.map((title: string, index: number) => (
                              <span
                                key={title}
                                onClick={() => {
                                  const ref = roomTypeRefs.current.get(title);
                                  if (ref) {
                                    ref.scrollIntoView({ 
                                      behavior: 'smooth', 
                                      block: 'start' 
                                    });
                                  }
                                }}
                                style={{
                                  fontSize: '16px',
                                  fontWeight: '400',
                                  color: '#666',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = '#333';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = '#666';
                                }}
                              >
                                <span style={{ fontSize: '16px', fontWeight: '400', color: 'inherit', marginRight: '0' }}>{title}</span>
                                {index < groupTitles.length - 1 && (
                                  <span style={{ color: '#ccc', margin:'0 15px' }}>|</span>
                                )}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                      
                      {/* 모든 베네핏의 이미지들을 리스트로 표시 */}
                      <div className="room-images-grid" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '48px',
                        width: '100%'
                      }}>
                        {(() => {
                          const benefitGroups = getBenefitGroups();
                          return Object.entries(benefitGroups).map(([title, images]) => {
                            if (images.length === 0) {
                              return null;
                            }
                            
                            return (
                              <div 
                                key={title} 
                                ref={(el) => {
                                  if (el) {
                                    roomTypeRefs.current.set(title, el);
                                  } else {
                                    roomTypeRefs.current.delete(title);
                                  }
                                }}
                                style={{ width: '100%' }}
                              >
                                {/* 베네핏 이름 */}
                                <div style={{
                                  fontSize: '24px',
                                  fontWeight: '600',
                                  marginBottom: '24px',
                                  textAlign: 'center'
                                }}>
                                  {title}
                                </div>
                                
                                {/* 해당 베네핏의 이미지들 */}
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '24px'
                                }}>
                                  {images.map((img: any, imgIndex: number) => {
                                    const isVideo = isVideoFile(img.imageName);
                                    
                                    if (isVideo) {
                                      return (
                                        <div key={imgIndex} className="photo-main" style={{ width: '100%' }}>
                                          <video
                                            className="photo-main-image"
                                            controls
                                            src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                                            style={{ width: '100%' }}
                                          >
                                            브라우저가 비디오 태그를 지원하지 않습니다.
                                          </video>
                                        </div>
                                      );
                                    }
                                    
                                    return (
                                      <div key={imgIndex} className="photo-main" style={{ width: '100%' }}>
                                        <img
                                          className="photo-main-image"
                                          alt={img.title || `${title} 이미지 ${imgIndex + 1}`}
                                          src={`${AdminURL}/images/hotelimages/${img.imageName}`}
                                          style={{ width: '100%' }}
                                        />
                                        {img.notice && <div className="photo-main-notice">{img.notice}</div>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </>
                  ) : (
                    <>
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
                                <div className="photo-main-title">{img.title}</div>
                                <div className="photo-main-notice">{img.notice}</div>
                              </div>
                            );
                          });
                        }
                        return (
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
                        );
                      })()}
                    </>
                  )}
                </div>
              )}
            </div>


            <div className="related-products-btn-wrapper">
            
              <button 
                className="related-products-btn"
                onClick={() => {
                  setShowRightPanel(true);
                  setActiveRightTab('schedule');
                }}
              >
                관련 상품 보기
              </button>

                {/* 탑 버튼 */}
                <div className="top-button-wrapper">
                  <button
                    className="top-button"
                    onClick={() => {
                      const leftSection = document.querySelector('.RestHotelDetail .left-section');
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
                      className={`right-tab-button right-tab-benefit ${activeRightTab === 'custom' ? 'active' : ''}`}
                      onClick={() => setActiveRightTab('custom')}
                    >
                      일정만들기
                    </button>
                  </div>
                </div>
              

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
                                
                                // 상품명을 RecoilStore에 저장
                                const productNameFromSchedule = getProductNameFromSchedule(product);
                                setProductName(productNameFromSchedule);

                                // 일차별 호텔 정보 파싱
                                const hotelInfoPerDay = getHotelInfoPerDay(selectedHotels);
                                
                                navigate('/counsel/rest/hotelcost', { 
                                  state: {
                                    hotelInfo: hotelInfo,
                                    productInfo: product,
                                    city: CITY,
                                    selectedHotels: selectedHotels,
                                    hotelInfoPerDay: hotelInfoPerDay
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

                {activeRightTab === 'custom' && (
                  <div className="benefit-card-section">
                    <div className="hotel-cards-section">
                      <div className="hotel-cards">
                        {hotelDetails.map((hotel, index) => {
                          const nights = selectedNights[hotel.id] || hotel.nights || 1;
                          const hotelSort = hotel.hotelType || hotel.hotelSort || '리조트';
                          
                          return (
                            <div key={hotel.id} className="hotel-card">
                              <div className="hotel-card-day">{index + 1}일차</div>
                              <div className="hotel-card-header">
                                <div className="hotel-card-badge">
                                  {hotelSort}
                                </div>
                                <div className="hotel-card-title">{hotel.hotelNameKo}</div>
                              </div>
                              <div className="hotel-card-content">
                                <div className="hotel-card-nights-control">
                                  <button
                                    className="nights-btn"
                                    onClick={() => handleNightsChange(hotel.id, -1)}
                                    disabled={nights <= 1}
                                  >
                                    -
                                  </button>
                                  <span className="nights-value">{nights}박</span>
                                  <button
                                    className="nights-btn"
                                    onClick={() => handleNightsChange(hotel.id, 1)}
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

