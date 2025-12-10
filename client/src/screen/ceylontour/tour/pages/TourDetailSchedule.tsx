import "./TourDetail.scss";
import { useEffect, useState } from "react";
import { FaCheck, FaRegCircle, FaStar } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import TourImageData from "../../..//common/ProductImageData";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AdminURL } from "../../../../MainURL";
import AirlineData from "../../../AirlineData";
import locationIcon from "../../lastimages/tourPage/location.png"
import hotelbuildingIcon from "../../lastimages/tourPage/hotelbuilding.png"
import hotelplateIcon from "../../lastimages/tourPage/hotelplate.png"
import RatingBoard from "../../..//common/RatingBoard";
import { IoMdClose } from "react-icons/io";


export default function TourDetailSchedule(
  { 
    tourInfo, scheduleData 
  }: { 
    tourInfo?: any, scheduleData?: any
  }
) {

  console.log('tourInfo', tourInfo);
  console.log('scheduleData', scheduleData);

  return (
    <div className="resort_detail_page">

      {/* 항공사별 일정표 ---------------------------------------------------------------------------------------------------------------- */}
      <div className="resort_detail_schedule__byairline__wrapper">
        <div className="resort_detail_schedule_header__wrapper">
          <span className="header__main">항공사별 일정표</span>
        </div>
        <div className="flight__items__wrapper">
          {
            tourInfo && tourInfo.manageAirline && typeof tourInfo.manageAirline === 'string' && (() => {
              const manageAirline = JSON.parse(tourInfo.manageAirline);
              const parsedPeriodData = tourInfo.tourPeriodData ? JSON.parse(tourInfo.tourPeriodData) : {};
              
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
            {tourInfo?.productName}
          </span>
        </div>

        <div className="schedule__tables__wrapper">
          {
            scheduleData && scheduleData.scheduleDetail && typeof scheduleData.scheduleDetail === 'string' && (() => {
              const scheduleDetail = JSON.parse(scheduleData.scheduleDetail);
              const manageAirline = (tourInfo.manageAirline && typeof tourInfo.manageAirline === 'string') ? JSON.parse(tourInfo.manageAirline) : [];
              
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
                                return airline.departFlight?.id === detailItem.id || airline.arriveFlight?.id === detailItem.id;
                              } else {
                                return airline.departFlight1?.id === detailItem.id || 
                                       airline.departFlight2?.id === detailItem.id ||
                                       airline.arriveFlight1?.id === detailItem.id ||
                                       airline.arriveFlight2?.id === detailItem.id;
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
                          <RatingBoard rating={parseInt(dayItem.score) || 0} />
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
      <div className="resort_detail_must__read__section__wrapper resort_detail_mx__section">
        <div className="single__header__main">필독사항</div>
        <div className="must__read__wrapper">
          {tourInfo?.cautionNote && tourInfo.cautionNote !== '' && (
            <span style={{whiteSpace: 'pre-wrap'}}>{tourInfo.cautionNote}</span>
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

