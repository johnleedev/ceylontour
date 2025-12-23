import React, { RefObject } from 'react';

interface ScheduleTrafficAddProps {
  trafficModalOpen: { dayIndex: number; locationIndex: number } | null;
  setTrafficModalOpen: React.Dispatch<React.SetStateAction<{ dayIndex: number; locationIndex: number } | null>>;
  selectedTrafficTab: 'airline' | 'train' | 'bus' | 'ship';
  setSelectedTrafficTab: React.Dispatch<React.SetStateAction<'airline' | 'train' | 'bus' | 'ship'>>;
  airlineList: any[];
  setAirlineList: React.Dispatch<React.SetStateAction<any[]>>;
  trainList: any[];
  setTrainList: React.Dispatch<React.SetStateAction<any[]>>;
  busList: any[];
  setBusList: React.Dispatch<React.SetStateAction<any[]>>;
  shipList: any[];
  setShipList: React.Dispatch<React.SetStateAction<any[]>>;
  currentSearchAirportCode: string;
  setCurrentSearchAirportCode: React.Dispatch<React.SetStateAction<string>>;
  currentSearchTrainCity: string;
  setCurrentSearchTrainCity: React.Dispatch<React.SetStateAction<string>>;
  currentSearchBusCity: string;
  setCurrentSearchBusCity: React.Dispatch<React.SetStateAction<string>>;
  currentSearchShipCity: string;
  setCurrentSearchShipCity: React.Dispatch<React.SetStateAction<string>>;
  isLoadingAirline: boolean;
  setIsLoadingAirline: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingTrain: boolean;
  setIsLoadingTrain: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingBus: boolean;
  setIsLoadingBus: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingShip: boolean;
  setIsLoadingShip: React.Dispatch<React.SetStateAction<boolean>>;
  searchAirlineData: (searchTerm: string) => Promise<void>;
  searchTrainData: (searchTerm: string) => Promise<void>;
  searchBusData: (searchTerm: string) => Promise<void>;
  searchShipData: (searchTerm: string) => Promise<void>;
  scheduleList: any[];
  setScheduleList: React.Dispatch<React.SetStateAction<any[]>>;
  selectedScheduleIndex: number;
  createEmptyDetail: () => any;
  safeJsonParse: <T,>(jsonString: any, defaultValue: T) => T;
  searchInputRef: RefObject<HTMLInputElement>;
  dayIndex: number;
  locationIndex: number;
}

