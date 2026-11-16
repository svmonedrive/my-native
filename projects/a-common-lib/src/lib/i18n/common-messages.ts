import type { MessageBundle } from './i18n.service';

/** Messages every app gets for free. An app can override any key in its own `provideI18n(...)` bundle. */
export const COMMON_MESSAGES: MessageBundle = {
  'common.language': { en: 'Language', bn: 'ভাষা', hi: 'भाषा' },
  'common.theme': { en: 'Theme', bn: 'থিম', hi: 'थीम' },
  'common.light': { en: 'Light', bn: 'হালকা', hi: 'लाइट' },
  'common.dark': { en: 'Dark', bn: 'গাঢ়', hi: 'डार्क' },
  'common.switchToLight': { en: 'Switch to light mode', bn: 'হালকা মোডে যান', hi: 'लाइट मोड में जाएँ' },
  'common.switchToDark': { en: 'Switch to dark mode', bn: 'গাঢ় মোডে যান', hi: 'डार्क मोड में जाएँ' },
  'common.comingSoon': { en: 'This service is coming soon.', bn: 'এই পরিষেবাটি শীঘ্রই আসছে।', hi: 'यह सेवा जल्द आ रही है।' },
  'common.services': { en: 'Services', bn: 'পরিষেবা', hi: 'सेवाएँ' },
  'service.trendhub.name': { en: 'Trendhub', bn: 'ট্রেন্ডহাব', hi: 'ट्रेंडहब' },
  'service.trendhub.description': { en: 'Latest trends and offers.', bn: 'সর্বশেষ ট্রেন্ড ও অফার।', hi: 'ताज़ा ट्रेंड और ऑफ़र।' },
  'service.matrimony.name': { en: 'Matrimony', bn: 'পাত্রপাত্রী', hi: 'मैट्रिमोनी' },
  'service.matrimony.description': { en: 'Find a life partner.', bn: 'জীবনসঙ্গী খুঁজুন।', hi: 'जीवनसाथी खोजें।' },
  'service.landhub.name': { en: 'Landhub', bn: 'ল্যান্ডহাব', hi: 'लैंडहब' },
  'service.landhub.description': { en: 'Buy, sell and rent land.', bn: 'জমি কেনা, বেচা ও ভাড়া।', hi: 'ज़मीन खरीदें, बेचें और किराए पर लें।' },
  'service.doctors.name': { en: 'Doctors', bn: 'ডাক্তার', hi: 'डॉक्टर' },
  'service.doctors.description': { en: 'Find and book doctors.', bn: 'ডাক্তার খুঁজুন ও অ্যাপয়েন্টমেন্ট নিন।', hi: 'डॉक्टर खोजें और अपॉइंटमेंट बुक करें।' },
};
