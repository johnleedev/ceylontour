import { Route, Routes } from "react-router-dom";
import CounselMain from "./CounselMain";
import RestRouter from "./rest/RestRouter";
import TourRouter from "./tour/TourRouter";
import ScheduleRederBox from "../common/ScheduleRederBox";

export default function CounselRouter() {
  return (
    <div>
      <Routes >
        <Route path="/" element={<CounselMain />}/>
        <Route path="/rest/*" element={<RestRouter />}/>
        <Route path="/tour/*" element={<TourRouter />}/>
        <Route path="/scheduletest" element={<ScheduleRederBox/>}/>
      </Routes>
    </div>
  );
  
}
