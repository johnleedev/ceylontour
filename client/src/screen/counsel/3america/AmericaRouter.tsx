import { Route, Routes } from "react-router-dom";

import CounselTourHeader from "../common/CounselTourHeader";
import AmericaTripPage from "./1trip/AmericaTripPage";
import AmericaHotelPage from "./3hotel/AmericaHotelPage";  
import AmericaScheduleRecommend from "./2schedule/AmericaScheduleRecommend";
import AmericaScheduleCustom from "./2schedule/AmericaScheduleCustom";
import FlightPage from "./4flight/AmericaFlightPage";
import EstimatePage from "./5estimate/AmericaEstimatePage";


export default function AmericaRouter() {
  return (
    <div>
      <CounselTourHeader />
      <Routes >
        <Route path="/" element={<AmericaTripPage />}/>
        <Route path="/hotel" element={<AmericaHotelPage />}/>
        <Route path="/schedulerecommend" element={<AmericaScheduleRecommend />}/>
        <Route path="/schedulecustom" element={<AmericaScheduleCustom />}/>
        <Route path="/flight" element={<FlightPage />}/>
        <Route path="/estimate" element={<EstimatePage />}/>
      </Routes>
    </div>
  );
  
}
