import { atom } from "recoil";


export const recoilExchangeRate = atom({
  key: "exchangeRate",
  default: {
      date: '',
      USDunit : '',
      USDsend_KRW_tts : 0,
      EURunit : '',
      EURsend_KRW_tts : 0,
    }
});

export const recoilExchangeAuthKey = atom({
  key: "exchangeAuthKey",
  default: "JO8PTEDP9D2ZK5AE0Y10"
});


// 로그인 사용자 정보 저장
export interface UserInfo {
  name: string;
  userId: string;
  auth: string;
}

export const recoilUserInfo = atom<UserInfo>({
  key: "userInfo",
  default: {
    name: '',
    userId: '',
    auth: ''
  }
});


export const recoilCounselFormData = atom({
  key: "counselFormData",
  default: {
    customerName: '',
    theme: '',
    destination: '',
    travelDate: '',
    duration: ''
  }
});

export interface CustomerInfoFormData {
  theme: string[];
  customer1Name: string;
  customer1Phone: string;
  customer2Name: string;
  customer2Phone: string;
  destination: string;
  weddingDate: string;
  travelPeriodStart: string;
  travelPeriodEnd: string;
  reserveDate: string;
  travelStyle: string[];
  flightStyle: string[];
  accommodationPreference: string[];
  wantsAndNeeds: string;
  selfTicketing: boolean;
  beforeTicketing: boolean;
}

export const recoilCustomerInfoFormData = atom<CustomerInfoFormData>({
  key: "customerInfoFormData",
  default: {
    theme: ['honeymoon'],
    customer1Name: '',
    customer1Phone: '',
    customer2Name: '',
    customer2Phone: '',
    destination: '',
    weddingDate: (() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    travelPeriodStart: '',
    travelPeriodEnd: '',
    reserveDate: (() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })(),
    travelStyle: [],
    flightStyle: [],
    accommodationPreference: [],
    wantsAndNeeds: '',
    selfTicketing: false,
    beforeTicketing: false
  }
});

export interface HotelInfo {
  id?: number;
  hotelNameKo?: string;
  hotelNameEn?: string;
  nation?: string;
  city?: string;
  hotelAddress?: string;
  hotelLocation?: string;
  tripAdviser?: string;
  customerScore?: string;
  hotelLevel?: string;
  hotelBadge?: string;
  imageNamesAllView?: string;
  imageNamesRoomView?: string;
  imageNamesEtcView?: string;
  hotelRoomTypes?: string;
  [key: string]: any;
}

export interface ProductInfo {
  id?: number;
  productName?: string;
  scheduleSort?: string;
  costType?: string;
  tourPeriodData?: string;
  includeNote?: string;
  notIncludeNote?: string;
  productScheduleData?: string;
  [key: string]: any;
}

export interface SelectedHotelData {
  hotelInfo: HotelInfo | null;
  productInfo: ProductInfo | null;
  scheduleCards: any[];
  selectedHotels?: Array<{ index: number; hotelSort: string; dayNight?: string; hotel: any | null }>;
  periodText: string;
  includeItems: string[];
  excludeItems: string[];
  selectedRoomTypes?: { [key: number]: string };
  selectedNights?: { [key: number]: number };
  travelPeriod?: string;
  reserveDate?: string;
  locationInfo?: {
    address?: string;
    details?: string[];
  };
  benefitItems?: Array<{
    title: string;
    text: string;
    image?: string;
  }>;
  priceInfo?: {
    pricePerPerson: number;
    totalPrice: number;
    guestCount: number;
  };
}

export const recoilSelectedHotelData = atom<SelectedHotelData>({
  key: "selectedHotelData",
  default: {
    hotelInfo: null,
    productInfo: null,
    scheduleCards: [],
    periodText: '',
    includeItems: [],
    excludeItems: [],
    selectedRoomTypes: {},
    selectedNights: {},
    travelPeriod: '',
    reserveDate: '',
    locationInfo: {
      address: '',
      details: []
    },
    benefitItems: [],
    priceInfo: {
      pricePerPerson: 0,
      totalPrice: 0,
      guestCount: 2
    }
  }
});

export interface ScheduleData {
  productInfo: ProductInfo | null;
  scheduleDetails?: any;
  selectedSchedule?: any; // 선택된 항공편의 일정 정보
  selectedItems?: any[];
  totalPrice?: number;
  guestCount?: number;
}

