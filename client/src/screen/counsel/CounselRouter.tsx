import { Route, Routes } from "react-router-dom";
import CounselMain from "./CounselMain";
import RestRouter from "./1rest/RestRouter";
import TourRouter from "./2europe/TourRouter";
import ScheduleRederBox from "../common/ScheduleRederBox";
import AmericaRouter from "./3america/AmericaRouter";
import AustraliaRouter from "./4australia/AustraliaRouter";

export default function CounselRouter() {
  return (
    <div>
      <Routes >
        <Route path="/" element={<CounselMain />}/>
        <Route path="/rest/*" element={<RestRouter />}/>
        <Route path="/europe/*" element={<TourRouter />}/>
        <Route path="/america/*" element={<AmericaRouter />}/>
        <Route path="/australia/*" element={<AustraliaRouter />}/>
        <Route path="/scheduletest" element={<ScheduleRederBox/>}/>
      </Routes>
    </div>
  );
  
}
