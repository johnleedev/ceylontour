import "./HotelDetailPage.scss";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { MainURL }from "../../MainURL";
import hotelbuilding from "../../lastimages/tourPage/hotelbuilding.png"
import hotelplate from "../../lastimages/tourPage/hotelplate.png"
import location from "../../lastimages/tourPage/location.png"
import { FaRegCircle } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { FaStar, FaCheck } from "react-icons/fa";
import AirlineData from "../../screen/AirlineData";
import RatingBoard from "../../screen/common/RatingBoard";
import TourImageData from "../../screen/common/ProductImageData";
import { FaLocationDot } from "react-icons/fa6";


export default function PackagePage() {
 
  const url = new URL(window.location.href);
  const ID = url.searchParams.get("id");
  
  const hotelDataSub = {
    id: 0,
    tourId: 0,
    title: "세인트 레지스 호텔",
    subtitle: "Saint Regis Hotel Bali",
    rating: 5,
    imagePath: TourImageData.hotelPageMain,
    mainBgImage: TourImageData.hotelPageMain,
    description:
      "2017년 새롭게 단장을 마치고 모던 럭셔리를 지향하는 호텔로 거듭났습니다. 모든 객실에서 지쿠지와 개인용 풀장이 설치되어있는 것이 특징이며, 하얗고 깔끔한 인테리어는 산토리니만의 감성을 느끼기에 안성맞춤입니다.",
    benefit: [
      "매일 2~6인 조식",
      "BBQ 1회 2인 씨푸드 디너뷔페(생맥주 무제한 제공)",
      "투숙기간중 1회 치킨 & 생맥주 2잔",
      "방콕시내 호텔간 왕복셔틀버스 제공",
    ],
    roomtype: ["클리프 오션뷰", "오션뷰", "오션뷰 풀빌라"],
    hotelImages: [
      { type: 1, imagePath: TourImageData.hotelDetail1 },
      { type: 2, imagePath: TourImageData.hotelDetail2 },
      { type: 3, imagePath: TourImageData.hotelDetail3 },
      { type: 2, imagePath: TourImageData.hotelDetail3 },
    ],
    address: {
      contury: "인도네시아",
      state: "발리",
      city: "쿠타",
      detailAddress: "Sauthon Road",
    },
    nearby: [
      { distance: "28km", name: "발리국제공항" },
      { distance: "20km", name: "사원" },
    ],
  }

  const [categoryBtn, setCategoryBtn] = useState('1');
  
  // 이요한 작업 -------------------------------------------------------------------------------------------------------------------------------------
 
  interface AirlineSubProps {
    sort : string;
    airlineName: string;
    departDate: string[];
    planeName: string;
    departAirport: string;
    departTime: string;
    arriveAirport: string;
    arriveTime: string;
  }
  interface AirlineProps {
    tourPeriod: string;
    departAirportMain : string;
    airlineData: AirlineSubProps[];
  }   
  const [flightType, setFlightType] = useState("직항");
  const [selectedAirlineIndex, setSelectedAirlineIndex] = useState(0);  
  const [directAirline, setDirectAirline] = useState<AirlineProps[]>([]);
  const [viaAirline, setViaAirline] = useState<AirlineProps[]>([]);

  interface SelectScheduleListProps {
    day : string;
    breakfast :string;
    lunch:string;
    dinner :string;
    hotel:string;
    score:string;
    scheduleDetail: ScheduleDetailProps[];
  }

   
  interface ScheduleDetailProps {
    id : string;
    sort: string;
    location: string;
    subLocation : string;
    locationTitle : string;
    locationContent : string;
    locationContentDetail : {name:string; notice:string[]}[];
    postImage : string;
  }

  const [isView, setIsView] = useState('');
  const [tourLocation, setTourLocation] = useState('');

  const [tourPeriodNight, setTourPeriodNight] = useState('');
  const [tourPeriodDay, setTourPeriodDay] = useState('');
  const [airlineName, setAirlineName] = useState('');
  const [departAirport, setDepartAirport] = useState('');
  const [departTime, setDepartTime] = useState('');
  const [arriveAirport, setArriveAirport] = useState('');
  const [arriveTime, setArriveTime] = useState('');
  const [airlineNameVia, setAirlineNameVia] = useState('');
  const [departAirportVia, setDepartAirportVia] = useState('');
  const [departTimeVia, setDepartTimeVia] = useState('');
  const [arriveAirportVia, setArriveAirportVia] = useState('');
  const [arriveTimeVia, setArriveTimeVia] = useState('');

  const [landCompany, setLandCompany] = useState('');
  const [productType, setProductType] = useState('');
  const [cautionNote, setCautionNote] = useState('');
  const [includeNote, setIncludeNote] = useState([]);
  const [includeNoteText, setIncludeNoteText] = useState('');
  const [notIncludeNote, setNotIncludeNote] = useState([]);
  const [notIncludeNoteText, setNotIncludeNoteText] = useState('');
  const [scheduleList, setScheduleList] = useState<SelectScheduleListProps[]>([]);
  const [reviseDate, setReviseDate] = useState('');

  const fetchAirplane = async (nation:string, location:string) => {
    const res = await axios.get(`${MainURL}/product/getairplane/${nation}/${location}`)
    if (res.data) {
      const copy = res.data;
      const parsedCopy = copy.map((item:any) => {return {...item, airlineData: JSON.parse(item.airlineData)};});
      const directAirlineCopy = parsedCopy.filter((e:any)=> e.sort === 'direct')
      const viaAirlineCopy = parsedCopy.filter((e:any)=> e.sort === 'via')
      setDirectAirline(directAirlineCopy);
      setViaAirline(viaAirlineCopy);
      setTourPeriodNight(directAirlineCopy[0].tourPeriodNight);
      setTourPeriodDay(directAirlineCopy[0].tourPeriodDay);
      setAirlineName(directAirlineCopy[0].airlineData[0].airlineName);
      setDepartAirport(directAirlineCopy[0].airlineData[0].departAirport);
      setDepartTime(directAirlineCopy[0].airlineData[0].departTime);
      setArriveAirport(directAirlineCopy[0].airlineData[0].arriveAirport);
      setArriveTime(directAirlineCopy[0].airlineData[0].arriveTime);
    } 
  };

  const fetchScheduleDetails = async (postId:any) => {
    const res = await axios.get(`${MainURL}/restproductschedule/getproductscheduledetails/${postId}`)
		if (res.data !== false) {
			const copy = res.data;
			const result = copy.map((item:any) => ({
				...item,
				scheduleDetail: JSON.parse(item.scheduleDetail)
			}));
      setScheduleList(result);
		}
  };

  const fetchPosts = async () => {
    const resschedule = await axios.post(`${MainURL}/product/getschedule`, {
      id : ID
    })
    if (resschedule.data) {
      const copy = resschedule.data[0];
      fetchAirplane(copy.nation, copy.tourLocation);
      fetchScheduleDetails(copy.id);
      setFlightType('직항')
      setIsView(copy.isView);
      setTourLocation(copy.tourLocation);
      setLandCompany(copy.landCompany);
      setProductType(copy.productType);
      setCautionNote(copy.cautionNote);
      setIncludeNote(JSON.parse(copy.includeNote));
      setIncludeNoteText(copy.includeNoteText);
      setNotIncludeNote(JSON.parse(copy.notIncludeNote));
      setNotIncludeNoteText(copy.notIncludeNoteText);
      setReviseDate(copy.reviseDate);
    } 
  };

  useEffect(() => {
    fetchPosts();
  }, []);  

  return (
    <div className="hotel_detail">
      
      <div className="hotel_detail__header__section__wrapper">
        <img className="hotel_detail_bg__image" src={hotelDataSub.mainBgImage} alt="temp" />
        <div className="hotel_detail_header__info">
          <span className="hotel_detail_header__subtitle">{hotelDataSub.subtitle}</span>
          <span className="hotel_detail_header__title">{hotelDataSub.title}</span>
          <div className="hotel_detail_header__loc__rating">
            <span className="header__location">발리 {'>'} 꾸따</span>
            <div className="header__rating">
               <FaStar />
               <FaStar />
               <FaStar />
            </div>
          </div>
        </div>
      </div>


      <div className="hotel_detail_acommodation__selector__wrapper">
        <span className="sub__text">인천출발 / 발리 5박 7일</span>
        <div className="selected__item__wrapper">
          <span className="selected__item">
            [꾸따] 포 포인츠 바이 쉐라톤 디럭스 라군 2박 + [누사두아]
            세인트레지스 풀빌라 2박
          </span>
        </div>
      </div>

      <div className="hotel_detail_roomtype__selector__wrapper">
        <div className="hotel__selector__wrapper">
          <div className={`hotel__selector__Btn ${categoryBtn === "1" ? "selected" : ""}`}
            onClick={()=>{setCategoryBtn('1')}}
          >
            <p>포 포인츠 바이 쉐리톤</p>
          </div>
          <div className={`hotel__selector__Btn ${categoryBtn === "2" ? "selected" : ""}`}
            onClick={()=>{setCategoryBtn('2')}}
          >
            <p>세인트레지스 풀빌라</p>
          </div>
        </div>
      </div>
  
      <div className="hotel_detail_image__selector__wrapper">
        <div className="images__grid__wrapper">
          {
          hotelDataSub.hotelImages.slice(0, 4).map((image, idx) => (
            <div key={idx}>
              <img src={image.imagePath} alt="temp" />
              {idx === 3 && (
                <div
                  className="mobile__show__all__btn"
                  onClick={() => {}}
                >
                  <span>사진 모두 보기</span>
                  <span>{`+${hotelDataSub.hotelImages.length}`}</span>
                </div>
              )}
            </div>
          ))
          }
        </div>
      </div>

      <div className="hotel_detail_info__items__wrapper hotel_detail_mx__section">
        <div className={"only-web"}>
          <span className="item__title">룸타입</span>
          <ul>
            {hotelDataSub.roomtype.map((item, idx) => (
              <li key={idx}>
                <label htmlFor={item}>
                  <input type="radio" id={item} checked={idx === 0} />
                  <span className={idx === 0 ? "select__room__type" : ""}>
                    {item}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className={"only-web"}>
          <span className="item__title">고객 베네핏</span>
          <ul>
            {hotelDataSub.benefit.map((item, idx) => (
              <li key={idx} className="item__title_text">- {item}</li>
            ))}
          </ul>
        </div>
        <div className={"only-web"}>
          <span className="item__title">호텔 위치</span>
          <ul>
            <li key="address" className="item__title_text">{`주소 : ${hotelDataSub.address.state} ${hotelDataSub.address.city} ${hotelDataSub.address.detailAddress}`}</li>
            {hotelDataSub.nearby.map(({ distance, name }, idx) => (
              <li key={idx} className="item__title_text">{`${distance} - ${name}`}</li>
            ))}
            <div className="map__view__btn">
              <FaLocationDot size={16}/>
              <span>호텔 위치 보기</span>
            </div>
          </ul>
        </div>
      </div>

      <div className="hotel_detail_select__package__byroom__wrapper">
        <div className="hotel_detail_select_header__wrapper">
          <span className="header__main">룸타입별 선택상품</span>
          <span className="header__sub">상품기간 : 2024.01.05 ~ 2024.12.20</span>
        </div>
        <div className="package__item__wrapper">
          <div className="image__wrapper">
            <img src={hotelDataSub.hotelImages[0].imagePath} alt="temp" />
          </div>
          <div className="padding__wrapper">
            <div className="package__info__wrapper">
              <div className="info__wrapper">
                <span className="info__title">클리프 오션뷰 풀빌라</span>
                <span className="info__subtitle">
                  선투숙리조트 2박 + 반엔트리 원베드 풀빌라 2박
                </span>
                <span className="info__subtitle">4박 6일 일정</span>
                <div className="info__detail__wrapper">
                  <span>-페어먼트 디럭스(5성급) 2박</span>
                  <span>-원베드 풀빌라 2박</span>
                  <span>-전 일정 조식 포함</span>
                  <span>-반얀트리 투숙시 런치 1회 석식 2회 제공</span>
                </div>
              </div>
            </div>
            <div className="package__price__wrapper">
              <div className="mb">
                <div className="price__wrapper">
                  <span className="price__main">₩ 3,500,000</span>
                  <span className="price__sub">/ 1인</span>
                </div>
                <span className="price__sub">항공료 불포함</span>
              </div>
              
              
            </div>
          </div>
        </div>
      </div>

      <div className="hotel_detail_schedule__byairline__wrapper">
        <div className="hotel_detail_schedule_header__wrapper">
          <span className="header__main">항공사별 일정표</span>
          <div className={"sidebar__wrapper"}
          >
            <span className={flightType === '직항' ? "selected__sidebar" : ""}
              onClick={() => {
                setFlightType('직항');
                setSelectedAirlineIndex(0);
              }}
            >직항</span>
            <span className={flightType === '경유' ? "selected__sidebar" : ""}
              onClick={() => {
                setFlightType('경유');
                setSelectedAirlineIndex(0);
              }}
            >경유</span>
          </div>
        </div>
        <div className="flight__items__wrapper">
          { flightType === '직항'
            ?
            directAirline.map((item:any, index:any)=>{

              const airlineWord = item.airlineData[0].airlineName.slice(0, 2); 
              const airlineWordCopy = (airlineWord === '5J' || airlineWord === '7C') ?  `A${airlineWord}` : airlineWord;
              const airlineImage = AirlineData[airlineWordCopy as keyof typeof AirlineData];

              return (
                (item.tourPeriodNight !== '' && item.tourPeriodDay !== '')
                ?
                <div className="flight__item__wrapper" key={index}>
                  <div className="airline__wrapper">
                    <img src={airlineImage} alt="temp" />
                    <span>
                      {item.airlineData[0].airlineName}
                    </span>
                  </div>
                  <div className="flight__schedule__wrapper">
                    <div className="flight__schedule_row">
                      <span>{item.airlineData[0].departAirport}</span>
                      <span>출발</span>
                      <span>({item.airlineData[0].departTime})</span>
                      <span>-</span>
                      <span>{item.airlineData[0].arriveAirport}</span>
                      <span>도착</span>
                      <span>({item.airlineData[0].arriveTime})</span>
                    </div>
                    <span>{tourLocation} {item.tourPeriodNight} {item.tourPeriodDay}</span>
                  </div>
                  <div className="flight__select__btn__wrapper "
                    onClick={()=>{
                      setSelectedAirlineIndex(index);
                      setTourPeriodNight(item.tourPeriodNight);
                      setTourPeriodDay(item.tourPeriodDay);
                      setAirlineName(item.airlineData[0].airlineName);
                      setDepartAirport(item.airlineData[0].departAirport);
                      setDepartTime(item.airlineData[0].departTime);
                      setArriveAirport(item.airlineData[0].arriveAirport);
                      setArriveTime(item.airlineData[0].arriveTime);
                    }}
                    >
                    <div className={selectedAirlineIndex === index ? "select__btn__wrapper checked" : "select__btn__wrapper"}>
                      <span>선택</span>
                      <FaCheck />
                    </div>
                  </div>
                </div>
                :
                <div className="flight__item__wrapper" style={{width:'100%', display:'flex', justifyContent:'center'}}>
                  <div style={{}}>직항 항공편이 없습니다.</div>
                </div>
              )
            })
            :
            viaAirline.map((item:any, index:any)=>{

              const airlineWord = item.airlineData[0].airlineName.slice(0, 2); 
              const airlineWordCopy = (airlineWord === '5J' || airlineWord === '7C') ?  `A${airlineWord}` : airlineWord;
              const airlineImage = AirlineData[airlineWordCopy as keyof typeof AirlineData];
              
              return ( 
                (item.tourPeriodNight !== '' && item.tourPeriodDay !== '')
                ?
                <div className="flight__item__wrapper" key={index}>
                  <div className="airline__wrapper">
                    <img src={airlineImage} alt="temp" />
                    <span>
                      {item.airlineData[0].airlineName}
                    </span>
                  </div>
                  <div className="flight__schedule__wrapper">
                    <div className="flight__schedule_row">
                      <div className="flight__schedule">
                        <span>{item.airlineData[0].departAirport}</span>
                        <span>출발</span>
                        <span>({item.airlineData[0].departTime})</span>
                        <span>-</span>
                        <span>{item.airlineData[0].arriveAirport}</span>
                        <span>도착</span>
                        <span>({item.airlineData[0].arriveTime})</span>
                      </div>
                      <div className="flight__schedule">
                        <span>{item.airlineData[1].departAirport}</span>
                        <span>출발</span>
                        <span>({item.airlineData[1].departTime})</span>
                        <span>-</span>
                        <span>{item.airlineData[1].arriveAirport}</span>
                        <span>도착</span>
                        <span>({item.airlineData[1].arriveTime})</span>
                      </div>
                    </div>
                    <span>{tourLocation} {item.tourPeriodNight} {item.tourPeriodDay}</span>
                  </div>
                  <div className="flight__select__btn__wrapper"
                    onClick={()=>{
                      setSelectedAirlineIndex(index);
                      setTourPeriodNight(item.tourPeriodNight);
                      setTourPeriodDay(item.tourPeriodDay);
                      setAirlineName(item.airlineData[0].airlineName);
                      setDepartAirport(item.airlineData[0].departAirport);
                      setDepartTime(item.airlineData[0].departTime);
                      setArriveAirport(item.airlineData[0].arriveAirport);
                      setArriveTime(item.airlineData[0].arriveTime);
                      setAirlineNameVia(item.airlineData[1].airlineName);
                      setDepartAirportVia(item.airlineData[1].departAirport);
                      setDepartTimeVia(item.airlineData[1].departTime);
                      setArriveAirportVia(item.airlineData[1].arriveAirport);
                      setArriveTimeVia(item.airlineData[1].arriveTime);
                    }}
                  >
                    <div className={selectedAirlineIndex === index ? "select__btn__wrapper checked" : "select__btn__wrapper"}>
                      <span>선택</span>
                      <FaCheck />
                    </div>
                  </div>
                </div>
                :
                <div className="flight__item__wrapper" style={{width:'100%', display:'flex', justifyContent:'center'}}>
                  <div style={{}}>경유지 항공편이 없습니다.</div>
                </div>
              )
            })
          }
        </div>
      </div>

      <div className="hotel_detail_included__items__section__wrapper hotel_detail_mx__section">
        <div className="single__header__main">포함/불포함</div>
        <div className="included__items__wrapper">
          <div className="index__title__wrapper">
            <span className="included__icon"><FaRegCircle size={14}/></span>
            <span>포함사항</span>
          </div>
          <div className="elements__wrapper">
            {
              includeNote.map((item:any, index:any)=>{
                return (
                  <span key={index}>{item}</span>
                )
              })
            }
            <span>- {includeNoteText}</span>
          </div>
          <div className="index__title__wrapper">
            <span className="unincluded__icon"><IoMdClose size={18}/></span>
            <span>불포함사항</span>
          </div>
          <div className="elements__wrapper">
            {
              notIncludeNote.map((item:any, index:any)=>{
                return (
                  <span key={index}>{item}</span>
                )
              })
            }
            <span>- {notIncludeNoteText}</span>
          </div>
        </div>
      </div>

      {
        (cautionNote !== '' && cautionNote !== null) &&
        <div className="hotel_detail_must__read__section__wrapper hotel_detail_mx__section">
          <div className="single__header__main">주의사항</div>
          <div className="must__read__wrapper">
            {cautionNote}
          </div>
        </div>
      }
      
      <div className="hotel_detail_must__read__section__wrapper hotel_detail_mx__section">
        <div className="single__header__main">필독사항</div>
        <div className="must__read__wrapper">
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
        </div>
      </div>


      {/* 일정표 ---------------------------------------------------------------------------------------------------------------- */}

      <div className="hotel_detail_mx__section">
        <div className="header__wrapper">
          <span className="header__main">일정표</span>
          <span className="header__sub">
            KE 대한항공 인천 오후 출발 (17:40) / {tourLocation} {tourPeriodNight} {tourPeriodDay} (2024.10.16 ~
            2024.10.23)
          </span>
        </div>

        <div className="schedule__tables__wrapper">
          {
            scheduleList.map((item:any, index:any)=>{

              return (
                <div className="schedule__table__wrapper" key={index}>
                  <div className="schedule__header">
                    <span className="main__text">{index+1} DAY</span>
                    <span className="sub__text">2024-10-16(토)</span>
                  </div>
                  <div className="schedule__main__wrapper">
                    {
                      index === 0 &&
                      <>
                      { flightType === '직항'
                        ?
                        <div className="schedule__element__wrapper">
                          <div className="flight__schedule__board__wrapper">
                            <div className="flight__schedule__board">
                              <div className="flight__info__wrapper">
                                <img src={AirlineData.KE} alt="temp" />
                                <span>{airlineName}</span>
                              </div>
                              <div className="flight__time__wrapper">
                                <span className="flight__time">07시간 30분</span>
                                <div className="depart__info">
                                  <div />
                                  <span className="time__text">{departTime}</span>
                                  <span className="airport__text">{departAirport} 출발</span>
                                </div>
                                <div className="arrive__info">
                                  <div />
                                  <span className="time__text">{arriveTime}</span>
                                  <span className="airport__text">{arriveAirport} 도착</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        :
                        <div className="schedule__element__wrapper">
                          <div className="flight__schedule__board__wrapper">
                            <div className="flight__schedule__board" style={{marginBottom:'50px'}}>
                              <div className="flight__info__wrapper">
                                <img src={AirlineData.KE} alt="temp" />
                                <span>{airlineName}</span>
                              </div>
                              <div className="flight__time__wrapper">
                                <span className="flight__time">07시간 30분</span>
                                <div className="depart__info">
                                  <div />
                                  <span className="time__text">{departTime}</span>
                                  <span className="airport__text">{departAirport} 출발</span>
                                </div>
                                <div className="arrive__info">
                                  <div />
                                  <span className="time__text">{arriveTime}</span>
                                  <span className="airport__text">{arriveAirport} 도착</span>
                                </div>
                              </div>
                            </div>
                            <div className="flight__schedule__board">
                              <div className="flight__info__wrapper">
                                <img src={AirlineData.KE} alt="temp" />
                                <span>{airlineNameVia}</span>
                              </div>
                              <div className="flight__time__wrapper">
                                <span className="flight__time">07시간 30분</span>
                                <div className="depart__info">
                                  <div />
                                  <span className="time__text">{departTimeVia}</span>
                                  <span className="airport__text">{departAirportVia} 출발</span>
                                </div>
                                <div className="arrive__info">
                                  <div />
                                  <span className="time__text">{arriveTimeVia}</span>
                                  <span className="airport__text">{arriveAirportVia} 도착</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                      </>
                      
                    }
                    {
                      item.scheduleDetail.map((subItem:any, subIndex:any)=>{

                        return (
                          <div className="schedule__element__wrapper" key={subIndex}>
                            <div className="schedule__element__header__wrapper">
                              {
                                subItem.location !== '' &&
                                <div className="schedule__location__wrapper">
                                  <div className="location__absolute__wrapper">
                                    <img src={location} style={{width:'46px'}}/>
                                  </div>
                                  <span className="location__text">{subItem.location}</span>
                                </div>
                              }
                            </div>
                            {
                              subItem.locationDetail.map((detailItem:any, detailIndex:number)=>{
                                return (
                                  <div key={detailIndex}>
                                    <div className="schedule__element__header__wrapper">
                                      <div className="schedule__element__header">
                                        <div className="absolute__wrapper">
                                          <div className="dot__icon" />
                                        </div>
                                        <div className="schedule__text__wrapper">
                                          <span>{detailItem.subLocation}</span>
                                        </div>
                                      </div>
                                    </div>
                                    {
                                      detailItem.subLocationDetail.map((subDetailItem:any, subDetailIndex:number)=>{

                                        const postImages = subDetailItem.postImage ? JSON.parse(subDetailItem.postImage) : "";

                                        return (
                                          <div className="schedule__element__main__wrapper" key={subDetailIndex}>
                                            <div className="image__wrapper">
                                              <div className="imagebox">
                                                <img style={{height:'100%', width:'100%'}}
                                                  src={`${MainURL}/lastimages/scheduleboximages/${postImages[0]}`}
                                                />                                                
                                              </div>
                                            </div>
                                            <div className="table__wrapper">
                                              <div className="table__header">
                                                <span>{subDetailItem.locationTitle}</span>
                                              </div>
                                              <div className="table__main">
                                                <span>{subDetailItem.locationContent}</span>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      })
                                    }
                                  </div>
                                )
                              })
                            }
                            </div>
                        )
                      })
                    }
                  </div>

                  <div className="additional__schedule__wrapper">
                    <div className="index__wrapper">
                      <img src={hotelplate} style={{height:'24px'}}/>
                      <span>식사</span>
                    </div>
                    <div className="meal__info__wrapper">
                      <span>[조식] {item.breakfast ? item.breakfast : "없음"}</span>
                      <span>[중식] {item.lunch ? item.lunch : "없음"}</span>
                      <span>[석식] {item.dinner ? item.dinner : "없음"}</span>
                    </div>
                  </div>
                  <div className="additional__schedule__wrapper">
                    <div className="index__wrapper">
                      <img src={hotelbuilding} style={{height:'24px'}}/>
                      <span>호텔</span>
                    </div>
                    <div className="additional__info__wrapper">
                      <p>{item.hotel}</p>
                      <div className="additional__rating__wrapper">
                        <RatingBoard rating={parseInt(item.score)} ratingSize={20} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  );
}
