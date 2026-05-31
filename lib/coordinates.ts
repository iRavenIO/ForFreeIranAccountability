/**
 * Iran city approximate coordinates.
 *
 * This is a lookup table for approximate city-level centroids.
 * In production, replace with a proper Iran postal-code centroid dataset.
 *
 * Keys are English province names (matching DB values).
 * City entries include both English and Persian names for lookup.
 *
 * Format: { "Province Name": { "City Name | Persian Name": [lat, lng] } }
 * Multiple entries per city support bilingual lookups.
 */

export const iranCityCoordinates: Record<string, Record<string, [number, number]>> = {
  'Tehran Province': {
    'Tehran': [35.6892, 51.3890],
    'تهران': [35.6892, 51.3890],
    'Rey': [35.5935, 51.4390],
    'ری': [35.5935, 51.4390],
    'Shemiranat': [35.8167, 51.4833],
    'شمیرانات': [35.8167, 51.4833],
    'Varamin': [35.3247, 51.6455],
    'ورامین': [35.3247, 51.6455],
    'Pakdasht': [35.4785, 51.6860],
    'پاکدشت': [35.4785, 51.6860],
    'Damavand': [35.7178, 52.0660],
    'دماوند': [35.7178, 52.0660],
    'Robat Karim': [35.4846, 51.0829],
    'رباط کریم': [35.4846, 51.0829],
    'Shahriar': [35.6597, 51.0593],
    'شهریار': [35.6597, 51.0593],
    'Malard': [35.6659, 50.9767],
    'ملارد': [35.6659, 50.9767],
    'Eslamshahr': [35.5522, 51.2344],
    'اسلامشهر': [35.5522, 51.2344],
    'Qods': [35.7214, 51.1089],
    'قدس': [35.7214, 51.1089],
    'Pishva': [35.3083, 51.7267],
    'پیشوا': [35.3083, 51.7267],
    'Firuzkuh': [35.7567, 52.7689],
    'فیروزکوه': [35.7567, 52.7689],
    'Baharestan': [35.5231, 51.1881],
    'بهارستان': [35.5231, 51.1881],
  },
  'Alborz Province': {
    'Karaj': [35.8400, 51.0100],
    'کرج': [35.8400, 51.0100],
    'Fardis': [35.7244, 50.9883],
    'فردیس': [35.7244, 50.9883],
    'Eshtehard': [35.7261, 50.3664],
    'اشتهارد': [35.7261, 50.3664],
    'Taleqan': [36.1833, 50.7667],
    'طالقان': [36.1833, 50.7667],
    'Nazarabad': [35.9531, 50.6078],
    'نظرآباد': [35.9531, 50.6078],
    'Mohammadshahr': [35.7553, 50.9200],
    'شهر محمد': [35.7553, 50.9200],
  },
  'Isfahan Province': {
    'Isfahan': [32.6546, 51.6680],
    'اصفهان': [32.6546, 51.6680],
    'Kashan': [33.9850, 51.4094],
    'کاشان': [33.9850, 51.4094],
    'Najafabad': [32.6324, 51.3660],
    'نجف‌آباد': [32.6324, 51.3660],
    'Khomeynishahr': [32.6856, 51.5361],
    'خمینی‌شهر': [32.6856, 51.5361],
    'Shahin Shahr': [32.8579, 51.5528],
    'شاهین‌شهر': [32.8579, 51.5528],
    'Shahreza': [32.0339, 51.8794],
    'شهرضا': [32.0339, 51.8794],
    'Mobarakeh': [32.3464, 51.5044],
    'مبارکه': [32.3464, 51.5044],
    'Falavarjan': [32.5553, 51.5097],
    'فلاورجان': [32.5553, 51.5097],
  },
  'Fars Province': {
    'Shiraz': [29.5918, 52.5837],
    'شیراز': [29.5918, 52.5837],
    'Marvdasht': [29.8742, 52.8025],
    'مرودشت': [29.8742, 52.8025],
    'Kazerun': [29.6194, 51.6542],
    'کازرون': [29.6194, 51.6542],
    'Fasa': [28.9383, 53.6483],
    'فسا': [28.9383, 53.6483],
    'Jahrom': [28.5000, 53.5606],
    'جهرم': [28.5000, 53.5606],
    'Darab': [28.7519, 54.5444],
    'داراب': [28.7519, 54.5444],
  },
  'Razavi Khorasan Province': {
    'Mashhad': [36.2970, 59.6062],
    'مشهد': [36.2970, 59.6062],
    'Neyshabur': [36.2133, 58.7958],
    'نیشابور': [36.2133, 58.7958],
    'Sabzevar': [36.2126, 57.6819],
    'سبزوار': [36.2126, 57.6819],
    'Torbat-e Heydarieh': [35.2739, 59.2194],
    'تربت حیدریه': [35.2739, 59.2194],
    'Kashmar': [35.2383, 58.4658],
    'کاشمر': [35.2383, 58.4658],
    'Gonabad': [34.3528, 58.6836],
    'گناباد': [34.3528, 58.6836],
  },
  'East Azerbaijan Province': {
    'Tabriz': [38.0800, 46.2919],
    'تبریز': [38.0800, 46.2919],
    'Maragheh': [37.3919, 46.2419],
    'مراغه': [37.3919, 46.2419],
    'Marand': [38.4333, 45.7750],
    'مرند': [38.4333, 45.7750],
    'Ahar': [38.4775, 47.0700],
    'اهر': [38.4775, 47.0700],
    'Mianeh': [37.4211, 47.7150],
    'میانه': [37.4211, 47.7150],
  },
  'West Azerbaijan Province': {
    'Urmia': [37.5491, 45.0748],
    'ارومیه': [37.5491, 45.0748],
    'Khoy': [38.5503, 44.9522],
    'خوی': [38.5503, 44.9522],
    'Mahabad': [36.7631, 45.7222],
    'مهاباد': [36.7631, 45.7222],
    'Bukan': [36.5208, 46.2089],
    'بوکان': [36.5208, 46.2089],
    'Salmas': [38.1972, 44.7653],
    'سلماس': [38.1972, 44.7653],
  },
  'Khuzestan Province': {
    'Ahvaz': [31.3203, 48.6692],
    'اهواز': [31.3203, 48.6692],
    'Abadan': [30.3430, 48.2777],
    'آبادان': [30.3430, 48.2777],
    'Khorramshahr': [30.4406, 48.1806],
    'خرمشهر': [30.4406, 48.1806],
    'Dezful': [32.3878, 48.4058],
    'دزفول': [32.3878, 48.4058],
    'Masjed Soleyman': [31.9364, 49.3039],
    'مسجد سلیمان': [31.9364, 49.3039],
    'Shushtar': [32.0456, 48.8481],
    'شوشتر': [32.0456, 48.8481],
  },
  'Mazandaran Province': {
    'Sari': [36.5633, 53.0601],
    'ساری': [36.5633, 53.0601],
    'Amol': [36.4700, 52.3600],
    'آمل': [36.4700, 52.3600],
    'Babol': [36.5500, 52.6833],
    'بابل': [36.5500, 52.6833],
    'Qaemshahr': [36.4611, 52.8600],
    'قائم‌شهر': [36.4611, 52.8600],
    'Nowshahr': [36.6489, 51.4961],
    'نوشهر': [36.6489, 51.4961],
    'Tonekabon': [36.8167, 50.8833],
    'تنکابن': [36.8167, 50.8833],
    'Chalus': [36.6556, 51.4217],
    'چالوس': [36.6556, 51.4217],
  },
  'Gilan Province': {
    'Rasht': [37.2809, 49.5832],
    'رشت': [37.2809, 49.5832],
    'Anzali': [37.4726, 49.4610],
    'انزلی': [37.4726, 49.4610],
    'Lahijan': [37.2075, 50.0039],
    'لاهیجان': [37.2075, 50.0039],
    'Rudsar': [37.1375, 50.2839],
    'رودسر': [37.1375, 50.2839],
  },
  'Kerman Province': {
    'Kerman': [30.2839, 57.0833],
    'کرمان': [30.2839, 57.0833],
    'Rafsanjan': [30.4067, 55.9939],
    'رفسنجان': [30.4067, 55.9939],
    'Sirjan': [29.4583, 55.6728],
    'سیرجان': [29.4583, 55.6728],
    'Bam': [29.1083, 58.3569],
    'بم': [29.1083, 58.3569],
  },
  'Kermanshah Province': {
    'Kermanshah': [34.3277, 47.0778],
    'کرمانشاه': [34.3277, 47.0778],
    'Eslamabad-e Gharb': [34.1094, 46.5275],
    'اسلام‌آباد غرب': [34.1094, 46.5275],
    'Kangavar': [34.5042, 47.9653],
    'کنگاور': [34.5042, 47.9653],
  },
  'Sistan and Baluchestan Province': {
    'Zahedan': [29.4964, 60.8629],
    'زاهدان': [29.4964, 60.8629],
    'Zabol': [31.0306, 61.5014],
    'زابل': [31.0306, 61.5014],
    'Iranshahr': [27.2064, 60.6847],
    'ایرانشهر': [27.2064, 60.6847],
    'Chabahar': [25.2919, 60.6431],
    'چابهار': [25.2919, 60.6431],
    'Saravan': [27.3708, 62.3344],
    'سراوان': [27.3708, 62.3344],
  },
  'Yazd Province': {
    'Yazd': [31.8968, 54.3677],
    'یزد': [31.8968, 54.3677],
    'Ardakan': [32.3100, 54.0175],
    'اردکان': [32.3100, 54.0175],
    'Maybod': [32.2497, 54.0167],
    'میبد': [32.2497, 54.0167],
    'Taft': [31.7478, 54.2042],
    'تفت': [31.7478, 54.2042],
  },
  'Hamadan Province': {
    'Hamadan': [34.7992, 48.5146],
    'همدان': [34.7992, 48.5146],
    'Malayer': [34.3019, 48.8200],
    'ملایر': [34.3019, 48.8200],
    'Nahavand': [34.1883, 48.3778],
    'نهاوند': [34.1883, 48.3778],
    'Tuyserkan': [34.5500, 48.4500],
    'تویسرکان': [34.5500, 48.4500],
  },
  'Ardabil Province': {
    'Ardabil': [38.2500, 48.2950],
    'اردبیل': [38.2500, 48.2950],
    'Parsabad': [39.6483, 47.9175],
    'پارس‌آباد': [39.6483, 47.9175],
    'Meshginshahr': [38.3989, 47.6819],
    'مشگین‌شهر': [38.3989, 47.6819],
  },
  'Bushehr Province': {
    'Bushehr': [28.9233, 50.8200],
    'بوشهر': [28.9233, 50.8200],
    'Bandar Ganaveh': [29.5792, 50.5169],
    'گناوه': [29.5792, 50.5169],
  },
  'Chaharmahal and Bakhtiari Province': {
    'Shahrekord': [32.3256, 50.8644],
    'شهرکرد': [32.3256, 50.8644],
    'Borujen': [31.9653, 51.2875],
    'بروجن': [31.9653, 51.2875],
  },
  'Zanjan Province': {
    'Zanjan': [36.6769, 48.4961],
    'زنجان': [36.6769, 48.4961],
    'Abhar': [36.1469, 49.2181],
    'ابهر': [36.1469, 49.2181],
  },
  'Semnan Province': {
    'Semnan': [35.5750, 53.3917],
    'سمنان': [35.5750, 53.3917],
    'Shahrud': [36.4183, 54.9764],
    'شاهرود': [36.4183, 54.9764],
    'Damghan': [36.1683, 54.3481],
    'دامغان': [36.1683, 54.3481],
    'Garmsar': [35.2181, 52.3408],
    'گرمسار': [35.2181, 52.3408],
  },
  'Qazvin Province': {
    'Qazvin': [36.2688, 50.0041],
    'قزوین': [36.2688, 50.0041],
    'Takestan': [36.0697, 49.6958],
    'تاکستان': [36.0697, 49.6958],
  },
  'Qom Province': {
    'Qom': [34.6399, 50.8759],
    'قم': [34.6399, 50.8759],
  },
  'Kurdistan Province': {
    'Sanandaj': [35.3146, 46.9988],
    'سنندج': [35.3146, 46.9988],
    'Saqqez': [36.2499, 46.2735],
    'سقز': [36.2499, 46.2735],
    'Marivan': [35.5270, 46.1764],
    'مریوان': [35.5270, 46.1764],
  },
  'Kohgiluyeh and Boyer-Ahmad Province': {
    'Yasuj': [30.6682, 51.5876],
    'یاسوج': [30.6682, 51.5876],
    'Gachsaran': [30.3556, 50.7981],
    'گچساران': [30.3556, 50.7981],
  },
  'Lorestan Province': {
    'Khorramabad': [33.4878, 48.3558],
    'خرم‌آباد': [33.4878, 48.3558],
    'Borujerd': [33.8972, 48.7517],
    'بروجرد': [33.8972, 48.7517],
    'Dorud': [33.4956, 49.0622],
    'دورود': [33.4956, 49.0622],
    'Aligudarz': [33.4006, 49.6947],
    'الیگودرز': [33.4006, 49.6947],
  },
  'Markazi Province': {
    'Arak': [34.0917, 49.6892],
    'اراک': [34.0917, 49.6892],
    'Saveh': [35.0214, 50.3567],
    'ساوه': [35.0214, 50.3567],
    'Mahallat': [33.9111, 50.4533],
    'محلات': [33.9111, 50.4533],
  },
  'Hormozgan Province': {
    'Bandar Abbas': [27.1832, 56.2666],
    'بندرعباس': [27.1832, 56.2666],
    'Bandar Lengeh': [26.5581, 54.8806],
    'بندر لنگه': [26.5581, 54.8806],
    'Minab': [27.1311, 57.0872],
    'میناب': [27.1311, 57.0872],
  },
  'Ilam Province': {
    'Ilam': [33.6374, 46.4227],
    'ایلام': [33.6374, 46.4227],
    'Dehloran': [32.6941, 47.2678],
    'دهلران': [32.6941, 47.2678],
  },
  'Golestan Province': {
    'Gorgan': [36.8457, 54.4384],
    'گرگان': [36.8457, 54.4384],
    'Gonbad-e Kavus': [37.2500, 55.1672],
    'گنبد کاووس': [37.2500, 55.1672],
    'Aliabad-e Katul': [36.9100, 54.8700],
    'علی‌آباد': [36.9100, 54.8700],
  },
  'North Khorasan Province': {
    'Bojnurd': [37.4750, 57.3333],
    'بجنورد': [37.4750, 57.3333],
    'Shirvan': [37.4028, 57.9217],
    'شیروان': [37.4028, 57.9217],
  },
  'South Khorasan Province': {
    'Birjand': [32.8664, 59.2211],
    'بیرجند': [32.8664, 59.2211],
    'Ferdows': [34.0186, 58.1722],
    'فردوس': [34.0186, 58.1722],
    'Tabas': [33.5958, 56.9244],
    'طبس': [33.5958, 56.9244],
  },
};

