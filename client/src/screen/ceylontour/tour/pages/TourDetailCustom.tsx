
import './TourDetailCustom.scss';
import React, { useCallback, useState } from 'react';
import sampleImage4 from '../../../lastimages/hotels/hotel_04.png';
import locationIcon from '../../../lastimages/tourPage/location.png';
import hotelbuildingIcon from '../../../lastimages/tourPage/hotelbuilding.png';
import hotelplateIcon from '../../../lastimages/tourPage/hotelplate.png';
import { IoMdArrowDropup, IoMdArrowDropdown } from 'react-icons/io';
import { AdminURL} from "../../../../MainURL";
import RatingBoard from '../../../common/RatingBoard';
import { RestAirlineProps, RestScheduleListProps, RestSelectScheduleDetailProps } from '../../product/Product_InterfaceData';
import { MdOutlineStar } from 'react-icons/md';
import { LuPencil } from "react-icons/lu";
import { HiMagnifyingGlass } from "react-icons/hi2";

// Props type
interface ResortDetailPageCustomProps {
  flightType: string;
  setFlightType: (type: string) => void;
  selectedAirline: RestAirlineProps | undefined;
  setSelectedAirline: (airline: RestAirlineProps) => void;
  directAirline: RestAirlineProps[];
  viaAirline: RestAirlineProps[];
  airportOptions: { value: string; label: string }[];
  selectedAirport: string;
  setSelectedAirport: (airport: string) => void;
  isAirportDropdownOpen: boolean;
  setIsAirportDropdownOpen: (open: boolean) => void;
  flightOptions: any[];
  selectedFlight: string;
  setSelectedFlight: (flight: string) => void;
  isFlightDropdownOpen: boolean;
  setIsFlightDropdownOpen: (open: boolean) => void;
  selectedSchedule: RestScheduleListProps | undefined;
  selectedScheduleDetail: RestSelectScheduleDetailProps[];
  CITY: string;
  tourInfo?: any;
  scheduleData?: any;
}

function CustomRatingBoard({ rating }: { rating: number }) {
 
  const formatRatingArray = useCallback((rating: number) => {
    const integerPart = Math.floor(rating);
    const fractionalPart = Math.round((rating - integerPart) * 100);

    return new Array(5).fill(0).map((_, i) => {
      if (i < integerPart) {
        return 100;
      }
      if (i === integerPart) {
        return fractionalPart;
      }
      return 0;
    });
  }, []);

  return (
    <div className="custom-rating__board__wrapper">
      {formatRatingArray(rating).map((value, idx) => {
        return (
          <div className="custom-rating__icon" key={idx} >
            <MdOutlineStar size={16}
              className={value === 100 ? "custom-filled__star" : "custom-empty__star"}
            />
          </div>
        )
      })}
    </div>
  );
}

