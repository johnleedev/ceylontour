import React, { useEffect, useState } from 'react';
import './CounselLogin.scss'
import axios from 'axios';
import { AdminURL } from '../../MainURL';
import { FaCheck } from "react-icons/fa";
import { CiWarning } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import { IoPersonOutline } from "react-icons/io5";
import { IoLockClosedOutline } from "react-icons/io5";
import { useSetRecoilState } from 'recoil';
import { recoilUserInfo } from '../../RecoilStore';

export default function CounselLogin () {

  let navigate = useNavigate();
  const setUserInfo = useSetRecoilState(recoilUserInfo);

  const [refresh, setRefresh] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState(1);
  const [userId, setUserId] = useState('');
  const [userPasswd, setUserPasswd] = useState('');

  const [logisterName, setLogisterName] = useState('');
  const [logisterId, setLogisterId] = useState('');
  const [logisterPasswd, setLogisterPasswd] = useState('');
  const [logisterPasswdCheck, setLogisterPasswdCheck] = useState('');

  const handleLogin = async () => {
    await axios
      .post(`${AdminURL}/control/loginadmin`, {
        userId : userId,
        passwd : userPasswd
      })
      .then((res)=>{
        if (res.data.success) {
          if (res.data.auth === 'true') {
            setUserInfo({
              name: res.data.name || '',
              userId: res.data.userId || '',
              auth: res.data.auth || ''
            });
            alert('로그인 되었습니다.');
            setRefresh(!refresh);
            navigate('/counsel');
          } else {
            alert('관리자 로그인 승인이 필요합니다.');
          }
        } else {
         if (res.data.which === 'id') {
           alert('없는 아이디입니다.');  
         }
         if (res.data.which === 'passwd') {
           alert('비밀번호가 정확하지 않습니다.');
         }
        }
      })
      .catch((err)=>{
        alert('다시 시도해주세요.')
      })
   };
 

  return (
    <div className='MainAdmin'>

      <div className="inner">

        <div className="loginBox">
          <h1 className="logintitle">LOGIN</h1>
          <div className="inputbox">
            <p className='icon'><IoPersonOutline /></p>
            <input value={userId} className="inputdefault addInput" type="text" 
              onChange={(e) => {setUserId(e.target.value)}}
              onKeyDown={(e)=>{if (e.key === 'Enter') {handleLogin();}}}/>
          </div>
          <div className="inputbox">
            <p className='icon'><IoLockClosedOutline /></p>
            <input value={userPasswd} className="inputdefault addInput" type="password" 
              onChange={(e) => {setUserPasswd(e.target.value)}}
              onKeyDown={(e)=>{if (e.key === 'Enter') {handleLogin();}}}/>
          </div>
          <div className='btn-row' 
            onClick={handleLogin}
          >
            <p>로그인</p>
          </div>
          
        </div>
        

        

       
        
      </div>
     
    </div>
  );
}

