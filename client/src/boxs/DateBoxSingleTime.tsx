import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import { FaRegCalendarAlt } from "react-icons/fa";
import './Boxs.scss';
import { useState } from "react";
import { format } from "date-fns";

interface DateBoxDoubleProps {
  date: Date | null;
  setSelectDate: any; // 수정된 부분
  marginLeft?: number;
}

export const DateBoxSingleTime: React.FC<DateBoxDoubleProps> = ({ date, setSelectDate, marginLeft }) => {
  const [startDate, setStartDate] = useState<Date | null>(date instanceof Date ? date : null);

  const handleSelectDateChange = (event: Date | null) => {
    if (!event) {
      setStartDate(null);
      setSelectDate(null);
      return;
    }
    setStartDate(event);
    const formattedDate = format(event, 'yyyy-MM-dd HH:mm');
    setSelectDate(formattedDate);
  };
  

  return (
    <div className="calendarbox calendarSingleTime" style={{ marginLeft: marginLeft ? `${marginLeft}px` : '5px' }}>
      <div className="datebox dateboxSingleTime">
        <DatePicker
          locale={ko}
          shouldCloseOnSelect
          minDate={new Date('2024-01-01')}
          selected={startDate}
          isClearable
          onChange={handleSelectDateChange}
          showYearDropdown
          showTimeSelect
          timeIntervals={30}
          dateFormat="yyyy-MM-dd HH:mm"
        />
      </div>
      <FaRegCalendarAlt className="calender-icon" style={{ right: '10px' }} />
    </div>
  );
};
