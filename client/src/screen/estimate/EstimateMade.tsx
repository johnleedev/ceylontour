import React, { useState } from 'react'
import "./Estimate.scss";
import { TitleBox } from '../../boxs/TitleBox';
import { FiMinusCircle } from 'react-icons/fi';
import { DropdownBox } from '../../boxs/DropdownBox';
import { DropDownAirline, DropDownPackageType, DropDownTourPeriodDayType, DropDownTourPeriodNightType } from '../DefaultData';
import { BiSolidArrowFromLeft, BiSolidArrowFromRight, BiSolidArrowToLeft, BiSolidArrowToRight, BiSolidLeftArrowAlt, BiSolidRightArrowAlt } from 'react-icons/bi';
import EstimateSchedule from './EstimateSchedule';
import EstimateSample from './EstimateSample';


interface AirlineProps {
  sort : string;
  airlineName: string;
  departDate: string[];
  planeName: string;
  departAirport: string;
  departTime: string;
  arriveAirport: string;
  arriveTime: string;
}
interface DirectProps {
  id : string;
  tourPeriodNight: string;
  tourPeriodDay: string;
  departAirportMain : string;
  departAirline: string;
  airlineData: AirlineProps[];
}   
interface ViaProps {
  id : string;
  tourPeriodNight: string;
  tourPeriodDay: string;
  departAirportMain : string;
  departAirline: string;
  airlineData: AirlineProps[];
}   

interface ResortListProps {
  sort: string;
  cityName : string;
  resortName : string;
  roomType : string;
  checkin : string;
  nightNum : string;
};

interface CustomOrderProps {
  no: string;
  productName : string;
  program : string;
  personCost : string;
  allCost : string;
};

