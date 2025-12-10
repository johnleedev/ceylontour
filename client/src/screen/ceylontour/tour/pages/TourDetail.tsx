import "./TourDetail.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AdminURL} from "../../../../MainURL";
import AirlineData from "../../../AirlineData";
import locationIcon from "../../lastimages/tourPage/location.png"
import hotelbuildingIcon from "../../lastimages/tourPage/hotelbuilding.png"
import hotelplateIcon from "../../lastimages/tourPage/hotelplate.png"
import RatingBoard from "../../..//common/RatingBoard";
import { IoIosArrowBack, IoMdClose } from "react-icons/io";
import ProductImageData from "../../..//common/ProductImageData";
import { ImageNoticeProps, ProductRestHotelInfo, RestAirlineProps, RestScheduleListProps, RestSelectScheduleDetailProps } from "../../product/Product_InterfaceData";
import { FaCheck, FaRegCircle, FaStar } from "react-icons/fa";
import { IoMdArrowDropup, IoMdArrowDropdown } from "react-icons/io";
import sampleImage1 from "../../lastimages/hotels/hotel_01.png"
import sampleImage2 from "../../lastimages/hotels/hotel_02.png"
import sampleImage4 from "../../lastimages/hotels/hotel_04.png"
import ResortCustomOrder from './TourDetailCustom';
import { CiCalendar } from "react-icons/ci";
import { GoPerson } from "react-icons/go";
import TourDetailCustom from "./TourDetailCustom";