export const recoilSelectedScheduleData = atom<ScheduleData>({
  key: "selectedScheduleData",
  default: {
    productInfo: null,
    scheduleDetails: null,
    selectedItems: [],
    totalPrice: 0,
    guestCount: 2
  }
});

export interface HotelCartItem {
  id: number;
  hotelNameKo: string;
  city: string;
  nights: number; // 박수 (기본값: 2)
}

export const recoilHotelCart = atom<HotelCartItem[]>({
  key: "hotelCart",
  default: []
});

export interface CityCartItem {
  id: number;
  cityKo: string;
  nation: string;
  nights: number; // 박수 (기본값: 2)
  // 도시 정보 필드들
  isView?: string;
  locationType?: string;
  cityEn?: string;
  trafficCode?: string;
  tourNotice?: string;
  eventExpo?: string;
  resortCategory?: string;
  scheduleCategory?: string;
  hotelCategory?: string;
  serviceCategory?: string;
  taxRefundPlace?: string;
  inputImage?: string;
  courseImage?: string;
  basicinfoImage?: string;
  detailmapImage?: string;
  tourPreviewImage?: string | null;
  airlineInfo?: string;
  visaInfo?: string;
  exrateInfo?: string;
  plugInfo?: string;
  weatherInfo?: string;
  languageInfo?: string;
  timezoneInfo?: string;
  tipInfo?: string;
  priceInfo?: string;
  additionalInfo?: string;
  imageNamesNotice?: string;
  imageNamesGuide?: string;
  imageNamesEnt?: string;
  imageNamesEvent?: string;
  imageNamesCafe?: string;
  imageNamesMainPoint?: string;
  [key: string]: any; // 기타 모든 도시 정보 필드 허용
}

export const recoilCityCart = atom<CityCartItem[]>({
  key: "cityCart",
  default: []
});

// 상품명 저장
export const recoilProductName = atom<string>({
  key: "productName",
  default: ""
});

// 일정 데이터 저장
export interface ScheduleInfo {
  airlineData: {
    sort: string;
    airlineCode: string[];
  };
  scheduleDetailData: Array<{
    breakfast: string;
    lunch: string;
    dinner: string;
    hotel: string;
    score: string;
    scheduleDetail: Array<{
      id: number;
      sort?: string;
      st?: string;
      isViewLocation: boolean;
      locationIcon?: string;
      location: string;
      isUseMainContent: boolean;
      mainContent?: string;
      locationDetail: Array<{
        subLocation: string;
        isUseContent: boolean;
        subLocationContent: string;
        subLocationDetail: number[];
      }>;
      airlineData?: any;
      trainData?: any;
      busData?: any;
      shipData?: any;
    }>;
  }>;
}

export const recoilScheduleInfo = atom<ScheduleInfo | null>({
  key: "scheduleInfo",
  default: null
});

// 선택된 일정 상품 정보 저장 (EuropeCityDetail에서 선택한 일정)
export interface SelectedScheduleProduct {
  id?: number;
  productName?: string;
  scheduleSort?: string;
  costType?: string;
  tourPeriodData?: {
    periodNight?: string;
    periodDay?: string;
  };
  includeNote?: string;
  notIncludeNote?: string;
  productScheduleData?: string;
  nation?: string[];
  tourmapImage?: string;
  [key: string]: any;
}

export const recoilSelectedScheduleProduct = atom<SelectedScheduleProduct | null>({
  key: "selectedScheduleProduct",
  default: null
});

// 호텔 리스트 및 선택된 호텔 정보 저장 (EuropeScheduleCost에서 사용)
export interface HotelListData {
  hotels: any[];
  hotelCities: string[];
  activeHotelCity: string | null;
  selectedHotel: any | null;
  showPhotoGallery: boolean;
  activePhotoTab: number;
  selectedMainImageIndex: number;
  imageAllView: any[];
  imageRoomView: any[];
  imageEtcView: any[];
}

export const recoilHotelListData = atom<HotelListData>({
  key: "hotelListData",
  default: {
    hotels: [],
    hotelCities: [],
    activeHotelCity: null,
    selectedHotel: null,
    showPhotoGallery: false,
    activePhotoTab: 0,
    selectedMainImageIndex: 0,
    imageAllView: [],
    imageRoomView: [],
    imageEtcView: []
  }
});


