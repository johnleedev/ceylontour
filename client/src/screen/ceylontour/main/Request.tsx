import React, { useEffect, useState } from 'react';
// import Footer from '../../../components/';
import './Main.scss'
import axios from 'axios';
import { MainURL }from '../../../MainURL';
import { format } from "date-fns";
import Footer from '../../component/Footer';
import { DateBoxDouble } from '../../../boxs/DateBoxDouble';
import { DropdownBox } from '../../../boxs/DropdownBox';
import { DropDownNum, DropDownTime, DropDownTime2 } from '../../DefaultData';
import { DateBoxSingle } from '../../../boxs/DateBoxSingle';

export default function Main(props:any) {

	const currentDate = new Date();
	const date = format(currentDate, 'yyyy-MM-dd');

	const [selectTab1, setSelectTab1] = useState('selected');
  const [selectTab2, setSelectTab2] = useState('');

  // 접속시 접속수 증가시키기
  const appUseCount = () => {
    
    axios
      .post(`${MainURL}/appusecount`, {
        date : date
      })
      .then((res) => {return})
      .catch((error) => {
        console.log(error);
      });
  }
     
  useEffect(()=>{
    appUseCount();
  }, []); 


	const [sort, setSort] = useState('상담');
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [dateCeremony, setDateCeremony] = useState(date);
	const [tourLocation, setTourLocation] = useState('');
	const [requestion, setRequestion] = useState('');
	const [visitDate, setVisitDate] = useState(date);
	const [visitTime, setVisitTime] = useState('AM 9:00');
	const [callTime, setCallTime] = useState('전일가능');
	const [stage, setStage] = useState('');

	const [dateStart, setDateStart] = useState(date);
	const [dateEnd, setDateEnd] = useState(date);
	const [tourType, setTourType] = useState('');
	const [tourPersonNum, setTourPersonNum] = useState('1');

	 // 수정저장 함수
	 const handleRequest = async () => {
    await axios
    .post(`${MainURL}//request`, {
      date : date,
			sort : selectTab1 === 'selected' ? '상담' : '견적',
			name : name,
			phone : phone,
			dateCeremony : dateCeremony,
			tourLocation : tourLocation,
			requestion : requestion,
			visitDate : visitDate,
			visitTime : visitTime,
			visitPath : '웹사이트',
			callTime : callTime,
			stage : stage,
			dateStart: dateStart,
			dateEnd : dateEnd,
			tourType: tourType,
			tourPersonNum: tourPersonNum
    })
    .then((res)=>{
      if (res.data) {
        alert('문의가 등록되었습니다.');
				setName('');
				setPhone('');
				setDateCeremony('');
				setTourLocation('');
				setRequestion('');
				setVisitDate('');
				setVisitTime('');
				setCallTime('');
				setStage('');
				setDateStart('');
				setDateEnd('');
				setTourType('');
				setTourPersonNum('1');
      }
    })
    .catch((err)=>{
      alert('다시 시도해주세요.')
    })
  };

	return (
		<div className='request'>

			<div className="inner">

				<div className="request--inputboxCover">

					<div className="request--select-row">
						<div className={`request--select-btn ${selectTab1}`}
							onClick={()=>{setSelectTab1('selected'); setSelectTab2('');}}
						>
							<p style={{color: selectTab1 === 'selected' ? '#333' : '#BDBDBD'}}>상담예약하기</p>
						</div>
						<div className={`request--select-btn ${selectTab2}`}
							onClick={()=>{setSelectTab1(''); setSelectTab2('selected')}}
						>
							<p style={{color: selectTab2 === 'selected' ? '#333' : '#BDBDBD'}}>견적문의하기</p>
						</div>
					</div>

					<div className="request--inputbox-row">
						<div className="request--title">
							<p>예식일</p>
						</div>
						<div className="request--content">
							<DateBoxSingle  setSelectDate={setDateCeremony} date={dateCeremony}/>
							<div className='request--btn'
								onClick={()=>{setDateCeremony('')}}
							>
								<p>미정</p>
							</div>
  					</div>
					</div>

					<div className="request--inputbox-row">
						<div className="request--title">
							<p>이름</p>
						</div>
						<div className="request--content">
							<input className="request--inputdefault" type="text" style={{width:'200px'}} 
							value={name} onChange={(e)=>{setName(e.target.value)}}/>
  					</div>
					</div>

					<div className="request--inputbox-row">
						<div className="request--title">
							<p>연락처</p>
						</div>
						<div className="request--content">
							<input className="request--inputdefault" type="text" style={{width:'200px'}} 
							value={phone} onChange={(e)=>{setPhone(e.target.value)}}/>
  					</div>
					</div>

					{
						selectTab2 === 'selected' &&
						<div className="request--inputbox-row">
							<div className="request--title">
								<p>여행타입</p>
							</div>
							<div className="request--content">
								<div className='request--btn2'
									style={{marginRight:'10px', backgroundColor: tourType === '허니문' ? '#8d8d8d' : '#fff'}}
									onClick={()=>{setTourType('허니문')}}
								>
									<p style={{color: tourType === '허니문' ? '#fff' : '#676767'}}>허니문</p>
								</div>
								<div className='request--btn2'
									style={{marginRight:'10px', backgroundColor: tourType === '일반' ? '#8d8d8d' : '#fff'}}
									onClick={()=>{setTourType('일반')}}
								>
									<p style={{color: tourType === '일반' ? '#fff' : '#676767'}}>일반</p>
								</div>
							</div>
						</div>
					}

					{
						selectTab2 === 'selected' &&
						<div className="request--inputbox-row">
							<div className="request--title">
								<p>여행기간</p>
							</div>
							<div className="request--content">
								<DateBoxDouble  setSelectStartDate={setDateStart} setSelectEndDate={setDateEnd} dateStart={dateStart} dateEnd={dateEnd}/>
							</div>
						</div>
					}

					{
						selectTab2 === 'selected' &&
						<div className="request--inputbox-row">
							<div className="request--title">
								<p>인원</p>
							</div>
							<div className="request--content">
							<DropdownBox
								widthmain='150px'
								height='35px'
								selectedValue={visitTime}
								options={DropDownNum}    
								handleChange={(e)=>{setVisitTime(e.target.value)}}
							/>
							</div>
						</div>
					}

					<div className="request--inputbox-row">
						<div className="request--title">
							<p>관심 여행지</p>
						</div>
						<div className="request--content">
							{
								['유렵', '미주', '몰디브', '칸쿤', '모리셔스', '하와이', '괌', '발리', '사무이', '푸켓', '카오락', '나트랑', '푸꾸옥', '다낭']
								.map((item:any, index:any)=>{
									return (
										<div className='request--btn2'
											style={{border: tourLocation === item ? '2px solid #8d8d8d' : '1px solid #cecece', marginBottom:'10px'}}
											onClick={()=>{setTourLocation(item)}}
										>
											<p>{item}</p>
										</div>
									)
								})
							}
  					</div>
					</div>

					<div className="request--inputbox-row">
						<div className="request--title">
							<p>기타 여행지</p>
						</div>
						<div className="request--content">
							<input className="request--inputdefault" type="text" style={{width:'200px'}} 
							value={tourLocation} onChange={(e)=>{setTourLocation(e.target.value)}}/>
  					</div>
					</div>

					<div className="request--inputbox-row">
						<div className="request--title">
							<p>통화 가능시간</p>
						</div>
						<div className="request--content">
							<DropdownBox
								widthmain='150px'
								height='35px'
								selectedValue={callTime}
								options={DropDownTime2}    
								handleChange={(e)=>{setCallTime(e.target.value)}}
							/>
  					</div>
					</div>
					
					{
						selectTab1 === 'selected' &&
						<div className="request--inputbox-row">
							<div className="request--title">
								<p>방문상담예약</p>
							</div>
							<div className="request--content">
								<DateBoxSingle setSelectDate={setVisitDate} date={visitDate}/>
								<DropdownBox
									widthmain='150px'
									height='35px'
									selectedValue={tourPersonNum}
									options={DropDownTime}    
									handleChange={(e)=>{setTourPersonNum(e.target.value)}}
								/>
							</div>
						</div>
					}

					<div className="request--inputbox-row">
						<div className="request--title">
							<p>장소</p>
						</div>
						<div className="request--content">
							<div className='request--btn2'
								style={{marginRight:'10px', backgroundColor: stage === '대구본사' ? '#8d8d8d' : '#fff'}}
								onClick={()=>{setStage('대구본사')}}
							>
								<p style={{color: stage === '대구본사' ? '#fff' : '#676767'}}>대구본사</p>
							</div>
							<div className='request--btn2'
								style={{marginRight:'10px', backgroundColor: stage === '창원지사' ? '#8d8d8d' : '#fff'}}
								onClick={()=>{setStage('창원지사')}}
							>
								<p style={{color: stage === '창원지사' ? '#fff' : '#676767'}}>창원지사</p>
							</div>
  					</div>
					</div>

					<div className="request--inputbox-row">
						<div className="request--title">
							<p>요청사항</p>
						</div>
						<div className="request--content">
							<textarea 
								className="request--textarea"
								value={requestion}
								onChange={(e)=>{setRequestion(e.target.value)}}
							/>
  					</div>
					</div>

					<div className='request--btn-box'>
						<div className="request--btn" 
							onClick={handleRequest}
						>
							<p>문의하기</p>
						</div>
					</div>
					
				</div>
			</div>
            
			<Footer />

		</div>
	);
}
