import { atom } from "recoil";


export const recoilExchangeRate = atom({
  key: "exchangeRate",
  default: {
      date: '',
      unit : '',
      send_KRW_tts : 0,
    }
});



export const recoilNoticeExchangeRate = atom({
  key: "noticeExchangeRate",
  default: [{
      base : '',
      KRW : 0
    }]
});

export const recoilRestDepositExchangeRate = atom({
  key: "restDepositExchangeRate",
  default: [{
      base : '',
      KRW : 0
    }]
});


// export const recoilExchangeAuthKey = atom({
//   key: "exchangeAuthKey",
//   default: "iPohzAyaVzOgv6XTPqiBpJPFL4iVzjaf"
// });

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
