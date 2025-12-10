import "./NationList.scss";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AdminURL } from "../../../../MainURL";
import ProductImageData from "../../..//common/ProductImageData";
import { IoLocationOutline } from "react-icons/io5";
import { LuCalendarDays } from "react-icons/lu";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { ScheduleDataProps } from "../TourInterfaceData";


export default function NationList() {
  
  let navigate = useNavigate();
  const cityObj = useLocation().state.cityObj;
  
  const [list, setList] = useState<ScheduleDataProps[]>([]);

  const fetchPosts = async () => {
    console.log('cityObj.tourNation', cityObj.tourNation);
    const resschedule = await axios.post(`${AdminURL}/producttour/gettourschedules`, {
      tourNation : cityObj.tourNation
    })
    if (resschedule.data) {
      const copy = [...resschedule.data].map((item) => {
        try {
          // tourNation이 JSON 문자열인 경우 파싱하여 + 로 연결
          const nations = JSON.parse(item.tourNation);
          return {
            ...item,
            filteredTourNation: Array.isArray(nations) ? nations.join('+') : item.tourNation
          };
        } catch (e) {
          // 파싱 실패시 원본 그대로 반환
          return item;
        }
      });
      console.log('copy', copy);
      setList(copy);
    } 
  };


  useEffect(() => {
    fetchPosts();
  }, []);


  const [toUser, setToUser] = useState('발리');
  const [categoryMenu, setCategoryMenu] = useState('휴양지추천상품');
  


  return (
    <div className="nation_page">

      <div className="nation_detail_search__bar___wrapper">
        <div className="nation_detail_search__box">
          <IoLocationOutline className="nation_detail_search__text"/>
          <select value={toUser} onChange={(e)=>{setToUser(e.target.value)}} className="nation_detail_search__select">
            { ['발리','몰디브','칸쿤','푸켓'].map((option:any, index:any) => (
              <option key={index} value={option.value}>발리</option>
            ))}
          </select>
        </div>
        <div className="nation_detail_search__bar"></div>
        <div className="nation_detail_search__box">
          <select value={toUser} onChange={(e)=>{setToUser(e.target.value)}} className="nation_detail_search__select">
            { ['대서양','인도양','남미'].map((option:any, index:any) => (
              <option key={index} value={option.value}>전체</option>
            ))}
          </select>
        </div>
        <div className="nation_detail_search__bar"></div>
        <div className="nation_detail_search__box">
          <LuCalendarDays className="nation_detail_search__text"/>
          <div className="nation_detail_search__select">

          </div>
        </div>
        <div className="nation_detail_search__bar"></div>
        <div className="nation_detail_search__box">
          <HiOutlineBuildingOffice2 className="nation_detail_search__text"/>
          <select value={toUser} onChange={(e)=>{setToUser(e.target.value)}} className="nation_detail_search__select">
            { ['발리','몰디브','칸쿤','푸켓'].map((option:any, index:any) => (
              <option key={index} value={option.value}>리조트</option>
            ))}
          </select>
        </div>
        <div className="nation_detail_search__box">
          <div className="nation_detail_search__btn">
            찾기
          </div>
        </div>
      </div>

      <div className="nation__header__section__wrapper">
        <img className="bg__image" src={ProductImageData.paris} alt="temp" />
      </div>

      <div className="nation_detail_category__menu__section__wrapper">
        <div className="nation_detail_category__menu__content">
            {
              ["유럽추천상품", "프랑스", "이탈리아", "스위스", "오스트리아", "스페인", "동유럽", "포르투갈", "크로아티아", "산토리니", "북유럽"]
              .map((item:any, index:any)=>{
                return (
                  <div className={`category__menu-item ? ${categoryMenu === item ? 'on' : ''}`} 
                    key={index} onClick={()=>{setCategoryMenu(item);}}
                  >
                    <div className={`category__menu-face ${categoryMenu !== '' ? 'on' : ''}`} >{item}</div>
                    <div className={`category__menu-face2 ${categoryMenu === item ? 'on' : ''}`}> </div>
                  </div>
                )
              })
            }
        </div>
      </div>


      
      <div className="product__item__list__wrapper resort_page_mx__section">
        <div className="header__title" style={{height:'200px'}}>
          <span>{cityObj?.filteredTourNation || ''}</span>
          <span> 추천 상품</span>
        </div>
        <div className="product__items__wrapper">
          {
            list.map((item:any, index:any) => {
              // 기간 데이터 파싱
              let periodText = "";
              try {
                const periodData = JSON.parse(item.tourPeriodData);
                periodText = `${periodData.periodNight} ${periodData.periodDay}`;
              } catch (e) {
                periodText = "";
              }

              // 스케줄 데이터 파싱
              let scheduleText = "";
              try {
                const scheduleData = JSON.parse(item.productScheduleData);
                scheduleText = scheduleData.map((s:any) => 
                  s.city && s.night ? `${s.city}${s.night}` : ""
                ).filter((t:string) => t).join(' + ');
              } catch (e) {
                scheduleText = "";
              }

              // 포함 사항 파싱
              let includeItems = [];
              try {
                includeItems = JSON.parse(item.includeNote);
              } catch (e) {
                includeItems = [];
              }

              // 이미지 파싱
              let imageUrl = ProductImageData.paris; // 기본 이미지
              try {
                const images = JSON.parse(item.inputImage);
                if (images && images.length > 0) {
                  imageUrl = `${AdminURL}/lastimages/nationimages/${images[0]}`;
                }
              } catch (e) {
                // 기본 이미지 사용
              }

              return (
                <div className={`product__item__wrapper ${index === 0 ? "selectedbox" : ""}`} key={item.id}
                  onClick={()=>{
                    window.scrollTo(0, 0);
                    navigate(`/tour/detail?id=${item.id}`);
                  }}
                >
                  <div className="image__wrapper">
                    <img src={imageUrl} alt={item.productName} />
                  </div>
                  <div className="product__info__wrapper">
                    <div className="product__info__wrapper_left">
                      <div className="info__header">
                        <span className="tour__title">{item.filteredTourNation}</span>
                        <span className="tour__period">{periodText}</span>
                      </div>
                      <div className="info__header">
                        <div style={{display: 'flex', gap: '8px', marginBottom: '4px'}}>
                          <span style={{color: '#999'}}>{item.productName}</span>
                        </div>
                      </div>
                      <div className="product__schedule">{scheduleText}</div>
                      <div className="product__content">
                        {
                          includeItems.slice(0, 3).map((subItem:any, subIndex:any) => (
                            <div key={subIndex}>
                              <p>- {subItem}</p>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                    <div className="product__info__wrapper_verticalBar"></div>
                    <div className="product__info__wrapper_right">
                      <div className="product__cost">견적 문의</div>
                      <p className="product__cost_sub">항공료불포함</p>
                      <div className={`product__cost_selectBtn_box ${index === 0 ? "selected" : ""}`}>
                        <p>자세히 보기</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
   

    </div>
  );
}