export default function TourDetailCustom(props: ResortDetailPageCustomProps) {
  const { tourInfo, scheduleData } = props;
  
  // 호텔 체크박스 상태 (호텔 개수만큼)
  const [hotelChecked, setHotelChecked] = useState([false, false, false]);
  // 호텔2 태그 선택 상태 - 각 태그별로 개별 체크박스
  const hotel2Tags = ['우붓', '섬', '힙스터', '클러버', '럭셔리'];
  const [tagChecked, setTagChecked] = useState([false, false, false, false, false]);

  // 커스텀 옵션 아코디언 상태
  const [expandedSections, setExpandedSections] = useState({
    aviation: true,
    vehicle: false,
    vip: false,
    hocance: false,
    excursion: true
  });

  // 커스텀 옵션 체크박스 상태
  const [customOptions, setCustomOptions] = useState({
    aviation: {
      koreanAir: true,
      garuda: false
    },
    excursion: {
      scuba: true,
      marineSports: false,
      jetSki: false,
      jeepTour: false,
      rafting: false
    }
  });

  const handleHotelCheck = (idx: number) => {
    setHotelChecked(prev => prev.map((v, i) => i === idx ? !v : v));
  };
  const handleTagCheck = (idx: number) => {
    setTagChecked(prev => prev.map((v, i) => i === idx ? !v : v));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const handleCustomOption = (section: 'aviation' | 'excursion', option: string) => {
    setCustomOptions(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [option]: !(prev[section] as any)[option]
      }
    }));
  };

  return (
    <div>
     
      
      {/* 항공사별 일정표 */}
      <div className="resort_detail_schedule__byairline__wrapper">
        <div className="resort_detail_schedule_header__wrapper">
          <span className="header__main">항공사별 시간표</span>
          <div className="sidebar__wrapper">
            <span className={props.flightType === '직항' ? "selected__sidebar" : ""}
              onClick={() => {
                props.setFlightType('직항');
                if (props.directAirline.length > 0) props.setSelectedAirline(props.directAirline[0]);
              }}
            >직항</span>
            <span className={props.flightType === '경유' ? "selected__sidebar" : ""}
              onClick={() => {
                props.setFlightType('경유');
                if (props.viaAirline.length > 0) props.setSelectedAirline(props.viaAirline[0]);
              }}
            >경유</span>
          </div>
        </div>
        
        {/* 항공사별 일정표 한 줄 레이아웃 */}
        <div className="flight__row__wrapper">
          {/* 왼쪽: 출발공항 드롭다운 */}
          <div className="flight__row__left">
            <div className="custom__dropdown__wrapper">
              <div 
                className={`custom__dropdown__selected ${props.isAirportDropdownOpen ? 'open' : ''}`}
                onClick={() => props.setIsAirportDropdownOpen(!props.isAirportDropdownOpen)}
              >
                <span className="dropdown__text">
                  {props.airportOptions.find(opt => opt.value === props.selectedAirport)?.label}
                </span>
                <span className="dropdown__arrow">
                  {props.isAirportDropdownOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
                </span>
              </div>
              {props.isAirportDropdownOpen && (
                <div className="custom__dropdown__options">
                  {props.airportOptions.map(opt => (
                    <div
                      key={opt.value}
                      className="custom__dropdown__option"
                      onClick={() => {
                        props.setSelectedAirport(opt.value);
                        props.setIsAirportDropdownOpen(false);
                      }}
                    >
                      <span className="dropdown__text">
                        {opt.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flight__row__middle"></div>
          {/* 오른쪽: 항공편 드롭다운 (로고+텍스트) */}
          <div className="flight__row__right">
            {/* 커스텀 드롭다운 */}
            <div className="custom__dropdown__wrapper">
              <div 
                className={`custom__dropdown__selected ${props.isFlightDropdownOpen ? 'open' : ''}`}
                onClick={() => props.setIsFlightDropdownOpen(!props.isFlightDropdownOpen)}
              >
                <div className="dropdown__left">
                  <img
                    src={props.flightOptions.find(f => f.value === props.selectedFlight)?.logo}
                    alt="항공사로고"
                    className="dropdown__airline__logo"
                  />
                  <span className="dropdown__airline__name">
                    {props.flightOptions.find(f => f.value === props.selectedFlight)?.label}
                  </span>
                </div>
                <div className="dropdown__center">
                  <span className="dropdown__flight__info">
                    {props.flightOptions.find(f => f.value === props.selectedFlight)?.info}
                  </span>
                </div>
                <div className="dropdown__right">
                  <span className="dropdown__arrow">
                    {props.isFlightDropdownOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
                  </span>
                </div>
              </div>
              {props.isFlightDropdownOpen && (
                <div className="custom__dropdown__options">
                  {props.flightOptions.map(opt => (
                    <div
                      key={opt.value}
                      className="custom__dropdown__option"
                      onClick={() => {
                        props.setSelectedFlight(opt.value);
                        props.setIsFlightDropdownOpen(false);
                      }}
                    >
                      <div className="dropdown__left">
                        <img
                          src={opt.logo}
                          alt="항공사로고"
                          className="dropdown__airline__logo"
                        />
                        <span className="dropdown__airline__name">
                          {opt.label}
                        </span>
                      </div>
                      <div className="dropdown__center">
                        <span className="dropdown__flight__info">
                          {opt.info}
                        </span>
                      </div>
                      <div className="dropdown__right">
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* 항공사별 일정표 섹션 - 80% + 20% 레이아웃 */}
      <div className="custom-layout-container">
        {/* 왼쪽 80% - 기존 일정표 */}
        <div className="custom-layout-left">

          {/* 일정표 */}
          <div className="custom-resort_detail_mx__section">
            <div className="custom-resort_detail_schedule_header__wrapper">
              <span className="custom-header__main">추천 여행일정표</span>
              <span className="custom-header__sub">
                {props.selectedAirline?.airlineData[0].airlineName} {props.selectedAirline?.departAirportMain} {String(props.selectedAirline?.airlineData[0].arriveTime).replace(/(\d{2})(\d{2})/, "$1:$2")} 출발 / {props.CITY} {props.selectedSchedule?.tourPeriod}
              </span>
            </div>

            <div className="custom-schedule__tables__wrapper">
              {
                props.selectedScheduleDetail?.map((item:any, index:any)=>{

                  return (
                    <div className="custom-schedule__table__wrapper" key={index}>
                      <div className="custom-schedule__header">
                        <span className="custom-main__text">{index+1} DAY</span>
                        <span className="custom-sub__text">2024-10-16(토)</span>
                      </div>
                      <div className="custom-schedule__main__wrapper">
                        {
                          (index === 0 || index === props.selectedScheduleDetail.length - 1) &&
                          <>
                          { props.flightType === '직항'
                            ?
                            <div className="custom-schedule__element__wrapper">
                              <div className="custom-flight__schedule__board__wrapper">
                                {
                                  item.scheduleDetail.map((subItem:any, subIndex:any)=>{
                                    
                                    return subItem.airlineDetail !== undefined && (
                                      <div className="custom-flight__schedule__board" key={subIndex}>
                                        <div className="custom-flight__info__wrapper">
                                          <img src={subItem.airlineDetail[0].airlineImage} alt="temp" />
                                          <span>{subItem.airlineDetail[0].airlineName}</span>
                                        </div>
                                        <div className="custom-flight__time__wrapper">
                                          <span className="custom-flight__time">{subItem.airlineDetail[0].flightTime}</span>
                                          <div className="custom-depart__info">
                                            <div />
                                            <span className="custom-time__text">{subItem.airlineDetail[0].departTime}</span>
                                            <span className="custom-airport__text">{subItem.airlineDetail[0].departAirport} 출발</span>
                                          </div>
                                          <div className="custom-arrive__info">
                                            <div />
                                            <span className="custom-time__text">{subItem.airlineDetail[0].arriveTime}</span>
                                            <span className="custom-airport__text">{subItem.airlineDetail[0].arriveAirport} 도착</span>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })
                                }
                              </div>
                            </div>
                            :
                            <div className="custom-schedule__element__wrapper">
                              <div className="custom-flight__schedule__board__wrapper">
                                {
                                  item.scheduleDetail.map((subItem:any, subIndex:any)=>{
                                    
                                    return subItem.airlineDetail !== undefined && (
                                      <div key={subIndex}>
                                        <div className="custom-flight__schedule__board" >
                                          <div className="custom-flight__info__wrapper">
                                            <img src={subItem.airlineDetail[0].airlineImage} alt="temp" />
                                            <span>{subItem.airlineDetail[0].airlineName}</span>
                                          </div>
                                          <div className="custom-flight__time__wrapper">
                                            <span className="custom-flight__time">{subItem.airlineDetail[0].flightTime}</span>
                                            <div className="custom-depart__info">
                                              <div />
                                              <span className="custom-time__text">{subItem.airlineDetail[0].departTime}</span>
                                              <span className="custom-airport__text">{subItem.airlineDetail[0].departAirport} 출발</span>
                                            </div>
                                            <div className="custom-arrive__info">
                                              <div />
                                              <span className="custom-time__text">{subItem.airlineDetail[0].arriveTime}</span>
                                              <span className="custom-airport__text">{subItem.airlineDetail[0].arriveAirport} 도착</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="custom-flight__schedule__board" >
                                          <div className="custom-flight__info__wrapper">
                                            <img src={subItem.airlineDetail[1].airlineImage} alt="temp" />
                                            <span>{subItem.airlineDetail[1].airlineName}</span>
                                          </div>
                                          <div className="custom-flight__time__wrapper">
                                            <span className="custom-flight__time">{subItem.airlineDetail[1].flightTime}</span>
                                            <div className="custom-depart__info">
                                              <div />
                                              <span className="custom-time__text">{subItem.airlineDetail[1].departTime}</span>
                                              <span className="custom-airport__text">{subItem.airlineDetail[1].departAirport} 출발</span>
                                            </div>
                                            <div className="custom-arrive__info">
                                              <div />
                                              <span className="custom-time__text">{subItem.airlineDetail[1].arriveTime}</span>
                                              <span className="custom-airport__text">{subItem.airlineDetail[1].arriveAirport} 도착</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })
                                }
                              </div>
                            </div>
                          }
                          </>
                        }
                        {
                          item.scheduleDetail.map((subItem:any, subIndex:any)=>{

                            return (
                              <div className="custom-schedule__element__wrapper" key={subIndex}>
                                <div className="custom-schedule__element__header__wrapper">
                                  {
                                    subItem.location !== "" &&
                                    <div className="custom-schedule__location__wrapper">
                                      <div className="custom-location__absolute__wrapper">
                                        <img src={locationIcon} style={{width:'46px'}}/>
                                      </div>
                                      <span className="custom-location__text">{subItem.location}</span>
                                    </div>
                                  }
                                </div>
                                {
                                  subItem.locationDetail.map((detailItem:any, detailIndex:number)=>{
                                    return (
                                      <div key={detailIndex} className="custom-schedule__sub_element__wrapper">
                                        {
                                          detailItem.subLocation !== "" &&
                                          <div className="custom-schedule__element__subTitle__wrapper">
                                            <div className="custom-schedule__element__subTitle">
                                              <div className="custom-absolute__wrapper">
                                                <div className="custom-dot__icon" />
                                              </div>
                                              <div className="custom-schedule__text__wrapper">
                                                <span>{detailItem.subLocation}</span>
                                                <div className="custom-schedule__btns">
                                                  <button className="custom-schedule__btn custom-schedule__btn--delete" title="삭제"
                                                    onClick={() => {
                                                      console.log('삭제');
                                                    }}
                                                  >–</button>
                                                  <button className="custom-schedule__btn custom-schedule__btn--edit" title="변경"
                                                    onClick={() => {
                                                      console.log('변경');
                                                    }}>변경</button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        }
                                        {
                                          detailItem.subLocationDetail.map((subDetailItem:any, subDetailIndex:number)=>{

                                            const postImages = subDetailItem.postImage ? JSON.parse(subDetailItem.postImage) : "";

                                            return postImages !== "" && (
                                              <div className="custom-schedule__element__main__wrapper" key={subDetailIndex}>
                                                <div className="custom-image__wrapper">
                                                  <div className="custom-imagebox">
                                                    <img style={{height:'100%', width:'100%'}}
                                                      src={`${AdminURL}/lastimages/scheduledetailboximages/${postImages[0]}`}
                                                    />                                                
                                                  </div>
                                                </div>
                                                <div className="custom-table__wrapper">
                                                  <div className="custom-table__header">
                                                    <span>{subDetailItem.locationTitle}</span>
                                                  </div>
                                                  <div className="custom-table__main">
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

                      <div className="custom-additional__schedule__wrapper">
                        <div className="custom-index__wrapper">
                          <img src={hotelplateIcon} style={{height:'24px'}}/>
                          <span>식사</span>
                        </div>
                        <div className="custom-additional__schedule__wrapper__textbox">
                          <div className="custom-meal__info__wrapper">
                            <span>[조식] {item.breakfast !== "undefined" ? item.breakfast : "없음"}</span>
                            <span>[중식] {item.lunch ? item.lunch : "없음"}</span>
                            <span>[석식] {item.dinner ? item.dinner : "없음"}</span>
                          </div>
                          <div className="custom-additional__btn__wrapper custom-schedule__btns">
                            <button className="custom-schedule__btn custom-schedule__btn--edit" title="변경">변경</button>
                          </div>
                        </div>
                      </div>
                      <div className="custom-additional__schedule__wrapper">
                        <div className="custom-index__wrapper">
                          <img src={hotelbuildingIcon} style={{height:'24px'}}/>
                          <span>호텔</span>
                        </div>
                        <div className="custom-additional__schedule__wrapper__textbox">
                          <div className="custom-additional__info__wrapper" style={{marginLeft:'0'}}>
                            <p>{item.hotel}</p>
                            <div className="custom-additional__rating__wrapper">
                              <CustomRatingBoard rating={parseInt(item.score)} />
                            </div>
                          </div>
                          <div className="custom-additional__btn__wrapper custom-schedule__btns">
                            <button className="custom-schedule__btn custom-schedule__btn--edit" title="변경">변경</button>
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

        {/* 오른쪽 20% - 커스텀 옵션 */}
        <div className="custom-layout-right">
          <div className="custom-header">
            <div className="custom-header-title">
              <div className="custom-header-icon">
               <LuPencil className='custom-header-icon-pencil'/>
              </div>
              <h3 className="custom-header-text">
                나만의 커스텀
              </h3>
            </div>
            <p className="custom-header-description">
              추천 여행일정에서 개인의 취향에 맞게 일정변경 및 요청사항을 신청 할 수 있으며 여행기간 동안 고객 케어를 받으며 한층 업그레이드된 안전하고 편안한 
              여행을 즐길 수 있습니다.
            </p>
          </div>

          {/* 검색바 */}
          <div className="custom-search-bar">
            <span className="custom-search-icon">
              <HiMagnifyingGlass size={16}/>
            </span>
            <input 
              type="text" 
              className="custom-search-input"
            />
          </div>

          {/* 아코디언 섹션들 */}
          {/* 항공/교통 */}
          <div className="custom-accordion-section">
            <div 
              className={`custom-accordion-header ${expandedSections.aviation ? 'expanded' : ''}`}
              onClick={() => toggleSection('aviation')}
            >
              항공/교통
              <span>{expandedSections.aviation ? '▲' : '▼'}</span>
            </div>
            {expandedSections.aviation && (
              <div className="custom-accordion-content">
                <label className="custom-checkbox-label">
                  <input
                    type="checkbox"
                    checked={customOptions.aviation.koreanAir}
                    onChange={() => handleCustomOption('aviation', 'koreanAir')}
                    className="custom-checkbox"
                  />
                  <span className="custom-checkbox-text">대한항공</span>
                </label>
                <label className="custom-checkbox-label">
                  <input
                    type="checkbox"
                    checked={customOptions.aviation.garuda}
                    onChange={() => handleCustomOption('aviation', 'garuda')}
                    className="custom-checkbox"
                  />
                  <span className="custom-checkbox-text">가루다항공</span>
                </label>
              </div>
            )}
          </div>

          {/* 차량/가이드 */}
          <div className="custom-accordion-section">
            <div 
              className={`custom-accordion-header ${expandedSections.vehicle ? 'expanded' : ''}`}
              onClick={() => toggleSection('vehicle')}
            >
              차량/가이드
              <span>{expandedSections.vehicle ? '▲' : '▼'}</span>
            </div>
          </div>

          {/* VIP 서비스 */}
          <div className="custom-accordion-section">
            <div 
              className={`custom-accordion-header ${expandedSections.vip ? 'expanded' : ''}`}
              onClick={() => toggleSection('vip')}
            >
              VIP 서비스
              <span>{expandedSections.vip ? '▲' : '▼'}</span>
            </div>
          </div>

          {/* 호캉스즐기기 */}
          <div className="custom-accordion-section">
            <div 
              className={`custom-accordion-header ${expandedSections.hocance ? 'expanded' : ''}`}
              onClick={() => toggleSection('hocance')}
            >
              호캉스즐기기
              <span>{expandedSections.hocance ? '▲' : '▼'}</span>
            </div>
          </div>

          {/* 익스커션 */}
          <div className="custom-accordion-section">
            <div 
              className={`custom-accordion-header ${expandedSections.excursion ? 'expanded' : ''}`}
              onClick={() => toggleSection('excursion')}
            >
              익스커션
              <span>{expandedSections.excursion ? '▲' : '▼'}</span>
            </div>
            {expandedSections.excursion && (
              <div className="custom-accordion-content">
                <label className="custom-checkbox-label">
                  <input
                    type="checkbox"
                    checked={customOptions.excursion.scuba}
                    onChange={() => handleCustomOption('excursion', 'scuba')}
                    className="custom-checkbox"
                  />
                  <span className="custom-checkbox-text">스쿠버 다이빙</span>
                </label>
                <label className="custom-checkbox-label">
                  <input
                    type="checkbox"
                    checked={customOptions.excursion.marineSports}
                    onChange={() => handleCustomOption('excursion', 'marineSports')}
                    className="custom-checkbox"
                  />
                  <span className="custom-checkbox-text">해양스포츠</span>
                </label>
                <label className="custom-checkbox-label">
                  <input
                    type="checkbox"
                    checked={customOptions.excursion.jetSki}
                    onChange={() => handleCustomOption('excursion', 'jetSki')}
                    className="custom-checkbox"
                  />
                  <span className="custom-checkbox-text">제트스키</span>
                </label>
                <label className="custom-checkbox-label">
                  <input
                    type="checkbox"
                    checked={customOptions.excursion.jeepTour}
                    onChange={() => handleCustomOption('excursion', 'jeepTour')}
                    className="custom-checkbox"
                  />
                  <span className="custom-checkbox-text">지프투어</span>
                </label>
                <label className="custom-checkbox-label">
                  <input
                    type="checkbox"
                    checked={customOptions.excursion.rafting}
                    onChange={() => handleCustomOption('excursion', 'rafting')}
                    className="custom-checkbox"
                  />
                  <span className="custom-checkbox-text">레프팅</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