/**
 * Get approximate coordinates for a city within a province.
 * Handles both Persian and English city names.
 */
export function getCityCoordinates(
  province: string | null,
  city: string | null
): { lat: number; lng: number } | null {
  if (!province || !city) return null;

  const provinceData = iranCityCoordinates[province];
  if (!provinceData) return null;

  // Direct match
  if (provinceData[city]) {
    const [lat, lng] = provinceData[city];
    return { lat, lng };
  }

  // Case-insensitive + partial match
  const cityLower = city.replace(/[آا]/g, '[آا]').toLowerCase();
  for (const [key, val] of Object.entries(provinceData)) {
    if (key.toLowerCase() === cityLower) {
      const [lat, lng] = val;
      return { lat, lng };
    }
  }
  for (const [key, val] of Object.entries(provinceData)) {
    if (key.toLowerCase().includes(cityLower) || cityLower.includes(key.toLowerCase())) {
      const [lat, lng] = val;
      return { lat, lng };
    }
  }

  return null;
}

/**
 * Get approximate center of a province.
 */
export function getProvinceCenter(province: string): { lat: number; lng: number } | null {
  const centers: Record<string, [number, number]> = {
    'Tehran Province': [35.7000, 51.4000],
    'Alborz Province': [35.8200, 50.9500],
    'Isfahan Province': [32.6500, 51.6700],
    'Fars Province': [29.6000, 52.5000],
    'Razavi Khorasan Province': [36.3000, 59.6000],
    'East Azerbaijan Province': [38.0800, 46.2900],
    'West Azerbaijan Province': [37.5500, 45.0800],
    'Khuzestan Province': [31.3000, 48.6800],
    'Mazandaran Province': [36.5000, 53.0000],
    'Gilan Province': [37.2800, 49.5800],
    'Kerman Province': [30.2900, 57.0800],
    'Kermanshah Province': [34.3300, 47.0800],
    'Sistan and Baluchestan Province': [29.5000, 60.8600],
    'Yazd Province': [31.8900, 54.3600],
    'Hamadan Province': [34.8000, 48.5100],
    'Ardabil Province': [38.2500, 48.2900],
    'Bushehr Province': [28.9200, 50.8200],
    'Chaharmahal and Bakhtiari Province': [32.3300, 50.8600],
    'Zanjan Province': [36.6800, 48.4900],
    'Semnan Province': [35.5800, 53.3900],
    'Qazvin Province': [36.2700, 50.0000],
    'Qom Province': [34.6400, 50.8800],
    'Kurdistan Province': [35.3100, 47.0000],
    'Kohgiluyeh and Boyer-Ahmad Province': [30.6700, 51.5900],
    'Lorestan Province': [33.4900, 48.3500],
    'Markazi Province': [34.0900, 49.6900],
    'Hormozgan Province': [27.1800, 56.2700],
    'Ilam Province': [33.6400, 46.4200],
    'Golestan Province': [36.8500, 54.4400],
    'North Khorasan Province': [37.4800, 57.3300],
    'South Khorasan Province': [32.8700, 59.2200],
  };

  const center = centers[province];
  if (center) return { lat: center[0], lng: center[1] };

  // Default: center of Iran
  return { lat: 32.4279, lng: 53.6880 };
}
