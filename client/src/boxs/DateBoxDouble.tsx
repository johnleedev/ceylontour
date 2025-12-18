import DatePicker, { CalendarContainer } from "react-datepicker";
import  "react-datepicker/dist/react-datepicker.css" ;
import {ko} from "date-fns/locale";
import { FaRegCalendarAlt } from "react-icons/fa";
import './Boxs.scss'
import { useState, useEffect } from "react";


interface DateBoxDoubleProps {
  dateStart: any;
  dateEnd: any;
  setSelectStartDate : any;
  setSelectEndDate : any;
  marginLeft? : number
}

export const DateBoxDouble : React.FC<DateBoxDoubleProps> = ({dateStart, dateEnd, setSelectStartDate, setSelectEndDate, marginLeft }) => {

  const [startDate, setStartDate] = useState(dateStart);
  const [endDate, setEndDate] = useState(dateEnd);

  // dateStart와 dateEnd prop이 변경될 때 내부 상태 업데이트
  useEffect(() => {
    if (dateStart) {
      const newStartDate = dateStart instanceof Date ? dateStart : new Date(dateStart);
      setStartDate(newStartDate);
    } else {
      setStartDate(null);
    }
    if (dateEnd) {
      const newEndDate = dateEnd instanceof Date ? dateEnd : new Date(dateEnd);
      setEndDate(newEndDate);
    } else {
      setEndDate(null);
    }
  }, [dateStart, dateEnd]);

  const handleSelectDateChange = ( event : any) => {

    const [start, end] = event;
    setStartDate(start); // 시작 날짜 설정
    setEndDate(end); // 종료 날짜 설정
   
    if (end) {
      const startcopy = start.toLocaleDateString('ko-KR');
      const endcopy = end.toLocaleDateString('ko-KR');
  
      const startsplitCopy = startcopy.slice(0, -1).split('. ');
      const startsplitCopy2Copy = startsplitCopy[1] < 10 ? `0${startsplitCopy[1]}` : startsplitCopy[1];
      const startsplitCopy3Copy = startsplitCopy[2] < 10 ? `0${startsplitCopy[2]}` : startsplitCopy[2];
      const reformmedStartText = `${startsplitCopy[0]}-${startsplitCopy2Copy}-${startsplitCopy3Copy}`;

      const endsplitCopy = endcopy.slice(0, -1).split('. ');
      const endsplitCopy2Copy = endsplitCopy[1] < 10 ? `0${endsplitCopy[1]}` : endsplitCopy[1];
      const endsplitCopy3Copy = endsplitCopy[2] < 10 ? `0${endsplitCopy[2]}` : endsplitCopy[2];
      const reformmedEndText = `${endsplitCopy[0]}-${endsplitCopy2Copy}-${endsplitCopy3Copy}`;

      setSelectStartDate(reformmedStartText);
      setSelectEndDate(reformmedEndText);

    }

  }
  return (
    <div className='calendarbox calendarDouble' style={{marginLeft: marginLeft ? `${marginLeft}px` : '5px'}}>
      <div className="datebox dateboxDouble">
         <DatePicker
          locale={ko}
          // selected={dateStart}
          shouldCloseOnSelect // 날짜 선택시 달력 닫힘
          minDate={new Date('2023-01-01')} // 선택 가능한 최소 날짜
          dateFormat="yyyy-MM-dd"
          selectsRange // 날짜 범위를 선택할 수 있도록 활성화합니다.     
          startDate={startDate} // 날짜 범위 선택 시, 범위의 시작 날짜와 종료 날짜를 설정합니다.
          endDate={endDate}
          monthsShown={4}// 달력 2개 표시
          isClearable // 선택한 날짜를 초기화할 수 있는 버튼(클리어 버튼)을 활성화합니다.
          onChange={handleSelectDateChange}
          formatWeekDay={(nameOfDay) => nameOfDay.substring(0, 1)}
          showYearDropdown // 연도 선택 드롭다운을 활성화합니다
        />
      </div>
      <FaRegCalendarAlt className='calender-icon' style={{right: '10px'}}/>
    </div>  
  )
}
  
  
