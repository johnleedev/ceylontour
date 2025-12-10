// RestMainPage ------------------------------------------------------------

export interface ProductRestHotelInfo {
  id: number;
  isView: boolean;
  hotelSort: string;
  isInfoInput: boolean;
  nation: string;
  city: string;
  hotelNameKo: string;
  hotelNameEn: string;
  hotelLevel: string;
  hotelPhone: string;
  hotelAddress: string;
  hotelLocation?: string;
  hotelBadge?: string;
  hotelNotice?: string;
  hotelRecommendPoint?: string;
  hotelConvenience: string[];
  notIncludeCost?: string;
  hotelCheckIn: string;
  hotelCheckOut: string;
  hotelPolicy: {
    allowPet: string;
    forAdult?: string;
  };
  hotelParking: string;
  customerScore?: string;
  tripAdviser?: string;
  resortCategory: string[];
  hotelCategory: string[];
  serviceCategory: {
    product?: string;
    program?: string;
    productCost?: string;
  }[];
  imageNamesAllView: string[];
  imageNamesRoomView: string[];
  imageNamesEtcView: string[];
  reviseDate: string;
}


// RestDetailPage ------------------------------------------------------------
export interface ImageNoticeProps {
  imageName: string; 
  title: string;
  notice: string;
}

export interface RestAirlineProps {
  id: number;
  tourPeriod: string;
  departAirportMain : string;
  airlineData: AirlineSubProps[];
}   
interface AirlineSubProps {
  sort : string;
  airlineName: string;
  departDate: string[];
  planeName: string;
  departAirport: string;
  departTime: string;
  arriveAirport: string;
  arriveTime: string;
}

export interface RestScheduleListProps {
  id: number;
	isView : string;
	sort : string;
	nation: string;
	tourLocation: string;
	landCompany : string;
	productType: string;
	tourPeriod: string;
	departAirport: string;
	departFlight : string;
	selectedSchedule : string;
	cautionNote : string;
	includeNote : string[];
	includeNoteText : string;
	notIncludeNote : string[];
	notIncludeNoteText : string;
	scheduleList : string;
	reviseDate : string;
}

export interface RestSelectScheduleDetailProps {
  day : string;
  breakfast :string;
  lunch:string;
  dinner :string;
  hotel:string;
  score:string;
  scheduleDetail: ScheduleDetailProps[];
}
 
interface ScheduleDetailProps {
  id : string;
  sort: string;
  location: string;
  subLocation : string;
  locationTitle : string;
  locationContent : string;
  locationContentDetail : {name:string; notice:string[]}[];
  postImage : string;
}