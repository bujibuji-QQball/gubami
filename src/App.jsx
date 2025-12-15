import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Utensils, Train, ShoppingBag, Sun, CloudRain, Cloud, Calendar, Phone, Home, Ticket, Plane, Info, ChevronRight, QrCode, ChevronDown, ChevronUp, Map, Star, Plus, Camera, Coffee, Music, BookOpen, Gift, Edit3, Footprints, Bus, Car, Save, Trash2, X, Banknote, PlusCircle, AlertCircle, Link, ShoppingCart, Store, Package, Search, Cigarette, Wind, Droplets, ThermometerSun, Sunrise, Sunset, RefreshCw, Umbrella, Gauge } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('itinerary');
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedRecArea, setSelectedRecArea] = useState('shinjuku'); 
  const [expandedEvents, setExpandedEvents] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedTransits, setExpandedTransits] = useState({});

  // 天氣狀態
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 購物清單相關狀態
  const [expandedShoppingCats, setExpandedShoppingCats] = useState({
    drugstore: true,
    conbini: true,
    supermarket: true,
    souvenir: true,
    other: true
  });
  const [showAddShoppingModal, setShowAddShoppingModal] = useState(false);
  const [newShoppingItem, setNewShoppingItem] = useState({
    name: '',
    category: 'drugstore', // 預設分類
    desc: '',
    location: '',
    price: ''
  });
  const [showDeleteShoppingConfirm, setShowDeleteShoppingConfirm] = useState(false);
  const [shoppingItemToDelete, setShoppingItemToDelete] = useState(null); 

  // 編輯模式狀態 (控制是否顯示刪除按鈕)
  const [isEditMode, setIsEditMode] = useState(false);

  // 新增行程的彈窗狀態
  const [showAddEventModal, setShowAddEventModal] = useState(false);
    
  // 刪除確認的彈窗狀態
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null); 
    
  // 新增清單景點的彈窗狀態
  const [showAddRecModal, setShowAddRecModal] = useState(false);
  const [newRecItem, setNewRecItem] = useState({
    area: 'shinjuku',
    category: 'food',
    name: '',
    desc: '',
    query: ''
  });
    
  // 刪除清單景點的確認彈窗
  const [showDeleteRecConfirm, setShowDeleteRecConfirm] = useState(false);
  const [recItemToDelete, setRecItemToDelete] = useState(null); 

  // 新增行程的資料結構 
  const [newEvent, setNewEvent] = useState({
    time: '',
    title: '',
    type: 'sight', 
    note: '',
    location: '',
    // 自訂交通資訊
    hasTransit: false,
    transitType: 'train',
    transitTime: '',
    transitDesc: '',
    transitDetail: '',
    transitUrl: '' 
  });

  // 購物清單資料庫 (純文字)
  const [shoppingList, setShoppingList] = useState({
    drugstore: {
      title: '藥妝類',
      items: [
        { name: 'KUMARGIC EYE', desc: '專治黑眼圈的眼霜，據說很有感', location: '各大藥妝店 (松本清)', price: '¥1,000' },
        { name: 'KOSE 蜜粉', desc: '定妝效果好，控油持妝，CP值高', location: '各大藥妝店', price: '¥1,320' },
        { name: '妙利散 (Miyarisan)', desc: '宮入菌益生菌，整腸健胃', location: '各大藥妝店', price: '¥2,500' },
      ]
    },
    conbini: {
      title: '超商必買',
      items: [
        { name: '飯田商店 X Ramen Feel 泡麵', desc: '7-11 限定聯名款，湯頭濃郁', location: '7-11', price: '¥300' },
        { name: '生火腿起司', desc: 'Lawson 下酒菜神物', location: 'Lawson', price: '¥350' },
        { name: '抹茶牛奶', desc: '7-11 自有品牌，味道濃厚', location: '7-11', price: '¥200' },
        { name: 'Famichiki (法式香雞排)', desc: '全家必吃炸雞，肉汁超多', location: 'FamilyMart', price: '¥220' },
        { name: 'OHAYO 布丁', desc: '焦糖烤布蕾口感，表層脆脆的', location: '各大超商', price: '¥180' },
        { name: '烤雞皮', desc: '全家冷凍/熱食櫃，口感Q彈', location: 'FamilyMart', price: '¥200' },
      ]
    },
    supermarket: {
      title: '超市尋寶',
      items: [
        { name: '昆布鹽', desc: '調味神物，炒菜煮湯都好用', location: '超市 (Life, Summit)', price: '¥400' },
        { name: '柚子胡椒', desc: '九州名產，搭配燒肉或火鍋超讚', location: '超市', price: '¥350' },
      ]
    },
    souvenir: {
      title: '伴手禮',
      items: [
        { name: 'PRESS BUTTER SAND', desc: '焦糖奶油夾心餅，口感層次豐富', location: '東京車站/晴空塔', price: '¥1,000 (5入)' },
        { name: 'PISTA & TOKYO', desc: '開心果甜點專賣店，濃郁堅果香', location: '東京車站', price: '¥1,200' },
      ]
    },
    other: {
      title: '其他',
      items: []
    }
  });

  // 深度旅遊推薦清單資料庫 (useState)
  const [recommendationsData, setRecommendationsData] = useState({
    shinjuku: {
      name: '新宿',
      categories: {
        coffee: [
          { name: 'Berg (ベルク)', desc: '新宿站東口地下傳奇老店，必點咖啡與熱狗', query: 'Berg Shinjuku' },
          { name: '4/4 SEASONS COFFEE', desc: '新宿御苑旁，自烘豆手沖名店，布丁也好吃', query: '4/4 SEASONS COFFEE Shinjuku' },
          { name: 'Blue Bottle Coffee 新宿', desc: 'NEWoMan 1F，位置方便，落地窗採光好', query: 'Blue Bottle Coffee Shinjuku' },
          { name: 'Tajimaya Coffee (但馬屋珈琲店)', desc: '懷舊昭和風，深焙咖啡愛好者必去', query: 'Tajimaya Coffee Shinjuku' },
        ],
        shopping: [
          { name: 'Bic Camera 新宿東口店', desc: '與Uniqlo共構，家電服飾一次買齊', query: 'Bicqlo Shinjuku East' },
          { name: 'Onitsuka Tiger 新宿東', desc: '新宿最大旗艦店，款式最齊全，Nippon Made系列豐富', query: 'Onitsuka Tiger Shinjuku East' },
          { name: 'MOUSSY 新宿 Lumine Est', desc: '位於Lumine Est B1，年輕潮流款式多', query: 'MOUSSY Lumine Est Shinjuku' },
          { name: 'AZUL by moussy 新宿', desc: '風格較休閒，通常在大型商場內', query: 'AZUL by moussy Shinjuku' },
        ],
        drugstore: [
          { name: '松本清 新宿三丁目店', desc: '藥妝種類最齊全，還有專櫃化妝品', query: 'Matsumoto Kiyoshi Shinjuku Sanchome' },
        ],
        shrine: [
          { name: '花園神社', desc: '新宿的總守護神，酉之市發源地', query: 'Hanazono Shrine' },
        ],
        select: [
          { name: 'BEAMS JAPAN', desc: 'B1-5F全是日本嚴選好物，必買富士山選品', query: 'BEAMS JAPAN Shinjuku' },
          { name: '世界堂 新宿本店', desc: '文具畫材控的天堂，價格超實惠', query: 'Sekhaido Shinjuku' },
        ],
        sight: [
          { name: '新宿黃金街', desc: '二戰後保留至今的木造酒吧街，昭和風情', query: 'Shinjuku Golden Gai' },
        ]
      }
    },
    shibuya: {
      name: '澀谷/下北澤',
      categories: {
        coffee: [
          { name: 'Bear Pond Espresso', desc: '下北澤傳奇咖啡，老闆很有個性，Espresso必試', query: 'Bear Pond Espresso Shimokitazawa' },
          { name: 'Ogawa Coffee Laboratory', desc: '下北澤 Reload 內，京都名店，可自己選手沖器具', query: 'Ogawa Coffee Laboratory Shimokitazawa' },
          { name: 'Fuglen Tokyo (澀谷)', desc: '代代木公園旁，挪威復古風，日劇取景地', query: 'Fuglen Tokyo' },
          { name: 'The Roastery by Nozy Coffee', desc: '原宿貓街上，工業風，只賣單一產區咖啡', query: 'The Roastery by Nozy Coffee' },
          { name: 'Camelback Sandwich&Espresso', desc: '澀谷神山町，壽司職人做的三明治配拿鐵', query: 'Camelback Sandwich&Espresso' },
        ],
        shopping: [
          { name: 'Onitsuka Tiger 澀谷', desc: '澀谷公園通上，獨棟店面，貨源充足', query: 'Onitsuka Tiger Shibuya' },
          { name: 'MOUSSY SHIBUYA 109', desc: '澀谷109旗艦店，款式最新，店員穿搭很強', query: 'MOUSSY SHIBUYA 109' },
          { name: 'AZUL by moussy 澀谷', desc: '就在109附近或百貨內，平價好入手', query: 'AZUL by moussy Shibuya' },
          { name: 'Shibuya PARCO', desc: '任天堂旗艦店、寶可夢中心、JUMP SHOP', query: 'Shibuya PARCO' },
          { name: 'Mega Don Quijote 澀谷本店', desc: '東京最大級唐吉訶德，動線寬敞好逛', query: 'Mega Don Quijote Shibuya' },
        ],
        sight: [
          { name: '宮下公園 (MIYASHITA PARK)', desc: '頂樓空中公園與潮流商場結合', query: 'Miyashita Park' },
        ],
        shrine: [
          { name: '金王八幡宮', desc: '澀谷最古老的神社，求財運與勝運', query: 'Konno Hachimangu Shrine' },
        ],
        select: [
          { name: 'Village Vanguard 下北澤', desc: '充滿次文化與怪奇雜貨的書店', query: 'Village Vanguard Shimokitazawa' },
          { name: 'B-SIDE LABEL 下北澤', desc: '原創設計防水貼紙專賣店', query: 'B-SIDE LABEL Shimokitazawa' },
        ]
      }
    },
    ito: {
      name: '伊東/伊豆',
      categories: {
        food: [
          { name: '樂味家 Marugen (楽味家まるげん)', desc: '伊東必吃！招牌「渦輪丼」是用宗田鰹做的獨特料理', query: 'Rakumiya Marugen Ito' },
          { name: 'Marutaka (まるたか)', desc: '伊東車站附近的人氣居酒屋，提供新鮮生魚片定食', query: 'Marutaka Ito Station' },
          { name: 'Fujiichi (ふじ一)', desc: '就在海邊！可以邊看海邊烤乾貨，非常有氣氛', query: 'Fujiichi Ito' },
          { name: '伊豆高原啤酒本店', desc: '海鮮丼份量驚人！滿滿的鮭魚卵和生魚片', query: 'Izu Kogen Beer Main Branch' },
          { name: 'Tokai-kan (東海館)', desc: '昭和初期溫泉旅館，裡面有喫茶室可以喝茶看河景', query: 'Tokaikan Ito' },
        ],
        coffee: [
          { name: 'Omuro Saryo (おおむろ軽食堂)', desc: '大室山下的質感食堂，有日式糰子和抹茶', query: 'Omuro Saryo' },
        ],
        shopping: [
          { name: 'Ito Marine Town', desc: '道之驛休息站，這裡的伴手禮最齊全，還有足湯', query: 'Ito Marine Town' },
        ]
      }
    },
    asakusa: {
      name: '淺草',
      categories: {
        coffee: [
          { name: 'Fuglen Asakusa', desc: '來自挪威的知名咖啡，淺草分店氛圍極佳，還有鬆餅', query: 'Fuglen Asakusa' },
          { name: 'Feb\'s Coffee & Scone', desc: '淺草人氣司康與咖啡小店，早餐推薦', query: 'Feb\'s Coffee & Scone Asakusa' },
          { name: 'Sukemasa Coffee', desc: '穿著和服的咖啡師，很有淺草氛圍', query: 'Sukemasa Coffee' },
        ],
        shrine: [
          { name: '今戶神社', desc: '招財貓發源地之一，求姻緣超靈驗', query: 'Imado Shrine' },
        ],
        sight: [
          { name: '合羽橋道具街', desc: '廚具、餐具、食品模型專賣街', query: 'Kappabashi Dougu Street' },
        ],
        drugstore: [
          { name: 'Sun Drug 淺草店', desc: '位於新仲見世通，價格常有驚喜', query: 'Sun Drug Asakusa' },
        ],
        select: [
          { name: 'Skoob', desc: '淺草在地職人手工皮鞋', query: 'Skoob Asakusa' },
        ]
      }
    },
    ueno: {
      name: '上野',
      categories: {
        coffee: [
          { name: 'Kayaba Coffee (カヤバ珈琲)', desc: '谷根千地區百年老屋改建，蛋沙拉三明治必點', query: 'Kayaba Coffee' },
        ],
        shopping: [
          { name: '多慶屋 (Takeya)', desc: '上野御徒町的紫色大樓，食品藥妝電器全包', query: 'Takeya Okachimachi' },
          { name: '二木的菓子', desc: '阿美橫町零食批發，伴手禮掃貨必去', query: 'Niki no Kashi Ueno' },
          { name: 'Yodobashi Camera 上野店', desc: '上野的大型電器行', query: 'Yodobashi Camera Multimedia Ueno' },
        ]
      }
    },
    akihabara: {
      name: '秋葉原',
      categories: {
        coffee: [
          { name: 'Verde (ヴェルデ)', desc: '秋葉原昭和風喫茶店，自家烘焙，可抽菸(注意)', query: 'Coffee Verde Akihabara' },
          { name: 'Vault Coffee', desc: '秋葉原隱藏版，安靜舒適，適合休息', query: 'Vault Coffee Akihabara' },
        ],
        shopping: [
          { name: 'Yodobashi Akiba', desc: '秋葉原超巨型旗艦店，樓上有美食街', query: 'Yodobashi Camera Akiba' },
          { name: 'Radio Kaikan (無線電會館)', desc: '秋葉原的地標，動漫模型格子趣', query: 'Akihabara Radio Kaikan' },
        ],
        shrine: [
          { name: '神田明神', desc: '動漫聖地，守護江戶的總鎮守，IT護身符', query: 'Kanda Myojin Shrine' },
        ],
        select: [
          { name: '2k540 AKI-OKA ARTISAN', desc: '高架橋下的職人手作街，文青必訪', query: '2k540 AKI-OKA ARTISAN' },
          { name: 'mAAch ecute 神田萬世橋', desc: '紅磚高架橋改建的質感商場', query: 'mAAch ecute Kanda Manseibashi' },
        ]
      }
    },
    tokyoStation: {
      name: '東京車站',
      categories: {
        shopping: [
          { name: 'Onitsuka Tiger 丸之內', desc: '鄰近東京車站，KITTE商場內，交通方便', query: 'Onitsuka Tiger KITTE Marunouchi' },
          { name: '大丸東京店', desc: '東京車站共構，伴手禮天堂', query: 'Daimaru Tokyo' },
        ],
        coffee: [
          { name: 'Marunouchi Cafe × WIRED CAFE', desc: '丸之內大樓旁，露天座位氣氛好', query: 'Marunouchi Cafe WIRED CAFE' },
          { name: 'Glitch Coffee & Roasters', desc: '神保町附近，極淺焙手沖冠軍店', query: 'Glitch Coffee & Roasters' },
        ],
        select: [
          { name: 'Traveler\'s Factory 東京站', desc: '旅人筆記本專賣店，限定印章', query: 'Traveler\'s Factory Tokyo Station' },
          { name: 'KITTE 丸之內', desc: '由舊郵局改建的文青選物商場', query: 'KITTE Marunouchi' },
        ]
      }
    }
  });

  const toggleShoppingCategory = (key) => {
    setExpandedShoppingCats(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // 修改：打開 Modal 時不再強制綁定分類，或者給一個預設值
  const openShoppingModal = (category = 'drugstore') => {
    setNewShoppingItem(prev => ({ ...prev, category }));
    setShowAddShoppingModal(true);
  };

  const deleteShoppingItem = (categoryKey, itemIndex) => {
      setShoppingItemToDelete({ categoryKey, itemIndex });
      setShowDeleteShoppingConfirm(true);
  };

  const confirmDeleteShoppingItem = () => {
    if (shoppingItemToDelete) {
      setShoppingList(prev => {
        const newItems = [...prev[shoppingItemToDelete.categoryKey].items];
        newItems.splice(shoppingItemToDelete.itemIndex, 1);
        return {
          ...prev,
          [shoppingItemToDelete.categoryKey]: {
            ...prev[shoppingItemToDelete.categoryKey],
            items: newItems
          }
        };
      });
      setShoppingItemToDelete(null);
      setShowDeleteShoppingConfirm(false);
    }
  };

  const addNewShoppingItem = () => {
    if (!newShoppingItem.name) return;
    setShoppingList(prev => ({
      ...prev,
      [newShoppingItem.category]: {
        ...prev[newShoppingItem.category],
        items: [...prev[newShoppingItem.category].items, newShoppingItem]
      }
    }));
    setShowAddShoppingModal(false);
    setNewShoppingItem({ name: '', category: 'drugstore', desc: '', location: '', price: '' });
  };
  
  const searchOnGoogle = (keyword) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(keyword + ' 日本')}&tbm=isch`;
    window.open(url, '_blank');
  };
  
  const openUrl = (url) => {
    window.open(url, '_blank');
  };
  
  const openAddRecModal = (area, category) => {
    setNewRecItem({ area, category, name: '', desc: '', query: '' });
    setShowAddRecModal(true);
  };

  const addNewRecItem = () => {
    if (!newRecItem.name) return;
    setRecommendationsData(prev => ({
      ...prev,
      [newRecItem.area]: {
        ...prev[newRecItem.area],
        categories: {
          ...prev[newRecItem.area].categories,
          [newRecItem.category]: [
            ...(prev[newRecItem.area].categories[newRecItem.category] || []),
            { name: newRecItem.name, desc: newRecItem.desc, query: newRecItem.query || newRecItem.name }
          ]
        }
      }
    }));
    setShowAddRecModal(false);
  };

  const deleteRecItem = (area, category, index) => {
    setRecItemToDelete({ area, category, index });
    setShowDeleteRecConfirm(true);
  };

  const confirmDeleteRecItem = () => {
    if (recItemToDelete) {
      setRecommendationsData(prev => {
        const newItems = [...prev[recItemToDelete.area].categories[recItemToDelete.category]];
        newItems.splice(recItemToDelete.index, 1);
        return {
          ...prev,
          [recItemToDelete.area]: {
            ...prev[recItemToDelete.area],
            categories: {
              ...prev[recItemToDelete.area].categories,
              [recItemToDelete.category]: newItems
            }
          }
        };
      });
      setRecItemToDelete(null);
      setShowDeleteRecConfirm(false);
    }
  };

  // 天氣資料處理
  const LOCATIONS_COORDS = {
    0: { lat: 35.6938, lon: 139.7034 }, // Shinjuku (Day 1)
    1: { lat: 35.6580, lon: 139.7016 }, // Shibuya (Day 2)
    2: { lat: 34.9731, lon: 139.0985 }, // Ito (Day 3)
    3: { lat: 34.9080, lon: 139.1065 }, // Izu (Day 4)
    4: { lat: 35.6586, lon: 139.7454 }, // Tokyo Tower (Day 5)
    5: { lat: 35.7148, lon: 139.7967 }, // Asakusa (Day 6)
    6: { lat: 35.7719, lon: 140.3929 }, // Narita (Day 7)
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return <Sun className="w-5 h-5 text-orange-400" />;
    if (code >= 1 && code <= 3) return <Cloud className="w-5 h-5 text-gray-400" />;
    if (code >= 45 && code <= 48) return <Cloud className="w-5 h-5 text-gray-400" />; // Fog
    if (code >= 51 && code <= 67) return <CloudRain className="w-5 h-5 text-blue-400" />; // Rain
    if (code >= 71 && code <= 77) return <CloudRain className="w-5 h-5 text-indigo-400" />; // Snow
    if (code >= 80 && code <= 82) return <CloudRain className="w-5 h-5 text-blue-500" />; // Showers
    return <Sun className="w-5 h-5 text-orange-400" />;
  };

  const getWeatherDesc = (code) => {
    const codes = {
      0: '晴朗無雲',
      1: '大致晴朗', 2: '多雲', 3: '陰天',
      45: '起霧', 48: '白霜霧',
      51: '毛毛雨', 53: '毛毛雨', 55: '毛毛雨',
      61: '小雨', 63: '中雨', 65: '大雨',
      80: '陣雨', 81: '陣雨', 82: '強陣雨',
    };
    return codes[code] || '晴時多雲';
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const fetchWeather = async (dayIndex) => {
    setWeatherLoading(true);
    const coords = LOCATIONS_COORDS[dayIndex] || LOCATIONS_COORDS[0];
    try {
      // Fetching current conditions + daily forecast for 'today' context
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=Asia%2FTokyo&forecast_days=1`
      );
      const data = await response.json();
      setWeatherData({
          current: data.current,
          daily: data.daily
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch weather", error);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedDay);
  }, [selectedDay]);

  // 將行程資料庫轉為 State，以便編輯
  const [itinerary, setItinerary] = useState([
    {
      date: '12/20 (六)',
      location: '移動日 / 新宿',
      events: [
        { time: '06:30', title: '萊爾富 冬山香南店', type: 'transport', note: '全員集合！別遲到喔～ 護照、錢包再次確認。', location: '萊爾富便利商店 冬山香南店' },
        { 
          // transit 物件中加入 from (起點) 和 to (終點) 用於導航連結
          transit: { type: 'car', time: '1h 30m', desc: '開車前往機場', detail: '自行開車前往桃園機場。請記得確認停車場預約資訊。', from: '萊爾富便利商店 冬山香南店', to: 'Taoyuan Airport Terminal 2' },
          time: '10:55', title: '日航 JL802', type: 'flight', note: '記得提早2小時到機場櫃檯報到。機上有Häagen-Dazs冰淇淋！', location: 'Taoyuan Airport Terminal 2' 
        },
        { 
          transit: { type: 'flight', time: '3h', desc: '飛行時間', detail: 'JL802 航班，預計飛行時間約3小時。', from: 'Taoyuan Airport Terminal 2', to: 'Narita International Airport' },
          time: '14:55', title: '成田國際機場', type: 'flight', note: '抵達後，先去上廁所、買水，準備搭乘 Skyliner 進市區。', location: 'Narita International Airport' 
        },
        { 
          transit: { type: 'train', time: '1h 10m', desc: 'Skyliner → 日暮里 → 山手線', detail: '1. 搭乘 Skyliner 至日暮里站 (約36分, ¥2,570)\n2. 站內轉乘 JR 山手線 (往新宿/池袋方向)\n3. 搭乘山手線至新大久保站 (約20分, ¥180)', from: 'Narita International Airport', to: 'DoMo S Hyakunincho' },
          time: '17:34', title: 'DoMo S Hyakunincho', type: 'hotel', note: 'Check-in 放行李。這間民宿風格很日式，附近有超市可以先逛逛買消夜。', location: 'DoMo S Hyakunincho' 
        },
        { 
          transit: { type: 'walk', time: '15m', desc: '步行前往歌舞伎町方向', detail: '沿著職安通或大久保通往新宿站方向走，穿過西武新宿站旁即可抵達黃金街。', from: 'DoMo S Hyakunincho', to: 'Shinjuku Golden Gai' },
          time: '18:45', title: '新宿黃金街 / 日本再生酒場', type: 'food', note: '晚餐第一站！昭和風情滿點。', location: 'Shinjuku Golden Gai', 
          tips: ['黃金街：很多店只有幾個座位，看到空位就勇敢進去吧！每家店都有獨特的「席料」(座位費)。', '日本再生酒場：必點「もつ煮込み (燉內臟)」和「つくね (雞肉丸)」。站著吃更有氣氛！', '拍照注意：黃金街大部分店家禁止對著店員或客人拍照，拍街景就好。'] 
        },
      ]
    },
    {
      date: '12/21 (日)',
      location: '世田谷 / 澀谷',
      events: [
        { time: '10:36', title: 'Ramen MAIKAGURA', type: 'food', note: '拉麵百名店！絕對值得排隊的美味。', location: 'Ramen MAIKAGURA', tips: ['必點：醬油拉麵 (Shoyu Ramen)。湯頭是用全雞熬煮，香氣逼人，被譽為「像在喝高級雞湯」。', '提醒：這家店非常熱門，建議開店前30分鐘就去排隊，不然可能會等上1小時。'] },
        { 
          transit: { type: 'train', time: '15m', desc: '小田急線 千歲船橋 → 豪德寺', detail: '從千歲船橋站搭乘小田急線各停往新宿方向，2站即達豪德寺站。出站後步行約10分鐘。(車資 ¥140)', from: 'Ramen MAIKAGURA', to: 'Gotokuji Temple' },
          time: '13:30', title: '豪德寺', type: 'sight', note: '招財貓的發源地，貓奴必去！', location: 'Gotokuji Temple', tips: ['拍照點：走到最裡面的招財貓奉納所，上千隻招財貓排排站，超級壯觀！', '伴手禮：一定要去社務所買一隻小招財貓回家，據說願望實現後要再買一隻大一點的回來還願。', '注意：請安靜參拜，不要為了拍照移動招財貓喔。'] 
        },
        { 
          transit: { type: 'train', time: '10m', desc: '小田急線 豪德寺 → 下北澤', detail: '搭乘小田急線往新宿方向，約5分鐘抵達下北澤站。(車資 ¥140)', from: 'Gotokuji Temple', to: 'Shimokitazawa' },
          time: '14:54', title: '下北澤 (Shimokitazawa)', type: 'shopping', note: '古著、咖哩、雜貨的天堂。隨意漫步就對了。', location: 'Shimokitazawa', tips: ['逛街推薦：除了古著店，一定要逛「Reload」這個新商場，有很多文青小店。', '美食：下北澤是「咖哩激戰區」，隨便找一家湯咖哩都不會踩雷。推薦「Rojiura Curry SAMURAI」。', '咖啡：累了就去「Bear Pond Espresso」喝杯有靈魂的咖啡。'] 
        },
        { 
          transit: { type: 'train', time: '5m', desc: '井之頭線 下北澤 → 澀谷', detail: '轉乘京王井之頭線急行往澀谷方向，一站即達。(車資 ¥140)', from: 'Shimokitazawa', to: 'Negishi Shibuya' },
          time: '18:15', title: 'Negishi (牛舌)', type: 'food', note: '東京CP值最高的牛舌定食連鎖店。', location: 'Negishi', tips: ['點餐攻略：推薦「白坦 (Shirotan)」套餐，是厚切的霜降牛舌，口感軟嫩彈牙！', '吃法：一定要把山藥泥淋在麥飯上，加一點醬油，搭配牛舌一起吃，絕配！'] 
        },
        { 
          transit: { type: 'walk', time: '5m', desc: '步行至 Scramble Square', detail: 'Negishi 吃飽後，步行至澀谷 Scramble Square 大樓，入口在 14 樓。', from: 'Negishi Shibuya', to: 'Shibuya Scramble Square' },
          time: '20:00', title: '澀谷 SKY', type: 'sight', note: '目前東京最紅的觀景台，360度無死角夜景。', location: 'Shibuya SKY', tips: ['入場：不能帶包包、腳架、自拍棒上去，要先寄放。手機建議掛脖子上。', '拍照：角落的玻璃角是兵家必爭之地，建議一上去就先去排隊拍照。', '體驗：如果風不大，一定要去躺在網床上看星星。'] 
        },
      ]
    },
    {
      date: '12/22 (一)',
      location: '伊豆 / 溫泉',
      events: [
        { time: '08:40', title: 'DOMO HOTEL', type: 'hotel', note: '退房，準備前往伊豆囉！行李可以寄放或用宅急便寄到下一間飯店。', location: 'DOMO HOTEL' },
        { 
          transit: { type: 'train', time: '2h', desc: '山手線 → 品川 → 10:08 特急踊子號', detail: '1. 新大久保/新宿搭乘山手線至品川 (約20分, ¥210)\n2. 轉乘 10:08 發車的特急踊子號 (Odoriko 5號) 直達伊東 (約1h 37m, 票價約 ¥3,890, 含指定席)\n*請務必預留轉乘時間！', from: 'DoMo S Hyakunincho', to: 'Hoshino Resorts KAI Anjin' },
          time: '12:00', title: '星野集團 界 Anjin', type: 'hotel', note: '今天的重頭戲！全客房海景的奢華溫泉旅館。', location: 'Hoshino Resorts KAI Anjin', 
          tips: ['特色：這間是以「威廉·亞當斯 (三浦按針)」為主題，充滿大航海時代的風格。', '體驗：一定要參加飯店的「精釀啤酒品飲」活動（如果有的話）。', '溫泉：頂樓的露天風呂可以看海，建議傍晚和隔天日出都去泡一次。', '晚餐：界系列的會席料理非常精緻，請穿著輕鬆的浴衣享用。'] 
        }
      ]
    },
    {
      date: '12/23 (二)',
      location: '伊豆 / 淺草',
      events: [
        { time: '10:30', title: '大室山', type: 'sight', note: '像個抹茶布丁一樣的可愛火山。', location: 'Omuroyama', tips: ['體驗：搭乘吊椅纜車上山，風景超級開闊！如果天氣好可以看到富士山。', '必做：在火山口繞一圈 (約1公里)，可以360度看海看山。', '美食：山下的「大室山糰子」很好吃，可以買來解饞。'] },
        { 
          transit: { type: 'bus', time: '15m', desc: '東海巴士 シャボテン公園行', detail: '從大室山搭乘東海巴士前往伊豆仙人掌動物園，非常近，甚至可以步行前往。(車資約 ¥170)', from: 'Omuroyama', to: 'Izu Shaboten Zoo' },
          time: '11:50', title: '伊豆仙人掌動物園', type: 'sight', note: '不只是仙人掌，重點是動物！', location: 'Izu Shaboten Zoo', tips: ['必看：冬天限定的「水豚君泡柚子溫泉」，看著牠們瞇眼泡湯超級療癒！', '互動：這裡的動物很多都是放養的，孔雀會在路上走，還可以餵食水豚。', '午餐：園區內有以水豚為造型的漢堡，拍照很可愛。'] 
        },
        { 
          transit: { type: 'bus', time: '40m', desc: '東海巴士 → 伊東車站', detail: '搭乘東海巴士返回伊東車站，準備搭車回東京。(車資約 ¥720)', from: 'Izu Shaboten Zoo', to: 'Ito Station' },
          time: '14:45', title: '伊東車站', type: 'transport', note: '搭乘特急踊子號 (Odoriko) 返回東京。買個鐵路便當在車上吃吧！', location: 'Ito Station' 
        },
        { 
          transit: { type: 'train', time: '2h', desc: '特急踊子號 → 東京 → 淺草', detail: '1. 搭乘踊子號回到東京站 (約 ¥3,890)\n2. 轉乘 JR 山手線至神田，轉銀座線至淺草 (約 ¥180+¥180)', from: 'Ito Station', to: 'Hotel Sunroute Asakusa' },
          time: '17:40', title: 'Hotel Sunroute Asakusa', type: 'hotel', note: '回到東京，住進充滿江戶風情的淺草。', location: 'Hotel Sunroute Asakusa' 
        },
        { 
          transit: { type: 'walk', time: '5m', desc: '步行前往', detail: '飯店步行即可抵達 UNIQLO 淺草店。', from: 'Hotel Sunroute Asakusa', to: 'UNIQLO Asakusa' },
          time: '18:17', title: 'UNIQLO 淺草店', type: 'shopping', note: '這家Uniqlo很不一樣！裝潢充滿日本祭典風格。', location: 'UNIQLO Asakusa', tips: ['限定：這裡有淺草限定的刺繡圖案和UT，非常適合當伴手禮。', '拍照：店內的巨大燈籠和木造裝潢，本身就是一個景點。'] 
        },
      ]
    },
    {
      date: '12/24 (三)',
      location: '東京鐵塔 / 晴空塔',
      events: [
        { time: '09:54', title: '東京站一番街', type: 'shopping', note: '伴手禮一級戰區。', location: 'Tokyo Station First Avenue', tips: ['必買：New York Perfect Cheese (起司奶油脆餅)，通常中午前就會賣完，要先衝！', '逛街：動漫迷要去「Character Street」，拉麵迷要去「Ramen Street」。', '拍照：記得走到丸之內口，拍紅磚車站的復古外觀。'] },
        { 
          transit: { type: 'walk', time: '10m', desc: '步行至丸之內 OAZO', detail: '走地下連通道即可抵達丸之內 OAZO，不用出站吹風。', from: 'Tokyo Station First Avenue', to: 'Nemuro Hanamaru Marunouchi Oazo' },
          time: '11:02', title: '根室花丸 (OAZO店)', type: 'food', note: '來自北海道的迴轉壽司，鮮度沒話說。', location: 'Nemuro Hanamaru Marunouchi Oazo', tips: ['攻略：如果不想排太久，建議一開店就去，或是抽號碼牌後去逛街。', '必吃：炙燒比目魚鰭邊 (Engawa)、生干貝 (Hotate)、當季的秋刀魚。', '湯品：他們的「花咲蟹鐵炮汁」非常鮮甜，必點！'] 
        },
        { 
          transit: { type: 'train', time: '20m', desc: '丸之內線/三田線 → 御成門', detail: '從大手町站搭乘三田線至御成門站，出站後即可看到東京鐵塔。(車資 ¥180)', from: 'Nemuro Hanamaru Marunouchi Oazo', to: 'Tokyo Tower' },
          time: '15:05', title: '東京鐵塔', type: 'sight', note: '東京永遠的地標，紅白配色就是經典。', location: 'Tokyo Tower', tips: ['拍照點：除了塔下，推薦去附近的「增上寺」，可以拍到寺廟與鐵塔的合影。', '體驗：如果體力好，可以挑戰爬樓梯上展望台 (約600階)，會有證書喔！'] 
        },
        { 
          transit: { type: 'walk', time: '15m', desc: '步行至大門', detail: '從東京鐵塔步行約15分鐘至大門站附近的 Tonkatsu Aoki。', from: 'Tokyo Tower', to: 'Tonkatsu Aoki Daimon' },
          time: '16:52', title: 'Tonkatsu Aoki (檍)', type: 'food', note: '東京豬排四大天王之一。', location: 'Tonkatsu Aoki Daimon', tips: ['必吃：特上里脊豬排 (Tokujo Rosu)。肉質粉嫩多汁，脂香四溢。', '佐料：桌上有喜馬拉雅岩鹽、松露鹽等多種鹽，推薦沾鹽吃，更能引出肉的甜味。', '提醒：這家店只有吧台座位，翻桌率快，但也需要排隊。'] 
        },
        { 
          transit: { type: 'train', time: '20m', desc: '淺草線 → 淺草', detail: '從大門站搭乘淺草線至淺草站，步行至吾妻橋頭。(車資 ¥220)', from: 'Tonkatsu Aoki Daimon', to: 'Asahi Beer Hall' },
          time: '18:23', title: '朝日啤酒總部', type: 'sight', note: '那個金色的...泡沫？還是雲？', location: 'Asahi Beer Hall', tips: ['冷知識：那團金色的物體其實是菲利普·史塔克設計的「聖火台上的火焰」。', '體驗：22樓有景觀酒吧，可以喝到最新鮮的Asahi生啤，還能看夜景。'] 
        },
        { 
          transit: { type: 'walk', time: '15m', desc: '步行越過吾妻橋', detail: '沿著隅田川步道散步，或走過吾妻橋直達晴空塔（押上）。', from: 'Asahi Beer Hall', to: 'Tokyo Skytree' },
          time: '19:33', title: '東京晴空塔', type: 'sight', note: '世界最高電波塔。', location: 'Tokyo Skytree', tips: ['購物：樓下的「Soramachi」商場非常好逛，有很多日本雜貨和限定伴手禮。', '夜景：如果不想花錢上展望台，30樓與31樓的餐廳層也有免費的景觀窗可以看。'] 
        },
      ]
    },
    {
      date: '12/25 (四)',
      location: '淺草 / 秋葉原 / 上野',
      events: [
        { time: '09:37', title: '淺草寺 雷門', type: 'sight', note: '東京最古老寺廟，感受下町風情。', location: 'Senso-ji', tips: ['必吃：仲見世通的「木村家」人形燒、「九重」炸饅頭。', '求籤：淺草寺的籤據說很靈驗，但凶籤比例很高 (約30%)。抽到凶別難過，綁在架子上就好；抽到吉記得帶回家。', '拍照：想拍沒人的雷門？建議早上8點前或晚上9點後來。'] },
        { 
          transit: { type: 'walk', time: '5m', desc: '步行至六區', detail: '穿過傳法院通，前往淺草六區。', from: 'Senso-ji', to: 'Mizuguchi' },
          time: '11:44', title: 'Mizuguchi 食堂', type: 'food', note: '在地人吃的食堂，不是觀光客店。', location: 'Mizuguchi', tips: ['氣氛：充滿懷舊昭和風，牆上貼滿手寫菜單。', '推薦：薑燒豬肉定食、馬鈴薯燉肉。這就是日本媽媽的味道。', '飲料：這裡的特製檸檬沙瓦很有名。'] 
        },
        { 
          transit: { type: 'train', time: '10m', desc: '筑波快線 淺草 → 秋葉原', detail: '搭乘つくばエクスプレス (TX) 從淺草站直達秋葉原站。(車資 ¥210)', from: 'Mizuguchi', to: 'Akihabara Electric Town' },
          time: '13:04', title: '秋葉原電氣街', type: 'shopping', note: '動漫、電器、偶像的聖地。', location: 'Akihabara Electric Town', tips: ['逛街：想找模型去「Radio Kaikan」，想找復古遊戲去「Super Potato」。', '體驗：可以去女僕咖啡廳體驗一下「萌え萌えキュン (Moe Moe Kyun)」。', '扭蛋：秋葉原扭蛋會館有幾百台扭蛋機，小心荷包失守。'] 
        },
        { 
          transit: { type: 'train', time: '5m', desc: '山手線 秋葉原 → 上野', detail: '搭乘 JR 山手線或京濱東北線，兩站即達上野站。(車資 ¥140)', from: 'Akihabara Electric Town', to: 'Ameyoko Shopping District' },
          time: '15:22', title: '上野阿美橫町', type: 'shopping', note: '充滿叫賣聲的露天市集，像台灣的年貨大街。', location: 'Ameyoko Shopping District', tips: ['必買：二木的菓子 (零食批發)，價格非常便宜，適合大量採購。', '必吃：路邊的水果串 (草莓、哈密瓜)，還有OS Drug旁邊的章魚燒。', '藥妝：這裡的藥妝店競爭激烈，價格通常比新宿、澀谷便宜。'] 
        },
        { 
          transit: { type: 'train', time: '5m', desc: '山手線 上野 → 日暮里', detail: '搭乘 JR 山手線至日暮里站。(車資 ¥140)', from: 'Ameyoko Shopping District', to: 'Yakiniku Bouya Nippori' },
          time: '18:24', title: '一頭牛燒肉 房家', type: 'food', note: 'A5黑毛和牛燒肉！', location: 'Yakiniku Bouya', tips: ['特色：他們是買下一整頭牛，所以可以吃到很多稀有部位。', '必點：和牛拼盤，一次滿足多種口感。', '配菜：他們的盛岡冷麵也很道地，適合收尾解膩。'] 
        },
      ]
    },
    {
      date: '12/26 (五)',
      location: '返程',
      events: [
        { time: '16:05', title: '成田機場第二航廈', type: 'transport', note: '抵達機場辦理登機。', location: 'Narita Airport Terminal 2' },
        { 
           transit: { type: 'flight', time: '4h', desc: '飛行時間', detail: '日航 JL809，滿載而歸！', from: 'Narita Airport Terminal 2', to: 'Taoyuan Airport Terminal 2' },
           time: '18:05', title: '日航 JL809', type: 'flight', note: '返回台灣。', location: 'Narita Airport Terminal 2', tips: ['最後採買：入關後的免稅店還可以買到ROYCE巧克力、東京香蕉。', '硬幣：把剩下的日圓硬幣都在販賣機花掉吧！'] 
        }
      ]
    }
  ]);

  // 更新行程內容的函式
  const updateEvent = (dayIndex, eventIndex, field, value) => {
    const newItinerary = [...itinerary];
    if (field === 'transit') {
       newItinerary[dayIndex].events[eventIndex].transit.desc = value;
    } else {
       newItinerary[dayIndex].events[eventIndex][field] = value;
    }
    setItinerary(newItinerary);
  };

  const deleteEvent = (dayIndex, eventIndex) => {
      setEventToDelete({ dayIndex, eventIndex });
      setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      // 深度複製以避免狀態變異問題
      const newItinerary = [...itinerary];
      const updatedEvents = [...newItinerary[eventToDelete.dayIndex].events];
      updatedEvents.splice(eventToDelete.eventIndex, 1);
      
      newItinerary[eventToDelete.dayIndex] = {
          ...newItinerary[eventToDelete.dayIndex],
          events: updatedEvents
      };
      
      setItinerary(newItinerary);
      setEventToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const addNewEvent = () => {
    if (!newEvent.time || !newEvent.title) return;
    const newItinerary = [...itinerary];
      
    // 自訂交通資訊
    let customTransit = null;
    if (newEvent.hasTransit) {
       // 如果有填寫自訂 URL，直接使用；否則使用自動生成的連結
       // 為了自動生成，我們需要知道起點。這裡假設起點是「上一個行程點」。
       const prevEvent = newItinerary[selectedDay].events[newItinerary[selectedDay].events.length - 1];
       const fromLoc = prevEvent ? (prevEvent.location || prevEvent.title) : 'Current Location';
       
       customTransit = {
           type: newEvent.transitType,
           time: newEvent.transitTime || '??m',
           desc: newEvent.transitDesc || '移動',
           detail: newEvent.transitDetail || '無詳細說明',
           from: fromLoc,
           to: newEvent.location || newEvent.title,
           // 優先使用使用者輸入的 URL
           customUrl: newEvent.transitUrl
       };
    }

    const eventToAdd = {
      ...newEvent,
      transit: customTransit
    };

    newItinerary[selectedDay].events.push(eventToAdd);
    // 按時間排序
    newItinerary[selectedDay].events.sort((a, b) => a.time.localeCompare(b.time));
    setItinerary(newItinerary);
    setNewEvent({ 
        time: '', 
        title: '', 
        type: 'sight', 
        note: '', 
        location: '',
        hasTransit: false,
        transitType: 'train',
        transitTime: '',
        transitDesc: '',
        transitDetail: '',
        transitUrl: ''
    });
    setShowAddEventModal(false);
  };

  const toggleEvent = (dayIndex, eventIndex) => {
    const key = `${dayIndex}-${eventIndex}`;
    setExpandedEvents(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleCategory = (area, category) => {
    const key = `${area}-${category}`;
    setExpandedCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleTransit = (dayIndex, eventIndex) => {
    const key = `${dayIndex}-${eventIndex}`;
    setExpandedTransits(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Google Maps 路線導航函式
  const openRoute = (from, to, customUrl) => {
    if (customUrl) {
        window.open(customUrl, '_blank');
        return;
    }
    if (!from || !to) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=transit`;
    window.open(url, '_blank');
  };

  // Helper functions
  const openMap = (loc) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`, '_blank');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'food': return <Utensils className="w-4 h-4 text-rose-500" />;
      case 'sight': return <MapPin className="w-4 h-4 text-indigo-500" />;
      case 'transport': return <Train className="w-4 h-4 text-emerald-500" />;
      case 'shopping': return <ShoppingBag className="w-4 h-4 text-amber-500" />;
      case 'hotel': return <Home className="w-4 h-4 text-purple-500" />;
      case 'flight': return <Plane className="w-4 h-4 text-sky-500" />;
      case 'drugstore': return <Plus className="w-4 h-4 text-green-500" />;
      case 'shrine': return <Map className="w-4 h-4 text-red-500" />;
      case 'select': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'coffee': return <Coffee className="w-4 h-4 text-orange-800" />;
      case 'music': return <Music className="w-4 h-4 text-pink-500" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getTransitIcon = (type) => {
      switch(type) {
          case 'train': return <Train className="w-3 h-3 text-stone-400" />;
          case 'walk': return <Footprints className="w-3 h-3 text-stone-400" />;
          case 'bus': return <Bus className="w-3 h-3 text-stone-400" />;
          case 'car': return <Car className="w-3 h-3 text-stone-400" />;
          case 'flight': return <Plane className="w-3 h-3 text-stone-400" />;
          default: return <Navigation className="w-3 h-3 text-stone-400" />;
      }
  }

  // 顏色配置更換為更柔和的日式配色
  const getTypeColor = (type) => {
    switch (type) {
      case 'food': return 'border-l-4 border-l-rose-400 bg-white';
      case 'sight': return 'border-l-4 border-l-indigo-400 bg-white';
      case 'transport': return 'border-l-4 border-l-emerald-400 bg-white';
      case 'shopping': return 'border-l-4 border-l-amber-400 bg-white';
      case 'hotel': return 'border-l-4 border-l-purple-400 bg-white';
      case 'flight': return 'border-l-4 border-l-sky-400 bg-white';
      case 'drugstore': return 'border-l-4 border-l-green-400 bg-white';
      case 'shrine': return 'border-l-4 border-l-red-400 bg-white';
      case 'select': return 'border-l-4 border-l-yellow-400 bg-white';
      case 'coffee': return 'border-l-4 border-l-orange-800 bg-white';
      case 'music': return 'border-l-4 border-l-pink-400 bg-white';
      default: return 'border-l-4 border-l-gray-400 bg-white';
    }
  };

  const getCategoryName = (cat) => {
    const map = {
      coffee: '咖啡廳 / 喫茶店',
      shopping: '購物 / 品牌',
      drugstore: '藥妝店',
      shrine: '神社 / 寺廟',
      select: '選物 / 文創',
      sight: '景點',
      food: '美食'
    };
    return map[cat] || cat;
  };

  return (
    <div className="flex flex-col h-screen bg-[#fcfaf2] font-sans text-slate-800 overflow-hidden max-w-md mx-auto shadow-2xl relative">
        
      {/* 頂部 Header */}
      <div className="bg-[#fcfaf2] px-6 pt-12 pb-4 z-10 border-b border-stone-200">
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-xs font-medium tracking-wider text-stone-500 block mb-1">TRIP TO JAPAN</span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">牛肉麵 🇯🇵</h1>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-900 text-white rounded-full">2025</span>
            
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`ml-2 p-1.5 rounded-full transition-colors ${isEditMode ? 'bg-indigo-500 text-white' : 'bg-stone-200 text-stone-500'}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-stone-500 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> Dec 20 - Dec 26 • 7 Days
        </p>
      </div>

      {/* 主要內容區塊 */}
      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        
        {activeTab === 'itinerary' && (
          <>
            {/* 日期選擇器 */}
            <div className="sticky top-0 bg-[#fcfaf2]/95 backdrop-blur pt-3 pb-3 z-20 overflow-x-auto whitespace-nowrap px-4 border-b border-stone-200 hide-scrollbar shadow-sm">
              <div className="flex space-x-3">
                {itinerary.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDay(index)}
                    className={`flex flex-col items-center justify-center min-w-[65px] py-2 px-2 rounded-xl transition-all duration-300 border ${
                      selectedDay === index 
                        ? 'bg-slate-800 border-slate-800 text-white shadow-md' 
                        : 'bg-white border-stone-100 text-stone-400 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-[10px] font-medium tracking-wide uppercase">{day.date.split(' ')[1].replace(/[()]/g, '')}</span>
                    <span className="text-lg font-bold font-mono">{day.date.split(' ')[0].split('/')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 天氣與地點概況 (Live Weather) */}
            <div className="mx-5 mt-6 mb-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                           LIVE WEATHER
                        </p>
                        <button 
                          onClick={() => fetchWeather(selectedDay)} 
                          className={`p-1 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-400 transition-all ${weatherLoading ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="w-3 h-3" />
                        </button>
                    </div>
                    {lastUpdated && (
                        <span className="text-[9px] text-stone-300 font-mono">
                            更新: {lastUpdated.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-500" />
                            {itinerary[selectedDay].location}
                        </p>
                    </div>
                    <div className="flex flex-col items-end">
                       {weatherLoading ? (
                           <div className="animate-pulse flex flex-col items-end gap-1">
                               <div className="h-8 w-16 bg-stone-200 rounded"></div>
                               <div className="h-4 w-12 bg-stone-200 rounded"></div>
                           </div>
                       ) : weatherData ? (
                           <>
                                <div className="flex items-center gap-2">
                                    {getWeatherIcon(weatherData.current.weather_code)}
                                    <span className="text-3xl font-bold text-slate-800">{weatherData.current.temperature_2m}<span className="text-lg align-top">°C</span></span>
                                </div>
                                <span className="text-xs text-stone-500 font-medium">{getWeatherDesc(weatherData.current.weather_code)}</span>
                           </>
                       ) : (
                           <span className="text-xs text-stone-400">無法取得天氣</span>
                       )}
                    </div>
                </div>
                
                {/* 詳細天氣資訊 Grid */}
                {weatherData && !weatherLoading && (
                  <>
                    <div className="grid grid-cols-4 gap-2 pt-4 border-t border-stone-100">
                        {/* 體感溫度 */}
                        <div className="flex flex-col items-center justify-center p-2 bg-stone-50 rounded-xl">
                             <ThermometerSun className="w-4 h-4 text-orange-400 mb-1" />
                             <span className="text-xs font-bold text-slate-700">{weatherData.current.apparent_temperature}°</span>
                             <span className="text-[9px] text-stone-400">體感</span>
                        </div>
                        {/* 降雨機率 */}
                        <div className="flex flex-col items-center justify-center p-2 bg-stone-50 rounded-xl">
                             <Umbrella className="w-4 h-4 text-blue-400 mb-1" />
                             <span className="text-xs font-bold text-slate-700">{weatherData.daily.precipitation_probability_max[0]}%</span>
                             <span className="text-[9px] text-stone-400">降雨機率</span>
                        </div>
                        {/* 濕度 */}
                        <div className="flex flex-col items-center justify-center p-2 bg-stone-50 rounded-xl">
                             <Droplets className="w-4 h-4 text-sky-400 mb-1" />
                             <span className="text-xs font-bold text-slate-700">{weatherData.current.relative_humidity_2m}%</span>
                             <span className="text-[9px] text-stone-400">濕度</span>
                        </div>
                        {/* 紫外線 */}
                         <div className="flex flex-col items-center justify-center p-2 bg-stone-50 rounded-xl">
                             <Sun className="w-4 h-4 text-amber-500 mb-1" />
                             <span className="text-xs font-bold text-slate-700">{weatherData.daily.uv_index_max[0]}</span>
                             <span className="text-[9px] text-stone-400">UV指數</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {/* 日出日落 */}
                        <div className="flex items-center justify-between p-2 bg-stone-50 rounded-xl px-3">
                            <div className="flex items-center gap-2">
                                <Sunrise className="w-4 h-4 text-orange-300" />
                                <span className="text-xs font-bold text-slate-600">{formatTime(weatherData.daily.sunrise[0])}</span>
                            </div>
                            <div className="w-[1px] h-3 bg-stone-200"></div>
                            <div className="flex items-center gap-2">
                                <Sunset className="w-4 h-4 text-indigo-300" />
                                <span className="text-xs font-bold text-slate-600">{formatTime(weatherData.daily.sunset[0])}</span>
                            </div>
                        </div>
                        
                        {/* 風速與氣壓 */}
                        <div className="flex items-center justify-between p-2 bg-stone-50 rounded-xl px-3">
                             <div className="flex items-center gap-1.5">
                                <Wind className="w-4 h-4 text-stone-400" />
                                <span className="text-xs font-bold text-slate-600">{weatherData.current.wind_speed_10m} <span className="text-[8px] font-normal">km/h</span></span>
                             </div>
                             <div className="flex items-center gap-1.5">
                                <Gauge className="w-4 h-4 text-stone-400" />
                                <span className="text-xs font-bold text-slate-600">{weatherData.current.surface_pressure} <span className="text-[8px] font-normal">hPa</span></span>
                             </div>
                        </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 行程卡片列表 (可摺疊) */}
            <div className="px-5 space-y-0">
              {itinerary[selectedDay].events.map((event, idx) => {
                const isExpanded = expandedEvents[`${selectedDay}-${idx}`];
                const isTransitExpanded = expandedTransits[`${selectedDay}-${idx}`];
                return (
                  <div key={idx} className="relative pb-6 last:pb-0">
                      
                    {/* 交通連接線 (如果有的話) */}
                    {event.transit && (
                        <div className="flex flex-col mb-4 pl-2 opacity-80">
                            <div className="w-[1px] h-full bg-stone-300 absolute left-[29px] top-[-20px] bottom-10 z-0 border-l border-dashed border-stone-300"></div>
                              
                            {/* 交通按鈕 (可點擊展開) */}
                            <div 
                              className="ml-10 flex items-center gap-2 text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200 shadow-sm z-10 cursor-pointer w-fit hover:bg-stone-200 transition-colors"
                              onClick={() => toggleTransit(selectedDay, idx)}
                            >
                                {getTransitIcon(event.transit.type)}
                                {isEditMode ? (
                                    <>
                                      <input 
                                        type="text" 
                                        className="font-mono font-bold bg-transparent border-b border-stone-300 w-16 focus:outline-none"
                                        value={event.transit.time}
                                        onChange={(e) => {
                                          const newItinerary = [...itinerary];
                                          newItinerary[selectedDay].events[idx].transit.time = e.target.value;
                                          setItinerary(newItinerary);
                                        }}
                                      />
                                      <input 
                                        type="text" 
                                        className="bg-transparent border-b border-stone-300 focus:outline-none flex-1"
                                        value={event.transit.desc}
                                        onChange={(e) => updateEvent(selectedDay, idx, 'transit', e.target.value)}
                                      />
                                    </>
                                ) : (
                                    <>
                                        <span className="font-mono font-bold">{event.transit.time}</span>
                                        <span className="w-[1px] h-3 bg-stone-300 mx-1"></span>
                                        <span>{event.transit.desc}</span>
                                        {isTransitExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                                    </>
                                )}
                            </div>

                            {/* 展開後的詳細交通資訊與導航按鈕 */}
                            {isTransitExpanded && !isEditMode && (
                              <div className="ml-10 mt-2 p-3 bg-white border border-stone-200 rounded-xl shadow-sm z-10 animate-fadeIn">
                                <div className="text-xs text-stone-600 mb-3 leading-relaxed whitespace-pre-wrap">
                                  {event.transit.detail || '暫無詳細路線資訊。'}
                                </div>
                                <button 
                                  onClick={() => openRoute(event.transit.from, event.transit.to, event.transit.customUrl)}
                                  className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                  <Navigation className="w-3 h-3" />
                                  路線導航 (Google Maps)
                                </button>
                              </div>
                            )}
                        </div>
                    )}
                      
                    <div className={`relative rounded-2xl shadow-sm transition-all duration-300 ${getTypeColor(event.type)} overflow-hidden z-10`}>
                        {/* 卡片標題區 (可點擊展開/收合) */}
                        <div 
                        className="p-5 flex items-start justify-between relative z-10 cursor-pointer"
                        onClick={() => !isEditMode && toggleEvent(selectedDay, idx)}
                        >
                        <div className="flex items-start gap-4 flex-1">
                            {/* Icon 圓圈 */}
                            <div className="mt-1 w-8 h-8 flex items-center justify-center bg-stone-50 rounded-full shadow-inner border border-stone-100 shrink-0">
                            {getTypeIcon(event.type)}
                            </div>
                              
                            <div className="flex-1 min-w-0">
                            {/* 時間與標籤 */}
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                                {isEditMode ? (
                                  <input 
                                    type="text" 
                                    className="text-sm font-mono text-slate-600 font-bold bg-white/50 px-1.5 rounded border-b border-stone-300 w-16"
                                    value={event.time}
                                    onChange={(e) => updateEvent(selectedDay, idx, 'time', e.target.value)}
                                  />
                                ) : (
                                  <span className="text-sm font-mono text-slate-600 font-bold">{event.time}</span>
                                )}
                                {event.type === 'food' && <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">必吃美食</span>}
                                {event.type === 'shopping' && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">必買清單</span>}
                                {event.type === 'sight' && <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">景點</span>}
                            </div>
                              
                            {isEditMode ? (
                              <input 
                                type="text" 
                                className="text-lg font-bold text-slate-800 leading-snug w-full bg-transparent border-b border-stone-300 focus:outline-none mb-1"
                                value={event.title}
                                onChange={(e) => updateEvent(selectedDay, idx, 'title', e.target.value)}
                              />
                            ) : (
                              <h3 className="text-lg font-bold text-slate-800 leading-snug">{event.title}</h3>
                            )}

                            <div className="flex items-center gap-1 mt-1">
                                {!isExpanded && !isEditMode && <p className="text-xs text-stone-400 line-clamp-1">{event.note}</p>}
                            </div>
                            </div>
                        </div>
                          
                        {/* 展開指示箭頭或刪除按鈕 */}
                        <div className="text-stone-300 ml-2 mt-2">
                          {isEditMode ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteEvent(selectedDay, idx); }}
                              className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-full"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          ) : (
                             isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                        </div>

                        {/* 展開後的詳細內容 (編輯模式下強制展開) */}
                        {(isExpanded || isEditMode) && (
                        <div className="px-5 pb-5 pt-0 animate-fadeIn">
                            <div className="border-t border-stone-100 pt-3 space-y-4">
                              
                            {/* 詳細筆記 */}
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase mb-1">Note</p>
                                {isEditMode ? (
                                  <textarea 
                                    className="text-sm text-stone-600 w-full bg-stone-50 p-2 rounded-lg border border-stone-200 focus:outline-none focus:border-indigo-300"
                                    rows={2}
                                    value={event.note}
                                    onChange={(e) => updateEvent(selectedDay, idx, 'note', e.target.value)}
                                  />
                                ) : (
                                  <p className="text-sm text-stone-600">{event.note}</p>
                                )}
                            </div>

                            {/* 導遊小撇步 */}
                            {event.tips && (
                                <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                                <p className="text-[10px] font-bold text-indigo-400 mb-1.5 flex items-center gap-1 uppercase tracking-wide">
                                    <Info className="w-3 h-3" /> Travel Tips
                                </p>
                                <ul className="space-y-1">
                                    {event.tips.map((tip, tIdx) => (
                                    <li key={tIdx} className="text-xs text-stone-600 flex items-start gap-1.5">
                                        <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-300 shrink-0"></span>
                                        {tip}
                                    </li>
                                    ))}
                                </ul>
                                </div>
                            )}

                            {/* 操作按鈕群 */}
                            <div className="flex gap-2 pt-2">
                                <button 
                                onClick={(e) => { e.stopPropagation(); openMap(event.location); }}
                                className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-indigo-100 transition-colors"
                                >
                                <Navigation className="w-3 h-3" /> 導航前往
                                </button>
                            </div>
                            </div>
                        </div>
                        )}
                    </div>
                  </div>
                );
              })}
              
              {/* 新增行程按鈕 (只在行程頁面底部顯示) */}
              <div className="pt-4 pb-12 flex justify-center">
                 <button 
                  onClick={() => setShowAddEventModal(true)}
                  className="flex flex-col items-center justify-center text-stone-400 hover:text-slate-600 transition-colors gap-2 group"
                 >
                   <div className="w-12 h-12 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center group-hover:border-slate-400 group-hover:bg-stone-50">
                     <Plus className="w-6 h-6" />
                   </div>
                   <span className="text-xs font-bold">新增行程</span>
                 </button>
              </div>

            </div>
          </>
        )}

        {/* ... existing code for modals ... */}
        {/* 新增行程 Modal */}
        {showAddEventModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fadeIn max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">新增行程</h3>
                <button onClick={() => setShowAddEventModal(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* 基本資訊 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">時間</label>
                    <input 
                      type="time" 
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    />
                  </div>
                   <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">類型</label>
                    <select 
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                    >
                      <option value="sight">景點</option>
                      <option value="food">美食</option>
                      <option value="shopping">購物</option>
                      <option value="transport">交通</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">標題</label>
                  <input 
                    type="text" 
                    placeholder="行程名稱"
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">備註 / 導航地點</label>
                  <input 
                    type="text" 
                    placeholder="輸入地點名稱 (用於Google Maps搜尋)"
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500 mb-2"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  />
                  <textarea 
                    placeholder="輸入筆記..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                    rows={2}
                    value={newEvent.note}
                    onChange={(e) => setNewEvent({...newEvent, note: e.target.value})}
                  />
                </div>

                {/* 自訂交通區塊 */}
                <div className="pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-stone-500 flex items-center gap-1">
                      <Train className="w-3 h-3" /> 加入交通資訊
                    </label>
                    <input 
                      type="checkbox" 
                      checked={newEvent.hasTransit}
                      onChange={(e) => setNewEvent({...newEvent, hasTransit: e.target.checked})}
                      className="accent-indigo-600"
                    />
                  </div>

                  {newEvent.hasTransit && (
                    <div className="space-y-3 bg-stone-50 p-3 rounded-lg border border-stone-200 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-stone-400 block mb-1">方式</label>
                            <select 
                              className="w-full bg-white border border-stone-200 rounded p-1.5 text-xs"
                              value={newEvent.transitType}
                              onChange={(e) => setNewEvent({...newEvent, transitType: e.target.value})}
                            >
                              <option value="train">電車</option>
                              <option value="walk">步行</option>
                              <option value="bus">巴士</option>
                              <option value="car">計程車/車</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-stone-400 block mb-1">時間</label>
                            <input 
                              type="text" 
                              placeholder="例: 15m"
                              className="w-full bg-white border border-stone-200 rounded p-1.5 text-xs"
                              value={newEvent.transitTime}
                              onChange={(e) => setNewEvent({...newEvent, transitTime: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-400 block mb-1">簡述</label>
                          <input 
                            type="text" 
                            placeholder="例: JR山手線 → 新宿"
                            className="w-full bg-white border border-stone-200 rounded p-1.5 text-xs"
                            value={newEvent.transitDesc}
                            onChange={(e) => setNewEvent({...newEvent, transitDesc: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-400 block mb-1">詳細說明</label>
                          <textarea 
                            placeholder="轉乘資訊、票價等..."
                            className="w-full bg-white border border-stone-200 rounded p-1.5 text-xs"
                            rows={2}
                            value={newEvent.transitDetail}
                            onChange={(e) => setNewEvent({...newEvent, transitDetail: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-400 flex items-center gap-1 mb-1">
                             <Link className="w-3 h-3" /> 自訂導航連結 (選填)
                          </label>
                          <input 
                            type="text" 
                            placeholder="貼上 Google Maps 連結"
                            className="w-full bg-white border border-stone-200 rounded p-1.5 text-xs text-blue-500"
                            value={newEvent.transitUrl}
                            onChange={(e) => setNewEvent({...newEvent, transitUrl: e.target.value})}
                          />
                        </div>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={addNewEvent}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl mt-6 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                確認新增
              </button>
            </div>
          </div>
        )}

        {/* 刪除確認 Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-xl animate-fadeIn text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">確定要刪除嗎？</h3>
              <p className="text-sm text-stone-500 mb-6">刪除後將無法復原此行程。</p>
                
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-200 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 新增購物商品 Modal (修改版: 可選分類) */}
        {showAddShoppingModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fadeIn">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-slate-800">新增購物清單</h3>
                 <button onClick={() => setShowAddShoppingModal(false)} className="text-stone-400 hover:text-stone-600">
                   <X className="w-6 h-6" />
                 </button>
               </div>

               <div className="space-y-3">
                 <div>
                    <label className="text-xs font-bold text-stone-500 block mb-1">分類</label>
                    <select 
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                      value={newShoppingItem.category}
                      onChange={(e) => setNewShoppingItem({...newShoppingItem, category: e.target.value})}
                    >
                       <option value="drugstore">藥妝類</option>
                       <option value="conbini">超商必買</option>
                       <option value="supermarket">超市尋寶</option>
                       <option value="souvenir">伴手禮</option>
                       <option value="other">其他</option>
                    </select>
                 </div>
                 <div>
                   <label className="text-xs font-bold text-stone-500 block mb-1">商品名稱</label>
                   <input 
                     type="text" 
                     className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                     placeholder="例: 昆布鹽"
                     value={newShoppingItem.name}
                     onChange={(e) => setNewShoppingItem({...newShoppingItem, name: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-stone-500 block mb-1">參考價格</label>
                   <input 
                     type="text" 
                     className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                     placeholder="例: ¥400"
                     value={newShoppingItem.price}
                     onChange={(e) => setNewShoppingItem({...newShoppingItem, price: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-stone-500 block mb-1">購買地點/備註</label>
                   <input 
                     type="text" 
                     className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                     placeholder="例: 各大超市"
                     value={newShoppingItem.location}
                     onChange={(e) => setNewShoppingItem({...newShoppingItem, location: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-stone-500 block mb-1">描述</label>
                   <input 
                     type="text" 
                     className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                     placeholder="功能或特色..."
                     value={newShoppingItem.desc}
                     onChange={(e) => setNewShoppingItem({...newShoppingItem, desc: e.target.value})}
                   />
                 </div>
               </div>

               <button 
                 onClick={addNewShoppingItem}
                 className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl mt-6 hover:bg-indigo-700 transition-colors shadow-lg"
               >
                 加入清單
               </button>
             </div>
          </div>
        )}

        {/* 刪除購物商品確認 Modal */}
        {showDeleteShoppingConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-xl animate-fadeIn text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">確定要刪除此商品嗎？</h3>
                
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteShoppingConfirm(false)}
                  className="flex-1 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-200 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={confirmDeleteShoppingItem}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 刪除清單景點確認 Modal */}
        {showDeleteRecConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-xl animate-fadeIn text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">確定要刪除此景點嗎？</h3>
                
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteRecConfirm(false)}
                  className="flex-1 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-200 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={confirmDeleteRecItem}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 新增清單景點 Modal */}
        {showAddRecModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-fadeIn">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Map className="w-5 h-5" /> 新增景點/店鋪
                </h3>
                <button onClick={() => setShowAddRecModal(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">區域</label>
                  <select 
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                    value={newRecItem.area}
                    onChange={(e) => setNewRecItem({...newRecItem, area: e.target.value})}
                  >
                    {Object.keys(recommendationsData).map(key => (
                      <option key={key} value={key}>{recommendationsData[key].name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">分類</label>
                  <select 
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                    value={newRecItem.category}
                    onChange={(e) => setNewRecItem({...newRecItem, category: e.target.value})}
                  >
                    <option value="food">美食</option>
                    <option value="coffee">咖啡廳</option>
                    <option value="shopping">購物</option>
                    <option value="drugstore">藥妝</option>
                    <option value="shrine">神社</option>
                    <option value="sight">景點</option>
                    <option value="select">選物</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">名稱</label>
                  <input 
                    type="text" 
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="例: Harbs"
                    value={newRecItem.name}
                    onChange={(e) => setNewRecItem({...newRecItem, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">簡述</label>
                  <input 
                    type="text" 
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="特色說明"
                    value={newRecItem.desc}
                    onChange={(e) => setNewRecItem({...newRecItem, desc: e.target.value})}
                  />
                </div>
                 <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1">Google Maps 搜尋關鍵字 (選填)</label>
                  <input 
                    type="text" 
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="預設為名稱"
                    value={newRecItem.query}
                    onChange={(e) => setNewRecItem({...newRecItem, query: e.target.value})}
                  />
                </div>
              </div>

              <button 
                onClick={addNewRecItem}
                className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl mt-6 hover:bg-slate-700 transition-colors shadow-lg"
              >
                加入清單
              </button>
            </div>
          </div>
        )}

        {/* 深度旅遊推薦分頁 (Deep Dive) */}
        {activeTab === 'recommendations' && (
          <div className="px-5 py-6 space-y-4">
              
            {/* 地區選擇 Tab */}
            <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar">
              {Object.keys(recommendationsData).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedRecArea(key)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedRecArea === key
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-stone-500 border border-stone-200'
                  }`}
                >
                  {recommendationsData[key].name}
                </button>
              ))}
            </div>

            {/* 推薦景點列表 (分類摺疊) */}
            <div className="space-y-3">
              {Object.entries(recommendationsData[selectedRecArea].categories).map(([categoryKey, spots]) => {
                const isCatExpanded = expandedCategories[`${selectedRecArea}-${categoryKey}`];
                return (
                  <div key={categoryKey} className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
                    <div
                      onClick={() => toggleCategory(selectedRecArea, categoryKey)}
                      className="w-full px-4 py-3 flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-white rounded-full border border-stone-100">{getTypeIcon(categoryKey)}</span>
                        <span className="text-sm font-bold text-slate-700">{getCategoryName(categoryKey)}</span>
                        <span className="text-xs text-stone-400 font-mono">({spots.length})</span>
                      </div>
                        
                      <div className="flex items-center gap-3">
                        {isCatExpanded && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); openAddRecModal(selectedRecArea, categoryKey); }}
                             className="p-1 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-100"
                           >
                             <Plus className="w-4 h-4" />
                           </button>
                        )}
                        {isCatExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                      </div>
                    </div>
                      
                    {isCatExpanded && (
                      <div className="divide-y divide-stone-50">
                        {spots.map((spot, index) => (
                          <div key={index} className="p-4 flex items-start justify-between hover:bg-stone-50/50 transition-colors group relative">
                            <div className="flex-1 mr-4">
                              <h3 className="font-bold text-slate-800 text-sm mb-1">{spot.name}</h3>
                              <p className="text-xs text-stone-500">{spot.desc}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button 
                                  onClick={() => openMap(spot.query)}
                                  className="p-2 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-100 transition-colors flex flex-col items-center justify-center h-full gap-1 min-w-[50px]"
                                >
                                  <MapPin className="w-4 h-4" />
                                  <span className="text-[8px] font-bold">GO</span>
                                </button>
                                  
                                {/* 刪除按鈕 */}
                                <button 
                                  onClick={() => deleteRecItem(selectedRecArea, categoryKey, index)}
                                  className="p-1 text-stone-300 hover:text-red-400 self-end"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
              
            {/* 全域新增景點按鈕 */}
             <div className="fixed bottom-24 right-5 z-20">
               <button 
                 onClick={() => openAddRecModal(selectedRecArea, 'food')}
                 className="w-14 h-14 bg-slate-800 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-slate-700 transition-transform active:scale-95"
               >
                 <Plus className="w-6 h-6" />
               </button>
             </div>
          </div>
        )}

        {/* 購物清單分頁 (Shopping List) */}
        {activeTab === 'shopping' && (
          <div className="px-5 py-6 space-y-4">
             {/* 購物清單內容 */}
             <div className="space-y-4">
               {Object.entries(shoppingList).map(([key, category]) => {
                 const isExpanded = expandedShoppingCats[key];
                 return (
                   <div key={key} className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
                     <div
                       onClick={() => toggleShoppingCategory(key)}
                       className="w-full px-5 py-3 flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer"
                     >
                       <span className="font-bold text-slate-700">{category.title}</span>
                       
                       <div className="flex items-center gap-3">
                           <span className="text-xs text-stone-400 bg-white px-2 py-0.5 rounded-full border border-stone-100">{category.items.length}</span>
                           {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                       </div>
                     </div>
                     
                     {isExpanded && (
                       <div className="divide-y divide-stone-50">
                         {category.items.length === 0 ? (
                           <div className="p-8 text-center text-stone-400 text-xs italic">
                             暫無商品，點擊 + 新增
                           </div>
                         ) : (
                           category.items.map((item, idx) => (
                             <div key={idx} className="p-4 flex flex-col gap-2 hover:bg-stone-50/50 transition-colors group relative">
                               <div className="flex-1 min-w-0 pr-8">
                                 <div className="flex justify-between items-start mb-1">
                                   <h3 className="font-bold text-slate-800 text-sm truncate">{item.name}</h3>
                                   <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">{item.price}</span>
                                 </div>
                                 <p className="text-xs text-stone-500 line-clamp-2 mb-2">{item.desc}</p>
                                 <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center gap-1 text-[10px] text-stone-400">
                                      <MapPin className="w-3 h-3" />
                                      <span className="truncate max-w-[150px]">{item.location}</span>
                                    </div>
                                    <button 
                                      onClick={() => searchOnGoogle(item.name)}
                                      className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-indigo-500 bg-white border border-stone-200 rounded px-2 py-1 shadow-sm"
                                    >
                                      <Search className="w-3 h-3" /> 搜尋
                                    </button>
                                 </div>
                               </div>
                               
                               {/* 刪除按鈕 */}
                               <button 
                                  onClick={() => deleteShoppingItem(key, idx)}
                                  className="absolute top-4 right-4 text-stone-300 hover:text-red-400 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                           ))
                         )}
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
             
             {/* 全域新增商品按鈕 (FAB) */}
             <div className="fixed bottom-24 right-5 z-20">
               <button 
                 onClick={() => openShoppingModal()}
                 className="w-14 h-14 bg-slate-800 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-slate-700 transition-transform active:scale-95"
               >
                 <Plus className="w-6 h-6" />
               </button>
             </div>
          </div>
        )}

        {/* ... existing code ... */}
        {/* 資訊分頁 (Info Tab) */}
        {activeTab === 'info' && (
          <div className="px-5 py-6 space-y-6">
            <section>
              <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                Flight Info
              </h2>
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="p-5 border-b border-stone-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-sky-500 bg-sky-50 px-2 py-0.5 rounded">去程 12/20</span>
                    <span className="font-mono font-bold text-xl text-slate-800">10:55</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-slate-800">TPE</span>
                      <span className="text-xs text-stone-400 font-bold">Terminal 2</span>
                    </div>
                    <Plane className="w-5 h-5 text-stone-300 rotate-90" />
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold text-slate-800">NRT</span>
                      <span className="text-xs text-stone-400 font-bold">Terminal 2</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-stone-500 font-mono text-right">JL802</div>
                </div>
                <div className="p-5 bg-stone-50/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">回程 12/26</span>
                    <span className="font-mono font-bold text-xl text-slate-800">18:05</span>
                  </div>
                   <div className="flex justify-between items-center opacity-80">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-slate-800">NRT</span>
                      <span className="text-xs text-stone-400 font-bold">Terminal 2</span>
                    </div>
                    <Plane className="w-5 h-5 text-stone-300 rotate-90" />
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold text-slate-800">TPE</span>
                      <span className="text-xs text-stone-400 font-bold">Terminal 2</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-stone-500 font-mono text-right">JL809</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-3">Accommodation</h2>
              <div className="space-y-3">
                {[
                  { days: 'Day 1-3', name: 'DoMo S Hyakunincho', loc: '新宿百人町' },
                  { days: 'Day 3-4', name: '星野集團 界 Anjin', loc: '靜岡縣伊東市' },
                  { days: 'Day 4-7', name: 'Hotel Sunroute Asakusa', loc: '淺草' }
                ].map((hotel, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded mb-1 inline-block">{hotel.days}</span>
                      <h3 className="font-bold text-slate-800">{hotel.name}</h3>
                      <p className="text-xs text-stone-500 mt-0.5">{hotel.loc}</p>
                    </div>
                    <button onClick={() => openMap(hotel.name)} className="p-2 bg-stone-50 rounded-full text-stone-400 hover:text-slate-800 hover:bg-stone-100">
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
               <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                 <Cigarette className="w-4 h-4" /> Smoking Areas
               </h2>
               <div className="bg-white p-4 rounded-2xl border border-stone-100 text-sm text-slate-700 space-y-3">
                 <p className="text-xs text-stone-500 mb-2">日本路上大多禁止吸菸，請至指定吸菸區。</p>
                 <div className="grid grid-cols-1 gap-3">
                   <a href="https://www.google.com/search?q=club+JT" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
                     <Search className="w-4 h-4 text-stone-400" />
                     <span className="font-bold text-xs">CLUB JT 吸菸所搜尋 (Google)</span>
                   </a>
                 </div>
               </div>
            </section>
            
            <section>
               <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-3">Emergency</h2>
              <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 text-sm text-slate-700 space-y-3">
                 <div className="flex justify-between items-center pb-2 border-b border-rose-100/50">
                   <span className="font-medium">警察局</span>
                   <a href="tel:110" className="font-mono font-bold text-lg text-rose-600 flex items-center gap-1"><Phone className="w-3 h-3"/> 110</a>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-rose-100/50">
                   <span className="font-medium">救護車/火警</span>
                   <a href="tel:119" className="font-mono font-bold text-lg text-rose-600 flex items-center gap-1"><Phone className="w-3 h-3"/> 119</a>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="font-medium">旅外國人急難救助</span>
                   <a href="tel:+81332807811" className="font-mono font-bold text-rose-600 flex items-center gap-1 text-xs">
                    <Phone className="w-3 h-3"/> +81-3-3280-7811
                   </a>
                 </div>
              </div>
            </section>
          </div>
        )}

      </div>

      {/* 底部導航欄 */}
      <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-stone-100 pb-safe pt-2 px-6 flex justify-between items-center z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <button 
          onClick={() => setActiveTab('itinerary')}
          className={`flex flex-col items-center p-2 transition-all duration-300 ${activeTab === 'itinerary' ? 'text-slate-800 scale-105' : 'text-stone-300 hover:text-stone-400'}`}
        >
          <Calendar className="w-6 h-6 mb-1" strokeWidth={activeTab === 'itinerary' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">行程</span>
        </button>
        <button 
          onClick={() => setActiveTab('shopping')}
          className={`flex flex-col items-center p-2 transition-all duration-300 ${activeTab === 'shopping' ? 'text-slate-800 scale-105' : 'text-stone-300 hover:text-stone-400'}`}
        >
          <ShoppingBag className="w-6 h-6 mb-1" strokeWidth={activeTab === 'shopping' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">購物</span>
        </button>
        <button 
          onClick={() => setActiveTab('recommendations')}
          className={`flex flex-col items-center p-2 transition-all duration-300 ${activeTab === 'recommendations' ? 'text-slate-800 scale-105' : 'text-stone-300 hover:text-stone-400'}`}
        >
          <Map className="w-6 h-6 mb-1" strokeWidth={activeTab === 'recommendations' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">清單</span>
        </button>
        <button 
          onClick={() => setActiveTab('info')}
          className={`flex flex-col items-center p-2 transition-all duration-300 ${activeTab === 'info' ? 'text-slate-800 scale-105' : 'text-stone-300 hover:text-stone-400'}`}
        >
          <Info className="w-6 h-6 mb-1" strokeWidth={activeTab === 'info' ? 2.5 : 2} />
          <span className="text-[10px] font-bold">資訊</span>
        </button>
      </div>
        
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 20px);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};