export default function TourDetail() {
  
  let navigate = useNavigate();
  const url = new URL(window.location.href);
  const ID = url.searchParams.get("id");
  
  // Tour 정보 state
  const [tourInfo, setTourInfo] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState<any>(null);

  // 스케줄 상세 데이터 가져오기
  const fetchScheduleDetailData = async (scheduleData: any) => {
    try {
      // 1. DAY별 scheduleDetail id 추출
      const scheduleDetailArr = JSON.parse(scheduleData.scheduleDetail);
      const allDetailIds: { id: string, sort: string }[] = [];
      
      scheduleDetailArr.forEach((schedule: any) => {
        if (Array.isArray(schedule.scheduleDetailData)) {
          schedule.scheduleDetailData.forEach((day: any) => {
            if (Array.isArray(day.scheduleDetail)) {
              day.scheduleDetail.forEach((detailObj: any) => {
                if (detailObj && detailObj.id && Array.isArray(detailObj.id)) {
                  detailObj.id.forEach((id: any) => {
                    if (id && id !== 0 && id !== '0' && id !== undefined && id !== null) {
                      allDetailIds.push({ id: String(id), sort: detailObj.sort });
                    }
                  });
                }
              });
            }
          });
        }
      });

      // 2. 각 id로 productScheduleDetail/airline 조회
      const detailPromises = allDetailIds.map(item => {
        if (item.sort === 'location') {
          return axios.post(`${AdminURL}/tourscheduledetailbox/getscheduledetailbyid`, {
            scheduleDetailIds: [item.id]
          }).then(res => {
            return {
              sort: 'location',
              detail: res.data && Array.isArray(res.data) ? res.data[0] : res.data
            };
          });
        } else if (item.sort === 'airline') {
          return axios.post(`${AdminURL}/tournationcity/getairlinebyid`, { id: item.id })
            .then(res => {
              return {
                sort: 'airline',
                airlineData: res.data || null
              };
            });
        }
        return Promise.resolve(null);
      });
      const detailResults = await Promise.all(detailPromises);

      // 3. locationDetail의 subLocationDetail id 추출
      let allBoxIds: string[] = [];
      const converted = detailResults.map((item) => {
        if (!item) return null;
        if (item.sort === 'location' && 'detail' in item && item.detail) {
          let locationDetailArr = item.detail.locationDetail;
          if (!Array.isArray(locationDetailArr)) {
            if (typeof locationDetailArr === 'string') {
              try { locationDetailArr = JSON.parse(locationDetailArr); } catch { locationDetailArr = []; }
            } else {
              locationDetailArr = [];
            }
          }
          locationDetailArr.forEach((ld: any) => {
            if (Array.isArray(ld.subLocationDetail)) {
              ld.subLocationDetail.forEach((subId: any) => {
                if (subId) allBoxIds.push(String(subId));
              });
            }
          });
          return {
            id: item.detail.id,
            sort: 'location',
            location: item.detail.location,
            airlineData: null,
            locationDetail: locationDetailArr.map((ld: any) => ({
              subLocation: ld.subLocation,
              subLocationContent: ld.subLocationContent,
              subLocationDetail: Array.isArray(ld.subLocationDetail) ? ld.subLocationDetail.map((id: any) => id) : []
            }))
          };
        } else if (item.sort === 'airline' && 'airlineData' in item) {
          return {
            id: 0,
            sort: 'airline',
            location: '',
            airlineData: item.airlineData,
            locationDetail: [{
              subLocation: '',
              subLocationContent: '',
              subLocationDetail: []
            }]
          };
        }
        return null;
      }).filter(Boolean);

      // 4. productScheduleDetailBox 조회
      let boxDetailMap: Record<string, any> = {};
      if (allBoxIds.length > 0) {
        const boxRes = await axios.post(`${AdminURL}/tourscheduledetailbox/getdetailboxbyid`, {
          scheduleDetailIds: allBoxIds
        });
        if (Array.isArray(boxRes.data)) {
          boxRes.data.forEach((d: any) => {
            let postImage = '';
            if (Array.isArray(d.inputImage)) postImage = d.inputImage[0];
            else if (typeof d.inputImage === 'string') {
              try {
                const arr = JSON.parse(d.inputImage);
                postImage = Array.isArray(arr) ? arr[0] : d.inputImage;
              } catch {
                postImage = d.inputImage;
              }
            }
            boxDetailMap[String(d.id)] = {
              id: d.id,
              postImage,
              locationTitle: d.productName,
              locationContent: d.detailNotice,
              locationDetailSort: ''
            };
          });
        }
      }

      // 5. locationDetail의 subLocationDetail을 실제 객체로 치환
      const convertedWithBox = converted.map((item: any) => {
        if (item && item.sort === 'location') {
          return {
            ...item,
            locationDetail: item.locationDetail.map((detail: any) => ({
              ...detail,
              subLocationDetail: Array.isArray(detail.subLocationDetail)
                ? detail.subLocationDetail.map((id: any) =>
                    boxDetailMap[String(id)] || {
                      id: String(id),
                      postImage: '',
                      locationTitle: '',
                      locationContent: '',
                      locationDetailSort: ''
                    }
                  )
                : []
            }))
          };
        } else {
          return item;
        }
      });

      // 6. scheduleDetail에 값 반영
      const newScheduleDetail = scheduleDetailArr.map((schedule: any) => {
        const scheduleDetailData = schedule.scheduleDetailData.map((day: any) => {
          const details: any[] = [];
          
          if (Array.isArray(day.scheduleDetail)) {
            day.scheduleDetail.forEach((detailObj: any) => {
              if (detailObj.id && Array.isArray(detailObj.id) && detailObj.id.length > 0) {
                detailObj.id.forEach((id: any) => {
                  if (id && id !== 0 && id !== '0') {
                    if (detailObj.sort === 'airline') {
                      const airlineItem = convertedWithBox.find(item => 
                        item && item.sort === 'airline' && item.airlineData && 
                        (item.airlineData.id === id || item.id === id)
                      );
                      if (airlineItem) {
                        details.push(airlineItem);
                      }
                    } else if (detailObj.sort === 'location') {
                      const locationItem = convertedWithBox.find(item => 
                        item && item.sort === 'location' && item.location && 
                        (item.id === id || item.detail?.id === id)
                      );
                      if (locationItem) {
                        details.push(locationItem);
                      }
                    }
                  } else if (id === 0 || id === '0') {
                    details.push({
                      id: 0,
                      sort: 'location',
                      location: '',
                      airlineData: null,
                      locationDetail: [{
                        subLocation: '',
                        subLocationContent: '',
                        subLocationDetail: []
                      }]
                    });
                  }
                });
              }

              if (detailObj.sort === 'text') {
                const textValue = (detailObj.text ?? '').toString();
                details.push({
                  id: 0,
                  sort: 'text',
                  text: textValue,
                  location: textValue,
                  airlineData: null,
                  locationDetail: [{
                    subLocation: '',
                    subLocationContent: '',
                    subLocationDetail: []
                  }]
                });
              }

              if (details.length === 0) {
                details.push({
                  id: 0,
                  sort: 'location',
                  location: '',
                  airlineData: null,
                  locationDetail: [{
                    subLocation: '',
                    subLocationContent: '',
                    subLocationDetail: []
                  }]
                });
              }
            });
          }
          
          return {
            breakfast: day.breakfast || '',
            lunch: day.lunch || '',
            dinner: day.dinner || '',
            hotel: day.hotel || '',
            score: day.score || '',
            scheduleDetail: details
          };
        });

        return {
          airlineData: schedule.airlineData || { sort: '', airlineCode: [] },
          scheduleDetailData: scheduleDetailData
        };
      });
      
      return {
        ...scheduleData,
        scheduleDetail: JSON.stringify(newScheduleDetail)
      };
      
    } catch (e) {
      console.error('Error fetching schedule detail data:', e);
      return scheduleData;
    }
  };

  // 게시글 가져오기
  const fetchPosts = async () => {
    const resinfo = await axios.get(`${AdminURL}/producttour/gettourschedulepart/${ID}`)
    if (resinfo.data) {
      const copy = [...resinfo.data][0];
      console.log('copy', copy);
      setTourInfo(copy);
      
      // 스케줄 상세 데이터 가져오기
      const enrichedSchedule = await fetchScheduleDetailData(copy);
      setScheduleData(enrichedSchedule);
      
      console.log('enrichedSchedule', enrichedSchedule);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);  


  
  const NATION = url.searchParams.get("nation");
  // const CITY = url.searchParams.get("city");
  const CITY = "발리";

  // 리조트안내 & 상품보기
  const [category, setCategory] = useState('notice');
  // 기본일정 & 커스텀오더
  const [productTypeSelectedBtn, setProductTypeSelectedBtn] = useState('기본일정');
  // 하단 상품리스트 선택
  const [resortProducts, setResortProducts] = useState<any[]>([]);
  // 리조트보기 선택
  const [resortSelectBtn, setResortSelectBtn] = useState('1');

  const [benefitTab, setBenefitTab] = useState("리조트 상품");
  const [selectedAmenity, setSelectedAmenity] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // 호텔구성/일정/커스텀 탭 상태
  const [tab, setTab] = useState<'호텔구성'|'일정'|'커스텀'>('호텔구성');
  
  // 호텔 데이터 
  const [hotelDataSub, setHotelDataSub] = useState<ProductRestHotelInfo>();
  const [imageNamesAllView, setImageNamesAllView] = useState<ImageNoticeProps[]>([]);
  const [imageNamesRoomView, setImageNamesRoomView] = useState<ImageNoticeProps[]>([]);
  const [imageNamesEtcView, setImageNamesEtcView] = useState<ImageNoticeProps[]>([]);

  // 해당지역 항공정보
  const [flightType, setFlightType] = useState("직항");
  const [selectedAirline, setSelectedAirline] = useState<RestAirlineProps>(); 
  const [directAirline, setDirectAirline] = useState<RestAirlineProps[]>([]);
  const [viaAirline, setViaAirline] = useState<RestAirlineProps[]>([]);

  // 상품(일정) 정보
  const [scheduleList, setScheduleList] = useState<RestScheduleListProps[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<RestScheduleListProps>();
  const [selectedScheduleDetail, setSelectedScheduleDetail] = useState<RestSelectScheduleDetailProps[]>([]);

  // 출발공항/항공편 선택용 상태 및 데이터 추가
  const airportOptions = [
    { value: 'ICN', label: '인천공항 출발' },
    { value: 'TAE', label: '대구공항 출발' }
  ];
  const [selectedAirport, setSelectedAirport] = useState(airportOptions[0].value);
  const [isAirportDropdownOpen, setIsAirportDropdownOpen] = useState(false);

  const flightOptions = [
    {
      value: 'KE123',
      label: '대한항공',
      logo: AirlineData.KE,
      info: '인천 출발 (17:40) - 발리 도착 (21:40)'
    },
    {
      value: '7C456',
      label: '제주항공',
      logo: AirlineData.A7C,
      info: '대구 출발 (18:00) - 발리 도착 (22:00)'
    }
  ];
  const [selectedFlight, setSelectedFlight] = useState(flightOptions[0].value);
  const [isFlightDropdownOpen, setIsFlightDropdownOpen] = useState(false);

  


  
  return (
    <div className="resort_detail_page">
      
      <div className="resort_detail_breadcrumb">
        홈 &gt; 관광지 &gt; {tourInfo?.nation || ""} &gt; {tourInfo?.tourLocation || ""}
      </div>

   
      <div className="resort_detail-header">
        <IoIosArrowBack className='resort_detail-header-back-icon'
          onClick={()=>{
            window.scrollTo(0, 0);
            navigate(`/tour/list/`);
          }}
        />
        <div className="resort_detail-header-title">
          <h1>{tourInfo?.productName || ""}</h1>
          <p>{tourInfo?.scheduleSort || ""} - {tourInfo?.landCompany || ""}</p>
        </div>
      </div>
      <div className="bottombar"></div>

      {/* 날짜/인원 요약 search-row */}
      <div className="resort_detail-search-row">
        <div className="search-col">
          <div className="search-label">기간</div>
          <div className="search-content">
            <span className="search-icon">
              <CiCalendar className='calender-icon' color="#FFD600"/>
            </span>
            <span className="search-text">
              {tourInfo?.tourPeriodData && (() => {
                try {
                  const period = JSON.parse(tourInfo.tourPeriodData);
                  return `${period.periodNight} ${period.periodDay}`;
                } catch {
                  return "";
                }
              })()}
            </span>
          </div>
        </div>
        <div className="search-col">
          <div className="search-label">항공</div>
          <div className="search-content">
            <span className="search-icon">
              <GoPerson className='calender-icon' color="#FFD600"/>
            </span>
            <span className="search-text">
              {tourInfo?.manageAirline && (() => {
                try {
                  const airlines = JSON.parse(tourInfo.manageAirline);
                  if (airlines.length > 0) {
                    return airlines[0].flightType === 'connecting' ? '경유' : '직항';
                  }
                } catch {
                  return "";
                }
              })()}
            </span>
          </div>
        </div>
      </div>

     
      <TourDetailCustom
        flightType={flightType}
        setFlightType={setFlightType}
        selectedAirline={selectedAirline}
        setSelectedAirline={setSelectedAirline}
        directAirline={directAirline}
        viaAirline={viaAirline}
        airportOptions={airportOptions}
        selectedAirport={selectedAirport}
        setSelectedAirport={setSelectedAirport}
        isAirportDropdownOpen={isAirportDropdownOpen}
        setIsAirportDropdownOpen={setIsAirportDropdownOpen}
        flightOptions={flightOptions}
        selectedFlight={selectedFlight}
        setSelectedFlight={setSelectedFlight}
        isFlightDropdownOpen={isFlightDropdownOpen}
        setIsFlightDropdownOpen={setIsFlightDropdownOpen}
        selectedSchedule={selectedSchedule}
        selectedScheduleDetail={selectedScheduleDetail}
        CITY={CITY}
        {...({ tourInfo, scheduleData } as any)}
      />

           

      {/* 포함/불포함  ----------------------------------------------------------------------------------  */}
      <div className="resort_detail_included__items__section__wrapper">
        <div className="single__header__main">포함/불포함</div>
        <div className="included__items__wrapper">
          <div className="index__title__wrapper">
            <span className="included__icon"><FaRegCircle size={14}/></span>
            <span>포함사항</span>
          </div>
          <div className="elements__wrapper">
            {
              tourInfo?.includeNote && (() => {
                try {
                  const includeItems = JSON.parse(tourInfo.includeNote);
                  return includeItems.map((item: any, index: any) => (
                    <span key={index}>- {item}</span>
                  ));
                } catch {
                  return null;
                }
              })()
            }
            {tourInfo?.includeNoteText && <span>- {tourInfo.includeNoteText}</span>}
          </div>
          <div className="index__title__wrapper">
            <span className="unincluded__icon"><IoMdClose size={18}/></span>
            <span>불포함사항</span>
          </div>
          <div className="elements__wrapper">
            {
              tourInfo?.notIncludeNote && (() => {
                try {
                  const notIncludeItems = JSON.parse(tourInfo.notIncludeNote);
                  return notIncludeItems.map((item: any, index: any) => (
                    <span key={index}>- {item}</span>
                  ));
                } catch {
                  return null;
                }
              })()
            }
            {tourInfo?.notIncludeNoteText && <span>- {tourInfo.notIncludeNoteText}</span>}
          </div>
        </div>
      </div>

      
      {/* 필독사항  ----------------------------------------------------------------------------------  */}
      <div className="resort_detail_must__read__section__wrapper">
        <div className="single__header__main">필독사항</div>
        <div className="must__read__wrapper">
          {tourInfo?.cautionNote ? (
            <span>{tourInfo.cautionNote}</span>
          ) : (
            <>
              <span>
                - 상기일정은 항공 및 현지사정으로 인하여 변경될 수 있습니다.
              </span>
              <span>- 환율변동에 의해 요금이 가/감 될 수 있습니다.</span>
              <span>
                - 취소시 항공 및 호텔(리조트, 풀빌라 등)의 취소 수수료가 발생하는
                상품입니다.
              </span>
              <span>
                - 예약시 여권상의 정확한 영문이름으로 예약하셔야 하며 여권
                유효기간은 출발일 기준 6개월 이상 남아있어야 합니다.
              </span>
              <span>
                - 외국/이중 국적자의 해외여행은 도착지국가의 출입국 정책이
                상이하므로, 반드시 여행자 본인이 해당국의 대사관에 확인하셔야
                합니다.
              </span>
            </>
          )}
        </div> 
      </div>


      
      <div className="bottom__section__wrapper">
        <div className="single__header__main">요금</div>
        <div className="bottom--cost-cover">
          <div className="bottom--cost-content">
            <div className="bottom--cost-left">
              <div className="resort-title__wrapper">
                <h3 className="resort-title">{tourInfo?.productName || ""}</h3>
                <p className="schedule-info">
                  {tourInfo?.tourPeriodData && (() => {
                    try {
                      const period = JSON.parse(tourInfo.tourPeriodData);
                      return `${period.periodNight} ${period.periodDay} 일정`;
                    } catch {
                      return "";
                    }
                  })()}
                </p>
              </div>
              <p className="price-per-person">견적 문의</p>
            </div>
            <div className="bottom--cost-right">
              <div className="adult-count-box">
                <p>성인 2</p>
              </div>
              <div className="total-price">
                <p>견적 문의</p>
                <p className="flight-notice">{tourInfo?.costType || "항공표불포함"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

   

      
    </div>

  );
}
