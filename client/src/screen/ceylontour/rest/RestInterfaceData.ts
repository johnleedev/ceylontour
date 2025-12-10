export interface HotelDataProps {
  id: number;
  isView: string;
  hotelSort: string;
  nation: string;
  city: string;
  relatedLC: string; // JSON 문자열로 저장된 배열
  hotelNameKo: string;
  hotelNameEn: string;
  hotelLevel: string;
  hotelType: string | null;
  hotelPhone: string;
  hotelAddress: string;
  hotelLocation: string;
  hotelBadge: string; // JSON 문자열로 저장된 배열
  tourType: string; // JSON 문자열로 저장된 배열
  hotelMood: string; // JSON 문자열로 저장된 배열
  hotelNotice: string;
  hotelRecommendPoint: string;
  hotelConvenience: string; // JSON 문자열로 저장된 배열
  notIncludeCost: string; // JSON 문자열로 저장된 배열
  hotelCheckIn: string;
  hotelCheckOut: string;
  hotelPolicy: string; // JSON 문자열로 저장된 HotelPolicy 객체
  hotelParking: string;
  customerScore: string;
  tripAdviser: string;
  resortCategory: string; // JSON 문자열로 저장된 배열
  hotelCategory: string; // JSON 문자열로 저장된 배열
  hotelRoomTypes: string; // JSON 문자열로 저장된 HotelRoomType 배열
  serviceCategory: string; // JSON 문자열로 저장된 ServiceCategory 배열
  benefitCategory: string; // JSON 문자열로 저장된 BenefitCategory 객체
  reviseDate: string;
  imageNamesAllView: string;
  imageNamesRoomView: string;
  imageNamesEtcView: string;
  hotelID: string;
}


export interface ScheduleDataProps {
  id: number;
  isView: string;
  nation: string;
  tourLocation: string;
  airportCode: string;
  landCompany: string;
  applyPackage: string;
  scheduleSort: string;
  tourPeriodData: string;
  manageAirline: string;
  productName: string;
  productScheduleData: string;
  costType: string;
  scheduleOutline: string;
  includeNote: string;
  includeNoteText: string;
  notIncludeNote: string;
  notIncludeNoteText: string;
  cautionNote: string;
  scheduleDetail: string;
  reviseDate: string;
}