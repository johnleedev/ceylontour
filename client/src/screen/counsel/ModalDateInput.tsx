import React, { useState, useEffect } from 'react';
import DatePicker, { CalendarContainer } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import { FaRegCalendarAlt } from "react-icons/fa";
import '../../boxs/Boxs.scss';

interface ModalDateInputProps {
  isOpen: boolean;
  onClose: () => void;
  dateStart: Date | null;
  dateEnd: Date | null;
  onDateChange: (startDate: string, endDate: string) => void;
}

export default function ModalDateInput({
  isOpen,
  onClose,
  dateStart,
  dateEnd,
  onDateChange
}: ModalDateInputProps) {
  const [startDate, setStartDate] = useState<Date | null>(dateStart);
  const [endDate, setEndDate] = useState<Date | null>(dateEnd);

  // props가 변경될 때 내부 상태 업데이트
  useEffect(() => {
    setStartDate(dateStart);
    setEndDate(dateEnd);
  }, [dateStart, dateEnd]);

  const handleSelectDateChange = (event: any) => {
    const [start, end] = event;
    setStartDate(start);
    setEndDate(end);

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

      onDateChange(reformmedStartText, reformmedEndText);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '30px',
          position: 'relative',
          zIndex: 10002,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '2px solid #e0e0e0'
          }}
        >
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            여행기간 선택
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#999';
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px 0',
            minHeight: '300px'
          }}
        >
          <div className='calendarbox calendarDouble' style={{ marginLeft: '5px' }}>
            <div className="datebox dateboxDouble">
              <DatePicker
                locale={ko}
                shouldCloseOnSelect
                minDate={new Date('2023-01-01')}
                dateFormat="yyyy-MM-dd"
                selectsRange
                startDate={startDate}
                endDate={endDate}
                monthsShown={12}
                isClearable
                onChange={handleSelectDateChange}
                formatWeekDay={(nameOfDay) => nameOfDay.substring(0, 1)}
                showYearDropdown
                withPortal={false}
              />
            </div>
            <FaRegCalendarAlt className='calender-icon' style={{ right: '10px' }} />
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e0e0e0'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#5fb7ef',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4aa8d8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#5fb7ef';
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
