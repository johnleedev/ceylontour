import { Route, Routes } from "react-router-dom";

import CounselTourHeader from "../common/CounselTourHeader";
import EuropeTripPage from "./1trip/EuropeTripPage";
import EuropeCityPage from "./2city/EuropeCityPage";
import EuropeCityDetail from "./2city/EuropeCityDetail";
import EuropeScheduleRecommend from "./3schedule/EuropeScheduleCost";
// import EuropeScheduleEdit from "./3schedule/EuropeScheduleEdit";
import EuropeEstimatePage from "./5estimate/EuropeEstimatePage";


export default function TourRouter() {
  return (
    <div>
      <CounselTourHeader />
      <Routes >
        <Route path="/" element={<EuropeTripPage />}/>
        <Route path="/city" element={<EuropeCityPage />}/>
        <Route path="/citydetail" element={<EuropeCityDetail />}/>
        <Route path="/schedulerecommend" element={<EuropeScheduleRecommend />}/>
        {/* <Route path="/scheduleedit" element={<EuropeScheduleEdit />}/> */}
        <Route path="/estimate" element={<EuropeEstimatePage />}/>
        
      </Routes>
    </div>
  );
  
}
