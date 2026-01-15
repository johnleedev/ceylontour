import axios from 'axios';
import {AdminURL} from '../../MainURL';
// scheduleDetail JSON 문자열에서 subLocationContent 필드만 안전하게 정규화
// - 패턴: "subLocationContent":"...","isUseContent"
// - value 안의 따옴표(")를 \" 형태로 이스케이프하여 JSON.parse 오류를 방지
const normalizeSubLocationContent = (raw: string): string => {
  if (!raw || typeof raw !== 'string') return raw;

  try {
    // 이미 정상 JSON이면 그대로 반환
    JSON.parse(raw);
    return raw;
  } catch {
    // 무시하고 아래에서 복구 시도
  }

  try {
    const fixed = raw.replace(
      /("subLocationContent"\s*:\s*")([\s\S]*?)(",\s*"isUseContent")/g,
      (_match, prefix, content, suffix) => {
        // 1차로 이미 이스케이프된 \" 를 원래 따옴표로 복원
        let normalized = content.replace(/\\"/g, '"');
        // 2차로 실제 줄바꿈 문자를 \n 로 치환 (JSON 문자열에서 허용 형태로)
        normalized = normalized.replace(/\r?\n/g, '\\n');
        // 3차로 value 내부의 " 를 모두 \" 로 이스케이프
        normalized = normalized.replace(/"/g, '\\"');
        return `${prefix}${normalized}${suffix}`;
      }
    );

    // 복구 후 JSON.parse가 가능하면 fixed 사용, 아니면 원본 유지
    try {
      JSON.parse(fixed);
      return fixed;
    } catch {
      return raw;
    }
  } catch {
    return raw;
  }
};

interface FetchScheduleDetailParams {
  dataToFetch?: any;
  scheduleData: any;
  propsScheduleInfo: any;
  setScheduleList: (list: any[]) => void;
  setManageAirline: (list: any[]) => void;
  createEmptyDay: () => any;
  safeJsonParse: <T,>(jsonString: any, defaultValue: T) => T;
  repairJsonString: (value: string) => string;
  isAddOrRevise: 'add' | 'revise';
  // 일차별 호텔 정보 (상품명에서 파싱한 호텔 정보)
  hotelInfoPerDay?: Array<{ dayIndex: number; hotelName: string; hotelLevel: string }>;
  // 일차별 도시 정보 (유럽 일정용)
  cityInfoPerDay?: Array<{ dayIndex: number; cityName: string }>;
}

// ModalAddSchedule.tsx 의 fetchScheduleDetailData 로직을 외부에서 재사용하기 위한 함수
export const fetchScheduleDetailDataExternal = async (params: FetchScheduleDetailParams) => {
  const {
    dataToFetch,
    scheduleData,
    propsScheduleInfo,
    setScheduleList,
    setManageAirline,
    createEmptyDay,
    safeJsonParse,
    repairJsonString,
    isAddOrRevise,
    hotelInfoPerDay,
    cityInfoPerDay,
  } = params;


  try {
    const targetScheduleData = dataToFetch || scheduleData || propsScheduleInfo;

    if (!targetScheduleData) {
      const defaultSchedule = {
        airlineData: { sort: '', airlineCode: [] },
        scheduleDetailData: [createEmptyDay()]
      };
      setScheduleList([defaultSchedule]);
      return;
    }

    let scheduleDetailArr: any[] = [];

    if (targetScheduleData?.scheduleDetail) {
      let scheduleDetailValue = targetScheduleData.scheduleDetail;

      if (typeof scheduleDetailValue === 'string') {
        // subLocationContent 안의 HTML 때문에 JSON이 깨지는 경우를 사전에 정규화
        scheduleDetailValue = normalizeSubLocationContent(scheduleDetailValue);

        try {
          const trimmed = scheduleDetailValue.trim();
          if (trimmed && trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined') {
            scheduleDetailArr = JSON.parse(trimmed);
          } else {
            scheduleDetailArr = [];
          }
        } catch (parseError: any) {
          try {
            const trimmed = scheduleDetailValue.trim();
            const repaired = repairJsonString(trimmed);
            scheduleDetailArr = JSON.parse(repaired);
          } catch {
            scheduleDetailArr = safeJsonParse<any[]>(scheduleDetailValue, []);
          }
        }
      } else if (Array.isArray(scheduleDetailValue)) {
        scheduleDetailArr = scheduleDetailValue;
      } else if (typeof scheduleDetailValue === 'object' && scheduleDetailValue !== null) {
        scheduleDetailArr = [scheduleDetailValue];
      } else {
        scheduleDetailArr = [];
      }
    } else {
      scheduleDetailArr = [];
    }

    if (!Array.isArray(scheduleDetailArr) || scheduleDetailArr.length === 0) {
      const defaultSchedule = {
        airlineData: { sort: '', airlineCode: [] },
        scheduleDetailData: [createEmptyDay()]
      };
      setScheduleList([defaultSchedule]);

      if (targetScheduleData?.manageAirline) {
        const parsedManageAirline = safeJsonParse<any[]>(targetScheduleData.manageAirline, []);
        setManageAirline(Array.isArray(parsedManageAirline) ? parsedManageAirline : []);
      }
      return;
    }

    const originalIsViewLocationMap = new Map<string, boolean>();
    const originalIsUseContentMap = new Map<string, { isUseMainContent: boolean; mainContent: string }>();
    const originalLocationIconMap = new Map<string, string>();

    const allDetailIds: { id: string; sort: string; idx: number; isDetailBox?: boolean; scheduleIdx: number; dayIdx: number; text?: string }[] = [];

    scheduleDetailArr.forEach((schedule: any, scheduleIdx: number) => {
      if (schedule && Array.isArray(schedule.scheduleDetailData)) {
        schedule.scheduleDetailData.forEach((day: any, dayIdx: number) => {
          if (day && Array.isArray(day.scheduleDetail)) {
            // 각 DAY의 scheduleDetail 배열의 isViewLocation 값 출력
            day.scheduleDetail.forEach((detailObj: any, detailIdx: number) => {
              const isViewLocation = detailObj.isViewLocation !== undefined 
                ? detailObj.isViewLocation 
                : true;
            });
            
            // 각 DAY의 scheduleDetail 배열의 isUseMainContent 값 출력
            // console.log(`\n📋 DAY ${dayIdx + 1} - scheduleDetail isUseMainContent 값:`);
            day.scheduleDetail.forEach((detailObj: any, detailIdx: number) => {
              const isUseMainContent = detailObj.isUseMainContent !== undefined 
                ? detailObj.isUseMainContent 
                : false;
              // console.log(`  DAY${dayIdx + 1} - index ${detailIdx} -> ${isUseMainContent}`);
            });
            
            day.scheduleDetail.forEach((detailObj: any, detailIdx: number) => {
              if (detailObj && typeof detailObj === 'object') {
                if (!('id' in detailObj) && 'idx' in detailObj && detailObj.st === 'text' && detailObj.text) {
                  const idx = detailObj.idx;
                  const text = detailObj.text;
                  const viewLocationKey = `${scheduleIdx}-${dayIdx}-${idx}`;
                  // isViewLocation이 명시적으로 저장되어 있으면 그 값을 사용, 없으면 true (기본값)
                  const isViewLocationValue = detailObj.isViewLocation !== undefined 
                    ? detailObj.isViewLocation 
                    : true;
                  // console.log(`  [DAY ${dayIdx + 1}] 텍스트 항목 (idx: ${idx}): isViewLocation = ${isViewLocationValue}, key = ${viewLocationKey}`);
                  originalIsViewLocationMap.set(viewLocationKey, isViewLocationValue);
                  originalIsUseContentMap.set(viewLocationKey, {
                    isUseMainContent: detailObj.isUseMainContent !== undefined ? detailObj.isUseMainContent : false,
                    mainContent: detailObj.mainContent || ''
                  });
                  originalLocationIconMap.set(viewLocationKey, detailObj.locationIcon || '');

                  allDetailIds.push({
                    id: `text-${idx}`,
                    sort: 'text',
                    idx,
                    scheduleIdx,
                    dayIdx,
                    text
                  });
                } else if ('id' in detailObj && 'idx' in detailObj && 'st' in detailObj) {
                  const id = detailObj.id;
                  const idx = detailObj.idx;
                  const st = detailObj.st;
                  const text = detailObj.text;

                  const viewLocationKey = `${scheduleIdx}-${dayIdx}-${idx}`;
                  // isViewLocation이 명시적으로 저장되어 있으면 그 값을 사용, 없으면 true (기본값)
                  const isViewLocationValue = detailObj.isViewLocation !== undefined 
                    ? detailObj.isViewLocation 
                    : true;
                  // console.log(`  [DAY ${dayIdx + 1}] 새 형식 항목 (idx: ${idx}, st: ${st}, id: ${id}): isViewLocation = ${isViewLocationValue}, key = ${viewLocationKey}`);
                  originalIsViewLocationMap.set(viewLocationKey, isViewLocationValue);
                  const useContentData = {
                    isUseMainContent: detailObj.isUseMainContent !== undefined ? detailObj.isUseMainContent : false,
                    mainContent: detailObj.mainContent || ''
                  };
                  originalIsUseContentMap.set(viewLocationKey, useContentData);
                  originalLocationIconMap.set(viewLocationKey, detailObj.locationIcon || '');
                
                  if (st === 'text' && text) {
                    allDetailIds.push({
                      id: `text-${idx}`,
                      sort: 'text',
                      idx,
                      scheduleIdx,
                      dayIdx,
                      text
                    });
                  } else if (id !== undefined && id !== null && id !== 0 && id !== '0') {
                    let sort = 'location';
                    let isDetailBox = false;

                    if (st === 'g') {
                      sort = 'location';
                      isDetailBox = false;
                    } else if (st === 'p') {
                      sort = 'location';
                      isDetailBox = true;
                    } else if (st === 'airline') {
                      sort = 'airline';
                    } else if (st === 'train') {
                      sort = 'train';
                    } else if (st === 'bus') {
                      sort = 'bus';
                    } else if (st === 'ship') {
                      sort = 'ship';
                    }

                    allDetailIds.push({
                      id: String(id),
                      sort,
                      idx,
                      isDetailBox,
                      scheduleIdx,
                      dayIdx
                    });
                  }
                } else if (detailObj.id) {
                  const ids = Array.isArray(detailObj.id) ? detailObj.id : [detailObj.id];
                  ids.forEach((id: any) => {
                    if (id && id !== 0 && id !== '0' && id !== undefined && id !== null) {
                      // 기존 형식: idx가 없으면 detailIdx를 idx로 사용
                      const idx = detailObj.idx !== undefined ? detailObj.idx : detailIdx;
                      const viewLocationKey = `${scheduleIdx}-${dayIdx}-${idx}`;
                      // isViewLocation이 명시적으로 저장되어 있으면 그 값을 사용, 없으면 true (기본값)
                      const isViewLocationValue = detailObj.isViewLocation !== undefined 
                        ? detailObj.isViewLocation 
                        : true;
                      console.log(`  [DAY ${dayIdx + 1}] 기존 형식 location (idx: ${idx}, detailIdx: ${detailIdx}, id: ${id}): isViewLocation = ${isViewLocationValue}, key = ${viewLocationKey}`);
                      originalIsViewLocationMap.set(viewLocationKey, isViewLocationValue);
                      originalIsUseContentMap.set(viewLocationKey, {
                        isUseMainContent: detailObj.isUseMainContent !== undefined ? detailObj.isUseMainContent : false,
                        mainContent: detailObj.mainContent || ''
                      });
                      originalLocationIconMap.set(viewLocationKey, detailObj.locationIcon || '');

                      allDetailIds.push({
                        id: String(id),
                        sort: detailObj.sort || 'location',
                        idx: idx,
                        isDetailBox: detailObj.isDetailBox || false,
                        scheduleIdx,
                        dayIdx
                      });
                    }
                  });
                } else if (detailObj.sort === 'text' && detailObj.text) {
                  // 기존 형식: idx가 없으면 detailIdx를 idx로 사용
                  const idx = detailObj.idx !== undefined ? detailObj.idx : detailIdx;
                  const viewLocationKey = `${scheduleIdx}-${dayIdx}-${idx}`;
                  // isViewLocation이 명시적으로 저장되어 있으면 그 값을 사용, 없으면 true (기본값)
                  const isViewLocationValue = detailObj.isViewLocation !== undefined 
                    ? detailObj.isViewLocation 
                    : true;
                  console.log(`  [DAY ${dayIdx + 1}] 텍스트 항목 (idx: ${idx}): isViewLocation = ${isViewLocationValue}, key = ${viewLocationKey}`);
                  originalIsViewLocationMap.set(viewLocationKey, isViewLocationValue);
                  originalIsUseContentMap.set(viewLocationKey, {
                    isUseMainContent: detailObj.isUseMainContent !== undefined ? detailObj.isUseMainContent : false,
                    mainContent: detailObj.mainContent || ''
                  });
                  originalLocationIconMap.set(viewLocationKey, detailObj.locationIcon || '');

                  allDetailIds.push({
                    id: `text-${idx}`,
                    sort: 'text',
                    idx: idx,
                    scheduleIdx,
                    dayIdx,
                    text: detailObj.text
                  });
                }
              }
            });
          }
        });
      }
    });

    if (allDetailIds.length === 0) {
      const defaultSchedule = {
        airlineData: targetScheduleData?.airlineData || { sort: '', airlineCode: [] },
        scheduleDetailData: [createEmptyDay()]
      };
      setScheduleList([defaultSchedule]);

      if (targetScheduleData?.manageAirline) {
        const parsedManageAirline = safeJsonParse<any[]>(targetScheduleData.manageAirline, []);
        setManageAirline(Array.isArray(parsedManageAirline) ? parsedManageAirline : []);
      }
      return;
    }

    const detailPromises = allDetailIds.map(item => {
      if (item.sort === 'location') {
        const fetchDetailBox = () =>
          axios.post(`${AdminURL}/scheduledetailbox/getdetailboxbyid`, {
            scheduleDetailIds: [item.id]
          }).then(boxRes => {
            if (boxRes.data && Array.isArray(boxRes.data) && boxRes.data.length > 0) {
              const boxData: any = boxRes.data[0];
              return {
                sort: 'location',
                detail: {
                  id: 0,
                  location: boxData.city || '',
                  locationDetail: JSON.stringify([{
                    subLocation: boxData.sort ? `[${boxData.sort}]` : '',
                    subLocationContent: '',
                    subLocationDetail: [boxData.id]
                  }])
                },
                isMainCategory: false,
                detailBoxData: boxData,
                idx: item.idx,
                scheduleIdx: item.scheduleIdx,
                dayIdx: item.dayIdx
              };
            }
            return null;
          });

        const fetchMain = () =>
          axios.post(`${AdminURL}/scheduledetailbox/getscheduledetailbyid`, {
            scheduleDetailIds: [item.id]
          }).then(async res => {
            const hasMainData = res.data && (
              (Array.isArray(res.data) && res.data.length > 0) ||
              (!Array.isArray(res.data) && res.data)
            );

            if (hasMainData) {
              return {
                sort: 'location',
                detail: Array.isArray(res.data) ? res.data[0] : res.data,
                isMainCategory: true,
                idx: item.idx,
                scheduleIdx: item.scheduleIdx,
                dayIdx: item.dayIdx
              };
            }

            try {
              const fallback = await fetchDetailBox();
              if (fallback) {
                return {
                  ...fallback,
                  isMainCategory: false
                };
              }
            } catch (e) {
              console.error('묶음일정 기본 API 실패 후 상세일정 API 재시도 실패:', e);
            }

            return null;
          });

        if (item.isDetailBox === true) {
          return fetchDetailBox().catch(err => {
            console.error('소분류 API 호출 실패:', err);
            return null;
          });
        }

        if (item.isDetailBox === false) {
          return fetchMain().catch(err => {
            console.error('대분류 API 호출 실패:', err);
            return null;
          });
        }

        return fetchDetailBox()
          .then(result => {
            if (result) return result;
            return fetchMain();
          })
          .catch(err => {
            console.error('상세/묶음 일정 조회 실패:', err);
            return null;
          });
      } else if (item.sort === 'airline') {
        return axios.post(`${AdminURL}/airline/getairlinebyid`, { id: item.id })
          .then(res => ({
            sort: 'airline',
            airlineData: res.data || null,
            idx: item.idx,
            scheduleIdx: item.scheduleIdx,
            dayIdx: item.dayIdx
          }))
          .catch(err => {
            console.error('항공편 조회 실패 (무시하고 진행):', item.id, err?.message || err);
            return null;
          });
      } else if (item.sort === 'train') {
        return axios.post(`${AdminURL}/train/gettrainbyid`, { id: item.id })
          .then(res => ({
            sort: 'train',
            trainData: res.data || null,
            idx: item.idx,
            scheduleIdx: item.scheduleIdx,
            dayIdx: item.dayIdx
          }))
          .catch(err => {
            console.error('기차편 조회 실패 (무시하고 진행):', item.id, err?.message || err);
            return null;
          });
      } else if (item.sort === 'bus') {
        return axios.post(`${AdminURL}/bus/getbusbyid`, { id: item.id })
          .then(res => ({
            sort: 'bus',
            busData: res.data || null,
            idx: item.idx,
            scheduleIdx: item.scheduleIdx,
            dayIdx: item.dayIdx
          }))
          .catch(err => {
            console.error('버스편 조회 실패 (무시하고 진행):', item.id, err?.message || err);
            return null;
          });
      } else if (item.sort === 'ship') {
        return axios.post(`${AdminURL}/ship/getshipbyid`, { id: item.id })
          .then(res => ({
            sort: 'ship',
            shipData: res.data || null,
            idx: item.idx,
            scheduleIdx: item.scheduleIdx,
            dayIdx: item.dayIdx
          }))
          .catch(err => {
            console.error('선박편 조회 실패 (무시하고 진행):', item.id, err?.message || err);
            return null;
          });
      } else if (item.sort === 'text' && item.text) {
        return Promise.resolve({
          sort: 'text',
          text: item.text,
          idx: item.idx,
          scheduleIdx: item.scheduleIdx,
          dayIdx: item.dayIdx
        });
      }
      return Promise.resolve(null);
    });

    const detailResults = await Promise.all(detailPromises);

    const originalLocationDetailMap = new Map<string, any>();
    scheduleDetailArr.forEach((schedule: any, scheduleIdx: number) => {
      if (schedule && Array.isArray(schedule.scheduleDetailData)) {
        schedule.scheduleDetailData.forEach((day: any, dayIdx: number) => {
          if (day && Array.isArray(day.scheduleDetail)) {
            day.scheduleDetail.forEach((detailObj: any, detailIdx: number) => {
              if (detailObj && detailObj.id && detailObj.sort === 'location') {
                const detailId = Array.isArray(detailObj.id) ? detailObj.id[0] : detailObj.id;
                if (detailId && detailId !== 0 && detailId !== '0') {
                  let locationDetail: any[] = [];
                  if (detailObj.locationDetail) {
                    if (Array.isArray(detailObj.locationDetail)) {
                      locationDetail = detailObj.locationDetail;
                    } else if (typeof detailObj.locationDetail === 'string') {
                      locationDetail = safeJsonParse<any[]>(detailObj.locationDetail, []);
                    }
                  }
                  locationDetail.forEach((ld: any) => {
                    const key = `${detailId}-${ld.subLocation || ''}`;
                    originalLocationDetailMap.set(key, {
                      isUseContent: ld.isUseContent !== undefined ? ld.isUseContent : false,
                      subLocationContent: ld.subLocationContent || ''
                    });
                  });
                }
              }
            });
          }
        });
      }
    });

    let allBoxIds: string[] = [];
    const converted = detailResults.map((item, idx) => {
      if (!item) return null;
      if (item.sort === 'location' && 'detail' in item && item.detail) {
        if ('isMainCategory' in item && item.isMainCategory === false && 'detailBoxData' in item && item.detailBoxData) {
          const boxData: any = item.detailBoxData;
          const subLocationId = boxData.id;

          if (subLocationId) {
            allBoxIds.push(String(subLocationId));
          }

          const viewLocationKey = `${item.scheduleIdx}-${item.dayIdx}-${item.idx}`;
          const isViewLocation = originalIsViewLocationMap.has(viewLocationKey)
            ? originalIsViewLocationMap.get(viewLocationKey)
            : true;
          const useContentInfo = originalIsUseContentMap.get(viewLocationKey);
          const isUseMainContent = useContentInfo?.isUseMainContent !== undefined ? useContentInfo.isUseMainContent : false;
          const mainContent = useContentInfo?.mainContent || '';
          const locationIcon = originalLocationIconMap.get(viewLocationKey) || '';

          return {
            id: 0,
            sort: 'location',
            location: boxData.city || '',
            isViewLocation: isViewLocation !== false,
            isUseMainContent,
            mainContent,
            locationIcon,
            airlineData: null,
            locationDetail: [{
              subLocation: boxData.sort ? `[${boxData.sort}]` : '',
              subLocationContent: '',
              isUseContent: false,
              subLocationDetail: [subLocationId]
            }]
          };
        }

        let locationDetailArr = item.detail.locationDetail;
        if (!Array.isArray(locationDetailArr)) {
          locationDetailArr = safeJsonParse<any[]>(locationDetailArr, []);
        }

        locationDetailArr.forEach((ld: any) => {
          if (Array.isArray(ld.subLocationDetail)) {
            ld.subLocationDetail.forEach((subItem: any) => {
              if (subItem && typeof subItem === 'object' && subItem.id) {
                allBoxIds.push(String(subItem.id));
              } else if (subItem && (typeof subItem === 'string' || typeof subItem === 'number')) {
                allBoxIds.push(String(subItem));
              }
            });
          }
        });
        const viewLocationKey = `${item.scheduleIdx}-${item.dayIdx}-${item.idx}`;
        const isViewLocation = originalIsViewLocationMap.has(viewLocationKey)
          ? originalIsViewLocationMap.get(viewLocationKey)
          : true;
        console.log(`🔍 [2단계] converted - [DAY ${item.dayIdx + 1}] ${item.sort} (idx: ${item.idx}): key = ${viewLocationKey}, isViewLocation = ${isViewLocation}, hasInMap = ${originalIsViewLocationMap.has(viewLocationKey)}`);
        const useContentInfo = originalIsUseContentMap.get(viewLocationKey);
        const isUseMainContent = useContentInfo?.isUseMainContent !== undefined ? useContentInfo.isUseMainContent : false;
        const mainContent = useContentInfo?.mainContent || '';
        const locationIcon = originalLocationIconMap.get(viewLocationKey) || '';

        return {
          id: item.detail.id,
          sort: 'location',
          location: item.detail.location,
          isViewLocation: isViewLocation !== false,
          isUseMainContent,
          mainContent,
          locationIcon,
          airlineData: null,
          locationDetail: locationDetailArr.map((ld: any) => {
            const key = `${item.detail.id}-${ld.subLocation || ''}`;
            const originalLd = originalLocationDetailMap.get(key);
            const isUseContent = ld.isUseContent !== undefined
              ? ld.isUseContent
              : (originalLd?.isUseContent !== undefined ? originalLd.isUseContent : false);
            const subLocationContent = originalLd?.subLocationContent || ld.subLocationContent || '';

            return {
              subLocation: ld.subLocation,
              subLocationContent,
              isUseContent,
              subLocationDetail: Array.isArray(ld.subLocationDetail)
                ? ld.subLocationDetail.map((subItem: any) => {
                    if (subItem && typeof subItem === 'object' && subItem.id && subItem.postImages !== undefined) {
                      return subItem;
                    }
                    return subItem;
                  })
                : []
            };
          })
        };
      } else if (item.sort === 'airline' && 'airlineData' in item) {
        const viewLocationKey = `${item.scheduleIdx}-${item.dayIdx}-${item.idx}`;
        const isViewLocation = originalIsViewLocationMap.has(viewLocationKey)
          ? originalIsViewLocationMap.get(viewLocationKey)
          : true;
        const locationIcon = originalLocationIconMap.get(viewLocationKey) || '';
        console.log(`🔍 [2단계] converted - [DAY ${item.dayIdx + 1}] ${item.sort} (idx: ${item.idx}): key = ${viewLocationKey}, isViewLocation = ${isViewLocation}, hasInMap = ${originalIsViewLocationMap.has(viewLocationKey)}`);

        return {
          id: item.airlineData?.id || 0,
          sort: 'airline',
          location: '',
          isViewLocation: isViewLocation !== false,
          locationIcon,
          airlineData: item.airlineData,
          locationDetail: [{
            subLocation: '',
            subLocationContent: '',
            subLocationDetail: []
          }]
        };
      } else if (item.sort === 'train' && 'trainData' in item && item.trainData) {
        const trainData = item.trainData as any;
        const viewLocationKey = `${item.scheduleIdx}-${item.dayIdx}-${item.idx}`;
        const isViewLocation = originalIsViewLocationMap.has(viewLocationKey)
          ? originalIsViewLocationMap.get(viewLocationKey)
          : true;
        const locationIcon = originalLocationIconMap.get(viewLocationKey) || '';
        console.log(`🔍 [2단계] converted - [DAY ${item.dayIdx + 1}] ${item.sort} (idx: ${item.idx}): key = ${viewLocationKey}, isViewLocation = ${isViewLocation}, hasInMap = ${originalIsViewLocationMap.has(viewLocationKey)}`);

        return {
          id: trainData?.id || 0,
          sort: 'train',
          location: '',
          isViewLocation: isViewLocation !== false,
          locationIcon,
          trainData,
          locationDetail: [{
            subLocation: '',
            subLocationContent: '',
            subLocationDetail: []
          }]
        };
      } else if (item.sort === 'bus' && 'busData' in item && item.busData) {
        const busData = item.busData as any;
        const viewLocationKey = `${item.scheduleIdx}-${item.dayIdx}-${item.idx}`;
        const isViewLocation = originalIsViewLocationMap.has(viewLocationKey)
          ? originalIsViewLocationMap.get(viewLocationKey)
          : true;
        const locationIcon = originalLocationIconMap.get(viewLocationKey) || '';
        console.log(`🔍 [2단계] converted - [DAY ${item.dayIdx + 1}] ${item.sort} (idx: ${item.idx}): key = ${viewLocationKey}, isViewLocation = ${isViewLocation}, hasInMap = ${originalIsViewLocationMap.has(viewLocationKey)}`);

        return {
          id: busData?.id || 0,
          sort: 'bus',
          location: '',
          isViewLocation: isViewLocation !== false,
          locationIcon,
          busData,
          locationDetail: [{
            subLocation: '',
            subLocationContent: '',
            subLocationDetail: []
          }]
        };
      } else if (item.sort === 'ship' && 'shipData' in item && item.shipData) {
        const shipData = item.shipData as any;
        const viewLocationKey = `${item.scheduleIdx}-${item.dayIdx}-${item.idx}`;
        const isViewLocation = originalIsViewLocationMap.has(viewLocationKey)
          ? originalIsViewLocationMap.get(viewLocationKey)
          : true;
        const locationIcon = originalLocationIconMap.get(viewLocationKey) || '';
        console.log(`🔍 [2단계] converted - [DAY ${item.dayIdx + 1}] ${item.sort} (idx: ${item.idx}): key = ${viewLocationKey}, isViewLocation = ${isViewLocation}, hasInMap = ${originalIsViewLocationMap.has(viewLocationKey)}`);

        return {
          id: shipData?.id || 0,
          sort: 'ship',
          location: '',
          isViewLocation: isViewLocation !== false,
          locationIcon,
          shipData,
          locationDetail: [{
            subLocation: '',
            subLocationContent: '',
            subLocationDetail: []
          }]
        };
      } else if (item.sort === 'text' && 'text' in item && item.text) {
        const viewLocationKey = `${item.scheduleIdx}-${item.dayIdx}-${item.idx}`;
        const isViewLocation = originalIsViewLocationMap.has(viewLocationKey)
          ? originalIsViewLocationMap.get(viewLocationKey)
          : true;
        const useContentInfo = originalIsUseContentMap.get(viewLocationKey);
        const isUseMainContent = useContentInfo?.isUseMainContent !== undefined ? useContentInfo.isUseMainContent : false;
        const mainContent = useContentInfo?.mainContent || '';
        const locationIcon = originalLocationIconMap.get(viewLocationKey) || '';
        // console.log(`🔍 [2단계] converted - [DAY ${item.dayIdx + 1}] ${item.sort} (idx: ${item.idx}): key = ${viewLocationKey}, isViewLocation = ${isViewLocation}, isUseMainContent = ${isUseMainContent}, hasInMap = ${originalIsViewLocationMap.has(viewLocationKey)}`);

        return {
          id: 0,
          sort: 'text',
          location: item.text,
          isViewLocation: isViewLocation !== false,
          isUseMainContent,
          mainContent,
          locationIcon,
          airlineData: null,
          locationDetail: [{
            subLocation: '',
            subLocationContent: '',
            subLocationDetail: []
          }]
        };
      }
      return null;
    }).filter(Boolean);

    let boxDetailMap: Record<string, any> = {};
    if (allBoxIds.length > 0) {
      const boxRes = await axios.post(`${AdminURL}/scheduledetailbox/getdetailboxbyid`, {
        scheduleDetailIds: allBoxIds
      });
      if (Array.isArray(boxRes.data)) {
        boxRes.data.forEach((d: any) => {
          let postImages: string[] = [];
          if (Array.isArray(d.inputImage)) {
            postImages = d.inputImage.slice(0, 3);
          } else if (typeof d.inputImage === 'string') {
            const arr = safeJsonParse<string[]>(d.inputImage, []);
            postImages = Array.isArray(arr) ? arr.slice(0, 3) : [d.inputImage];
          }
          boxDetailMap[String(d.id)] = {
            id: d.id,
            postImages,
            locationTitle: d.productName,
            locationContent: d.detailNotice,
            locationDetailSort: ''
          };
        });
      }
    }

    const convertedWithBoxMap = new Map<string, any>();
    const convertedWithBox = converted.map((item: any, convertedIdx: number) => {
      if (item.sort === 'location') {
        const result = {
          ...item,
          isUseMainContent: item.isUseMainContent !== undefined ? item.isUseMainContent : false,
          mainContent: item.mainContent || '',
          locationIcon: item.locationIcon || '',
          locationDetail: item.locationDetail.map((detail: any) => ({
            ...detail,
            subLocationDetail: Array.isArray(detail.subLocationDetail)
              ? detail.subLocationDetail.map((subItem: any) => {
                  if (subItem && typeof subItem === 'object' && subItem.id && subItem.postImages !== undefined) {
                    return subItem;
                  }
                  const id = typeof subItem === 'object' && subItem.id ? String(subItem.id) : String(subItem);
                  return boxDetailMap[id] || {
                    id,
                    postImages: [],
                    locationTitle: '',
                    locationContent: '',
                    locationDetailSort: ''
                  };
                })
              : []
          }))
        };
        if (allDetailIds[convertedIdx]) {
          const key = `${allDetailIds[convertedIdx].scheduleIdx}-${allDetailIds[convertedIdx].dayIdx}-${allDetailIds[convertedIdx].idx}`;
          convertedWithBoxMap.set(key, result);
        }
        return result;
      } else {
        const result = item;
        if (allDetailIds[convertedIdx]) {
          const key = `${allDetailIds[convertedIdx].scheduleIdx}-${allDetailIds[convertedIdx].dayIdx}-${allDetailIds[convertedIdx].idx}`;
          convertedWithBoxMap.set(key, result);
        }
        return result;
      }
    });

    const detailResultsWithIdx = detailResults.map((result, resultIdx) => {
      if (result && allDetailIds[resultIdx]) {
        return {
          ...result,
          idx: allDetailIds[resultIdx].idx,
          scheduleIdx: allDetailIds[resultIdx].scheduleIdx,
          dayIdx: allDetailIds[resultIdx].dayIdx,
          originalId: allDetailIds[resultIdx].id
        };
      }
      return null;
    }).filter(Boolean);

    detailResultsWithIdx.sort((a: any, b: any) => {
      if (a.scheduleIdx !== b.scheduleIdx) return a.scheduleIdx - b.scheduleIdx;
      if (a.dayIdx !== b.dayIdx) return a.dayIdx - b.dayIdx;
      return a.idx - b.idx;
    });

    const scheduleGroups: Record<number, Record<number, any[]>> = {};
    detailResultsWithIdx.forEach((item: any) => {
      if (!scheduleGroups[item.scheduleIdx]) {
        scheduleGroups[item.scheduleIdx] = {};
      }
      if (!scheduleGroups[item.scheduleIdx][item.dayIdx]) {
        scheduleGroups[item.scheduleIdx][item.dayIdx] = [];
      }
      scheduleGroups[item.scheduleIdx][item.dayIdx].push(item);
    });

    const newScheduleList = scheduleDetailArr.map((schedule: any, scheduleIdx: number) => {
      if (!schedule.scheduleDetailData || !Array.isArray(schedule.scheduleDetailData) || schedule.scheduleDetailData.length === 0) {
        return {
          airlineData: schedule.airlineData || { sort: '', airlineCode: [] },
          scheduleDetailData: [createEmptyDay()]
        };
      }

      const scheduleDetailData = schedule.scheduleDetailData.map((day: any, dayIdx: number) => {
        if (!day || typeof day !== 'object') {
          return createEmptyDay();
        }

        const details: any[] = [];

        if (scheduleGroups[scheduleIdx] && scheduleGroups[scheduleIdx][dayIdx]) {
          const dayItems = scheduleGroups[scheduleIdx][dayIdx];
          // console.log(`🔍 [3단계] 최종 details 생성 - DAY ${dayIdx + 1}, 항목 수: ${dayItems.length}`);
          dayItems.forEach((item: any) => {
            const key = `${item.scheduleIdx}-${item.dayIdx}-${item.idx}`;
            const convertedItem = convertedWithBoxMap.get(key);
            const isViewLocation = convertedItem?.isViewLocation !== undefined
              ? convertedItem.isViewLocation
              : true;
            const isUseMainContent = convertedItem?.isUseMainContent !== undefined
              ? convertedItem.isUseMainContent
              : false;
            const mainContent = convertedItem?.mainContent || '';
            const locationIcon = convertedItem?.locationIcon || '';
            // console.log(`  [DAY ${dayIdx + 1}] 최종 항목 (idx: ${item.idx}, sort: ${item.sort}): key = ${key}, isViewLocation = ${isViewLocation}, hasInMap = ${convertedWithBoxMap.has(key)}, convertedItem =`, convertedItem);

            if (item.sort === 'airline' && item.airlineData) {
              const key = `${item.scheduleIdx}-${item.dayIdx}-${item.idx}`;
              const locationIcon = convertedWithBoxMap.get(key)?.locationIcon || '';
              details.push({
                id: parseInt(item.originalId) || 0,
                sort: 'airline',
                location: '',
                isViewLocation: isViewLocation !== false,
                locationIcon,
                idx: item.idx, // idx 저장
                airlineData: item.airlineData,
                locationDetail: [{
                  subLocation: '',
                  subLocationContent: '',
                  subLocationDetail: []
                }]
              });
            } else if (item.sort === 'train' && item.trainData) {
              const key = `${item.scheduleIdx}-${item.dayIdx}-${item.idx}`;
              const locationIcon = convertedWithBoxMap.get(key)?.locationIcon || '';
              details.push({
                id: parseInt(item.originalId) || 0,
                sort: 'train',
                location: '',
                isViewLocation: isViewLocation !== false,
                locationIcon,
                idx: item.idx, // idx 저장
                trainData: item.trainData,
                locationDetail: [{
                  subLocation: '',
                  subLocationContent: '',
                  subLocationDetail: []
                }]
              });
            } else if (item.sort === 'bus' && item.busData) {
              const key = `${item.scheduleIdx}-${item.dayIdx}-${item.idx}`;
              const locationIcon = convertedWithBoxMap.get(key)?.locationIcon || '';
              details.push({
                id: parseInt(item.originalId) || 0,
                sort: 'bus',
                location: '',
                isViewLocation: isViewLocation !== false,
                locationIcon,
                idx: item.idx, // idx 저장
                busData: item.busData,
                locationDetail: [{
                  subLocation: '',
                  subLocationContent: '',
                  subLocationDetail: []
                }]
              });
            } else if (item.sort === 'ship' && item.shipData) {
              const key = `${item.scheduleIdx}-${item.dayIdx}-${item.idx}`;
              const locationIcon = convertedWithBoxMap.get(key)?.locationIcon || '';
              details.push({
                id: parseInt(item.originalId) || 0,
                sort: 'ship',
                location: '',
                isViewLocation: isViewLocation !== false,
                locationIcon,
                idx: item.idx, // idx 저장
                shipData: item.shipData,
                locationDetail: [{
                  subLocation: '',
                  subLocationContent: '',
                  subLocationDetail: []
                }]
              });
            } else if (item.sort === 'text' && item.text) {
              details.push({
                id: 0,
                sort: 'text',
                location: item.text,
                isViewLocation: isViewLocation !== false,
                isUseMainContent,
                mainContent,
                locationIcon,
                idx: item.idx, // idx 저장
                airlineData: null,
                locationDetail: [{
                  subLocation: '',
                  subLocationContent: '',
                  subLocationDetail: []
                }]
              });
            } else if (item.sort === 'location' && item.detail) {
              if (item.isMainCategory === false && item.detailBoxData) {
                const boxData = item.detailBoxData;
                const boxDetail = boxDetailMap[String(boxData.id)];
                let postImages: string[] = [];

                if (boxDetail && Array.isArray(boxDetail.postImages)) {
                  postImages = boxDetail.postImages;
                } else {
                  if (Array.isArray(boxData.inputImage)) {
                    postImages = boxData.inputImage.slice(0, 3);
                  } else if (typeof boxData.inputImage === 'string') {
                    const parsedImages = safeJsonParse<string[]>(boxData.inputImage, []);
                    postImages = Array.isArray(parsedImages) ? parsedImages.slice(0, 3) : (parsedImages ? [parsedImages] : []);
                  }
                }

                details.push({
                  id: 0,
                  sort: 'location',
                  location: boxData.city || '',
                  isViewLocation: isViewLocation !== false,
                  isUseMainContent,
                  mainContent,
                  locationIcon,
                  idx: item.idx, // idx 저장
                  airlineData: null,
                  locationDetail: [{
                    subLocation: boxData.sort ? `[${boxData.sort}]` : '',
                    subLocationContent: '',
                    subLocationDetail: [{
                      id: boxData.id,
                      postImages,
                      locationTitle: boxDetail?.locationTitle || boxData.productName || '',
                      locationContent: boxDetail?.locationContent || boxData.detailNotice || '',
                      locationDetailSort: ''
                    }]
                  }]
                });
              } else {
                let locationDetailArr = item.detail.locationDetail;
                if (!Array.isArray(locationDetailArr)) {
                  locationDetailArr = safeJsonParse<any[]>(locationDetailArr, []);
                }

                const processedLocationDetail = locationDetailArr.map((ld: any) => ({
                  ...ld,
                  subLocationDetail: Array.isArray(ld.subLocationDetail)
                    ? ld.subLocationDetail.map((subId: any) => {
                        const idStr = String(subId);
                        return boxDetailMap[idStr] || {
                          id: subId,
                          postImages: [],
                          locationTitle: '',
                          locationContent: '',
                          locationDetailSort: ''
                        };
                      })
                    : []
                }));

                details.push({
                  id: item.detail.id || 0,
                  sort: 'location',
                  location: item.detail.location || '',
                  isViewLocation: isViewLocation !== false,
                  isUseMainContent,
                  mainContent,
                  locationIcon,
                  idx: item.idx, // idx 저장
                  airlineData: null,
                  locationDetail: processedLocationDetail
                });
              }
            }
          });
        }

        if (details.length === 0 && Array.isArray(day.scheduleDetail) && day.scheduleDetail.length > 0) {
          day.scheduleDetail.forEach((detailObj: any) => {
            if (detailObj && detailObj.sort === 'text') {
              const textValue = (detailObj.text ?? '').toString();
              if (textValue) {
                details.push({
                  id: 0,
                  sort: 'text',
                  location: textValue,
                  airlineData: null,
                  locationDetail: [{
                    subLocation: '',
                    subLocationContent: '',
                    subLocationDetail: []
                  }]
                });
              }
            }
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

        // hotelInfoPerDay 또는 cityInfoPerDay에서 해당 일차의 정보 가져오기
        // hotelInfoPerDay가 있으면 호텔 정보를 우선 사용, 없으면 cityInfoPerDay 사용
        const hotelInfoForDay = hotelInfoPerDay?.find(info => info.dayIndex === dayIdx);
        const cityInfoForDay = cityInfoPerDay?.find(info => info.dayIndex === dayIdx);
        
        // 호텔 정보가 있으면 호텔명을, 없으면 도시 정보 사용
        const displayName = hotelInfoForDay?.hotelName || cityInfoForDay?.cityName || day.hotel || '';
        const displayScore = hotelInfoForDay?.hotelLevel || (cityInfoForDay ? '' : day.score || '');

        const result = {
          breakfast: day.breakfast || '',
          lunch: day.lunch || '',
          dinner: day.dinner || '',
          hotel: displayName,
          score: displayScore,
          scheduleDetail: details
        };
        // console.log(`✅ [DAY ${dayIdx + 1}] 최종 결과:`, details.map((d: any, i: number) => ({
        //   index: i,
        //   idx: d.idx,
        //   sort: d.sort,
        //   isViewLocation: d.isViewLocation,
        //   location: d.location || d.text || 'N/A'
        // })));
        return result;
      });

      return {
        airlineData: schedule.airlineData || { sort: '', airlineCode: [] },
        scheduleDetailData
      };
    });

    setScheduleList(newScheduleList);

    if (targetScheduleData.manageAirline) {
      const parsedManageAirline = safeJsonParse<any[]>(targetScheduleData.manageAirline, []);
      setManageAirline(Array.isArray(parsedManageAirline) ? parsedManageAirline : []);
    }
  } catch (e: any) {
    // 디버깅용: 어떤 스케줄에서 오류가 났는지 확인
    try {
      // id와 scheduleDetail 원문, 에러 메시지 출력
      console.error('❌ fetchScheduleDetailDataExternal 에러:', e?.message || e);
      console.error('   targetScheduleData.id:', (dataToFetch || scheduleData || propsScheduleInfo)?.id);
      console.error('   raw scheduleDetail:', (dataToFetch || scheduleData || propsScheduleInfo)?.scheduleDetail);
    } catch {
      // 로깅 중 에러가 나더라도 화면은 계속 동작하게 방어
    }

    const defaultSchedule = {
      airlineData: { sort: '', airlineCode: [] },
      scheduleDetailData: [createEmptyDay()]
    };
    setScheduleList([defaultSchedule]);
  }
};