export default function EstimateMade (props:any) {

  const isAddOrRevise = props.isAddOrRevise;

	const [selectSort, setSelectSort] = useState('휴양지');
  const [airlineSelectInput, setAirlineSelectInput] = useState('direct');
  
  const [directAirline, setDirectAirline] = useState<DirectProps[]>(
    isAddOrRevise === 'revise' ? props.directAirlineData : []
  )
  const [viaAirline, setViaAirline] = useState<ViaProps[]>(
    isAddOrRevise === 'revise' ? props.viaAirlineData : []
  )

  const [resortList, setResortList] = useState<ResortListProps[]>(
    [
      {sort: "선투숙", cityName : "", resortName : "", roomType : "", checkin:"", nightNum:""},
      {sort: "메인리조트1", cityName : "", resortName : "", roomType : "", checkin:"", nightNum:""},
      {sort: "메인리조트2", cityName : "", resortName : "", roomType : "", checkin:"", nightNum:""},
    ]
  );

  const [customOrder, setCustomOrder] = useState<CustomOrderProps[]>(
    [
      {no: "1", productName : "", program : "", personCost : "", allCost : ""},
    ]
  );

  // common style
  const verticalBar40 = {width:'1px', minHeight:'40px', backgroundColor:'#d4d4d4'};

  return (
    <div className='estimate'>
      <div className='menucover'></div>

      
      <div className="inner">
        <div className="create-product-cover">

          <div className="modal-header">
            <h1>상품만들기</h1>
          </div>

          <div className="sortBtnbox">
            <div className="sortBtn"
              style={{backgroundColor: selectSort === '휴양지' ? '#242d3f' : '#fff'}}
              onClick={()=>{setSelectSort('휴양지');}}
            >
              <p style={{color: selectSort === '휴양지' ? '#fff' : '#333'}}>휴양지</p>
            </div>
            <div className="sortBtn"
              style={{backgroundColor: selectSort === '유럽' ? '#242d3f' : '#fff'}}
              onClick={()=>{setSelectSort('유럽');}}
            >
              <p style={{color: selectSort === '유럽' ? '#fff' : '#333'}}>유럽</p>
            </div>
          </div>

          <div style={{height:20}}></div>
          <div className="modal-header">
            <p>고객요청사항</p>
          </div>

          <section>
            <div className="bottombar"></div>
            <div className="coverbox">
              <div className="coverrow half">
                <TitleBox width="120px" text='이름'/>
                <p></p>
              </div>
              <div className="coverrow half">
                <TitleBox width="120px" text='연락처'/>
                <p></p>
              </div>
            </div>
            <div className="coverbox">
              <div className="coverrow half">
                <TitleBox width="120px" text='방문경로'/>
                <p></p>
              </div>
              <div className="coverrow half">
                <TitleBox width="120px" text='요청일'/>
                <p></p>
              </div>
            </div>
            <div className="coverbox">
              <div className="coverrow hole">
                <TitleBox width="120px" text='참고일정'/>
                <p></p>
              </div>
            </div>
            <div className="coverbox">
              <div className="coverrow hole">
                <TitleBox width="120px" text='여행기간'/>
                <p></p>
                {/* <input className="inputdefault" type="text" style={{width:'60%', marginLeft:'5px'}} 
                  value={''} onChange={(e)=>{
                    // setLandBenefit(e.target.value)
                  }}/> */}
              </div>
            </div>
            <div className="coverbox">
              <div className="coverrow hole">
                <TitleBox width="120px" text='요청사항'/>
                <p></p>
              </div>
            </div>
          </section>

          {/* 항공스케줄 ------------------------------------------------------------------------------ */}

          <div style={{height:50}}></div>
          <div className="modal-header">
            <p>항공스케줄</p>
          </div>

          <div className="selectInputBtnBox">
            <div className="selectInputBtn"
              onClick={()=>{setAirlineSelectInput('direct')}}
              style={{backgroundColor: airlineSelectInput === 'direct' ? '#242d3f' : '#fff', 
                color: airlineSelectInput === 'direct' ? '#fff' : '#333' }}
            >직항</div>
            <div className="selectInputBtn"
              onClick={()=>{setAirlineSelectInput('via')}}
              style={{backgroundColor: airlineSelectInput === 'via' ? '#242d3f' : '#fff', 
                color: airlineSelectInput === 'via' ? '#fff' : '#333' }}
            >경유</div>
            <div className="selectInputBtn"
              onClick={()=>{
                if (airlineSelectInput === 'direct') {
                  const copy = [...directAirline]
                  if (copy.length === 0) {
                    setDirectAirline([...directAirline, 
                      {id: "", tourPeriodNight: "", tourPeriodDay: "", departAirportMain : "",  departAirline : "",
                        airlineData : [
                          { sort:"depart", airlineName:"", departDate:[], planeName:"", departAirport:"", departTime:"", arriveAirport:"", arriveTime:""},
                          { sort:"arrive", airlineName:"", departDate:[], planeName:"", departAirport:"", departTime:"", arriveAirport:"", arriveTime:""}
                        ]
                      }]
                    )
                  } else {
                    const lastItem = copy[copy.length - 1];
                    setDirectAirline([...directAirline, 
                      {id: "", tourPeriodNight: "", tourPeriodDay: "", departAirportMain : lastItem.departAirportMain,  departAirline : "",
                        airlineData : [
                          { sort:"depart", airlineName:"", departDate:[], planeName:"", departAirport:lastItem.airlineData[0].departAirport, departTime:"", arriveAirport:lastItem.airlineData[0].arriveAirport, arriveTime:""},
                          { sort:"arrive", airlineName:"", departDate:[], planeName:"", departAirport:lastItem.airlineData[1].departAirport, departTime:"", arriveAirport:lastItem.airlineData[1].arriveAirport, arriveTime:""}
                        ]
                      }]
                    )
                  }
                } else if (airlineSelectInput === 'via') {
                  const copy = [...viaAirline];
                  if (copy.length === 0) { 
                    setViaAirline([...viaAirline,
                      {id: "", tourPeriodNight: "", tourPeriodDay: "", departAirportMain : "",  departAirline : "",
                        airlineData : [
                          { sort:"depart", airlineName:"", departDate:[], planeName:"", departAirport:"", departTime:"", arriveAirport:"", arriveTime:""},
                          { sort:"viaArrive", airlineName:"", departDate:[], planeName:"", departAirport:"", departTime:"", arriveAirport:"", arriveTime:""},
                          { sort:"viaDepart", airlineName:"", departDate:[], planeName:"", departAirport:"", departTime:"", arriveAirport:"", arriveTime:""},
                          { sort:"arrive", airlineName:"", departDate:[], planeName:"", departAirport:"", departTime:"", arriveAirport:"", arriveTime:""},
                        ]
                      }
                    ])
                  } else {
                    const lastItem = copy[copy.length - 1];
                    setViaAirline([...viaAirline,
                      {id: "", tourPeriodNight: "", tourPeriodDay: "", departAirportMain : lastItem.departAirportMain,  departAirline : "",
                        airlineData : [
                          { sort:"depart", airlineName:"", departDate:[], planeName:"", departAirport:lastItem.airlineData[0].departAirport, departTime:"", arriveAirport:lastItem.airlineData[0].arriveAirport, arriveTime:""},
                          { sort:"viaArrive", airlineName:"", departDate:[], planeName:"", departAirport:lastItem.airlineData[1].departAirport, departTime:"", arriveAirport:lastItem.airlineData[1].arriveAirport, arriveTime:""},
                          { sort:"viaDepart", airlineName:"", departDate:[], planeName:"", departAirport:lastItem.airlineData[2].departAirport, departTime:"", arriveAirport:lastItem.airlineData[2].arriveAirport, arriveTime:""},
                          { sort:"arrive", airlineName:"", departDate:[], planeName:"", departAirport:lastItem.airlineData[3].departAirport, departTime:"", arriveAirport:lastItem.airlineData[3].arriveAirport, arriveTime:""},
                        ]
                      }
                    ])
                  }
                  
                }
              }}
              style={{width:'50px', backgroundColor: '#fff', color: '#333' }}
            >+</div>
          </div>
          
          {/* 직항 ----------------- */}
          <div style={{marginBottom:'50px'}}>
          { 
            airlineSelectInput === 'direct' &&
            <section>
              <div className="bottombar"></div>
              <div className='chart-box-cover' style={{backgroundColor:'#EAEAEA'}}>
                <div className='chartbox' style={{width:'13%'}} ><p>기간</p></div>
                <div className="chart-divider"></div>
                <div className='chartbox' style={{width:'7%'}} ><p>출발공항</p></div>
                <div className="chart-divider"></div>
                <div className='chartbox' style={{width:'7%'}} ><p>출발편명</p></div>
                <div className="chart-divider"></div>
                <div style={{width:'73%', display:'flex'}}>
                  <div className='chartbox' style={{width:'3%'}} ><p></p></div>
                  <div className="chart-divider"></div>
                  <div className='chartbox' style={{width:'12%'}} ><p>항공사</p></div>
                  <div className="chart-divider"></div>
                  <div className='chartbox' style={{width:'25%'}} ><p>출발요일</p></div>
                  <div className="chart-divider"></div>
                  <div className='chartbox' style={{width:'12%'}} ><p>편명</p></div>
                  <div className="chart-divider"></div>
                  <div className='chartbox' style={{width:'12%'}} ><p>출발공항</p></div>
                  <div className="chart-divider"></div>
                  <div className='chartbox' style={{width:'12%'}} ><p>출발시간</p></div>
                  <div className="chart-divider"></div>
                  <div className='chartbox' style={{width:'12%'}} ><p>도착공항</p></div>
                  <div className="chart-divider"></div>
                  <div className='chartbox' style={{width:'12%'}} ><p>도착시간</p></div>
                </div>
              </div>
              
              {
                directAirline.map((item:any, index:any)=>{
                  return (
                    <div className="coverbox">
                      <div className="coverrow hole">
                        <div style={{width:'13%', display:'flex', alignItems:'center'}} >
                          <div className='deleteRowBtn'
                            onClick={()=>{
                              
                            }}
                            ><FiMinusCircle  color='#FF0000'/>
                          </div>
                          <DropdownBox
                            widthmain='45%'
                            height='35px'
                            selectedValue={item.tourPeriodNight}
                            options={DropDownTourPeriodNightType}    
                            handleChange={(e)=>{
                              const copy = [...directAirline];
                              copy[index].tourPeriodNight = e.target.value;
                              setDirectAirline(copy);
                            }}
                          />
                          <DropdownBox
                            widthmain='45%'
                            height='35px'
                            selectedValue={item.tourPeriodDay}
                            options={DropDownTourPeriodDayType}    
                            handleChange={(e)=>{
                              const copy = [...directAirline];
                              copy[index].tourPeriodDay = e.target.value;
                              setDirectAirline(copy);
                            }}
                          />
                        </div>
                        <div style={{width:'1px', minHeight:'80px', backgroundColor:'#d4d4d4'}}></div>
                        <div style={{width:'7%'}} >
                          <DropdownBox
                            widthmain='90%'
                            height='35px'
                            selectedValue={item.departAirportMain}
                            options={[
                              { value: '선택', label: '선택' },
                              { value: '인천공항', label: '인천공항' },
                              { value: '대구공항', label: '대구공항' },
                              { value: '김해공항', label: '김해공항' }
                            ]}    
                            handleChange={(e)=>{
                              const copy = [...directAirline];
                              copy[index].departAirportMain = e.target.value;
                              setDirectAirline(copy);
                            }}
                          />
                        </div>
                        <div style={{width:'1px', minHeight:'80px', backgroundColor:'#d4d4d4'}}></div>
                        <div style={{width:'7%'}} >
                          <input className="inputdefault" type="text" style={{width:'90%', marginLeft:'5px', height:'35px'}} 
                            value={item.departAirline}
                            onChange={(e)=>{
                              const inputtext = e.target.value;
                              const copy = [...directAirline];
                              copy[index].departAirline = inputtext;
                              copy[index].airlineData[0].planeName = inputtext;
                              setDirectAirline(copy);
                            }}/>
                        </div>
                        <div style={{width:'1px', minHeight:'80px', backgroundColor:'#d4d4d4'}}></div>
                        <div style={{width:'73%'}} >
                        {
                          item.airlineData.map((subItem:any, subIndex:any)=>{
                            return (
                              <div style={{width:'100%', display:'flex', alignItems:'center'}} >
                                <div style={{width:'3%', display:'flex', alignItems:'center', justifyContent:'center'}} >
                                  { subItem.sort === 'depart' && <BiSolidRightArrowAlt /> }
                                  { subItem.sort === 'arrive' && <BiSolidLeftArrowAlt /> }
                                </div>
                                <div style={verticalBar40}></div>
                                <div style={{width:'12%'}} >
                                  <DropdownBox
                                    widthmain='90%'
                                    height='35px'
                                    selectedValue={subItem.airlineName}
                                    options={DropDownAirline}    
                                    handleChange={(e)=>{
                                    
                                    }}
                                  />
                                </div>
                                <div style={verticalBar40}></div>
                                <div style={{width:'25%'}} >
                                  <div className="dayBox">
                                    {
                                      ['월', '화', '수', '목', '금', '토', '일'].map((dateItem:any, dateIndex:any)=>{
                                        return (
                                          <div className="dayBtn" key={dateIndex}
                                          style={{backgroundColor:subItem.departDate.includes(dateItem) ? '#5fb7ef' : '#fff'}}
                                            onClick={()=>{
                                              const copy = [...directAirline]; 
                                              if (copy[index].airlineData[subIndex].departDate.includes(dateItem)) {
                                                const filteredDates = copy[index].airlineData[subIndex].departDate.filter(filterItem => filterItem !== dateItem);
                                                copy[index].airlineData[subIndex].departDate = filteredDates;
                                                setDirectAirline(copy);
                                              } else {
                                                copy[index].airlineData[subIndex].departDate.push(dateItem);
                                                setDirectAirline(copy);
                                              }
                                            }}
                                          ><p>{dateItem}</p></div>
                                        )
                                      })
                                    }
                                    <div className="dayBtn" 
                                      style={{backgroundColor:'#ccc'}}
                                      onClick={()=>{
                                        const copy = [...directAirline]; 
                                          copy[index].airlineData[subIndex].departDate = ['월', '화', '수', '목', '금', '토', '일'];
                                          setDirectAirline(copy);
                                      }}
                                    ><p>All</p></div>
                                  </div>
                                </div>
                                <div style={verticalBar40}></div>
                                <div style={{width:'12%'}} >
                                  <input className="inputdefault" type="text" style={{width:'90%', marginLeft:'5px'}} 
                                    value={subItem.planeName}
                                    onChange={(e)=>{
                                      const inputtext = e.target.value;
                                      const copy = [...directAirline];
                                      copy[index].departAirline = inputtext;
                                      copy[index].airlineData[subIndex].planeName = inputtext;
                                      setDirectAirline(copy);
                                    }}/>
                                </div>
                                <div style={verticalBar40}></div>
                                <div style={{width:'12%'}} >
                                  <input className="inputdefault" type="text" style={{width:'90%', marginLeft:'5px'}} 
                                    value={subItem.departAirport} 
                                    onChange={(e)=>{
                                      
                                      }}/>
                                </div>
                                <div style={verticalBar40}></div>
                                <div style={{width:'12%'}} >
                                  <input className="inputdefault" type="text" style={{width:'90%', marginLeft:'5px'}} 
                                    value={subItem.departTime} 
                                    onChange={(e)=>{
                                      
                                    }}/>
                                </div>
                                <div style={verticalBar40}></div>
                                <div style={{width:'12%'}} >
                                  <input className="inputdefault" type="text" style={{width:'90%', marginLeft:'5px'}} 
                                    value={subItem.arriveAirport} 
                                    onChange={(e)=>{}}/>
                                </div>
                                <div style={verticalBar40}></div>
                                <div style={{width:'12%'}} >
                                  <input className="inputdefault" type="text" style={{width:'90%', marginLeft:'5px'}} 
                                    value={subItem.arriveTime} 
                                    onChange={(e)=>{

                                    }}/>
                                </div>
                              </div>
                            )
                          })
                        }
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </section>
          }
          
          {/* 경유 ----------------- */}
          {
            airlineSelectInput === 'via' &&
            <section>
              <div className="bottombar"></div>
              <div className='chart-box-cover' style={{backgroundColor:'#EAEAEA'}}>
                <div className='chartbox' style={{width:'13%'}} ><p>기간</p></div>
                <div className="chart-divider"></div>
                <div className='chartbox' style={{width:'7%'}} ><p>출발공항</p></div>
                <div className="chart-divider"></div>
                <div className='chartbox' style={{width:'7%'}} ><p>출발편명</p></div>
                <div className="chart-divider"></div>
                <div style={{width:'73%', display:'flex'}}>
                  <div className='chartbox' style={{width:'3%'}} ><p></p></div>
                  <div className="chart-divider"></div>
                  <div className='chartbox' style={{width:'12%'}} ><p>항공사</p></div>
                  <div className="chart-divider"></div>
                  <div className='chartbox' style={{width:'25%'}} ><p>출발요일</p></div>
                  <div className="chart-divider"></div>
                  <div className='chartbox' style={{width:'12%'}} ><p>편명</p></div>
                  <div className="chart-divider"></div>
                  <div className='chartbox' style={{width:'12%'}} ><p>출발공항</p></div>
                  <div className="chart-divider"></div>
                  <div className='chartbox' style={{width:'12%'}} ><p>출발시간</p></div>
                  <div className="chart-divider"></div>
                  <div className='chartbox' style={{width:'12%'}} ><p>도착공항</p></div>
                  <div className="chart-divider"></div>
                  <div className='chartbox' style={{width:'12%'}} ><p>도착시간</p></div>
                </div>
              </div>
              
              {
                viaAirline.map((item:any, index:any)=>{
                  return (
                    <div className="coverbox">
                      <div className="coverrow hole">
                        <div style={{width:'13%', display:'flex', alignItems:'center'}} >
                          <div className='deleteRowBtn'
                            onClick={()=>{
                              
                            }}
                            ><FiMinusCircle  color='#FF0000'/>
                          </div>
                          <DropdownBox
                            widthmain='45%'
                            height='35px'
                            selectedValue={item.tourPeriodNight}
                            options={DropDownTourPeriodNightType}    
                            handleChange={(e)=>{
                              const copy = [...viaAirline];
                              copy[index].tourPeriodNight = e.target.value;
                              setViaAirline(copy);
                            }}
                          />
                          <DropdownBox
                            widthmain='45%'
                            height='35px'
                            selectedValue={item.tourPeriodDay}
                            options={DropDownTourPeriodDayType}    
                            handleChange={(e)=>{
                              const copy = [...viaAirline];
                              copy[index].tourPeriodDay = e.target.value;
                              setViaAirline(copy);
                            }}
                          />
                        </div>
                        <div style={{width:'1px', minHeight:'160px', backgroundColor:'#d4d4d4'}}></div>
                        <div style={{width:'7%'}} >
                          <DropdownBox
                            widthmain='90%'
                            height='35px'
                            selectedValue={item.departAirportMain}
                            options={[
                              { value: '선택', label: '선택' },
                              { value: '인천공항', label: '인천공항' },
                              { value: '대구공항', label: '대구공항' },
                              { value: '김해공항', label: '김해공항' }
                            ]}    
                            handleChange={(e)=>{
                              const copy = [...viaAirline];
                              copy[index].departAirportMain = e.target.value;
                              setViaAirline(copy);
                            }}
                          />
                        </div>
                        <div style={{width:'1px', minHeight:'160px', backgroundColor:'#d4d4d4'}}></div>
                        <div style={{width:'7%'}} >
                          <input className="inputdefault" type="text" style={{width:'90%', marginLeft:'5px', height:'35px'}} 
                            value={item.departAirline}
                            onChange={(e)=>{
                              const inputtext = e.target.value;
                              const copy = [...viaAirline];
                              copy[index].departAirline = inputtext;
                              copy[index].airlineData[0].planeName = inputtext;
                              setViaAirline(copy);
                            }}/>
                        </div>
                        <div style={{width:'1px', minHeight:'160px', backgroundColor:'#d4d4d4'}}></div>
                        <div style={{width:'73%'}} >
                        {
                          item.airlineData.map((subItem:any, subIndex:any)=>{
                            return (
                              <div style={{width:'100%', display:'flex', alignItems:'center'}} >
                                <div style={{width:'3%', display:'flex', alignItems:'center', justifyContent:'center'}} >
                                  { subItem.sort === 'depart' && <BiSolidArrowToRight /> }
                                  { subItem.sort === 'viaArrive' && <BiSolidArrowFromLeft /> }
                                  { subItem.sort === 'viaDepart' && <BiSolidArrowToLeft /> }
                                  { subItem.sort === 'arrive' && <BiSolidArrowFromRight /> }
                                </div>
                                <div style={verticalBar40}></div>
                                <div style={{width:'12%'}} >
                                  <DropdownBox
                                    widthmain='90%'
                                    height='35px'
                                    selectedValue={subItem.airlineName}
                                    options={DropDownAirline}    
                                    handleChange={(e)=>{
                                    
                                    }}
                                  />
                                </div>
                                <div style={verticalBar40}></div>
                                <div style={{width:'25%'}} >
                                  <div className="dayBox">
                                    {
                                      ['월', '화', '수', '목', '금', '토', '일'].map((dateItem:any, dateIndex:any)=>{
                                        return (
                                          <div className="dayBtn" key={dateIndex}
                                          style={{backgroundColor:subItem.departDate.includes(dateItem) ? '#5fb7ef' : '#fff'}}
                                            onClick={()=>{
                                              const copy = [...viaAirline]; 
                                              if (copy[index].airlineData[subIndex].departDate.includes(dateItem)) {
                                                const filteredDates = copy[index].airlineData[subIndex].departDate.filter(filterItem => filterItem !== dateItem);
                                                copy[index].airlineData[subIndex].departDate = filteredDates;
                                                setViaAirline(copy);
                                              } else {
                                                copy[index].airlineData[subIndex].departDate.push(dateItem);
                                                setViaAirline(copy);
                                              }
                                            }}
                                          ><p>{dateItem}</p></div>
                                        )
                                      })
                                    }
                                    <div className="dayBtn" 
                                      style={{backgroundColor:'#ccc'}}
                                      onClick={()=>{
                                        const copy = [...viaAirline]; 
                                        copy[index].airlineData[subIndex].departDate = ['월', '화', '수', '목', '금', '토', '일'];
                                        setViaAirline(copy);
                                      }}
                                    ><p>All</p></div>
                                  </div>
                                </div>
                                <div style={verticalBar40}></div>
                                <div style={{width:'12%'}} >
                                  <input className="inputdefault" type="text" style={{width:'90%', marginLeft:'5px'}} 
                                    value={subItem.planeName} 
                                    onChange={(e)=>{
                                      const inputtext = e.target.value;
                                      const copy = [...viaAirline];
                                      copy[index].departAirline = inputtext;
                                      copy[index].airlineData[subIndex].planeName = inputtext;
                                      setViaAirline(copy);
                                    }}/>
                                </div>
                                <div style={verticalBar40}></div>
                                <div style={{width:'12%'}} >
                                  <input className="inputdefault" type="text" style={{width:'90%', marginLeft:'5px'}} 
                                    value={subItem.departAirport} 
                                    onChange={(e)=>{
                                      
                                      }}/>
                                </div>
                                <div style={verticalBar40}></div>
                                <div style={{width:'12%'}} >
                                  <input className="inputdefault" type="text" style={{width:'90%', marginLeft:'5px'}} 
                                    value={subItem.departTime} 
                                    onChange={(e)=>{}}/>
                                </div>
                                <div style={verticalBar40}></div>
                                <div style={{width:'12%'}} >
                                  <input className="inputdefault" type="text" style={{width:'90%', marginLeft:'5px'}} 
                                    value={subItem.arriveAirport} 
                                    onChange={(e)=>{}}/>
                                </div>
                                <div style={verticalBar40}></div>
                                <div style={{width:'12%'}} >
                                  <input className="inputdefault" type="text" style={{width:'90%', marginLeft:'5px'}} 
                                    value={subItem.arriveTime} 
                                    onChange={(e)=>{}}/>
                                </div>
                              </div>
                            )
                          })
                        }
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </section>
          }
          </div>

          {/* 리조트 ------------------------------------------------------------------------------ */}

          <div style={{height:20}}></div>
          <div className="modal-header">
            <p>리조트</p>
          </div>


          <section>
            <div className="bottombar"></div>
            <div className='chart-box-cover' style={{backgroundColor:'#EAEAEA'}}>
              <div className='chartbox' style={{width:'15%'}} ><p>구분</p></div>
              <div className="chart-divider"></div>
              <div className='chartbox' style={{width:'20%'}} ><p>도시</p></div>
              <div className="chart-divider"></div>
              <div className='chartbox' style={{width:'20%'}} ><p>리조트명</p></div>
              <div className="chart-divider"></div>
              <div className='chartbox' style={{width:'20%'}} ><p>룸타입</p></div>
              <div className="chart-divider"></div>
              <div className='chartbox' style={{width:'10%'}} ><p>체크인</p></div>
              <div className="chart-divider"></div>
              <div className='chartbox' style={{width:'10%'}} ><p>박수</p></div>
              <div className="chart-divider"></div>
              <div className='chartbox' style={{width:'5%'}} ><p></p></div>
            </div>
            {
              resortList.map((item:any, index:any)=>{
                return (
                  <div className="coverbox">
                    <div className="coverrow hole" style={{minHeight:'60px'}} >
                      <div style={{width:'15%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        {
                          item.sort === '' 
                          ?
                          <DropdownBox
                            widthmain='95%'
                            height='35px'
                            selectedValue={''}
                            options={[
                              { value: '선투숙', label: '선투숙' },
                              { value: '메인리조트1', label: '메인리조트1' },
                              { value: '메인리조트2', label: '메인리조트2' },
                              { value: '메인리조트3', label: '메인리조트3' }
                            ]}    
                            handleChange={(e)=>{const copy = [...resortList]; copy[index].sort = e.target.value; setResortList(copy);}}
                          />
                          :
                          <p>{item.sort}</p>
                        }
                      </div>
                      <div style={{width:'1px', height:'inherit', backgroundColor:'#d4d4d4'}}></div>
                      <div style={{width:'20%', display:'flex'}} >
                        <input className="inputdefault" style={{width:'95%', marginLeft:'5px', minHeight:'40px', outline:'none'}} 
                          value={item.cityName} onChange={(e)=>{
                              const copy = [...resortList]; copy[index].cityName = e.target.value; setResortList(copy);
                            }}/>
                      </div>
                      <div style={{width:'1px', height:'inherit', backgroundColor:'#d4d4d4'}}></div>
                      <div style={{width:'20%'}} >
                        <input className="inputdefault" style={{width:'95%', marginLeft:'5px', minHeight:'40px', outline:'none'}} 
                            value={item.resortName} onChange={(e)=>{
                              const copy = [...resortList]; copy[index].resortName = e.target.value; setResortList(copy);
                            }}/>
                      </div>
                      <div style={{width:'1px', height:'inherit', backgroundColor:'#d4d4d4'}}></div>
                      <div style={{width:'20%'}} >
                        <input className="inputdefault" type="text" style={{width:'100%', marginRight:'5px', textAlign:'right', paddingRight:'5px'}} 
                          value={item.roomType} onChange={(e)=>{
                            const copy = [...resortList]; copy[index].roomType = e.target.value; setResortList(copy);
                          }}/>
                      </div>
                      <div style={{width:'10%'}} >
                        <input className="inputdefault" type="text" style={{width:'100%', marginRight:'5px', textAlign:'right', paddingRight:'5px'}} 
                          value={item.checkin} onChange={(e)=>{
                            const copy = [...resortList]; copy[index].checkin = e.target.value; setResortList(copy);
                          }}/>
                      </div>
                      <div style={{width:'10%'}} >
                        <input className="inputdefault" type="text" style={{width:'100%', marginRight:'5px', textAlign:'right', paddingRight:'5px'}} 
                          value={item.nightNum} onChange={(e)=>{
                            const copy = [...resortList]; copy[index].nightNum = e.target.value; setResortList(copy);  
                          }}/>
                      </div>
                      <div className="dayBox" style={{width:'5%'}}>
                        <div className="dayBtn"
                          onClick={()=>{
                            const copy = [...resortList, {sort: "", cityName : "", resortName : "", roomType : "", checkin:"", nightNum:""}];
                            setResortList(copy);
                          }}
                        >
                          <p>+</p>
                        </div>
                        <div className="dayBtn"
                          onClick={()=>{
                            const copy = [...resortList];
                            copy.splice(index, 1);
                            setResortList(copy);
                          }}
                        >
                          <p>-</p>
                        </div>
                      </div>  
                    </div>
                  </div>
                )
              })
            }
          </section>

          {/* 커스텀오더 ------------------------------------------------------------------------------ */}

          <div style={{height:50}}></div>
          <div className="modal-header">
            <p>커스텀오더</p>
          </div>

          <section>
            <div className="bottombar"></div>
            <div className='chart-box-cover' style={{backgroundColor:'#EAEAEA'}}>
              <div className='chartbox' style={{width:'5%'}} ><p>No</p></div>
              <div className="chart-divider"></div>
              <div className='chartbox' style={{width:'20%'}} ><p>품목</p></div>
              <div className="chart-divider"></div>
              <div className='chartbox' style={{width:'30%'}} ><p>세부내용/프로그램</p></div>
              <div className="chart-divider"></div>
              <div className='chartbox' style={{width:'20%'}} ><p>1인요금</p></div>
              <div className="chart-divider"></div>
              <div className='chartbox' style={{width:'20%'}} ><p>합계</p></div>
              <div className="chart-divider"></div>
              <div className='chartbox' style={{width:'5%'}} ><p></p></div>
            </div>
            {
              customOrder.map((item:any, index:any)=>{
                return (
                  <div className="coverbox">
                    <div className="coverrow hole" style={{minHeight:'60px'}} >
                      <div style={{width:'5%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <input className="inputdefault" style={{width:'95%', marginLeft:'5px', minHeight:'40px', outline:'none'}} 
                          value={item.no} onChange={(e)=>{
                             const copy = [...customOrder]; copy[index].no = e.target.value; setCustomOrder(copy);
                            }}/>
                      </div>
                      <div style={{width:'1px', height:'inherit', backgroundColor:'#d4d4d4'}}></div>
                      <div style={{width:'20%', display:'flex'}} >
                        <input className="inputdefault" style={{width:'95%', marginLeft:'5px', minHeight:'40px', outline:'none'}} 
                          value={item.productName} onChange={(e)=>{
                             const copy = [...customOrder]; copy[index].productName = e.target.value; setCustomOrder(copy);
                            }}/>
                      </div>
                      <div style={{width:'1px', height:'inherit', backgroundColor:'#d4d4d4'}}></div>
                      <div style={{width:'30%'}} >
                        <input className="inputdefault" style={{width:'95%', marginLeft:'5px', minHeight:'40px', outline:'none'}} 
                            value={item.program} onChange={(e)=>{
                              const copy = [...customOrder]; copy[index].program = e.target.value; setCustomOrder(copy);
                            }}/>
                      </div>
                      <div style={{width:'1px', height:'inherit', backgroundColor:'#d4d4d4'}}></div>
                      <div style={{width:'20%'}} >
                        <input className="inputdefault" type="text" style={{width:'100%', marginRight:'5px', textAlign:'right', paddingRight:'5px'}} 
                          value={item.personCost} onChange={(e)=>{
                            const copy = [...customOrder]; copy[index].personCost = e.target.value; setCustomOrder(copy);
                        }}/>
                      </div>
                      <div style={{width:'20%'}} >
                        <input className="inputdefault" type="text" style={{width:'100%', marginRight:'5px', textAlign:'right', paddingRight:'5px'}} 
                          value={item.allCost} onChange={(e)=>{
                            const copy = [...customOrder]; copy[index].allCost = e.target.value; setCustomOrder(copy);
                        }}/>
                      </div>
                      <div className="dayBox" style={{width:'5%'}}>
                        <div className="dayBtn"
                          onClick={()=>{
                            const copy = [...customOrder, {no: index+2, productName : "", program : "", personCost : "", allCost : ""}];
                            setCustomOrder(copy);
                          }}
                        >
                          <p>+</p>
                        </div>
                        <div className="dayBtn"
                          onClick={()=>{
                            const copy = [...customOrder];
                            copy.splice(index, 1);
                            setCustomOrder(copy);
                          }}
                        >
                          <p>-</p>
                        </div>
                      </div>  
                    </div>
                  </div>
                )
              })
            }
          </section>

           {/* 일정표 ------------------------------------------------------------------------------ */}

          <div style={{height:50}}></div>
          <div className="modal-header">
            <p>일정표</p>
          </div>

          <section style={{margin:'10px', display:'flex', justifyContent:'center'}}>
            <DropdownBox
              widthmain='100%'
              height='35px'
              selectedValue={''}
              options={[
                { value: '일정1', label: '일정1' },
                { value: '일정2', label: '일정2' },
                { value: '일정3', label: '일정3' },
                { value: '일정4', label: '일정4' }
              ]}    
              handleChange={(e)=>{
              
              }}
            />
          </section>

          <div className='btn-box' style={{width:'100%', justifyContent:'center', marginTop:'20px'}}>
            <div className="btn" style={{width:'97%', backgroundColor:'#5fb7ef', textAlign:'center'}}
              onClick={()=>{
             
              }}
            >
              <p style={{fontWeight:'bold'}}>일정표 생성</p>
            </div>
          </div>


        </div>

        <EstimateSchedule />
        <EstimateSample />
        
      </div>
    </div>
  )
}
