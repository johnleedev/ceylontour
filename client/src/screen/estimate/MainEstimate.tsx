import Header from "../component/Header";
import { Route, Routes } from "react-router-dom";
import EstimateMade from "./EstimateMade";


export default function MainEstimate() {


  return (
    <div>
      <Header />
      <Routes >
        <Route path="/" element={<EstimateMade />}/>
      </Routes>
    </div>
  );
  
}
