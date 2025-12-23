import React, { useState } from 'react';
import axios from 'axios';
import { AdminURL } from '../../MainURL';

interface ScheduleDetailBoxImportProps {
  searchTabTypes: Record<string, '묶음일정' | '상세일정'>;
  setSearchTabTypes: React.Dispatch<React.SetStateAction<Record<string, '묶음일정' | '상세일정'>>>;
  dayIndex: number;
  locationIndex: number;
  searchModalOpen: {dayIndex: number, locationIndex: number, tabType: '묶음일정' | '상세일정'} | null;
  setSearchModalOpen: React.Dispatch<React.SetStateAction<{dayIndex: number, locationIndex: number, tabType: '묶음일정' | '상세일정'} | null>>;
  locationSearchList: any[];
  setLocationSearchList: React.Dispatch<React.SetStateAction<any[]>>;
  handleDetailBoxItemClick: (item: any, dayIndex: number, detailIndex: number) => Promise<void>;
  handleSearchItemClick: (item: any, dayIndex: number, detailIndex: number) => Promise<void>;
  safeJsonParse: <T,>(jsonString: any, defaultValue: T) => T;
  searchModalKeyword: string;
  setSearchModalKeyword: React.Dispatch<React.SetStateAction<string>>;
  locationType: '휴양지' | '관광지' | '다구간';
  tourNation: string[];
  nation: string;
}

