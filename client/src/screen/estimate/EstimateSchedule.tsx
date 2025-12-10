import React, { useState } from 'react'
import "./EstimateSchedule.scss";
import { DropdownBox } from '../../boxs/DropdownBox';
import { ImLocation } from 'react-icons/im';
import axios from 'axios';
import { MainURL } from '../../MainURL';
// import ModalSelectScheduleBox from '../../admin/Menu6_ProductsRest/Modal/ModalSelectScheduleDetailBox';
import { CiCircleMinus, CiCirclePlus } from 'react-icons/ci';


interface ScheduleProps {
  id : string;
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
  isViaSort: string;
  sort: string;
  nation : string;
  city : string;
  location: string;
  locationDetail : {
    subLocation : string;
    subLocationDetail : {
      locationTitle : string;
      locationContent : string;
      postImage : string;
    }[]
  }[]
}

export default function EstimateSchedule(props:any) {
  
  const [isAddOrRevise, setIsAddOrRevise] = useState(props.isAddOrRevise);

  const [postId, setPostId] = useState('');
  const [nation, setNation] = useState('');
  const [tourLocation, setTourLocation] = useState();
  const [scheduleList, setScheduleList] = useState<ScheduleProps[]>( 
    isAddOrRevise === 'revise' 
    ? props.scheduleDetails 
    : [{ id: '', day : '1', breakfast :'', lunch:'', dinner :'', hotel:'', score:'', 
        scheduleDetail: [{ 
          id: '',
          isViaSort : '',
          sort: '',
          nation: '',
          city : '',
          location: '',
          locationDetail : [{
            subLocation: '',
            subLocationDetail : [{
              locationTitle: '',
              locationContent: '',
              postImage: ''
            }]
          }]
        }]
      }]
  );  

  const datmealOptions = [
    { value: '선택', label: '선택' },
    { value: '기내식', label: '기내식' },
    { value: '선택식', label: '선택식' },
    { value: '외부식', label: '외부식' },
    { value: '리조트', label: '리조트' },
    { value: '자유식', label: '자유식' },
    { value: '현지식', label: '현지식' },
    { value: '포함', label: '포함' },
    { value: '불포함', label: '불포함' }
  ]
  const [hotelsOptions, setHotelsOptions] = useState([{ value: '선택', label: '선택' }]);

  // 여행지 검색 & 자동완성기능 -----------------------------------------------------------------------------------------------------------------------------------------------------
	const [isViewSelectScheduleBoxModal, setIsViewSelectScheduleBoxModal] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [tourLocationList, setTourLocationList] = useState<ScheduleDetailProps[]>([]);
  const [selectedTourLocationList, setselectedTourLocationList] = useState<ScheduleDetailProps[]>([]);
  const [viewAutoCompleteTourLocation, setViewAutoCompleteTourLocation] = useState<boolean[][][][]>(
    () =>
      scheduleList?.map((schedule: ScheduleProps) =>
        schedule.scheduleDetail.map((detail: ScheduleDetailProps) =>
          detail.locationDetail.map((subDetail) =>
            subDetail.subLocationDetail.map(() => false)
          )
        )
      ) || []
  );
  const [locationOptions, setLocationOptions] = useState([{ value: '선택', label: '선택' }]);
  const [subLocationOptions, setSubLocationOptions] = useState([{ value: '선택', label: '선택' }]);

  // 여행지 리스트 가져오기 & location 셋팅
  const fetchPostsTourList = async (selectedCity:any) => {
    let res = await axios.get(`${MainURL}/restproductschedule/getscheduleboxforpost/${selectedCity}`);
    if (res.data) {
      let copy = res.data;
      setTourLocationList(copy);
      const locationresult = copy.map((item:any)=>
        ({ value:`${item.location}`,  label:`${item.location}` })
      );
      locationresult.unshift({ value: '선택', label: '선택' });
      setLocationOptions(locationresult);
    }
  };

  const handleSubLocationOption = (text: string ) => {
    const tourLocationCopy = [...tourLocationList];
    const result = tourLocationCopy.filter((item:any)=> item.location === text);
    const locationresult = result.map((item:any)=>
      ({ value:`${item.subLocation}`,  label:`${item.subLocation}` })
    );
    locationresult.unshift({ value: '선택', label: '선택' });
    setSubLocationOptions(locationresult);
  }

  const handleSelectScheduleBoxChange = (index: number, subIndex: number, detailIndex:number, subDetailIndex:number, locationCopy:string, subLocationCopy:string ) => {
    const tourLocationCopy = [...tourLocationList];
    const result = tourLocationCopy.filter((item:any)=> item.location === locationCopy && item.subLocation === subLocationCopy );
    setselectedTourLocationList(result);
    const viewAutoComplete = [...viewAutoCompleteTourLocation];
    viewAutoComplete[index][subIndex][detailIndex][subDetailIndex] = true;
    setViewAutoCompleteTourLocation(viewAutoComplete);
    setIsViewSelectScheduleBoxModal(true);
  }
  

  // 데이 추가
  const handleDayAdd = async () => {
    const lastItem = scheduleList[scheduleList.length - 1]; 
    const newDay = parseInt(lastItem.day) + 1;
    setScheduleList([...scheduleList, {
      id: `${newDay}`,
      day: newDay.toString(),
      breakfast: lastItem.breakfast,
      lunch: lastItem.lunch,
      dinner: lastItem.dinner,
      hotel: lastItem.hotel,
      score: lastItem.score,
      scheduleDetail: [{ 
        id: '',
        isViaSort : '',
        sort: '',
        nation: '',
        city : '',
        location: '',
        locationDetail : [{
          subLocation: '',
          subLocationDetail : [{
            locationTitle: '',
            locationContent: '',
            postImage: ''
          }]
        }]
      }]
    }]);
    const viewAutoCopy = [...viewAutoCompleteTourLocation, [[[false]]]];
    setViewAutoCompleteTourLocation(viewAutoCopy)
  };

  // 데이 삭제
  const handleDayDelete = async (index:number) => {
    const copyScheduleList = [...scheduleList];
    copyScheduleList.splice(index, 1);
    setScheduleList(copyScheduleList);
    const viewAutoCopy = [...viewAutoCompleteTourLocation];
    viewAutoCopy.splice(index, 1);
    setViewAutoCompleteTourLocation(viewAutoCopy)
  };

  // 여행지 추가
  const handleLocationAdd = async (index:number) => {
    const inputs = [...scheduleList];
    inputs[index].scheduleDetail = [...inputs[index].scheduleDetail, 
      { id : '',  isViaSort : '', sort: '', nation: nation, city : '', location: '', 
        locationDetail:[
          {subLocation: '', subLocationDetail : [{locationTitle: '',locationContent: '', postImage: ''}]}
        ]}];
    setScheduleList(inputs);
    const viewAutoCopy = [...viewAutoCompleteTourLocation];
    viewAutoCopy[index] = [...viewAutoCopy[index], [[false]]];
    setViewAutoCompleteTourLocation(viewAutoCopy)
  };

   // 여행지 삭제
  const handleLocationDelete  = async (index:number, subIndex:number) => {
    const inputs = [...scheduleList];
    inputs[index].scheduleDetail.splice(subIndex, 1);
    setScheduleList(inputs);
    const viewAutoCopy = [...viewAutoCompleteTourLocation];
    viewAutoCopy[index].splice(subIndex, 1);
    setViewAutoCompleteTourLocation(viewAutoCopy)
  };
  
  // 여행지 디테일 추가
  const handleLocationDetailAdd = async (index:number, subIndex:number) => {
    const copy = [...scheduleList];
    copy[index].scheduleDetail[subIndex].locationDetail = [
      ...copy[index].scheduleDetail[subIndex].locationDetail, 
      {
        subLocation: '',
        subLocationDetail : [{
          locationTitle: '',
          locationContent: '',
          postImage: ''
        }]
      }
    ];
    setScheduleList(copy);
    const viewAutoCopy = [...viewAutoCompleteTourLocation];
    viewAutoCopy[index][subIndex] = [...viewAutoCopy[index][subIndex], [false]];
    setViewAutoCompleteTourLocation(viewAutoCopy)
  };

  // 여행지 디테일 삭제
  const handleLocationDetailDelete = async (index:number, subIndex:number, detailIndex:number) => {
    const copy = [...scheduleList];
    copy[index].scheduleDetail[subIndex].locationDetail.splice(detailIndex, 1);
    setScheduleList(copy);
    const viewAutoCopy = [...viewAutoCompleteTourLocation];
    viewAutoCopy[index][subIndex].splice(detailIndex, 1);
    setViewAutoCompleteTourLocation(viewAutoCopy)
  };

  // 여행지 디테일 추가
  const handleSubLocationDetailAdd = async (index:number, subIndex:number, detailIndex:number) => {
    const copy = [...scheduleList];
    copy[index].scheduleDetail[subIndex].locationDetail[detailIndex].subLocationDetail = [
      ...copy[index].scheduleDetail[subIndex].locationDetail[detailIndex].subLocationDetail, 
      {
        locationTitle: '',
        locationContent: '',
        postImage: ''
      }
    ];
    setScheduleList(copy);
    const viewAutoCopy = [...viewAutoCompleteTourLocation];
    viewAutoCopy[index][subIndex][detailIndex] = [...viewAutoCopy[index][subIndex][detailIndex], false];
    setViewAutoCompleteTourLocation(viewAutoCopy)
  };

  // 여행지 디테일 삭제
  const handleSubLocationDetailDelete = async (index:number, subIndex:number, detailIndex:number, subDetailIndex:number) => {
    const copy = [...scheduleList];
    copy[index].scheduleDetail[subIndex].locationDetail[detailIndex].subLocationDetail.splice(subDetailIndex, 1);
    setScheduleList(copy);
    const viewAutoCopy = [...viewAutoCompleteTourLocation];
    viewAutoCopy[index][subIndex][detailIndex].splice(subDetailIndex, 1);
    setViewAutoCompleteTourLocation(viewAutoCopy)
  };

  // 일정 데이별 디테일 등록&저장 함수 ----------------------------------------------
  const registerDetailPost = async (item:any) => {
    const getParams = {
      scheduleID : postId,
      day: item.day,
      breakfast: item.breackfast,
      lunch: item.lunch, 
      dinner: item.dinner,
      hotel: item.hotel,
      score: item.score,
      scheduleDetail: JSON.stringify(item.scheduleDetail)
    }
    axios 
      .post(`${MainURL}/restproductschedule/registerscheduledetail`, getParams)
      .then((res) => {
        if (res.data) {
          alert('저장되었습니다.');
          props.setRefresh(!props.refresh);
        }
      })
      .catch(() => {
        console.log('실패함')
      })
  };

  return (
    <div className='schedule-estimate-cover'>

      <section>
        { scheduleList.length > 0 
          ?
          scheduleList?.map((item:any, index:any)=>{

            return (
              <div className="schedule" key={index}>
                <div className="top-row">
                  <div className="daytitle">
                    <h1>{item.day} DAY</h1>
                  </div>
                  <div className="daymeal">
                    <p>조식</p>
                    <DropdownBox
                      widthmain='15%'
                      height='35px'
                      selectedValue={item.breakfast}
                      options={datmealOptions}    
                      handleChange={(e)=>{
                        const copy = [...scheduleList];
                        copy[index].breakfast = e.target.value;
                        setScheduleList(copy);
                      }}
                    />
                    <p>중식</p>
                    <DropdownBox
                      widthmain='15%'
                      height='35px'
                      selectedValue={item.lunch}
                      options={datmealOptions}    
                      handleChange={(e)=>{
                        const copy = [...scheduleList];
                        copy[index].lunch = e.target.value;
                        setScheduleList(copy);
                      }}
                    />
                    <p>석식</p>
                    <DropdownBox
                      widthmain='15%'
                      height='35px'
                      selectedValue={item.dinner}
                      options={datmealOptions}    
                      handleChange={(e)=>{
                        const copy = [...scheduleList];
                        copy[index].dinner = e.target.value;
                        setScheduleList(copy);
                      }}
                    />
                    <p>호텔</p>
                    <DropdownBox
                      widthmain='15%'
                      height='35px'
                      selectedValue={item.hotel}
                      options={hotelsOptions}
                      handleChange={(e)=>{
                        const copy = [...scheduleList];
                        copy[index].hotel = e.target.value;
                        setScheduleList(copy);
                      }}
                    />
                    <DropdownBox
                      widthmain='10%'
                      height='35px'
                      selectedValue={item.score}
                      options={[
                        { value: '선택', label: '선택' },
                        { value: '5', label: '5' },
                        { value: '4', label: '4' },
                        { value: '3', label: '3' },
                        { value: '2', label: '2' },
                        { value: '1', label: '1' },
                      ]}    
                      handleChange={(e)=>{
                        const copy = [...scheduleList];
                        copy[index].score = e.target.value;
                        setScheduleList(copy);
                      }}
                    />
                  </div>
                </div>

                <div className="bottom-content">
                  {
                    item.scheduleDetail?.map((subItem:any, subIndex:any)=>{ 

                      return (
                        <div className='input-area' key={subIndex}>
                          <div className="cover">
                            <div className='rowbox'>
                              <div className='icon-box'>
                                <ImLocation color='#5fb7ef' size={20}/>
                              </div>
                              {
                                subItem.location === '' 
                                ? 
                                <DropdownBox
                                  widthmain='30%'
                                  height='35px'
                                  selectedValue={subItem.location}
                                  options={locationOptions}
                                  handleChange={(e)=>{
                                    const inputs = [...scheduleList];
                                    inputs[index].scheduleDetail[subIndex].location = e.target.value;
                                    setScheduleList(inputs);
                                    handleSubLocationOption(e.target.value);
                                  }}
                                />
                                :
                                <input style={{width:'30%'}} value={subItem.location}
                                  className="inputdefault" type="text" maxLength={100}
                                />
                              }
                            </div>
                            {
                              subItem.locationDetail.map((detailItem:any, detailIndex:any)=>{

                                return (
                                  <div key={detailIndex}>
                                    <div className='rowbox'>
                                      <div className="icon-box">
                                        <div className="dot__icon" />
                                      </div>
                                      {
                                        detailItem.subLocation === '' 
                                        ? 
                                        <DropdownBox
                                          widthmain='30%'
                                          height='35px'
                                          selectedValue={detailItem.subLocation}
                                          options={subLocationOptions}
                                          handleChange={(e)=>{
                                            const inputs = [...scheduleList];
                                            inputs[index].scheduleDetail[subIndex].locationDetail[detailIndex].subLocation = e.target.value;
                                            setScheduleList(inputs);
                                          }}
                                        />
                                        :
                                        <input style={{width:'30%'}} value={detailItem.subLocation}
                                          className="inputdefault" type="text" maxLength={100}
                                        />
                                      }
                                      <div className="schedule-dayBox">
                                        <div className="schedule-dayBtn"
                                          onClick={()=>{
                                            handleLocationDetailAdd(index, subIndex)
                                          }}
                                        >
                                          <p>+</p>
                                        </div>
                                      </div>  
                                      <div className="schedule-dayBox">
                                        <div className="schedule-dayBtn"
                                          onClick={()=>{
                                            handleLocationDetailDelete(index, subIndex, detailIndex);
                                          }}
                                        >
                                          <p>-</p>
                                        </div>
                                      </div>  
                                    </div>
                                    {
                                      detailItem.subLocationDetail.map((subDetailItem:any, subDetailIndex:any)=>{

                                        const postImages = subDetailItem.postImage ? JSON.parse(subDetailItem.postImage) : "";

                                        return (
                                          <div className='rowbox' key={subDetailIndex}>
                                            <div className="icon-box" style={{flexDirection:'column'}}>
                                              <div className="schedule-dayBox">
                                                <div className="schedule-dayBtn"
                                                  onClick={()=>{
                                                    handleSubLocationDetailAdd(index, subIndex, detailIndex);
                                                  }}
                                                >
                                                  <p>+</p>
                                                </div>
                                              </div>  
                                              <div className="schedule-dayBox">
                                                <div className="schedule-dayBtn"
                                                  onClick={()=>{
                                                    handleSubLocationDetailDelete(index, subIndex, detailIndex, subDetailIndex);
                                                  }}
                                                >
                                                  <p>-</p>
                                                </div>
                                              </div>  
                                            </div>
                                            <div className='scheduletextbox'>
                                              <div className="scheduletextbox-imagebox">
                                                <div className="imagebox">
                                                  {
                                                    subDetailItem.postImage !== '' &&
                                                    <img style={{height:'100%', width:'100%'}}
                                                      src={`${MainURL}/lastimages/scheduleboximages/${postImages}`}
                                                    />
                                                  }                                                    
                                                </div>
                                              </div>
                                              <div className="scheduletextbox-textbox">
                                                <input style={{width:'95%'}} value={subDetailItem.locationTitle} 
                                                  className="inputdefault" type="text" maxLength={100}
                                                  onClick={(e) => {
                                                    if (nation === '' || tourLocation === '') {
                                                      alert('먼저 국가/도시를 선택하셔야 합니다.')
                                                    } else {
                                                      handleSelectScheduleBoxChange(index, subIndex, detailIndex, subDetailIndex, subItem.location, detailItem.subLocation)
                                                    }
                                                  }}
                                                  onChange={(e)=>{
                                                    const copy = [...scheduleList];
                                                    copy[index].scheduleDetail[subIndex].locationDetail[detailIndex].subLocationDetail[subDetailIndex].locationTitle = e.target.value
                                                    setScheduleList(copy);
                                                  }}
                                                />
                                                <textarea 
                                                  className="textarea" style={{minHeight: '150px'}}
                                                  maxLength={300}
                                                  value={subDetailItem.locationContent}
                                                  onChange={(e)=>{
                                                    const copy = [...scheduleList];
                                                    copy[index].scheduleDetail[subIndex].locationDetail[detailIndex].subLocationDetail[subDetailIndex].locationContent = e.target.value
                                                    setScheduleList(copy);
                                                  }}
                                                />
                                              </div>
                                            </div>
                                            { (isViewSelectScheduleBoxModal && viewAutoCompleteTourLocation[index][subIndex][detailIndex][subDetailIndex]) &&
                                              <div className="selectScheduleBox-autoComplete">
                                                {/* <ModalSelectScheduleBox
                                                  refresh={refresh}
                                                  setRefresh={setRefresh}
                                                  setIsViewSelectScheduleBoxModal={setIsViewSelectScheduleBoxModal}
                                                  viewAutoCompleteTourLocation={viewAutoCompleteTourLocation}
                                                  setViewAutoCompleteTourLocation={setViewAutoCompleteTourLocation}
                                                  nation={nation}
                                                  selectedTourLocationList={selectedTourLocationList}
                                                  scheduleList={scheduleList}
                                                  setScheduleList={setScheduleList}
                                                  index={index}
                                                  subIndex={subIndex}
                                                  detailIndex={detailIndex}
                                                  subDetailIndex={subDetailIndex}
                                                /> */}
                                              </div>  
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
                          <div className="btnrow">
                            <div className="btn" style={{backgroundColor:"#fff", margin:'10px 10px'}}
                              onClick={()=>{
                                handleLocationDelete(index, subIndex);
                              }}>
                              <p><CiCircleMinus/>여행지삭제</p>
                            </div>
                            <div className="btn" style={{backgroundColor:"#EAEAEA", margin:'10px 0'}}
                              onClick={()=>{
                                handleLocationAdd(index);
                              }}>
                              <p><CiCirclePlus />여행지추가</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
                <div style={{width:'100%', height:'1px', backgroundColor:'#BDBDBD'}}></div>
                <div className='btn-box' style={{marginTop:'20px'}}>
                  <div className="btn" style={{backgroundColor:'#5fb7ef'}}
                      onClick={()=>{
                        registerDetailPost(item);
                      }}
                    >
                    <p>{item.day}DAY 저장</p>
                  </div>
                </div>
                {
                  scheduleList.length - 1 === index &&
                  <div className="daybtnrow"  style={{marginTop:'20px'}}>
                    <div className="daybtn" style={{width:'25%', backgroundColor:"#fff"}}
                      onClick={()=>{
                        handleDayDelete(index);
                      }}>
                      <CiCircleMinus /><p>DAY삭제</p>
                    </div>
                    <div className="daybtn" style={{width:'70%', backgroundColor:"#EAEAEA"}}
                        onClick={()=>{
                          handleDayAdd();
                        }}>
                      <CiCirclePlus /><p>DAY추가</p>
                    </div>
                  </div>
                }
              </div>      
            )
          })
          :
          <div className="daybtnrow"  style={{marginTop:'20px'}}>
            <div className="daybtn" style={{width:'70%', backgroundColor:"#EAEAEA"}}
                onClick={()=>{
                  setScheduleList(
                    [{
                      id: ``,
                      day: '1',
                      breakfast: '',
                      lunch: '',
                      dinner: '',
                      hotel: '',
                      score: '',
                      scheduleDetail: [{ 
                        id: '',
                        isViaSort : '',
                        sort: '',
                        nation: '',
                        city : '',
                        location: '',
                        locationDetail : [{
                          subLocation: '',
                          subLocationDetail : [{
                            locationTitle: '',
                            locationContent: '',
                            postImage: ''
                          }]
                        }]
                      }]
                    }]
                  )
                }}>
              <CiCirclePlus /><p>DAY추가</p>
            </div>
          </div>
        }
              
      </section>
      
      <div className='btn-box' style={{width:'100%', justifyContent:'center', marginTop:'20px'}}>
        <div className="btn" style={{width:'97%', backgroundColor:'#5fb7ef', textAlign:'center'}}
          onClick={()=>{
          
          }}
        >
          <p style={{fontWeight:'bold'}}>견적표 미리보기</p>
        </div>
      </div>
      
    </div>
  )
}
