import { Route, Routes } from "react-router-dom";

import CounselRestHeader from "../common/CounselRestHeader";
import RestTripPage from "./1trip/RestTripPage";
import RestHotelPage from "./2hotel/RestHotelPage";
import RestHotelDetail from "./2hotel/RestHotelDetail";
import RestHotelCost from "./2hotel/RestHotelCost";
import RestSchedulePage from "./3schedule/RestSchedulePage";
import RestFlightPage from "./4flight/RestFlightPage";
import RestEstimatePage from "./5estimate/RestEstimatePage";



export default function RestRouter() {
  return (
    <div>
      <CounselRestHeader />
      <Routes >
        <Route path="/" element={<RestTripPage />}/>
        <Route path="/hotel" element={<RestHotelPage />}/>
        <Route path="/hoteldetail" element={<RestHotelDetail />}/>
        <Route path="/hotelcost" element={<RestHotelCost />}/>
        <Route path="/schedule" element={<RestSchedulePage />}/>
        <Route path="/flight" element={<RestFlightPage />}/>
        <Route path="/estimate" element={<RestEstimatePage />}/>

      </Routes>
    </div>
  );
  
}
