import './App.scss';
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';

import Main from './screen/ceylontour/main/Main';
import RestRouter from './screen/ceylontour/rest/RestRouter';
import TourRouter from './screen/ceylontour/tour/tourRouter';
import CounselRouter from './screen/counsel/CounselRouter';
import Test from './screen/Test';

function App() {

      
  useEffect(()=>{
    
  }, []); 
  
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Main/>}/>
        <Route path="/counsel/*" element={<CounselRouter/>}/>
        <Route path="/rest/*" element={<RestRouter/>}/>
        <Route path="/tour/*" element={<TourRouter/>}/>
        <Route path="/test" element={<Test/>}/>
      </Routes>
    </div>
  );
}

export default App;