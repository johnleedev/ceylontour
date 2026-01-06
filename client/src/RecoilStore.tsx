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
  travelPeriod: string;
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
    weddingDate: '',
    travelPeriod: '',
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
}

export const recoilHotelCart = atom<HotelCartItem[]>({
  key: "hotelCart",
  default: []
});

export interface CityCartItem {
  id: number;
  cityKo: string;
  nation: string;
}

export const recoilCityCart = atom<CityCartItem[]>({
  key: "cityCart",
  default: []
});


