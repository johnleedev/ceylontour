import "./ResortDetail.scss";
import { useEffect, useState } from "react";
import { FaCheck, FaRegCircle, FaStar } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import TourImageData from "../../..//common/ProductImageData";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AdminURL } from "../../../../MainURL";
import AirlineData from "../../../AirlineData";
import locationIcon from "../../../lastimages/tourPage/location.png"
import hotelbuildingIcon from "../../../lastimages/tourPage/hotelbuilding.png"
import hotelplateIcon from "../../../lastimages/tourPage/hotelplate.png"
import RatingBoard from "../../../common/RatingBoard";
import { IoMdClose } from "react-icons/io";
import { HotelDataProps, ScheduleDataProps } from "../RestInterfaceData";



export default function ResortDetailSchedule(
  { 
    hotelInfo, imageNamesAllView, imageNamesRoomView, imageNamesEtcView, imageAll, hotelRoomTypes, scheduleData 
  }: { 
    hotelInfo?: any, imageNamesAllView?: any, imageNamesRoomView?: any, imageNamesEtcView?: any, imageAll?: any, hotelRoomTypes?: any, scheduleData?: ScheduleDataProps[]
  }
) {
  
  const [selectedRoomType, setSelectedRoomType] = useState<any>(hotelRoomTypes?.[0]?.roomTypeName);
  const [productListSelectedBtn, setProductListSelectedBtn] = useState<number>(0);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  // scheduleData를 resortListData로 변환
  const resortListData = scheduleData?.map((schedule) => {
    const parsedScheduleData = schedule.productScheduleData ? JSON.parse(schedule.productScheduleData) : [];
    const parsedPeriodData = schedule.tourPeriodData ? JSON.parse(schedule.tourPeriodData) : {};
    const keywords = parsedScheduleData.map((item: any) => item.productName);
    
    return {
      ...schedule,
      productName: schedule.productName,
      tourPeriodData: parsedPeriodData,
      keyword: keywords,
      scheduleSort: schedule.scheduleSort,
      costType: schedule.costType
    };
  }) || [];

  // resortListData의 첫 번째 값을 selectedSchedule 기본값으로 설정
  useEffect(() => {
    if (resortListData.length > 0 && !selectedSchedule) {
      setSelectedSchedule(resortListData[0]);
    }
  }, [resortListData]);

  // productName에서 호텔 이름들 추출
  const extractHotelNames = (productName: string) => {
    if (!productName) return [];
    const parts = productName.split(' + ');
    return parts.map(part => {
      // [위치] 호텔이름 숙박기간 형태에서 호텔이름만 추출
      const match = part.match(/\]\s*(.+?)\s+\d+박/);
      return match ? match[1].trim() : '';
    }).filter(name => name);
  };

  const hotelNames = selectedSchedule ? extractHotelNames(selectedSchedule.productName) : [];
  const [categoryBtn, setCategoryBtn] = useState<string>("1");

  console.log('selectedSchedule?.manageAirline', selectedSchedule?.manageAirline);

  return (
    <div className="resort_detail_page">

      <div className="resort_detail_selector__productList__wrapper">
        
     

        <div className="resort_detail_productList__box">
          {
            resortListData.map((item:any, index:any)=>{
              return (
                <div className={`resort_detail_productList_textRow ${productListSelectedBtn === index ? "selected" : ""}`} key={index} >
                  <div className="resort_detail_productList_text_left">
                    <h3>{item.productName}</h3>
                  </div>
                  <div className="resort_detail_productList_text_middle">
                    {
                      item.keyword.map((subItem:any, subIndex:any)=>(
                        <p key={subIndex}>{subItem}</p>
                      ))
                    }
                  </div>
                  <div className="resort_detail_productList_text_right">
                    <div className="productList_text_btn"
                      onClick={()=>{
                        setProductListSelectedBtn(index);
                        setSelectedSchedule(item);
                      }}
                    >
                      <p>자세히보기</p>
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>
      
      <div className="resort_detail_acommodation__selector__wrapper">
        <span className="sub__text">{selectedSchedule?.tourPeriodData?.periodNight} {selectedSchedule?.tourPeriodData?.periodDay}</span>
        <div className="selected__item__wrapper">
          <span className="selected__item">
            {selectedSchedule?.productName}
          </span>
        </div>
      </div>

      <div className="resort_detail_roomtype__selector__wrapper">
        <div className="resort__selector__wrapper">
          {hotelNames.map((hotelName, index) => (
            <div 
              key={index}
              className={`resort__selector__Btn ${categoryBtn === String(index + 1) ? "selected" : ""}`}
              onClick={() => setCategoryBtn(String(index + 1))}
            >
              <p>{hotelName}</p>
            </div>
          ))}
        </div> 
      </div>
      
       {/* 호텔 이미지 박스 ------------------------------------------------------------------------------------------------------------------------ */}
      <div className="resort_page_image__selector__wrapper">
        <div className="images__grid__wrapper">
          {imageAll?.slice(0, 3).map((image: any, idx: number) => (
            <div key={idx}>
              <img src={`${AdminURL}/lastimages/hotelimages/${image.imageName}`} alt="hotel view" />
              {idx === 2 && imageAll && imageAll.length > 3 && (
                <div className="show__all__btn" onClick={() => {}}>
                  <span>사진 모두 보기</span>
                  <span>{`+${imageAll.length - 3}`}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 호텔 정보 박스 ------------------------------------------------------------------------------------------------------------------------ */}
      <div className="resort_page_info__items__wrapper resort_page_mx__section">
        <div className={"only-web"}>
          <span className="item__title">룸타입</span>
          <ul>
            {hotelRoomTypes?.map((item: any, idx: number) => (
              <li key={idx}>
                <label htmlFor={item.roomTypeName}>
                  <input type="radio" id={item.roomTypeName} checked={item.roomTypeName === selectedRoomType} 
                    onChange={() => setSelectedRoomType(item.roomTypeName)} />
                  <span className={item.roomTypeName === selectedRoomType ? "select__room__type" : ""}>
                    {item.roomTypeName}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className={"only-web"}>
          <span className="item__title">고객 베네핏</span>
          <ul>
            {/* {hotelInfo.hotelBenefit.map((item: any, idx: number) => (
              <li key={idx} className="item__title_text">- {item}</li>
            ))} */}
          </ul>
        </div>
        <div className={"only-web"}>
          <span className="item__title">호텔 위치</span>
          <ul>
            <li key="address" className="item__title_text">{`주소 : ${hotelInfo?.hotelAddress}`}</li>
            {/* {hotelInfo.nearby.map(({ distance, name }, idx) => (
              <li key={idx} className="item__title_text">{`${distance} - ${name}`}</li>
            ))} */}
            <div className="map__view__btn">
              <FaLocationDot />
              <span>호텔 위치 보기</span>
            </div>
          </ul>
        </div>
      </div>

    
    {/* 항공사별 일정표 ---------------------------------------------------------------------------------------------------------------- */}
    <div className="resort_detail_schedule__byairline__wrapper">
          <div className="resort_detail_schedule_header__wrapper">
            <span className="header__main">항공사별 일정표</span>
            <div className={"sidebar__wrapper"}
            >
              {/* <span className={flightType === '직항' ? "selected__sidebar" : ""}
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
              >경유</span> */}
            </div>
          </div>
          <div className="flight__items__wrapper">
            {
              selectedSchedule && selectedSchedule.manageAirline && typeof selectedSchedule.manageAirline === 'string' && (() => {
                const manageAirline = JSON.parse(selectedSchedule.manageAirline);
                const parsedPeriodData = selectedSchedule.tourPeriodData;
                
                return manageAirline.map((item: any, index: number) => {
                  const isDirectFlight = item.flightType === 'direct';
                  
                  if (isDirectFlight) {
                    // 직항항공편
                    const airlineWord = item.departFlight?.airlineName?.slice(0, 2) || '';
                    const airlineWordCopy = (airlineWord === '5J' || airlineWord === '7C') ? `A${airlineWord}` : airlineWord;
                    const airlineImage = airlineWordCopy ? AirlineData[airlineWordCopy as keyof typeof AirlineData] : null;

                    return (
                      <div className="flight__item__wrapper" key={index}>
                        <div className="airline__wrapper">
                          {airlineImage && <img src={airlineImage} alt="airline" />}
                          <span>{item.departFlight?.airlineName}</span>
                        </div>
                        <div className="flight__schedule__wrapper">
                          <div className="flight__schedule_row">
                            <span>{item.departFlight?.depart}</span>
                            <span>출발</span>
                            <span>({item.departFlight?.departTime?.slice(0, 2)}:{item.departFlight?.departTime?.slice(2, 4)})</span>
                            <span>-</span>
                            <span>{item.departFlight?.arrive}</span>
                            <span>도착</span>
                            <span>({item.departFlight?.arriveTime?.slice(0, 2)}:{item.departFlight?.arriveTime?.slice(2, 4)})</span>
                          </div>
                          <span>{parsedPeriodData?.periodNight} {parsedPeriodData?.periodDay}</span>
                        </div>
                      </div>
                    );
                  } else {
                    // 경유항공편
                    const airlineWord = item.departFlight1?.airlineName?.slice(0, 2) || '';
                    const airlineWordCopy = (airlineWord === '5J' || airlineWord === '7C') ? `A${airlineWord}` : airlineWord;
                    const airlineImage = airlineWordCopy ? AirlineData[airlineWordCopy as keyof typeof AirlineData] : null;

                    return (
                      <div className="flight__item__wrapper" key={index}>
                        <div className="airline__wrapper">
                          {airlineImage && <img src={airlineImage} alt="airline" />}
                          <span>{item.departFlight1?.airlineName}</span>
                        </div>
                        <div className="flight__schedule__wrapper">
                          <div className="flight__schedule_row">
                            <div className="flight__schedule">
                              <span>{item.departFlight1?.depart}</span>
                              <span>출발</span>
                              <span>({item.departFlight1?.departTime?.slice(0, 2)}:{item.departFlight1?.departTime?.slice(2, 4)})</span>
                              <span>-</span>
                              <span>{item.departFlight1?.arrive}</span>
                              <span>도착</span>
                              <span>({item.departFlight1?.arriveTime?.slice(0, 2)}:{item.departFlight1?.arriveTime?.slice(2, 4)})</span>
                            </div>
                            <div className="flight__schedule">
                              <span>{item.departFlight2?.depart}</span>
                              <span>출발</span>
                              <span>({item.departFlight2?.departTime?.slice(0, 2)}:{item.departFlight2?.departTime?.slice(2, 4)})</span>
                              <span>-</span>
                              <span>{item.departFlight2?.arrive}</span>
                              <span>도착</span>
                              <span>({item.departFlight2?.arriveTime?.slice(0, 2)}:{item.departFlight2?.arriveTime?.slice(2, 4)})</span>
                            </div>
                          </div>
                          <span>{parsedPeriodData?.periodNight} {parsedPeriodData?.periodDay}</span>
                        </div>
                      </div>
                    );
                  }
                });
              })()
            }
          </div>
        </div>
      

        {/* 일정표 ---------------------------------------------------------------------------------------------------------------- */}
        <div className="resort_detail_mx__section">
          <div className="resort_detail_schedule_header__wrapper">
            <span className="header__main">일정표</span>
            <span className="header__sub">
              {/* KE 대한항공 인천 오후 출발 (17:40) / {tourLocation} {tourPeriodNight} {tourPeriodDay} (2024.10.16 ~ */}
              2024.10.23)
            </span>
          </div>

          <div className="schedule__tables__wrapper">
            {
              selectedSchedule && selectedSchedule.scheduleDetail && typeof selectedSchedule.scheduleDetail === 'string' && (() => {
                const scheduleDetail = JSON.parse(selectedSchedule.scheduleDetail);
                const manageAirline = (selectedSchedule.manageAirline && typeof selectedSchedule.manageAirline === 'string') ? JSON.parse(selectedSchedule.manageAirline) : [];
                
                // 첫 번째 스케줄의 데이터 사용
                const firstSchedule = scheduleDetail[0];
                if (!firstSchedule || !firstSchedule.scheduleDetailData) return null;
                
                // 유틸 함수: 출발-도착 시간으로 소요시간 계산
                const getFlightDuration = (departTime: any, arriveTime: any) => {
                  if (!departTime || !arriveTime) return '';
                  const depH = parseInt(departTime.slice(0,2), 10);
                  const depM = parseInt(departTime.slice(2,4), 10);
                  const arrH = parseInt(arriveTime.slice(0,2), 10);
                  const arrM = parseInt(arriveTime.slice(2,4), 10);
                  let min = (arrH*60+arrM) - (depH*60+depM);
                  if (min < 0) min += 24*60;
                  const h = Math.floor(min/60);
                  const m = min%60;
                  return `${h.toString().padStart(2,'0')}시간 ${m.toString().padStart(2,'0')}분`;
                };

                return firstSchedule.scheduleDetailData.map((dayItem: any, dayIndex: number) => {
                  return (
                    <div className="schedule__table__wrapper" key={dayIndex}>
                      <div className="schedule__header">
                        <span className="main__text">{dayIndex + 1} DAY</span>
                      </div>
                      <div className="schedule__main__wrapper">
                        {
                          dayItem.scheduleDetail && dayItem.scheduleDetail.map((detailItem: any, detailIndex: number) => {
                            // airline 타입인 경우
                            if (detailItem.sort === 'airline') {
                              const airlineInfo = manageAirline.find((airline: any) => {
                                if (airline.flightType === 'direct') {
                                  return airline.departFlight?.id === detailItem.id[0] || airline.arriveFlight?.id === detailItem.id[0];
                                } else {
                                  return airline.departFlight1?.id === detailItem.id[0] || 
                                         airline.departFlight2?.id === detailItem.id[0] ||
                                         airline.arriveFlight1?.id === detailItem.id[0] ||
                                         airline.arriveFlight2?.id === detailItem.id[0];
                                }
                              });

                              if (!airlineInfo) return null;

                              const isDirectFlight = airlineInfo.flightType === 'direct';
                              const isDepartDay = dayIndex === 0;

                              if (isDirectFlight) {
                                const flight = isDepartDay ? airlineInfo.departFlight : airlineInfo.arriveFlight;
                                if (!flight) return null;

                                const airlineWord = flight.airlineName?.slice(0, 2) || '';
                                const airlineWordCopy = (airlineWord === '5J' || airlineWord === '7C') ? `A${airlineWord}` : airlineWord;
                                const airlineImage = airlineWordCopy ? AirlineData[airlineWordCopy as keyof typeof AirlineData] : null;

                                return (
                                  <div className="schedule__element__wrapper" key={detailIndex}>
                                    <div className="flight__schedule__board__wrapper">
                                      <div className="flight__schedule__board">
                                        <div className="flight__info__wrapper">
                                          {airlineImage && <img src={airlineImage} alt="airline" />}
                                          <span>{flight.airlineName}</span>
                                        </div>
                                        <div className="flight__time__wrapper">
                                          <span className="flight__time">{getFlightDuration(flight.departTime, flight.arriveTime)}</span>
                                          <div className="depart__info">
                                            <div />
                                            <span className="time__text">{flight.departTime?.slice(0,2)}:{flight.departTime?.slice(2,4)}</span>
                                            <span className="airport__text">{flight.depart} 출발</span>
                                          </div>
                                          <div className="arrive__info">
                                            <div />
                                            <span className="time__text">{flight.arriveTime?.slice(0,2)}:{flight.arriveTime?.slice(2,4)}</span>
                                            <span className="airport__text">{flight.arrive} 도착</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              } else {
                                // 경유 항공편
                                const flight1 = isDepartDay ? airlineInfo.departFlight1 : airlineInfo.arriveFlight1;
                                const flight2 = isDepartDay ? airlineInfo.departFlight2 : airlineInfo.arriveFlight2;
                                
                                if (!flight1 || !flight2) return null;

                                const airlineWord = flight1.airlineName?.slice(0, 2) || '';
                                const airlineWordCopy = (airlineWord === '5J' || airlineWord === '7C') ? `A${airlineWord}` : airlineWord;
                                const airlineImage = airlineWordCopy ? AirlineData[airlineWordCopy as keyof typeof AirlineData] : null;

                                return (
                                  <div className="schedule__element__wrapper" key={detailIndex}>
                                    <div className="flight__schedule__board__wrapper">
                                      <div className="flight__schedule__board" style={{marginBottom:'50px'}}>
                                        <div className="flight__info__wrapper">
                                          {airlineImage && <img src={airlineImage} alt="airline" />}
                                          <span>{flight1.airlineName}</span>
                                        </div>
                                        <div className="flight__time__wrapper">
                                          <span className="flight__time">{getFlightDuration(flight1.departTime, flight1.arriveTime)}</span>
                                          <div className="depart__info">
                                            <div />
                                            <span className="time__text">{flight1.departTime?.slice(0,2)}:{flight1.departTime?.slice(2,4)}</span>
                                            <span className="airport__text">{flight1.depart} 출발</span>
                                          </div>
                                          <div className="arrive__info">
                                            <div />
                                            <span className="time__text">{flight1.arriveTime?.slice(0,2)}:{flight1.arriveTime?.slice(2,4)}</span>
                                            <span className="airport__text">{flight1.arrive} 도착</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flight__schedule__board">
                                        <div className="flight__info__wrapper">
                                          {airlineImage && <img src={airlineImage} alt="airline" />}
                                          <span>{flight2.airlineName}</span>
                                        </div>
                                        <div className="flight__time__wrapper">
                                          <span className="flight__time">{getFlightDuration(flight2.departTime, flight2.arriveTime)}</span>
                                          <div className="depart__info">
                                            <div />
                                            <span className="time__text">{flight2.departTime?.slice(0,2)}:{flight2.departTime?.slice(2,4)}</span>
                                            <span className="airport__text">{flight2.depart} 출발</span>
                                          </div>
                                          <div className="arrive__info">
                                            <div />
                                            <span className="time__text">{flight2.arriveTime?.slice(0,2)}:{flight2.arriveTime?.slice(2,4)}</span>
                                            <span className="airport__text">{flight2.arrive} 도착</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            }
                            // location 타입인 경우
                            else if (detailItem.sort === 'location') {
                              return (
                                <div className="schedule__element__wrapper" key={detailIndex}>
                                  <div className="schedule__element__header__wrapper">
                                    {detailItem.location && (
                                      <div className="schedule__location__wrapper">
                                        <div className="location__absolute__wrapper">
                                          <img src={locationIcon} style={{width:'46px'}} alt="location"/>
                                        </div>
                                        <span className="location__text">{detailItem.location}</span>
                                      </div>
                                    )}
                                  </div>
                                  {
                                    detailItem.locationDetail && detailItem.locationDetail.map((locationDetailItem: any, locationDetailIndex: number) => {
                                      return (
                                        <div key={locationDetailIndex}>
                                          <div className="schedule__element__header__wrapper">
                                            <div className="schedule__element__header">
                                              <div className="absolute__wrapper">
                                                <div className="dot__icon" />
                                              </div>
                                              <div className="schedule__text__wrapper">
                                                <span>{locationDetailItem.subLocation}</span>
                                              </div>
                                            </div>
                                          </div>
                                          {
                                            locationDetailItem.subLocationDetail && locationDetailItem.subLocationDetail.map((subDetailItem: any, subDetailIndex: number) => {
                                              return (
                                                <div className="schedule__element__main__wrapper" key={subDetailIndex}>
                                                  <div className="image__wrapper">
                                                    <div className="imagebox">
                                                      <img style={{height:'100%', width:'100%'}}
                                                        src={`${AdminURL}/lastimages/scheduledetailboximages/${subDetailItem.postImage}`}
                                                        alt="location detail"
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
                                              );
                                            })
                                          }
                                        </div>
                                      );
                                    })
                                  }
                                </div>
                              );
                            }
                            // text 타입인 경우
                            else if (detailItem.sort === 'text') {
                              return (
                                <div className="schedule__element__wrapper" key={detailIndex}>
                                  <div className="schedule__element__header__wrapper">
                                    <div className="schedule__location__wrapper">
                                      <div className="location__absolute__wrapper">
                                        <img src={locationIcon} style={{width:'46px'}} alt="location"/>
                                      </div>
                                      <span className="location__text">{detailItem.text}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })
                        }
                      </div>

                      <div className="additional__schedule__wrapper">
                        <div className="index__wrapper">
                          <img src={hotelplateIcon} style={{height:'24px'}} alt="meal"/>
                          <span>식사</span>
                        </div>
                        <div className="meal__info__wrapper">
                          <span>[조식] {dayItem.breakfast || "없음"}</span>
                          <span>[중식] {dayItem.lunch || "없음"}</span>
                          <span>[석식] {dayItem.dinner || "없음"}</span>
                        </div>
                      </div>
                      <div className="additional__schedule__wrapper">
                        <div className="index__wrapper">
                          <img src={hotelbuildingIcon} style={{height:'24px'}} alt="hotel"/>
                          <span>호텔</span>
                        </div>
                        <div className="additional__info__wrapper">
                          <p>{dayItem.hotel}</p>
                          <div className="additional__rating__wrapper">
                            <RatingBoard ratingSize={20} rating={parseInt(dayItem.score) || 0} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()
            }
          </div>
        </div>

        {/* 포함/불포함  ----------------------------------------------------------------------------------  */}
        <div className="resort_detail_included__items__section__wrapper resort_detail_mx__section">
          <div className="single__header__main">포함/불포함</div>
          <div className="included__items__wrapper">
            <div className="index__title__wrapper">
              <span className="included__icon"><FaRegCircle size={14}/></span>
              <span>포함사항</span>
            </div>
            <div className="elements__wrapper">
              {
                selectedSchedule && selectedSchedule.includeNote && (() => {
                  const includeNote = typeof selectedSchedule.includeNote === 'string' ? JSON.parse(selectedSchedule.includeNote) : selectedSchedule.includeNote;
                  return includeNote.map((item: any, index: any) => {
                    return (
                      <span key={index}>- {item}</span>
                    )
                  })
                })()
              }
              {selectedSchedule?.includeNoteText && <span>- {selectedSchedule.includeNoteText}</span>}
            </div>
            <div className="index__title__wrapper">
              <span className="unincluded__icon"><IoMdClose size={18}/></span>
              <span>불포함사항</span>
            </div>
            <div className="elements__wrapper">
              {
                selectedSchedule && selectedSchedule.notIncludeNote && (() => {
                  const notIncludeNote = typeof selectedSchedule.notIncludeNote === 'string' ? JSON.parse(selectedSchedule.notIncludeNote) : selectedSchedule.notIncludeNote;
                  return notIncludeNote.map((item: any, index: any) => {
                    return (
                      <span key={index}>- {item}</span>
                    )
                  })
                })()
              }
              {selectedSchedule?.notIncludeNoteText && <span>- {selectedSchedule.notIncludeNoteText}</span>}
            </div>
          </div>
        </div>

        {/* 필독사항  ----------------------------------------------------------------------------------  */}
        <div className="resort_detail_must__read__section__wrapper resort_detail_mx__section">
          <div className="single__header__main">필독사항</div>
          <div className="must__read__wrapper">
            {selectedSchedule?.cautionNote && selectedSchedule.cautionNote !== '' && (
              <span style={{whiteSpace: 'pre-wrap'}}>{selectedSchedule.cautionNote}</span>
            )}
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

        {/* 하단버튼  ----------------------------------------------------------------------------------  */}
        <div className="resort_detail_bottom_btn_cover resort_detail_mx__section">
          <div className="resort_detail_bottom_btn"
            style={{border:'1px solid #37b0d9'}}
          >
            <p style={{color:'#37b0d9'}}>찜하기</p>
          </div>
          <div className="resort_detail_bottom_btn"
            style={{border:'1px solid #37b0d9'}}
          >
            <p style={{color:'#37b0d9'}}>상담요청</p>
          </div>
          <div className="resort_detail_bottom_btn"
            style={{backgroundColor:'#37b0d9'}}
          >
            <p style={{color:'#fff'}}>일정변경요청하기</p>
          </div>
          <div className="resort_detail_bottom_btn"
            style={{backgroundColor:'#172aba'}}
          >
            <p style={{color:'#fff'}}>예약요청하기</p>
          </div>
        </div>



    </div>
  );
}
