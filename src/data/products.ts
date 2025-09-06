import { Category } from "./categories";
import { getProductImages } from "../assets/product-images";

export interface Product {
  id?: number;
  model: string;
  description: string;
  technical_description?: string;
  category: Category;
  images?: string[];
  contents?: string[];
  videos?: string[];
  new: boolean;
  created_at?: string;
  updated_at?: string;
}

export const products: Product[] = [
  {
    "model": "SPL-LED-700",
    "description": "700W LED Profile",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-LED-700").image],
    "contents": [getProductImages("SPL-LED-700").content],
    "videos": ["https://www.youtube.com/watch?v=J5wAKFQtPNs"],
    "new": true
  },
  {
    "model": "SPL-LED-681",
    "description": "LED BSW Moving Head Light",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-LED-681").image],
    "contents": [getProductImages("SPL-LED-681").content],
    "videos": ["https://www.youtube.com/watch?v=6fQ1Ka-cATg"],
    "new": true
  },
  {
    "model": "SPL-LED-M600BSWF",
    "description": "600W LED Profile",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-LED-M600BSWF").image],
    "contents": [getProductImages("SPL-LED-M600BSWF").content],
    "videos": [],
    "new": true
  },
  {
    "model": "SPL-MHL-420 IP",
    "description": "420W beam moving head light IP",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-MHL-420 IP").image],
    "contents": [getProductImages("SPL-MHL-420 IP").content],
    "videos": ["https://www.youtube.com/watch?v=uF_WQk1x_sA"],
    "new": true
  },
  {
    "model": "SPL-LED-M400B",
    "description": "LED Beam Moving Head Light",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-LED-M400B").image],
    "contents": [getProductImages("SPL-LED-M400B").content],
    "videos": [],
    "new": true
  },
  {
    "model": "SPL-MHL-M251G YH",
    "description": "250W Beam Moving Head",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-MHL-M251G YH").image],
    "contents": [getProductImages("SPL-MHL-M251G YH").content],
    "videos": ["https://www.youtube.com/watch?v=tJEyFmIrihc"],
    "new": true
  },
  {
    "model": "SPL-LED-800",
    "description": "800W LED Profile",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-LED-800").image],
    "contents": [getProductImages("SPL-LED-800").content],
    "videos": ["https://www.youtube.com/watch?v=BS9_3pcHwnA"],
    "new": false
  },
  {
    "model": "SPL-LED-481",
    "description": "480W LED CMY+BSW Moving Head",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-LED-481").image],
    "contents": [getProductImages("SPL-LED-481").content],
    "videos": ["https://www.youtube.com/watch?v=OvKiEPaUNjM"],
    "new": false
  },
  {
    "model": "SPL-MHL-380",
    "description": "380W BSW moving head",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-MHL-380").image],
    "contents": [getProductImages("SPL-MHL-380").content],
    "videos": ["https://www.youtube.com/watch?v=3AH2is8iU1U"],
    "new": false
  },
  {
    "model": "SPL-MHL-380B IP",
    "description": "380W beam moving head light IP",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-MHL-380B IP").image],
    "contents": [getProductImages("SPL-MHL-380B IP").content],
    "videos": ["https://www.youtube.com/watch?v=5rZ-uidFbL4"],
    "new": false
  },
  {
    "model": "SPL-MHL-380B",
    "description": "380W moving head",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-MHL-380B").image],
    "contents": [getProductImages("SPL-MHL-380B").content],
    "videos": ["https://www.youtube.com/watch?v=MsQIGWNZJiY"],
    "new": false
  },
  {
    "model": "SPL-MHL-295 JD",
    "description": "Beam Moving Head Light",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-MHL-295 JD").image],
    "contents": [getProductImages("SPL-MHL-295 JD").content],
    "videos": [],
    "new": false
  },
  {
    "model": "SPL-MHL-251G",
    "description": "250W Beam Moving Head",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-MHL-251G").image],
    "contents": [getProductImages("SPL-MHL-251G").content],
    "videos": ["https://www.youtube.com/watch?v=DmV1Tk9pi68"],
    "new": false
  },
  {
    "model": "SPL-MHL-251",
    "description": "250W beam Moving Head",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-MHL-251").image],
    "contents": [getProductImages("SPL-MHL-251").content],
    "videos": ["https://www.youtube.com/watch?v=x4ovKS7Vy24"],
    "new": false
  },
  {
    "model": "SPL-MHL-M250B MINI",
    "description": "250W beam moving head",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-MHL-M250B MINI").image],
    "contents": [getProductImages("SPL-MHL-M250B MINI").content],
    "videos": ["https://www.youtube.com/watch?v=wfT18C9yGgw"],
    "new": false
  },
  {
    "model": "SPL-MHL-M250G MINI",
    "description": "250W Beam Moving Head",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-MHL-M250G MINI").image],
    "contents": [getProductImages("SPL-MHL-M250G MINI").content],
    "videos": ["https://www.youtube.com/watch?v=sP-KovHGIzI"],
    "new": false
  },
  {
    "model": "SPL-LED-100S",
    "description": "100W LED spot moving head",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-LED-100S").image],
    "contents": [getProductImages("SPL-LED-100S").content],
    "new": false
  },
  {
    "model": "SPL-LED-60S",
    "description": "60W LED spot moving head",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-LED-60S").image],
    "contents": [getProductImages("SPL-LED-60S").content],
    "new": false
  },
  {
    "model": "SPL-LED-30S",
    "description": "30W LED spot moving head",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-LED-30S").image],
    "contents": [getProductImages("SPL-LED-30S").content],
    "new": false
  },
  {
    "model": "SPL-LED-M1940 EYE IP",
    "description": "LED wash moving head Zoom+Bee eye",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-M1940 EYE IP").image],
    "contents": [getProductImages("SPL-LED-M1940 EYE IP").content],
    "videos": ["https://www.youtube.com/watch?v=RFt90EgxTTk"],
    "new": true
  },
  {
    "model": "SPL-LED-1940",
    "description": "19*40W LED wash moving head Zoom+Bee eye",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-1940").image],
    "contents": [getProductImages("SPL-LED-1940").content],
    "videos": ["https://www.youtube.com/watch?v=FD0iv5CjzwU"],
    "new": true
  },
  {
    "model": "SPL-LED-740",
    "description": "7*40W LED wash moving head Zoom+Bee eye",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-740").image],
    "contents": [getProductImages("SPL-LED-740").content],
    "videos": ["https://www.youtube.com/watch?v=ynZm02BZ9AE"],
    "new": true
  },
  {
    "model": "SPL-LED-M700W Profile IP",
    "description": "LED Moving Head Lights",
    "category": Category.MOVING_HEAD,
    "images": [getProductImages("SPL-LED-M700W Profile IP").image],
    "contents": [
      getProductImages("SPL-LED-M700W Profile IP").content,
      getProductImages("SPL-LED-M700W Profile IP").content2
    ],
    "videos": ["/videos/video3.mp4"],
    "new": true
  },
  {
    "model": "SPL-LED-M1260YZ IP",
    "description": "12*60W LED moving bar zoom",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-M1260YZ IP").image],
    "contents": [getProductImages("SPL-LED-M1260YZ IP").content],
    "videos": ["https://www.youtube.com/watch?v=vYeNbPc0vc4"],
    "new": true
  },
  {
    "model": "SPL-LED-1810R",
    "description": "LED Wash light bar",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-1810R").image],
    "contents": [getProductImages("SPL-LED-1810R").content],
    "videos": ["https://www.youtube.com/watch?v=t6XcoTep58o"],
    "new": false
  },
  {
    "model": "SPL-LED-T200RGBW IP",
    "description": "LED Wash light",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-1810R").image],
    "contents": [getProductImages("SPL-LED-1810R").content],
    "videos": ["https://www.youtube.com/watch?v=aTaaKwahx8Q"],
    "new": true
  },
  {
    "model": "SPL-LED-M1915Z QK",
    "description": "19x15W LED wash moving head light",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-M1915Z QK").image],
    "contents": [getProductImages("SPL-LED-M1915Z QK").content],
    "videos": ["https://www.youtube.com/watch?v=mbOrPkKNElw"],
    "new": false
  },
  {
    "model": "SPL-LED-663",
    "description": "60W OSRAM PMMA beam pagoda",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-663").image],
    "contents": [getProductImages("SPL-LED-663").content],
    "videos": ["https://www.youtube.com/watch?v=B6BtofKd9GM"],
    "new": false
  },
  {
    "model": "SPL-LED-663S",
    "description": "30W spot pagoda",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-663S").image],
    "contents": [getProductImages("SPL-LED-663S").content],
    "videos": ["https://www.youtube.com/watch?v=zF8P4bCgbZI"],
    "new": false
  },
  {
    "model": "SPL-LED-1260",
    "description": "12*60W LED moving bar zoom",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-1260").image],
    "contents": [getProductImages("SPL-LED-1260").content],
    "new": false
  },
  {
    "model": "SPL-LED-1260S",
    "description": "Advanced Pixel-Controlled Moving Head Light with Versatile Beam and Wash Effects for Concerts, Nightclubs, Bars, and Stage Productions",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-1260S").image],
    "contents": [getProductImages("SPL-LED-1260S").content],
    "videos": ["/videos/video2.mp4"],
    "new": false
  },
  {
    "model": "SPL-LED-M1240G YZ",
    "description": "LED Wash light bar",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-M1240G YZ").image],
    "contents": [getProductImages("SPL-LED-M1240G YZ").content],
    "new": false
  },
  {
    "model": "SPL-LED-560",
    "description": "LED Bema Moving Light",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-560").image],
    "contents": [getProductImages("SPL-LED-560").content],
    "videos": ["https://www.youtube.com/watch?v=MhNi_5SC9aE"],
    "new": false
  },
  {
    "model": "SPL-LED-1040",
    "description": "LED Wash light bar",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-1040").image],
    "contents": [getProductImages("SPL-LED-1040").content],
    "videos": ["https://www.youtube.com/watch?v=SEY6qN7y6JI"],
    "new": false
  },
  {
    "model": "SPL-LED-1810R IP",
    "description": "LED Wash light bar",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-1810R IP").image],
    "contents": [getProductImages("SPL-LED-1810R IP").content],
    "videos": ["https://www.youtube.com/watch?v=CGbpsPi6_8A"],
    "new": false
  },
  {
    "model": "SPL-LED-3603",
    "description": "LED wall washer light",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-3603").image],
    "contents": [getProductImages("SPL-LED-3603").content],
    "new": false
  },
  {
    "model": "SPL-LED-500IP",
    "description": "Ip65 LED strobe bar",
    "category": Category.WASH_LIGHT,
    "images": [getProductImages("SPL-LED-500IP").image],
    "contents": [getProductImages("SPL-LED-500IP").content],
    "videos": ["https://www.youtube.com/watch?v=SEY6qN7y6JI"],
    "new": false
  },
  {
    "model": "SPL-LED-960 IP",
    "description": "960 Strobe light",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-960 IP").image],
    "contents": [getProductImages("SPL-LED-960 IP").content],
    "videos": ["https://www.youtube.com/watch?v=WIvSSkbW0AA"],
    "new": true
  },
  {
    "model": "SPL-LED-4410",
    "description": "Ip65 44x10W LED wash light",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-4410").image],
    "contents": [getProductImages("SPL-LED-4410").content],
    "videos": ["https://www.youtube.com/watch?v=JdcPis6dX0o"],
    "new": false
  },
  {
    "model": "SPL-LED-3240 IP",
    "description": "Ip65 32x40W LED wash light",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-3240 IP").image],
    "contents": [getProductImages("SPL-LED-3240 IP").content],
    "videos": ["https://www.youtube.com/watch?v=VpzLbhEn8iA"],
    "new": true
  },
  {
    "model": "SPL-LED-P616C IP",
    "description": "2*100W dual white LED blinder",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-P616C IP").image],
    "contents": [getProductImages("SPL-LED-P616C IP").content],
    "videos": ["https://www.youtube.com/watch?v=6JcIWKWPm7c"],
    "new": true
  },
  {
    "model": "SPL-LED-3000IP",
    "description": "Ip65 1000W LED strobe bar light",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-3000IP").image],
    "contents": [getProductImages("SPL-LED-3000IP").content],
    "videos": ["https://www.youtube.com/watch?v=xs0IbMVoNlg"],
    "new": false
  },
  {
    "model": "SPL-LED-960B",
    "description": "960 Strobe light",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-960B").image],
    "contents": [getProductImages("SPL-LED-960B").content],
    "videos": ["https://www.youtube.com/watch?v=7kFHeCamGVA"],
    "new": false
  },
  {
    "model": "SPL-LED-S960 II",
    "description": "Strobe light",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-S960 II").image],
    "contents": [getProductImages("SPL-LED-S960 II").content],
    "videos": ["https://www.youtube.com/watch?v=Fyivr4uGoP0"],
    "new": false
  },
  {
    "model": "SPL-LED-048 RGBW",
    "description": "48*5W RGBW TV light",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-048 RGBW").image],
    "contents": [getProductImages("SPL-LED-048 RGBW").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-LED-071 RGBW PRO",
    "description": "PRO LED Strobe light",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-071 RGBW PRO").image],
    "contents": [getProductImages("SPL-LED-071 RGBW PRO").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-LED-071D/071E",
    "description": "LED",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-071D").image],
    "contents": [getProductImages("SPL-LED-071D").content],
    "new": false
  },
  {
    "model": "SPL-LED-070D/070E",
    "description": "LED",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-070D").image],
    "contents": [getProductImages("SPL-LED-070D").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-LED-070G",
    "description": "9*3W UV flood light",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-070G").image],
    "contents": [getProductImages("SPL-LED-070G").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-LED-616",
    "description": "2*100W dual white LED blinder",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-616").image],
    "contents": [getProductImages("SPL-LED-616").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-LED-616B",
    "description": "2*100W dual white LED blinder",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-616B").image],
    "contents": [getProductImages("SPL-LED-616B").content],
    "videos": ["https://www.youtube.com/watch?v=i_LLUgPUNaE"],
    "new": false
  },
  {
    "model": "SPL-LED-616C",
    "description": "2*100W dual white LED blinder",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-616C").image],
    "contents": [getProductImages("SPL-LED-616C").content],
    "videos": ["https://www.youtube.com/watch?v=6JcIWKWPm7c"],
    "new": false
  },
  {
    "model": "SPL-LED-616F",
    "description": "4*100W dual white LED blinder",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-LED-616F").image],
    "contents": [getProductImages("SPL-LED-616F").content],
    "videos": ["https://www.youtube.com/watch?v=PHGPwOyD0kY"],
    "new": false
  },
  {
    "model": "SPL-COB-200",
    "description": "200W dual white LED spot light",
    "category": Category.LED_STROBE_LIGHT,
    "images": [getProductImages("SPL-COB-200").image],
    "contents": [getProductImages("SPL-COB-200").content],
    "videos": ["https://www.youtube.com/watch?v=1_VbuO0UnYw"],
    "new": false
  },
  {
    "model": "SPL-LED-P2415 IP",
    "description": "IP65 24*15W 6in1 Par light",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-P2415 IP").image],
    "contents": [getProductImages("SPL-LED-P2415 IP").content],
    "videos": ["https://www.youtube.com/watch?v=egXyWy9tpXE"],
    "new": true
  },
  {
    "model": "SPL-LED-P2015 IP",
    "description": "Ip65 20*15W 6in1 Par light",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-P2015 IP").image],
    "contents": [getProductImages("SPL-LED-P2015 IP").content],
    "videos": ["https://www.youtube.com/watch?v=wcGFlGy_7vA"],
    "new": true
  },
  {
    "model": "SPL-LED-P1220 IP",
    "description": "IP65 12*20W 4in1 Par light",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-P1220 IP").image],
    "contents": [getProductImages("SPL-LED-P1220 IP").content],
    "videos": ["https://www.youtube.com/watch?v=daGXOHN7D0c"],
    "new": true
  },
  {
    "model": "SPL-LED-P750 IP",
    "description": "IP65 7*50W 2in1 Par light",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-P750 IP").image],
    "contents": [getProductImages("SPL-LED-P750 IP").content],
    "new": true
  },
  {
    "model": "SPL-LED-450 II IP",
    "description": "IP 65 4 EYES PAR LIGHTS",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-450 II IP").image],
    "contents": [getProductImages("SPL-LED-450 II IP").content],
    "videos": ["https://www.youtube.com/watch?v=GAJYHSLrNpk"],
    "new": true
  },
  {
    "model": "SPL-LED-P1815IP",
    "description": "IP65 18*15W 6in1 Par light",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-P1815IP").image],
    "contents": [getProductImages("SPL-LED-P1815IP").content],
    "videos": ["https://www.youtube.com/watch?v=-0E4bCJp2pc"],
    "new": true
  },
  {
    "model": "SPL-LED-1810",
    "description": "18*10W 6in1 Par light",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-1810").image],
    "contents": [getProductImages("SPL-LED-1810").content],
    "videos": ["https://www.youtube.com/watch?v=wL2ahZX2cGc"],
    "new": false
  },
  {
    "model": "SPL-LED-316",
    "description": "T-BAR 20 Quad",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-316").image],
    "contents": [getProductImages("SPL-LED-316").content],
    "new": false
  },
  {
    "model": "SPL-LED-200Z",
    "description": "200W white COB Par 64 Zoom",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-200Z").image],
    "contents": [getProductImages("SPL-LED-200Z").content],
    "videos": ["https://www.youtube.com/watch?v=PLLYJxoyyR8&pp=0gcJCa0JAYcqIYzv"],
    "new": false
  },
  {
    "model": "SPL-LED-615",
    "description": "100W white COB LED Par 64",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-615").image],
    "contents": [getProductImages("SPL-LED-615").content],
    "videos": ["https://www.youtube.com/watch?v=LfEN84e2RyU"],
    "new": false
  },
  {
    "model": "SPL-LED-630",
    "description": "120W COB RGBW 4in1 LED Par 64",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-630").image],
    "contents": [getProductImages("SPL-LED-630").content],
    "new": false
  },
  {
    "model": "SPL-LED-631",
    "description": "100W white LED Par IP65",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-631").image],
    "contents": [getProductImages("SPL-LED-631").content],
    "videos": ["https://www.youtube.com/watch?v=PLLYJxoyyR8"],
    "new": false
  },
  {
    "model": "SPL-LED-079",
    "description": "12*10W UV light",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-079").image],
    "contents": [getProductImages("SPL-LED-079").content],
    "new": false
  },
  {
    "model": "SPL-LED-316/317",
    "description": "LED Battery light",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-317").image],
    "contents": [getProductImages("SPL-LED-317").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-LED-011",
    "description": "LED Strobe Bar light",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-011").image],
    "contents": [getProductImages("SPL-LED-011").content],
    "new": false
  },
  {
    "model": "SPL-LED-750",
    "description": "LED Par light",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-750").image],
    "contents": [getProductImages("SPL-LED-750").content],
    "videos": ["https://www.youtube.com/watch?v=KMUPxpzxImU"],
    "new": false
  },
  {
    "model": "SPL-LED-450",
    "description": "LED Par light",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-450").image],
    "contents": [getProductImages("SPL-LED-450").content],
    "videos": ["https://www.youtube.com/watch?v=Ghpk7hvQZ3o&pp=0gcJCa0JAYcqIYzv"],
    "new": false
  },
  {
    "model": "SPL-LED-P2010",
    "description": "20*10W 5in1 Par light",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-P2010").image],
    "contents": [getProductImages("SPL-LED-P2010").content],
    "new": false
  },
  {
    "model": "SPL-LED-1210",
    "description": "12*10W 5in1 Par light",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-1210").image],
    "contents": [getProductImages("SPL-LED-1210").content],
    "new": false
  },
  {
    "model": "SPL-LED-312F",
    "description": "18*18W RGBWA-UV 6in1 LED par can",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-312F").image],
    "contents": [getProductImages("SPL-LED-312F").content],
    "new": false
  },
  {
    "model": "SPL-LED-312D",
    "description": "18*10W RGBW Quad LED par can",
    "category": Category.LED_PAR_LIGHT,
    "images": [getProductImages("SPL-LED-312D").image],
    "contents": [getProductImages("SPL-LED-312D").content],
    "new": false
  },
  {
    "model": "SPL-RGB-286",
    "description": "50W full color animation laser light",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RGB-286").image],
    "contents": [getProductImages("SPL-RGB-286").content],
    "new": false
  },
  {
    "model": "SPL-RGB-130",
    "description": "30W full color animation laser light",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RGB-130").image],
    "contents": [getProductImages("SPL-RGB-130").content],
    "new": false
  },
  {
    "model": "SPL-RGB-115",
    "description": "15W full color animation laser light",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RGB-115").image],
    "contents": [getProductImages("SPL-RGB-115").content],
    "new": false
  },
  {
    "model": "SPL-RGB-119",
    "description": "10W RGB Animation laser light",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RGB-119").image],
    "contents": [getProductImages("SPL-RGB-119").content],
    "new": false
  },
  {
    "model": "SPL-RGB-246",
    "description": "5/8/10W RGB full color animation laser light",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RGB-246").image],
    "contents": [getProductImages("SPL-RGB-246").content],
    "new": false
  },
  {
    "model": "SPL-RGB-110/105",
    "description": "5/10W RGB full color animation laser light",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RGB-110").image],
    "contents": [getProductImages("SPL-RGB-110").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-RGB-510",
    "description": "5W RGB Animation laser light",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RGB-510").image],
    "contents": [getProductImages("SPL-RGB-510").content],
    "new": false 
  },
  {
    "model": "SPL-RGB-256",
    "description": "3W Mini RGB full color laser light",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RGB-256").image],
    "contents": [getProductImages("SPL-RGB-256").content],
    "new": false
  },
  {
    "model": "SPL-RGB-252/253",
    "description": "400mW/1W Mini RGB full color laser light",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RGB-252").image],
    "contents": [getProductImages("SPL-RGB-252").content],
    "new": false
  },
  {
    "model": "SPL-RGB-508",
    "description": "Fat beam laser bar",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RGB-508").image],
    "contents": [getProductImages("SPL-RGB-508").content],
    "videos": ["https://www.youtube.com/watch?v=VQaUTyxf-e8&pp=0gcJCa0JAYcqIYzv"],
    "new": false
  },
  {
    "model": "SPL-R-507",
    "description": "Fat beam laser bar",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-R-507").image],
    "contents": [getProductImages("SPL-R-507").content],
    "videos": ["https://www.youtube.com/watch?v=rvYt85462ok"],
    "new": false
  },
  {
    "model": "SPL-RGB-660",
    "description": "2W RGB full color moving laser",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RGB-660").image],
    "contents": [getProductImages("SPL-RGB-660").content],
    "new": false
  },
  {
    "model": "SPL-R/G/B-506A",
    "description": "Fat beam red laser bar",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-R").image],
    "contents": [getProductImages("SPL-R").content],
    "new": false
  },
  {
    "model": "SPL-RGB/R/G-506",
    "description": "Laser Beam Light",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RGB").image],
    "contents": [getProductImages("SPL-RGB").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-RGB-147",
    "description": "Geometric Laser Light",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RGB-147").image],
    "contents": [getProductImages("SPL-RGB-147").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-RG-144A",
    "description": "Double lens red-green laser light",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RG-144A").image],
    "contents": [getProductImages("SPL-RG-144A").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-RG-146A",
    "description": "4 Lens red-green laser light",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RG-146A").image],
    "contents": [getProductImages("SPL-RG-146A").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-RGB-202",
    "description": "Mobile-phone RGB laser light",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("SPL-RGB-202").image],
    "contents": [getProductImages("SPL-RGB-202").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "LED dance floor",
    "description": "Waterproof IP65 3D LED Dance floor",
    "category": Category.LASER_LIGHT,
    "images": [getProductImages("LED dance floor").image],
    "contents": [getProductImages("LED dance floor").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-LED-613",
    "description": "5*12W 6in1 LED ball",
    "category": Category.EFFECT_LIGHT,
    "images": [getProductImages("SPL-LED-613").image],
    "contents": [getProductImages("SPL-LED-613").content],
    "new": false
  },
  {
    "model": "SPL-RG-305A",
    "description": "4in1 mini party light",
    "category": Category.EFFECT_LIGHT,
    "images": [getProductImages("SPL-RG-305A").image],
    "contents": [getProductImages("SPL-RG-305A").content],
    "videos": ["https://www.youtube.com/watch?v=Izoszt03yGI"],
    "new": false
  },
  {
    "model": "SPL-LED-R200",
    "description": "LED lifting ball system",
    "category": Category.EFFECT_LIGHT,
    "images": [getProductImages("SPL-LED-R200").image],
    "contents": [getProductImages("SPL-LED-R200").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-LED-R201",
    "description": "LED lifting ball system",
    "category": Category.EFFECT_LIGHT,
    "images": [getProductImages("SPL-LED-R201").image],
    "contents": [getProductImages("SPL-LED-R201").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-LED-020M-A3",
    "description": "Laser derby",
    "category": Category.EFFECT_LIGHT,
    "images": [getProductImages("SPL-LED-020M-A3").image],
    "contents": [getProductImages("SPL-LED-020M-A3").content],
    "videos": ["https://www.youtube.com/watch?v=uNGhhmi-BhA&t=40s"],
    "new": false
  },
  {
    "model": "SPL-RG-301B",
    "description": "3in1 effect light",
    "category": Category.EFFECT_LIGHT,
    "images": [getProductImages("SPL-RG-301B").image],
    "contents": [getProductImages("SPL-RG-301B").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-RG-308A",
    "description": "Mini party light",
    "category": Category.EFFECT_LIGHT,
    "images": [getProductImages("SPL-RG-308A").image],
    "contents": [getProductImages("SPL-RG-308A").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-LED-F520G",
    "description": "5*50W Retro bar light",
    "category": Category.EFFECT_LIGHT,
    "images": [getProductImages("SPL-LED-F520G").image],
    "contents": [getProductImages("SPL-LED-F520G").content],
    "videos": [""],
    "new": false
  },
  {
    "model": "SPL-LED-183UV",
    "description": "18*3W UV bar",
    "category": Category.EFFECT_LIGHT,
    "images": [getProductImages("SPL-LED-183UV").image],
    "contents": [getProductImages("SPL-LED-183UV").content],
    "videos": [""],
    "new": false
  }
];