const ScheduleTrafficAdd: React.FC<ScheduleTrafficAddProps> = ({
  trafficModalOpen,
  setTrafficModalOpen,
  selectedTrafficTab,
  setSelectedTrafficTab,
  airlineList,
  setAirlineList,
  trainList,
  setTrainList,
  busList,
  setBusList,
  shipList,
  setShipList,
  currentSearchAirportCode,
  setCurrentSearchAirportCode,
  currentSearchTrainCity,
  setCurrentSearchTrainCity,
  currentSearchBusCity,
  setCurrentSearchBusCity,
  currentSearchShipCity,
  setCurrentSearchShipCity,
  isLoadingAirline,
  setIsLoadingAirline,
  isLoadingTrain,
  setIsLoadingTrain,
  isLoadingBus,
  setIsLoadingBus,
  isLoadingShip,
  setIsLoadingShip,
  searchAirlineData,
  searchTrainData,
  searchBusData,
  searchShipData,
  scheduleList,
  setScheduleList,
  selectedScheduleIndex,
  createEmptyDetail,
  safeJsonParse,
  searchInputRef,
  dayIndex,
  locationIndex
}) => {
  if (!trafficModalOpen || trafficModalOpen.dayIndex !== dayIndex || trafficModalOpen.locationIndex !== locationIndex) {
    return null;
  }

  return (
    <div className="airline-list-modal">
      {/* 탭 메뉴 */}
      <div style={{
        display:'flex',
        gap:'0',
        borderBottom:'2px solid #eee',
        backgroundColor:'#f8f9fa',
        padding:'0'
      }}>
        <button
          style={{
            padding:'12px 20px',
            background: selectedTrafficTab === 'airline' ? '#fff' : 'transparent',
            color: selectedTrafficTab === 'airline' ? '#007bff' : '#666',
            border:'none',
            borderBottom: selectedTrafficTab === 'airline' ? '3px solid #007bff' : '3px solid transparent',
            cursor:'pointer',
            fontSize:'14px',
            fontWeight: selectedTrafficTab === 'airline' ? '600' : '400',
            transition:'all 0.2s',
            marginBottom:'-2px'
          }}
          onClick={() => {
            setSelectedTrafficTab('airline');
            setAirlineList([]);
            setCurrentSearchAirportCode('');
          }}
        >항공편</button>
        <button
          style={{
            padding:'12px 20px',
            background: selectedTrafficTab === 'train' ? '#fff' : 'transparent',
            color: selectedTrafficTab === 'train' ? '#007bff' : '#666',
            border:'none',
            borderBottom: selectedTrafficTab === 'train' ? '3px solid #007bff' : '3px solid transparent',
            cursor:'pointer',
            fontSize:'14px',
            fontWeight: selectedTrafficTab === 'train' ? '600' : '400',
            transition:'all 0.2s',
            marginBottom:'-2px'
          }}
          onClick={() => {
            setSelectedTrafficTab('train');
            setTrainList([]);
            setCurrentSearchTrainCity('');
          }}
        >기차편</button>
        <button
          style={{
            padding:'12px 20px',
            background: selectedTrafficTab === 'bus' ? '#fff' : 'transparent',
            color: selectedTrafficTab === 'bus' ? '#007bff' : '#666',
            border:'none',
            borderBottom: selectedTrafficTab === 'bus' ? '3px solid #007bff' : '3px solid transparent',
            cursor:'pointer',
            fontSize:'14px',
            fontWeight: selectedTrafficTab === 'bus' ? '600' : '400',
            transition:'all 0.2s',
            marginBottom:'-2px'
          }}
          onClick={() => {
            setSelectedTrafficTab('bus');
            setBusList([]);
            setCurrentSearchBusCity('');
          }}
        >버스편</button>
        <button
          style={{
            padding:'12px 20px',
            background: selectedTrafficTab === 'ship' ? '#fff' : 'transparent',
            color: selectedTrafficTab === 'ship' ? '#007bff' : '#666',
            border:'none',
            borderBottom: selectedTrafficTab === 'ship' ? '3px solid #007bff' : '3px solid transparent',
            cursor:'pointer',
            fontSize:'14px',
            fontWeight: selectedTrafficTab === 'ship' ? '600' : '400',
            transition:'all 0.2s',
            marginBottom:'-2px'
          }}
          onClick={() => {
            setSelectedTrafficTab('ship');
            setShipList([]);
            setCurrentSearchShipCity('');
          }}
        >선박편</button>
      </div>
      
      {/* 검색 영역 */}
      <div className="airline-list-modal-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px', borderBottom:'1px solid #eee'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <p style={{fontSize:'14px', fontWeight:'bold'}}>
            {/* {selectedTrafficTab === 'airline' ? '항공편' : selectedTrafficTab === 'train' ? '기차편' : selectedTrafficTab === 'bus' ? '버스편' : '선박편'} */}
          </p>
        </div>
        <div style={{display:'flex', alignItems:'center'}}>
          {selectedTrafficTab === 'airline' && (
            <>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="도시명 또는 항공코드 검색"
                className="inputdefault"
                style={{
                  width:'220px',
                  minHeight:'40px',
                  outline:'none',
                  fontSize:'14px'
                }}
                value={currentSearchAirportCode}
                onChange={(e) => {
                  const value = e.currentTarget.value.trim();
                  const processedValue = /^[A-Za-z]{3}$/.test(value) ? value.toUpperCase() : value;
                  setCurrentSearchAirportCode(processedValue);
                }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    setIsLoadingAirline(true);
                    await searchAirlineData(currentSearchAirportCode);
                    setIsLoadingAirline(false);
                  }
                }}
              />
              <button
                style={{
                  padding:'8px 12px',
                  background:'#007bff',
                  color:'white',
                  border:'none',
                  borderRadius:'4px',
                  cursor:'pointer',
                  fontSize:'14px',
                  marginLeft:'8px'
                }}
                onClick={async () => {
                  if (!currentSearchAirportCode) return;
                  setIsLoadingAirline(true);
                  await searchAirlineData(currentSearchAirportCode);
                  setIsLoadingAirline(false);
                }}
              >검색</button>
            </>
          )}
          {selectedTrafficTab === 'train' && (
            <>
              <input
                type="text"
                placeholder="도시명 검색"
                className="inputdefault"
                style={{
                  width:'220px',
                  minHeight:'40px',
                  outline:'none',
                  fontSize:'14px'
                }}
                value={currentSearchTrainCity}
                onChange={(e) => {
                  setCurrentSearchTrainCity(e.currentTarget.value.trim());
                }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    setIsLoadingTrain(true);
                    await searchTrainData(currentSearchTrainCity);
                    setIsLoadingTrain(false);
                  }
                }}
              />
              <button
                style={{
                  padding:'8px 12px',
                  background:'#007bff',
                  color:'white',
                  border:'none',
                  borderRadius:'4px',
                  cursor:'pointer',
                  fontSize:'14px',
                  marginLeft:'8px'
                }}
                onClick={async () => {
                  if (!currentSearchTrainCity) return;
                  setIsLoadingTrain(true);
                  await searchTrainData(currentSearchTrainCity);
                  setIsLoadingTrain(false);
                }}
              >검색</button>
            </>
          )}
          {selectedTrafficTab === 'bus' && (
            <>
              <input
                type="text"
                placeholder="도시명 검색"
                className="inputdefault"
                style={{
                  width:'220px',
                  minHeight:'40px',
                  outline:'none',
                  fontSize:'14px'
                }}
                value={currentSearchBusCity}
                onChange={(e) => {
                  setCurrentSearchBusCity(e.currentTarget.value.trim());
                }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    setIsLoadingBus(true);
                    await searchBusData(currentSearchBusCity);
                    setIsLoadingBus(false);
                  }
                }}
              />
              <button
                style={{
                  padding:'8px 12px',
                  background:'#007bff',
                  color:'white',
                  border:'none',
                  borderRadius:'4px',
                  cursor:'pointer',
                  fontSize:'14px',
                  marginLeft:'8px'
                }}
                onClick={async () => {
                  if (!currentSearchBusCity) return;
                  setIsLoadingBus(true);
                  await searchBusData(currentSearchBusCity);
                  setIsLoadingBus(false);
                }}
              >검색</button>
            </>
          )}
          {selectedTrafficTab === 'ship' && (
            <>
              <input
                type="text"
                placeholder="도시명 검색"
                className="inputdefault"
                style={{
                  width:'220px',
                  minHeight:'40px',
                  outline:'none',
                  fontSize:'14px'
                }}
                value={currentSearchShipCity}
                onChange={(e) => {
                  setCurrentSearchShipCity(e.currentTarget.value.trim());
                }}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter') {
                    setIsLoadingShip(true);
                    await searchShipData(currentSearchShipCity);
                    setIsLoadingShip(false);
                  }
                }}
              />
              <button
                style={{
                  padding:'8px 12px',
                  background:'#007bff',
                  color:'white',
                  border:'none',
                  borderRadius:'4px',
                  cursor:'pointer',
                  fontSize:'14px',
                  marginLeft:'8px'
                }}
                onClick={async () => {
                  if (!currentSearchShipCity) return;
                  setIsLoadingShip(true);
                  await searchShipData(currentSearchShipCity);
                  setIsLoadingShip(false);
                }}
              >검색</button>
            </>
          )}
          <button style={{background:'none', border:'none', fontSize:'14px', cursor:'pointer', marginLeft:'8px'}} onClick={()=>{
            setTrafficModalOpen(null);
          }}>닫기</button>
        </div>
      </div>
      
      {/* 항공편 탭 내용 */}
      {selectedTrafficTab === 'airline' && (
        <>
          {isLoadingAirline ? (
            <div style={{padding:'30px', textAlign:'center'}}>불러오는 중...</div>
          ) : airlineList.length === 0 ? (
            <div style={{padding:'30px', textAlign:'center', color:'#888'}}>등록된 항공편이 없습니다.</div>
          ) : (
            <div className="airline-list-modal-table-wrap" style={{maxHeight:'1200px', overflowY:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#f8f9fa'}}>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>편명</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>항공사코드</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>항공사명</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>출발(시간) - 도착(시간)</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>+Day</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>운항요일</th>
                  </tr>
                </thead>
                <tbody>
                  {airlineList
                    .map((airlineItem:any, airlineIdx:number) => {
                      const dapartTimeCopy = airlineItem.departTime?.slice(0, 2) + ':' + airlineItem.departTime?.slice(2, 4);
                      const arriveTimeCopy = airlineItem.arriveTime?.slice(0, 2) + ':' + airlineItem.arriveTime?.slice(2, 4);
                      return (
                        <tr key={airlineIdx} style={{
                          cursor:'pointer',
                          backgroundColor: 'white',
                          transition: 'background-color 0.2s'
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f8ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                          }}
                          onClick={() => {
                            // 선택한 항공편을 해당 위치 아이템에 적용
                            setScheduleList(prev => {
                              const next = [...prev];
                              const schedule = next[selectedScheduleIndex];
                              const day = schedule?.scheduleDetailData?.[dayIndex];
                              if (!schedule || !day) return prev;
                              const newScheduleDetail = [...(day.scheduleDetail || [])];
                              // locationIndex 위치에 항공편 데이터 추가 또는 교체
                              if (newScheduleDetail[locationIndex]) {
                                newScheduleDetail[locationIndex] = {
                                  id: parseInt(airlineItem?.id) || 0,
                                  sort: 'airline',
                                  st: 'airline',
                                  location: '',
                                  isUseContent: false,
                                  isViewLocation: true,
                                  locationDetail: [{ subLocation: '', isUseContent: false, subLocationContent: '', subLocationDetail: [] }],
                                  airlineData: airlineItem
                                };
                              } else {
                                // locationIndex가 배열 범위를 벗어나면 배열을 확장
                                while (newScheduleDetail.length <= locationIndex) {
                                  newScheduleDetail.push(createEmptyDetail());
                                }
                                newScheduleDetail[locationIndex] = {
                                  id: parseInt(airlineItem?.id) || 0,
                                  sort: 'airline',
                                  st: 'airline',
                                  location: '',
                                  isUseContent: false,
                                  isViewLocation: true,
                                  locationDetail: [{ subLocation: '', isUseContent: false, subLocationContent: '', subLocationDetail: [] }],
                                  airlineData: airlineItem
                                };
                              }
                              const updatedDay = { ...day, scheduleDetail: newScheduleDetail };
                              const newScheduleDetailData = [...schedule.scheduleDetailData];
                              newScheduleDetailData[dayIndex] = updatedDay;
                              next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };
                              return next;
                            });
                            setTrafficModalOpen(null);
                          }}
                        >
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{airlineItem.flightCode || '-'}</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{airlineItem.airlineCode || '-'}</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{airlineItem.airlineName || '-'}</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{airlineItem.depart} ({dapartTimeCopy}) - {airlineItem.arrive} ({arriveTimeCopy})</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{airlineItem.addDay === 'true' ? '+1D' : ''}</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>
                            {(() => {
                              if (Array.isArray(airlineItem.departDate)) {
                                return airlineItem.departDate.join(', ');
                              } else {
                                const parsed = safeJsonParse<string[]>(airlineItem.departDate, []);
                                return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(', ') : (airlineItem.departDate || '-');
                              }
                            })()}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {/* 기차편 탭 내용 */}
      {selectedTrafficTab === 'train' && (
        <>
          {isLoadingTrain ? (
            <div style={{padding:'30px', textAlign:'center'}}>불러오는 중...</div>
          ) : trainList.length === 0 ? (
            <div style={{padding:'30px', textAlign:'center', color:'#888'}}>등록된 기차편이 없습니다.</div>
          ) : (
            <div className="airline-list-modal-table-wrap" style={{maxHeight:'1200px', overflowY:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#f8f9fa'}}>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>열차코드</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>열차명</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>출발(시간) - 도착(시간)</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>+Day</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>운행요일</th>
                  </tr>
                </thead>
                <tbody>
                  {trainList
                    .map((trainItem:any, trainIdx:number) => {
                      const dapartTimeCopy = trainItem.departTime?.slice(0, 2) + ':' + trainItem.departTime?.slice(2, 4);
                      const arriveTimeCopy = trainItem.arriveTime?.slice(0, 2) + ':' + trainItem.arriveTime?.slice(2, 4);
                      return (
                        <tr key={trainIdx} style={{
                          cursor:'pointer',
                          backgroundColor: 'white',
                          transition: 'background-color 0.2s'
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f8ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                          }}
                          onClick={() => {
                            // 선택한 기차편을 해당 위치 아이템에 적용
                            setScheduleList(prev => {
                              const next = [...prev];
                              const schedule = next[selectedScheduleIndex];
                              const day = schedule?.scheduleDetailData?.[dayIndex];
                              if (!schedule || !day) return prev;
                              const newScheduleDetail = [...(day.scheduleDetail || [])];
                              // locationIndex 위치에 기차편 데이터 추가 또는 교체
                              if (newScheduleDetail[locationIndex]) {
                                newScheduleDetail[locationIndex] = {
                                  id: parseInt(trainItem?.id) || 0,
                                  sort: 'train',
                                  st: 'train',
                                  location: '',
                                  isUseContent: false,
                                  isViewLocation: true,
                                  locationDetail: [{ subLocation: '', isUseContent: false, subLocationContent: '', subLocationDetail: [] }],
                                  trainData: trainItem
                                };
                              } else {
                                // locationIndex가 배열 범위를 벗어나면 배열을 확장
                                while (newScheduleDetail.length <= locationIndex) {
                                  newScheduleDetail.push(createEmptyDetail());
                                }
                                newScheduleDetail[locationIndex] = {
                                  id: parseInt(trainItem?.id) || 0,
                                  sort: 'train',
                                  st: 'train',
                                  location: '',
                                  isUseContent: false,
                                  isViewLocation: true,
                                  locationDetail: [{ subLocation: '', isUseContent: false, subLocationContent: '', subLocationDetail: [] }],
                                  trainData: trainItem
                                };
                              }
                              const updatedDay = { ...day, scheduleDetail: newScheduleDetail };
                              const newScheduleDetailData = [...schedule.scheduleDetailData];
                              newScheduleDetailData[dayIndex] = updatedDay;
                              next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };
                              return next;
                            });
                            setTrafficModalOpen(null);
                          }}
                        >
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{trainItem.trainCode || '-'}</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{trainItem.trainName || '-'}</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{trainItem.depart} ({dapartTimeCopy}) - {trainItem.arrive} ({arriveTimeCopy})</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{trainItem.addDay === 'true' ? '+1D' : ''}</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>
                            {(() => {
                              if (Array.isArray(trainItem.departDate)) {
                                return trainItem.departDate.join(', ');
                              } else {
                                const parsed = safeJsonParse<string[]>(trainItem.departDate, []);
                                return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(', ') : (trainItem.departDate || '-');
                              }
                            })()}
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {/* 버스편 탭 내용 */}
      {selectedTrafficTab === 'bus' && (
        <>
          {isLoadingBus ? (
            <div style={{padding:'30px', textAlign:'center'}}>불러오는 중...</div>
          ) : busList.length === 0 ? (
            <div style={{padding:'30px', textAlign:'center', color:'#888'}}>등록된 버스편이 없습니다.</div>
          ) : (
            <div className="airline-list-modal-table-wrap" style={{maxHeight:'1200px', overflowY:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#f8f9fa'}}>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>버스코드</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>버스명</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>출발(시간) - 도착(시간)</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>+Day</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>운행요일</th>
                  </tr>
                </thead>
                <tbody>
                  {busList
                    .map((busItem:any, busIdx:number) => {
                      const dapartTimeCopy = busItem.departTime?.slice(0, 2) + ':' + busItem.departTime?.slice(2, 4);
                      const arriveTimeCopy = busItem.arriveTime?.slice(0, 2) + ':' + busItem.arriveTime?.slice(2, 4);
                      return (
                        <tr key={busIdx} style={{
                          cursor:'pointer',
                          backgroundColor: 'white',
                          transition: 'background-color 0.2s'
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f8ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                          }}
                          onClick={() => {
                            // 선택한 버스편을 해당 위치 아이템에 적용
                            setScheduleList(prev => {
                              const next = [...prev];
                              const schedule = next[selectedScheduleIndex];
                              const day = schedule?.scheduleDetailData?.[dayIndex];
                              if (!schedule || !day) return prev;
                              const newScheduleDetail = [...(day.scheduleDetail || [])];
                              // locationIndex 위치에 버스편 데이터 추가 또는 교체
                              if (newScheduleDetail[locationIndex]) {
                                newScheduleDetail[locationIndex] = {
                                  id: parseInt(busItem?.id) || 0,
                                  sort: 'bus',
                                  st: 'bus',
                                  location: '',
                                  isUseContent: false,
                                  isViewLocation: true,
                                  locationDetail: [{ subLocation: '', isUseContent: false, subLocationContent: '', subLocationDetail: [] }],
                                  busData: busItem
                                };
                              } else {
                                // locationIndex가 배열 범위를 벗어나면 배열을 확장
                                while (newScheduleDetail.length <= locationIndex) {
                                  newScheduleDetail.push(createEmptyDetail());
                                }
                                newScheduleDetail[locationIndex] = {
                                  id: parseInt(busItem?.id) || 0,
                                  sort: 'bus',
                                  st: 'bus',
                                  location: '',
                                  isUseContent: false,
                                  isViewLocation: true,
                                  locationDetail: [{ subLocation: '', isUseContent: false, subLocationContent: '', subLocationDetail: [] }],
                                  busData: busItem
                                };
                              }
                              const updatedDay = { ...day, scheduleDetail: newScheduleDetail };
                              const newScheduleDetailData = [...schedule.scheduleDetailData];
                              newScheduleDetailData[dayIndex] = updatedDay;
                              next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };
                              return next;
                            });
                            setTrafficModalOpen(null);
                          }}
                        >
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{busItem.busCode || '-'}</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{busItem.busName || '-'}</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{busItem.depart} ({dapartTimeCopy}) - {busItem.arrive} ({arriveTimeCopy})</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{busItem.addDay === 'true' ? '+1D' : ''}</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>
                            {(() => {
                              if (Array.isArray(busItem.departDate)) {
                                return busItem.departDate.join(', ');
                              } else {
                                const parsed = safeJsonParse<string[]>(busItem.departDate, []);
                                return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(', ') : (busItem.departDate || '-');
                              }
                            })()}
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      
      {/* 선박편 탭 내용 */}
      {selectedTrafficTab === 'ship' && (
        <>
          {isLoadingShip ? (
            <div style={{padding:'30px', textAlign:'center'}}>불러오는 중...</div>
          ) : shipList.length === 0 ? (
            <div style={{padding:'30px', textAlign:'center', color:'#888'}}>등록된 선박편이 없습니다.</div>
          ) : (
            <div className="airline-list-modal-table-wrap" style={{maxHeight:'1200px', overflowY:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#f8f9fa'}}>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>선박코드</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>선박명</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>출발(시간) - 도착(시간)</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>+Day</th>
                    <th style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>운행요일</th>
                  </tr>
                </thead>
                <tbody>
                  {shipList
                    .map((shipItem:any, shipIdx:number) => {
                      const dapartTimeCopy = shipItem.departTime?.slice(0, 2) + ':' + shipItem.departTime?.slice(2, 4);
                      const arriveTimeCopy = shipItem.arriveTime?.slice(0, 2) + ':' + shipItem.arriveTime?.slice(2, 4);
                      return (
                        <tr key={shipIdx} style={{
                          cursor:'pointer',
                          backgroundColor: 'white',
                          transition: 'background-color 0.2s'
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f0f8ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                          }}
                          onClick={() => {
                            // 선택한 선박편을 해당 위치 아이템에 적용
                            setScheduleList(prev => {
                              const next = [...prev];
                              const schedule = next[selectedScheduleIndex];
                              const day = schedule?.scheduleDetailData?.[dayIndex];
                              if (!schedule || !day) return prev;
                              const newScheduleDetail = [...(day.scheduleDetail || [])];
                              // locationIndex 위치에 선박편 데이터 추가 또는 교체
                              if (newScheduleDetail[locationIndex]) {
                                newScheduleDetail[locationIndex] = {
                                  id: parseInt(shipItem?.id) || 0,
                                  sort: 'ship',
                                  st: 'ship',
                                  location: '',
                                  isUseContent: false,
                                  isViewLocation: true,
                                  locationDetail: [{ subLocation: '', isUseContent: false, subLocationContent: '', subLocationDetail: [] }],
                                  shipData: shipItem
                                };
                              } else {
                                // locationIndex가 배열 범위를 벗어나면 배열을 확장
                                while (newScheduleDetail.length <= locationIndex) {
                                  newScheduleDetail.push(createEmptyDetail());
                                }
                                newScheduleDetail[locationIndex] = {
                                  id: parseInt(shipItem?.id) || 0,
                                  sort: 'ship',
                                  st: 'ship',
                                  location: '',
                                  isUseContent: false,
                                  isViewLocation: true,
                                  locationDetail: [{ subLocation: '', isUseContent: false, subLocationContent: '', subLocationDetail: [] }],
                                  shipData: shipItem
                                };
                              }
                              const updatedDay = { ...day, scheduleDetail: newScheduleDetail };
                              const newScheduleDetailData = [...schedule.scheduleDetailData];
                              newScheduleDetailData[dayIndex] = updatedDay;
                              next[selectedScheduleIndex] = { ...schedule, scheduleDetailData: newScheduleDetailData };
                              return next;
                            });
                            setTrafficModalOpen(null);
                          }}
                        >
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{shipItem.shipCode || '-'}</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{shipItem.shipName || '-'}</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{shipItem.depart} ({dapartTimeCopy}) - {shipItem.arrive} ({arriveTimeCopy})</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>{shipItem.addDay === 'true' ? '+1D' : ''}</td>
                          <td style={{padding:'10px', border:'1px solid #ddd', textAlign:'center'}}>
                            {(() => {
                              if (Array.isArray(shipItem.departDate)) {
                                return shipItem.departDate.join(', ');
                              } else {
                                const parsed = safeJsonParse<string[]>(shipItem.departDate, []);
                                return Array.isArray(parsed) && parsed.length > 0 ? parsed.join(', ') : (shipItem.departDate || '-');
                              }
                            })()}
                          </td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScheduleTrafficAdd;