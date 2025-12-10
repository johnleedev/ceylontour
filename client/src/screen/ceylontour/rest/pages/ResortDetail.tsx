import "./ResortDetail.scss";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import TourImageData from "../../..//common/ProductImageData";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AdminURL } from "../../../../MainURL";
import ResortDetailNotice from "./ResortDetailNotice";
import ResortDetailSchedule from "./ResortDetailSchedule";
import { HotelDataProps, ScheduleDataProps } from "../RestInterfaceData";



export default function ResortDetail() {
  
  const url = new URL(window.location.href);
  const ID = url.searchParams.get("id");
  const NATION = url.searchParams.get("nation");
  const CITY = url.searchParams.get("city");

  let navigate = useNavigate();

  const [hotelInfo, setHotelInfo] = useState<HotelDataProps>();
  const [scheduleData, setScheduleData] = useState<ScheduleDataProps[]>();

  const [hotelMainImage, setHotelMainImage] = useState<any>(null);
  const [imageNamesAllView, setImageNamesAllView ] = useState<any>(null);
  const [imageNamesRoomView, setImageNamesRoomView ] = useState<any>(null);
  const [imageNamesEtcView, setImageNamesEtcView ] = useState<any>(null);
  const [imageAll, setImageAll] = useState<any>(null);
  const [hotelRoomTypes, setHotelRoomTypes] = useState<any>(null);

  const [category, setCategory] = useState('notice');
  const [othersHotelList, setOthersHotelList] = useState<HotelDataProps[]>([]);

  
  // 게시글 가져오기
  const fetchPosts = async () => {
    const resinfo = await axios.get(`${AdminURL}/productrest/getresthotelpart/${ID}`)
    let hotelType: string = '';
    let hotelNameKo: string = '';
    let hotelLocation: string = '';
    let productScheduleData: any;
    
    if (resinfo.data) {
      const copy = [...resinfo.data][0];
      console.log('hotelInfo', copy);
      setHotelInfo(copy);
      hotelType = copy.hotelType; // 팩요금
      hotelNameKo = copy.hotelNameKo;
      hotelLocation = copy.hotelLocation;
      const imageNamesAllViewCopy = copy.imageNamesAllView ? JSON.parse(copy.imageNamesAllView) : [];
      setImageNamesAllView(imageNamesAllViewCopy);
      setHotelMainImage(imageNamesAllViewCopy[0]);
      const imageNamesRoomViewCopy = copy.imageNamesRoomView ? JSON.parse(copy.imageNamesRoomView) : [];
      setImageNamesRoomView(imageNamesRoomViewCopy);
      const imageNamesEtcViewCopy = copy.imageNamesEtcView ? JSON.parse(copy.imageNamesEtcView) : [];
      setImageNamesEtcView(imageNamesEtcViewCopy);
      const imageAllCopy = imageNamesAllViewCopy.concat(imageNamesRoomViewCopy, imageNamesEtcViewCopy);
      setImageAll(imageAllCopy);
      const hotelRoomTypesCopy = copy.hotelRoomTypes ? JSON.parse(copy.hotelRoomTypes) : [];
      setHotelRoomTypes(hotelRoomTypesCopy);
    } 
    const resschedule = await axios.get(`${AdminURL}/productrest/getschedules/${NATION}/${CITY}`)
    if (resschedule.data) {
      let scheduleCopy = [...resschedule.data];
      console.log('schedulecopy', scheduleCopy);
      
      if (hotelType === '풀빌라') {
        const otherHotelType = '리조트';
        const resOthersHotel = await axios.get(`${AdminURL}/productrest/getothershotels/${otherHotelType}/${CITY}`);
        if (resOthersHotel.data) {
          const othersHotels = [...resOthersHotel.data];
          setOthersHotelList(othersHotels);
          
          console.log('othersHotels', othersHotels);
          // 모든 다른 호텔과 조합하여 상품 리스트 생성
          const newScheduleList: any[] = [];
          
          // 첫 번째 스케줄을 기준으로 각 호텔과 조합
          const baseSchedule = scheduleCopy[0];
          
          // 스케줄 상세 데이터 가져오기
          const enrichedSchedule = await fetchScheduleDetailData(baseSchedule);
          
          othersHotels.forEach((otherHotel) => {
            const parsedScheduleData = JSON.parse(baseSchedule.productScheduleData);
            
            // productName 재구성
            const newProductParts = parsedScheduleData.map((item: any) => {
              if (item.productName === '풀빌라') {
                return `[${hotelLocation}] ${hotelNameKo} ${item.dayNight}`;
              } else if (item.productName === '리조트') {
                return `[${otherHotel.hotelLocation}] ${otherHotel.hotelNameKo} ${item.dayNight}`;
              }
              return `${item.productName} ${item.dayNight}`;
            });
            
            const newProductName = newProductParts.join(' + ');
            
            newScheduleList.push({
              ...enrichedSchedule,
              productName: newProductName,
              combinedOtherHotel: otherHotel // 조합된 다른 호텔 정보 저장
            });
          });
          
          scheduleCopy = newScheduleList;
          console.log('newScheduleList with details', newScheduleList);
        }
      } else if (hotelType === '리조트') {

      } else if (hotelType === '') {

      }
      
      setScheduleData(scheduleCopy);
    }
  };

  // 스케줄 상세 데이터 가져오기 (ModalAddSchedule.tsx 참조)
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
          return axios.post(`${AdminURL}/restscheduledetailbox/getscheduledetailbyid`, {
            scheduleDetailIds: [item.id]
          }).then(res => {
            return {
              sort: 'location',
              detail: res.data && Array.isArray(res.data) ? res.data[0] : res.data
            };
          });
        } else if (item.sort === 'airline') {
          return axios.post(`${AdminURL}/restnationcity/getairlinebyid`, { id: item.id })
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
        const boxRes = await axios.post(`${AdminURL}/restscheduledetailbox/getdetailboxbyid`, {
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

  useEffect(() => {
    fetchPosts();
  }, []);  

  



  return (
    <div className="resort_detail_page">

       <div className="resort_page__header__section___wrapper">
        <img className="resort_page_bg__image" src={`${AdminURL}/lastimages/hotelimages/${hotelMainImage?.imageName}`} alt="temp" />
        <div className="resort_page_header__info">
          <span className="header__subtitle">{hotelInfo?.hotelNameEn}</span>
          <span className="resort_page_header__title">{hotelInfo?.hotelNameKo}</span>
          <div className="resort_page_header__loc__rating">
            <span className="header__location">{hotelInfo?.city} {'>'} {hotelInfo?.hotelLocation}</span>
            <div className="header__rating">
              {Array.from({ length: parseInt(hotelInfo?.hotelLevel || '0') }, (_, index) => (
                <FaStar key={index} />
              ))}
            </div>
          </div>
          {/* <span className="header__desc">{hotelInfo?.description}</span> */}
        </div>
      </div>

      <div className="resort_page_category__selector__wrapper">
        <div
          className={`category__bar ${
            category === "notice" ? "on" : ""
          }`}
          onClick={() => {
            setCategory("notice");
          }}
        >
          리조트안내
        </div>
        <div
          className={`category__bar ${
            category === "schedule" ? "on" : ""
          }`}
          onClick={() => setCategory("schedule")}
        >
          일정보기
        </div>
      </div>

        {
          (category === "notice" && hotelInfo) && 
          <ResortDetailNotice 
            hotelInfo={hotelInfo} 
            imageNamesAllView={imageNamesAllView}
            imageNamesRoomView={imageNamesRoomView}
            imageNamesEtcView={imageNamesEtcView}
            imageAll={imageAll}
            hotelRoomTypes={hotelRoomTypes}
          />
        }
      {
        category === "schedule" && <ResortDetailSchedule 
          hotelInfo={hotelInfo} 
          imageNamesAllView={imageNamesAllView} 
          imageNamesRoomView={imageNamesRoomView} 
          imageNamesEtcView={imageNamesEtcView} 
          imageAll={imageAll} 
          hotelRoomTypes={hotelRoomTypes}
          scheduleData={scheduleData}
        />
      }
    </div>
  );
}
