import { Route, Routes } from "react-router-dom";

import CounselTourHeader from "../common/CounselTourHeader";
import TripPage from "./1trip/AstTripPage";
import HotelPage from "./3hotel/AstHotelPage";
import ScheduleRecommend from "./2schedule/AstScheduleRecommend";
import ScheduleCustom from "./2schedule/AstScheduleCustom";
import FlightPage from "./4flight/AstFlightPage";
import EstimatePage from "./5estimate/AstEstimatePage";


export default function AustraliaRouter() {
  return (
    <div>
      <CounselTourHeader />
      <Routes >
        <Route path="/" element={<TripPage />}/>
        <Route path="/hotel" element={<HotelPage />}/>
        <Route path="/schedulerecommend" element={<ScheduleRecommend />}/>
        <Route path="/schedulecustom" element={<ScheduleCustom />}/>
        <Route path="/flight" element={<FlightPage />}/>
        <Route path="/estimate" element={<EstimatePage />}/>

        
      </Routes>
    </div>
  );
  
}