const ScheduleDetailBoxImport: React.FC<ScheduleDetailBoxImportProps> = ({
  searchTabTypes,
  setSearchTabTypes,
  dayIndex,
  locationIndex,
  searchModalOpen,
  setSearchModalOpen,
  locationSearchList,
  setLocationSearchList,
  handleDetailBoxItemClick,
  handleSearchItemClick,
  safeJsonParse,
  searchModalKeyword,
  setSearchModalKeyword,
  locationType,
  tourNation,
  nation
}) => {
  const tabKey = `${dayIndex}-${locationIndex}`;
  const isModalOpen = searchModalOpen && searchModalOpen.dayIndex === dayIndex && searchModalOpen.locationIndex === locationIndex;
  const currentTabType = isModalOpen ? searchModalOpen.tabType : (searchTabTypes[tabKey] || '묶음일정');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchModalKeyword.trim()) {
      setLocationSearchList([]);
      return;
    }

    setIsSearching(true);
    try {
      if (currentTabType === '상세일정') {
        // '공항' 키워드가 포함되어 있으면 전체 검색
        const isAirportSearch = searchModalKeyword.includes('공항') || searchModalKeyword.includes('픽업') || searchModalKeyword.includes('렌터카');
        
        if (isAirportSearch) {
          // 공항 검색: 전체 검색 (nation, city 파라미터 없이)
          const res = await axios.post(`${AdminURL}/scheduledetailbox/getdetailboxsearch`, {
            word: searchModalKeyword.trim()
          });
          if (res.data && res.data.resultData && res.data.resultData !== false && Array.isArray(res.data.resultData)) {
            setLocationSearchList([...res.data.resultData]);
          } else {
            setLocationSearchList([]);
          }
        } else {
          // 일반 검색: 국가 필터 적용
          // 국가 정보 설정
          let nationsToSearch: string[] = [];
          if (locationType === '휴양지') {
            // 휴양지: 단일 국가
            if (nation && nation !== '선택' && nation.trim() !== '') {
              nationsToSearch = [nation];
            }
          } else if (locationType === '관광지' || locationType === '다구간') {
            // 관광지/다구간: 여러 국가
            nationsToSearch = tourNation.filter(n => n !== '선택' && n.trim() !== '');
          }

          // 국가가 선택되지 않은 경우 검색하지 않음
          if (nationsToSearch.length === 0) {
            alert('국가를 선택해주세요.');
            setLocationSearchList([]);
            setIsSearching(false);
            return;
          }

          // 여러 국가가 있는 경우 각각 검색해서 합치기
          const searchPromises = nationsToSearch.map(async (nationItem) => {
            try {
              const res = await axios.post(`${AdminURL}/scheduledetailbox/getdetailboxsearch`, {
                nation: nationItem,
                city: '전체',
                word: searchModalKeyword.trim()
              });
              if (res.data && res.data.resultData && res.data.resultData !== false && Array.isArray(res.data.resultData)) {
                return res.data.resultData;
              }
              return [];
            } catch (error) {
              console.error(`Failed to search for nation ${nationItem}:`, error);
              return [];
            }
          });

          const results = await Promise.all(searchPromises);
          // 중복 제거 (id 기준)
          const uniqueResults = results.flat().reduce((acc: any[], current: any) => {
            if (!acc.find(item => item.id === current.id)) {
              acc.push(current);
            }
            return acc;
          }, []);
          setLocationSearchList(uniqueResults);
        }
      } else {
        // 대분류 검색: getscheduledetailsearch API 사용
        const res = await axios.post(`${AdminURL}/scheduledetailbox/getscheduledetailsearch`, {
          word: searchModalKeyword.trim()
        });
        if (res.data.resultData) {
          setLocationSearchList([...res.data.resultData]);
        } else {
          setLocationSearchList([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch search results:", error);
      setLocationSearchList([]);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isModalOpen) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={() => {
      setSearchModalOpen(null);
      setSearchModalKeyword('');
      setLocationSearchList([]);
    }}>
      <div className="seachlist" style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        width: '85vw',
        maxHeight: '80vh',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        <div className="search-list-header" style={{
          width:'100%', 
          display:'flex', 
          alignItems:'center', 
          justifyContent:'space-between', 
          padding:'15px 20px', 
          borderBottom:'1px solid #eee',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', flex: 1}}>
            <h3 style={{margin: 0, fontSize: '16px', fontWeight: '600'}}>
              {currentTabType === '묶음일정' ? '묶음일정 검색' : '상세일정 검색'}
            </h3>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <input
              type="text"
              className="inputdefault"
              placeholder="검색 키워드를 입력하세요"
              value={searchModalKeyword}
              onChange={(e) => setSearchModalKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              style={{
                width: '300px',
                minHeight: '36px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            <button
              style={{
                background: '#5fb7ef',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? '검색 중...' : '검색'}
            </button>
            <button
              style={{background:'none', border:'1px solid #ccc', borderRadius:'4px', padding:'8px 16px', cursor:'pointer', fontSize:'14px'}}
              onClick={()=>{ 
                setSearchModalOpen(null); 
                setSearchModalKeyword('');
                setLocationSearchList([]); 
              }}
            >닫기</button>
          </div>
        </div>
        <div className="main-list-cover" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px'
        }}>
          {locationSearchList?.length === 0 && !isSearching && (
            <div style={{padding: '40px', color: '#888', textAlign: 'center'}}>
              {searchModalKeyword ? '검색 결과가 없습니다.' : '검색 키워드를 입력하고 검색 버튼을 눌러주세요.'}
            </div>
          )}
          {isSearching && (
            <div style={{padding: '40px', color: '#888', textAlign: 'center'}}>
              검색 중...
            </div>
          )}
          {locationSearchList?.length > 0 &&
            locationSearchList.map((searchItem: any, searchIdx: number) => {
              // 상세일정인 경우
              if (currentTabType === '상세일정') {
                return (
                  <div 
                    key={searchIdx} 
                    className="rowbox" 
                    style={{
                      width:'100%', 
                      marginBottom:'10px', 
                      padding:'20px', 
                      border:'1px solid #eee',
                      cursor:'pointer',
                      backgroundColor:'#fff',
                      borderRadius: '4px'
                    }} 
                    onClick={() => {
                      handleDetailBoxItemClick(searchItem, dayIndex, locationIndex);
                      setSearchModalOpen(null);
                      setSearchModalKeyword('');
                      setLocationSearchList([]);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}
                  >
                    <div style={{width:'10%', fontWeight:'bold', fontSize:'18px', marginBottom:'5px'}}>
                      <span style={{fontSize:'14px', color:'#888', marginLeft:'10px'}}>ID: {searchItem.id}</span>
                    </div>
                    <div style={{width:'20%', marginBottom:'5px', color:'#666'}}>
                      <span>[{searchItem.sort}]</span>
                    </div>
                    <div style={{width:'40%', marginBottom:'5px', color:'#666'}}>
                      <span style={{marginLeft: '10px', fontWeight:'bold'}}>{searchItem.productName}</span>
                    </div>
                    <div style={{width:'15%', marginBottom:'5px', color:'#666'}}>
                      <span>({searchItem.nation} / {searchItem.city})</span>
                    </div>
                    <div style={{width:'15%', marginBottom:'5px', color:'#666'}}>
                      수정일: {searchItem.reviseDate || '-'}
                    </div>
                  </div>
                );
              }
              
              // 대분류인 경우 (기존)
              let locationDetailArr = safeJsonParse<any[]>(searchItem.locationDetail, []);
              const locationDetailCopy = locationDetailArr
                .map((subLocationDetail: any) => subLocationDetail.subLocation)
                .join(' / ');
              return (
                <div key={searchIdx} className="rowbox" style={{width:'100%', marginBottom:'10px', padding:'20px', border:'1px solid #eee', borderRadius: '4px'}} 
                    onClick={() => {
                      handleSearchItemClick(searchItem, dayIndex, locationIndex);
                      setSearchModalOpen(null);
                      setSearchModalKeyword('');
                      setLocationSearchList([]);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}>
                  <div style={{width:'10%', fontWeight:'bold', fontSize:'18px', marginBottom:'5px'}}>
                    <span style={{fontSize:'14px', color:'#888', marginLeft:'10px'}}>ID: {searchItem.id}</span>
                  </div>
                  <div style={{width:'15%', marginBottom:'5px', color:'#666'}}>
                    <span style={{fontWeight:'bold'}}>{searchItem.location || '-'}</span>
                  </div>
                  <div style={{width:'15%', marginBottom:'5px', color:'#666'}}>
                      <span>{searchItem.landCompany || '-'}</span>
                  </div>
                  <div style={{width:'40%', marginBottom:'5px', color:'#666'}}>
                    <span style={{marginLeft: '10px'}}>상세장소: {locationDetailCopy}</span>
                  </div>
                  <div style={{width:'20%', marginBottom:'5px', color:'#666'}}>작성자: {searchItem.userId} / 수정일: {searchItem.reviseDate}</div>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailBoxImport;