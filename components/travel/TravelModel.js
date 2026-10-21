import { travelAssets } from "./travelAssets";

export class TravelModel {
  _idx;
  constructor(notify, dynamic = null) {
    this.notify = notify;
    // WordPress se aaya hua dynamic data (server-side fetch, app/page.jsx).
    // Jahan WP data maujood ho wahan hardcoded fallback replace ho jata hai;
    // jahan WP khali ho wahan purana design data hi chalta rehta hai.
    this.dynamic = dynamic || {};
    if (Array.isArray(this.dynamic.explorerRegions) && this.dynamic.explorerRegions.length) {
      this.regions = this.dynamic.explorerRegions;
    }
    if (this.dynamic.placesByDistrict && Object.keys(this.dynamic.placesByDistrict).length) {
      const wpPlaces = {};
      for (const [district, items] of Object.entries(this.dynamic.placesByDistrict)) {
        wpPlaces[district] = items.map(i => i.name + "|" + (i.type || "Place")).join(";");
      }
      this.places = { ...this.places, ...wpPlaces };
    }
  }
  setState(patch) { this.state = { ...this.state, ...(typeof patch === "function" ? patch(this.state) : patch) }; this.notify?.(); }
  state = {
    region: "Gilgit-Baltistan", division: "Gilgit", district: "Hunza",
    mode: "search", query: "", interest: "All", favs: {}, menuOpen: false, ai: null, wiki: {}, mapSel: "Gilgit-Baltistan"
  };

  img(tags, lock, w, h) {
    const tag = String(tags).split(",")[0];
    return "https://loremflickr.com/" + (w || 640) + "/" + (h || 420) + "/" + tag + "?lock=" + lock;
  }

  wikiTitles = {
    "Attabad Lake": "Attabad_Lake", "Fairy Meadows": "Fairy_Meadows", "Badshahi Mosque": "Badshahi_Mosque",
    "Derawar Fort": "Derawar_Fort", "Mohenjo-daro": "Mohenjo-daro", "Princess of Hope": "Princess_of_Hope",
    "Ratti Gali Lake": "Ratti_Gali_Lake", "Takht-i-Bahi": "Takht-i-Bahi", "Kalash Valleys": "Kalash_Valleys",
    "Astola Island": "Astola_Island", "Malam Jabba": "Malam_Jabba", "Katpana Cold Desert": "Katpana_Desert",
    "Makli Necropolis": "Makli_Necropolis", "Saif-ul-Malook": "Saiful_Muluk", "Faisal Mosque": "Faisal_Mosque",
    "Gorakh Hill": "Gorakh_Hill",
    "All places": "Hunza_Valley", "Hills and peaks": "Karakoram", "Lakes and falls": "Lake_Saiful_Muluk",
    "Deserts": "Thar_Desert", "Forts and palaces": "Lahore_Fort", "Mosques and shrines": "Wazir_Khan_Mosque",
    "Beaches": "Astola_Island", "Green valleys": "Kumrat_Valley", "Old ruins": "Mohenjo-daro",
    "Food and bazaars": "Empress_Market", "Parks and animals": "Deosai_National_Park", "Snow and ski": "Malam_Jabba",
    "The mountain highway": "Karakoram_Highway", "Desert and old palaces": "Noor_Mahal", "Drive by the sea": "Kund_Malir",
    "$hero": "Passu_Cones", "$near": "Cholistan_Desert", "$footer": "Nanga_Parbat"
  };

  photo(key, fallback) { return travelAssets[key] || fallback; }

  regions = [
    { name: "Gilgit-Baltistan", meta: "3 divisions · 10 districts · peaks and lakes", divisions: {
      Gilgit: ["Gilgit", "Hunza", "Nagar", "Ghizer", "Gupis-Yasin"],
      Baltistan: ["Skardu", "Shigar", "Kharmang", "Ghanche", "Roundu"],
      Diamer: ["Diamer (Chilas)", "Astore", "Darel", "Tangir"] } },
    { name: "Punjab", meta: "9 divisions · 41 districts · forts and shrines", divisions: {
      Lahore: ["Lahore", "Kasur", "Nankana Sahib", "Sheikhupura"],
      Rawalpindi: ["Rawalpindi", "Murree", "Attock", "Chakwal", "Jhelum", "Talagang"],
      Bahawalpur: ["Bahawalpur", "Bahawalnagar", "Rahim Yar Khan"],
      Multan: ["Multan", "Khanewal", "Lodhran", "Vehari"],
      Faisalabad: ["Faisalabad", "Chiniot", "Jhang", "Toba Tek Singh"],
      Gujranwala: ["Gujranwala", "Gujrat", "Sialkot", "Narowal", "Hafizabad", "Mandi Bahauddin"],
      Sargodha: ["Sargodha", "Khushab", "Mianwali", "Bhakkar"],
      Sahiwal: ["Sahiwal", "Okara", "Pakpattan"],
      "Dera Ghazi Khan": ["Dera Ghazi Khan", "Rajanpur", "Layyah", "Muzaffargarh"] } },
    { name: "Khyber Pakhtunkhwa", meta: "7 divisions · 38 districts · valleys and old ruins", divisions: {
      Malakand: ["Swat", "Chitral Lower", "Chitral Upper", "Dir Upper", "Dir Lower", "Buner", "Shangla", "Bajaur"],
      Hazara: ["Abbottabad", "Mansehra", "Haripur", "Battagram", "Torghar", "Kolai-Palas"],
      Peshawar: ["Peshawar", "Charsadda", "Nowshera", "Khyber", "Mohmand"],
      Mardan: ["Mardan", "Swabi"],
      Kohat: ["Kohat", "Hangu", "Karak", "Kurram", "Orakzai"],
      Bannu: ["Bannu", "Lakki Marwat", "North Waziristan"],
      "Dera Ismail Khan": ["Dera Ismail Khan", "Tank", "South Waziristan"] } },
    { name: "Sindh", meta: "6 divisions · 30 districts · sea and old cities", divisions: {
      Karachi: ["Karachi South", "Karachi East", "Karachi West", "Karachi Central", "Korangi", "Malir", "Keamari"],
      Hyderabad: ["Hyderabad", "Thatta", "Jamshoro", "Dadu", "Badin", "Sujawal", "Matiari"],
      Sukkur: ["Sukkur", "Khairpur", "Ghotki"],
      Larkana: ["Larkana", "Shikarpur", "Jacobabad", "Kashmore", "Qambar Shahdadkot"],
      "Mirpur Khas": ["Mirpur Khas", "Tharparkar", "Umerkot"],
      "Shaheed Benazirabad": ["Nawabshah", "Naushahro Feroze", "Sanghar"] } },
    { name: "Balochistan", meta: "8 divisions · 36 districts · desert and coast", divisions: {
      Quetta: ["Quetta", "Pishin", "Killa Abdullah", "Chaman"],
      Kalat: ["Kalat", "Khuzdar", "Mastung", "Lasbela", "Hub", "Awaran"],
      Makran: ["Gwadar", "Kech (Turbat)", "Panjgur"],
      Sibi: ["Sibi", "Ziarat", "Harnai", "Kohlu", "Dera Bugti"],
      Zhob: ["Zhob", "Sherani", "Killa Saifullah"],
      Rakhshan: ["Kharan", "Washuk", "Chagai", "Nushki"],
      Naseerabad: ["Naseerabad", "Jafarabad", "Jhal Magsi", "Sohbatpur"],
      Loralai: ["Loralai", "Barkhan", "Musakhel", "Duki"] } },
    { name: "Azad Jammu & Kashmir", meta: "3 divisions · 10 districts · green hills", divisions: {
      Muzaffarabad: ["Muzaffarabad", "Neelum", "Hattian Bala"],
      Poonch: ["Poonch (Rawalakot)", "Bagh", "Haveli", "Sudhnoti"],
      Mirpur: ["Mirpur", "Bhimber", "Kotli"] } },
    { name: "Islamabad Capital Territory", meta: "1 division · 1 district · hills and parks", divisions: {
      "Capital Territory": ["Islamabad"] } }
  ];

  places = {
    Hunza: "Attabad Lake|Lake;Baltit Fort|Fort;Passu Cones|Peak;Khunjerab Pass|Pass;Eagle's Nest, Duikar|Viewpoint;Altit Fort|Fort",
    Gilgit: "Kargah Buddha|Heritage;Naltar Valley|Valley;Rakaposhi Viewpoint|Viewpoint;Gilgit Bazaar|Bazaar",
    Nagar: "Hopper Glacier|Glacier;Rush Lake|Lake;Rakaposhi Base Camp|Trek",
    Ghizer: "Phander Lake|Lake;Khalti Lake|Lake;Shandur Pass|Pass",
    "Gupis-Yasin": "Yasin Valley|Valley;Handrap Lake|Lake",
    Skardu: "Upper Kachura Lake|Lake;Shangrila Resort|Lake;Katpana Cold Desert|Desert;Skardu Fort|Fort;Deosai Gateway|Park",
    Shigar: "Shigar Fort|Fort;Blind Lake|Lake;Cold Desert Shigar|Desert",
    Kharmang: "Manthokha Waterfall|Waterfall;Kharmang Valley|Valley",
    Ghanche: "Khaplu Palace|Palace;Hushe Valley|Valley;Machulu Viewpoint|Viewpoint",
    Roundu: "Indus Gorge|Valley;Mehdiabad|Village",
    "Diamer (Chilas)": "Fairy Meadows|Meadow;Nanga Parbat Base Camp|Trek;Chilas Rock Carvings|Heritage;Babusar Top|Pass",
    Astore: "Rama Lake|Lake;Deosai National Park|Park;Rupal Face|Trek",
    Darel: "Darel Valley Forests|Forest", Tangir: "Tangir Valley|Valley",
    Lahore: "Badshahi Mosque|Mosque;Lahore Fort|Fort;Shalimar Gardens|Garden;Wazir Khan Mosque|Mosque;Wagah Border|Ceremony;Food Street|Food",
    Kasur: "Shrine of Bulleh Shah|Shrine;Ganda Singh Border|Border",
    "Nankana Sahib": "Gurdwara Janam Asthan|Religious;Sikh Heritage Trail|Heritage",
    Sheikhupura: "Hiran Minar|Heritage;Sheikhupura Fort|Fort",
    Rawalpindi: "Rawal Lake|Lake;Raja Bazaar|Bazaar;Ayub National Park|Park",
    Murree: "Mall Road|Bazaar;Patriata Chairlift|Viewpoint;Kashmir Point|Viewpoint;Pindi Point|Viewpoint",
    Attock: "Attock Fort|Fort;Khairabad Kund|River", Talagang: "Salt Range Trails|Trek",
    Chakwal: "Katas Raj Temples|Heritage;Kallar Kahar Lake|Lake;Khewra Salt Mine|Heritage",
    Jhelum: "Rohtas Fort|Fort;Tilla Jogian|Trek;Mangla Viewpoint|Lake",
    Bahawalpur: "Noor Mahal|Palace;Derawar Fort|Fort;Cholistan Desert|Desert;Lal Suhanra Park|Park;Darbar Mahal|Palace",
    Bahawalnagar: "Canal Drive|Scenic", "Rahim Yar Khan": "Pattan Minara|Heritage;Sheikh Zayed Palace|Palace",
    Multan: "Shrine of Shah Rukn-e-Alam|Shrine;Bahauddin Zakariya Shrine|Shrine;Multan Fort|Heritage;Hussain Agahi Bazaar|Bazaar",
    Khanewal: "Kabirwala Heritage|Heritage", Lodhran: "River Wetlands|Nature", Vehari: "Vehari Gardens|Garden",
    Faisalabad: "Clock Tower and Eight Bazaars|Bazaar;Jinnah Garden|Garden;Chenab Club|Heritage",
    Chiniot: "Omar Hayat Mahal|Palace;Woodwork Bazaar|Bazaar",
    Jhang: "Heer Ranjha Shrine|Shrine", "Toba Tek Singh": "Village Trail|Scenic",
    Gujranwala: "Sheranwala Bagh|Garden;Wrestling Akharas|Culture",
    Gujrat: "Chillianwala Memorial|Heritage;Pottery Bazaar|Bazaar",
    Sialkot: "Iqbal Manzil|Museum;Marala Head Works|Nature;Sialkot Fort|Fort",
    Narowal: "Kartarpur Corridor|Religious;Shahdara Gurdwara|Religious",
    Hafizabad: "Wetland Reserve|Nature", "Mandi Bahauddin": "Rasul Barrage|Nature",
    Sargodha: "Kirana Hills|Trek;Citrus Farms|Culture",
    Khushab: "Soon Valley|Valley;Uchhali Lake|Lake;Khabeki Lake|Lake;Kanhatti Garden|Garden",
    Mianwali: "Namal Lake|Lake;Chashma Barrage|Nature;Kalabagh|Scenic",
    Bhakkar: "Thal Desert|Desert", Sahiwal: "Harappa Ruins|Ruins;Harappa Museum|Museum",
    Okara: "Depalpur Fort|Fort", Pakpattan: "Baba Farid Shrine|Shrine",
    "Dera Ghazi Khan": "Fort Munro|Hill Station;Sakhi Sarwar Shrine|Shrine",
    Rajanpur: "Koh-e-Suleman Trails|Trek", Layyah: "Thal Forest|Forest", Muzaffargarh: "Head Muhammad Wala|Nature",
    Swat: "Malam Jabba Ski Resort|Ski;Mahodand Lake|Lake;Ushu Forest|Forest;Butkara Stupa|Ruins;White Palace|Palace;Kalam Valley|Valley",
    "Chitral Lower": "Kalash Valleys|Culture;Chitral Fort|Fort;Garam Chashma|Hot Spring;Chitral Gol Park|Park",
    "Chitral Upper": "Booni Valley|Valley;Tirich Mir Viewpoint|Peak;Shandur Polo Ground|Pass",
    "Dir Upper": "Kumrat Valley|Valley;Jahaz Banda Meadow|Meadow;Katora Lake|Lake",
    "Dir Lower": "Timergara Bazaar|Bazaar", Buner: "Pir Baba Shrine|Shrine;Elum Ghar|Trek",
    Shangla: "Yakh Tangi|Scenic", Bajaur: "Jandool Valley|Valley",
    Abbottabad: "Thandiani|Hill Station;Ilyasi Mosque|Mosque;Shimla Hill|Viewpoint;Harnoi|Nature",
    Mansehra: "Saif-ul-Malook Lake|Lake;Naran and Kaghan|Valley;Lulusar Lake|Lake;Shogran and Siri Paye|Meadow;Ansoo Lake|Lake",
    Haripur: "Khanpur Dam|Lake;Tarbela Lake|Lake", Battagram: "Allai Valley|Valley",
    Torghar: "Black Mountain|Trek", "Kolai-Palas": "Palas Valley Forest|Forest",
    Peshawar: "Qissa Khwani Bazaar|Bazaar;Bala Hisar Fort|Fort;Sethi House|Heritage;Peshawar Museum|Museum;Mahabat Khan Mosque|Mosque",
    Charsadda: "Shahbaz Garhi Rock Edicts|Ruins;Bala Hisar Mound|Ruins",
    Nowshera: "Cantt Heritage Walk|Heritage", Khyber: "Khyber Pass|Pass;Ali Masjid|Heritage",
    Mohmand: "Mohmand Dam Viewpoint|Nature",
    Mardan: "Takht-i-Bahi Monastery|Ruins;Jamal Garhi|Ruins;Shahbaz Garhi|Heritage",
    Swabi: "Hund Museum|Museum;Riverside Heritage|Heritage",
    Kohat: "Tanda Dam|Lake;Kohat Tunnel|Scenic", Hangu: "Hangu Hills|Trek",
    Karak: "Salt Mines|Heritage", Kurram: "Parachinar Valley|Valley", Orakzai: "Tirah Valley|Valley",
    Bannu: "Bannu Bazaar|Bazaar", "Lakki Marwat": "Pezu Pass|Pass", "North Waziristan": "Shawal Forest|Forest",
    "Dera Ismail Khan": "Indus Riverfront|Nature;Kafir Kot Fort|Fort", Tank: "Tank Bazaar|Bazaar",
    "South Waziristan": "Ladha Highlands|Trek",
    "Karachi South": "Clifton Beach|Beach;Mohatta Palace|Palace;Frere Hall|Heritage;Quaid's Mausoleum|Heritage;Empress Market|Bazaar",
    "Karachi East": "PAF Museum|Museum;Safari Park|Park",
    "Karachi West": "Manora Island|Beach;Churna Island|Diving",
    "Karachi Central": "Aladdin Park|Park", Korangi: "Korangi Creek|Nature",
    Malir: "Kathore Trails|Trek", Keamari: "Hawke's Bay|Beach;Sandspit Turtle Beach|Beach;Port Grand|Food",
    Hyderabad: "Pacco Qillo|Fort;Rani Bagh|Garden;Tombs of Talpur Mirs|Heritage;Bangle Bazaar|Bazaar",
    Thatta: "Makli Necropolis|Ruins;Shah Jahan Mosque|Mosque;Keenjhar Lake|Lake",
    Jamshoro: "Ranikot Fort|Fort;Amri Mounds|Ruins",
    Dadu: "Gorakh Hill Station|Hill Station;Manchhar Lake|Lake",
    Badin: "Zero Point Coast|Beach", Sujawal: "Indus Delta|Nature", Matiari: "Hala Handicrafts|Culture",
    Sukkur: "Sukkur Barrage|Heritage;Sadhu Bela Temple|Religious;Lansdowne Bridge|Heritage",
    Khairpur: "Faiz Mahal|Palace;Kot Diji Fort|Fort;Date Palm Groves|Culture",
    Ghotki: "Ghotki Shrines|Shrine",
    Larkana: "Mohenjo-daro|Ruins;Mohenjo-daro Museum|Museum;Shahi Bagh|Garden",
    Shikarpur: "Covered Bazaar|Bazaar", Jacobabad: "Victoria Tower|Heritage",
    Kashmore: "Guddu Barrage|Nature", "Qambar Shahdadkot": "Hamal Lake|Lake",
    "Mirpur Khas": "Kahu-Jo-Daro Stupa|Ruins;Mango Orchards|Culture",
    Tharparkar: "Nagarparkar Jain Temples|Heritage;Karoonjhar Hills|Trek;Thar Desert|Desert",
    Umerkot: "Umerkot Fort|Fort;Akbar Memorial|Heritage",
    Nawabshah: "Heritage Road|Heritage", "Naushahro Feroze": "Kot Lalu|Heritage", Sanghar: "Chotiari Wetland|Nature",
    Quetta: "Hanna Lake|Lake;Urak Valley|Valley;Hazarganji Chiltan Park|Park;Quetta Bazaars|Bazaar",
    Pishin: "Pishin Orchards|Culture", "Killa Abdullah": "Khojak Pass|Pass", Chaman: "Border Bazaar|Bazaar",
    Kalat: "Mir Fort Kalat|Fort", Khuzdar: "Moola Chotok Waterfall|Waterfall",
    Mastung: "Mastung Valley|Valley",
    Lasbela: "Kund Malir Beach|Beach;Hingol National Park|Park;Princess of Hope|Rock;Hinglaj Mata Temple|Religious;Mud Volcanoes|Nature",
    Hub: "Gadani Beach|Beach", Awaran: "Awaran Highlands|Trek",
    Gwadar: "Hammerhead Cliff|Coast;Astola Island|Island;East Bay Beach|Beach;Ormara Beach|Beach",
    "Kech (Turbat)": "Miri Kalat Fort|Fort", Panjgur: "Date Oases|Culture",
    Sibi: "Sibi Mela Ground|Culture", Ziarat: "Quaid-e-Azam Residency|Heritage;Juniper Forest|Forest;Prospect Point|Viewpoint",
    Harnai: "Chappar Rift|Scenic", Kohlu: "Kohlu Highlands|Trek", "Dera Bugti": "Bugti Hills|Trek",
    Zhob: "Zhob Valley|Valley", Sherani: "Takht-e-Sulaiman|Trek", "Killa Saifullah": "Kan Mehtarzai|Scenic",
    Kharan: "Kharan Desert|Desert", Washuk: "Raskoh Range|Trek", Chagai: "Chagai Hills|Trek", Nushki: "Nushki Sands|Desert",
    Naseerabad: "Canal Belt|Nature", Jafarabad: "Jhatpat Bazaar|Bazaar", "Jhal Magsi": "Pir Chattal Shrine|Shrine", Sohbatpur: "Wetlands|Nature",
    Loralai: "Loralai Orchards|Culture", Barkhan: "Barkhan Hills|Trek", Musakhel: "Musakhel Forest|Forest", Duki: "Duki Coalfields|Heritage",
    Muzaffarabad: "Pir Chinasi|Viewpoint;Red Fort|Fort;Jhelum Riverfront|Nature",
    Neelum: "Ratti Gali Lake|Lake;Arang Kel|Meadow;Sharda Ruins|Ruins;Kel Valley|Valley;Kutton Waterfall|Waterfall",
    "Hattian Bala": "Zalzal Lake|Lake;Leepa Valley|Valley",
    "Poonch (Rawalakot)": "Banjosa Lake|Lake;Toli Pir|Trek;Tatta Pani|Hot Spring",
    Bagh: "Ganga Choti|Trek;Sudhan Gali|Scenic", Haveli: "Forward Kahuta|Scenic", Sudhnoti: "Palandri Hills|Trek",
    Mirpur: "Mangla Lake|Lake;Ramkot Fort|Fort", Bhimber: "Baghsar Fort|Fort;Baghsar Lake|Lake", Kotli: "Kotli Riverfront|Nature",
    Islamabad: "Faisal Mosque|Mosque;Daman-e-Koh|Viewpoint;Pakistan Monument|Heritage;Trail 5 Margalla|Trek;Saidpur Village|Heritage;Rawal Lake View Park|Park;Lok Virsa Museum|Museum"
  };

  interestDefs = [
    { label: "All places", glyph: "◈", count: "900+", key: "All", tags: "landscape,pakistan" },
    { label: "Hills and peaks", glyph: "▲", count: "180", key: "Peak", tags: "mountain,snow,peak" },
    { label: "Lakes and falls", glyph: "≈", count: "140", key: "Lake", tags: "lake,waterfall" },
    { label: "Deserts", glyph: "◠", count: "26", key: "Desert", tags: "desert,dunes" },
    { label: "Forts and palaces", glyph: "⌂", count: "95", key: "Fort", tags: "fort,palace,castle" },
    { label: "Mosques and shrines", glyph: "☾", count: "120", key: "Religious", tags: "mosque,shrine" },
    { label: "Beaches", glyph: "~", count: "40", key: "Beach", tags: "beach,sea" },
    { label: "Green valleys", glyph: "⌄", count: "110", key: "Valley", tags: "valley,green,meadow" },
    { label: "Old ruins", glyph: "𐊗", count: "70", key: "Ruins", tags: "ruins,archaeology" },
    { label: "Food and bazaars", glyph: "✦", count: "85", key: "Food", tags: "bazaar,streetfood" },
    { label: "Parks and animals", glyph: "❦", count: "55", key: "Park", tags: "park,wildlife" },
    { label: "Snow and ski", glyph: "❄", count: "18", key: "Ski", tags: "ski,snow" }
  ];

  popularDefs = [
    { name: "Attabad Lake", where: "Hunza · Gilgit-Baltistan", tag: "Lake", season: "April to October", k: ["Lake", "Peak", "Valley"], tags: "lake,mountain" },
    { name: "Fairy Meadows", where: "Diamer · Gilgit-Baltistan", tag: "Meadow", season: "June to September", k: ["Peak", "Valley"], tags: "meadow,mountain,camp" },
    { name: "Badshahi Mosque", where: "Lahore · Punjab", tag: "Mosque", season: "October to March", k: ["Religious", "Food"], tags: "mosque,mughal" },
    { name: "Derawar Fort", where: "Bahawalpur · Punjab", tag: "Fort", season: "November to February", k: ["Fort", "Desert"], tags: "fort,desert" },
    { name: "Mohenjo-daro", where: "Larkana · Sindh", tag: "Ruins", season: "November to February", k: ["Ruins"], tags: "ruins,archaeology" },
    { name: "Princess of Hope", where: "Lasbela · Balochistan", tag: "Coast", season: "October to March", k: ["Beach", "Desert", "Park"], tags: "canyon,rock,desert" },
    { name: "Ratti Gali Lake", where: "Neelum · Kashmir", tag: "Lake", season: "July to September", k: ["Lake", "Valley"], tags: "lake,alpine" },
    { name: "Takht-i-Bahi", where: "Mardan · Khyber Pakhtunkhwa", tag: "Ruins", season: "October to March", k: ["Ruins"], tags: "monastery,ruins" },
    { name: "Kalash Valleys", where: "Chitral · Khyber Pakhtunkhwa", tag: "Culture", season: "May to September", k: ["Valley", "Food"], tags: "village,valley,culture" },
    { name: "Astola Island", where: "Gwadar · Balochistan", tag: "Island", season: "October to March", k: ["Beach"], tags: "island,sea" },
    { name: "Malam Jabba", where: "Swat · Khyber Pakhtunkhwa", tag: "Ski", season: "December to February", k: ["Ski", "Peak"], tags: "ski,snow,forest" },
    { name: "Katpana Cold Desert", where: "Skardu · Gilgit-Baltistan", tag: "Desert", season: "May to October", k: ["Desert", "Peak"], tags: "desert,dunes,mountain" },
    { name: "Makli Necropolis", where: "Thatta · Sindh", tag: "Ruins", season: "November to February", k: ["Ruins", "Religious"], tags: "tomb,ruins" },
    { name: "Saif-ul-Malook", where: "Mansehra · Khyber Pakhtunkhwa", tag: "Lake", season: "June to September", k: ["Lake", "Valley"], tags: "lake,mountain" },
    { name: "Faisal Mosque", where: "Islamabad · Capital", tag: "Mosque", season: "All year", k: ["Religious", "Park"], tags: "mosque,modern" },
    { name: "Gorakh Hill", where: "Dadu · Sindh", tag: "Hill", season: "November to March", k: ["Peak", "Valley"], tags: "hill,sunset" }
  ];

  slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  region(name) { return this.regions.find(r => r.name === name) || this.regions[0]; }
  parse(d) {
    const raw = this.places[d];
    if (!raw) return [];
    return raw.split(";").map(x => { const p = x.split("|"); return { name: p[0], type: p[1] || "Place" }; });
  }

  index() {
    if (this._idx) return this._idx;
    const out = [];
    this.regions.forEach(r => {
      out.push({ kind: "Region", name: r.name, where: r.meta.split(" · ")[0], region: r.name, division: Object.keys(r.divisions)[0], district: (r.divisions[Object.keys(r.divisions)[0]] || [])[0] });
      Object.keys(r.divisions).forEach(dv => {
        out.push({ kind: "Division", name: dv + " Division", where: r.name, region: r.name, division: dv, district: r.divisions[dv][0] });
        r.divisions[dv].forEach(ds => {
          out.push({ kind: "District", name: ds, where: dv + " · " + r.name, region: r.name, division: dv, district: ds });
          this.parse(ds).forEach(a => out.push({ kind: a.type, name: a.name, where: ds + " · " + r.name, region: r.name, division: dv, district: ds }));
        });
      });
    });
    this._idx = out;
    return out;
  }

  runAi(q) {
    const t = (q || "").toLowerCase();
    const map = [["desert", "Desert"], ["lake", "Lake"], ["mountain", "Peak"], ["peak", "Peak"], ["snow", "Ski"], ["ski", "Ski"], ["beach", "Beach"], ["coast", "Beach"], ["sea", "Beach"], ["fort", "Fort"], ["history", "Ruins"], ["old", "Ruins"], ["ruin", "Ruins"], ["food", "Food"], ["valley", "Valley"], ["green", "Valley"], ["hike", "Trek"], ["walk", "Trek"], ["trek", "Trek"], ["shrine", "Shrine"], ["mosque", "Mosque"]];
    const hits = map.filter(m => t.includes(m[0])).map(m => m[1]);
    const idx = this.index().filter(i => !["Region", "Division", "District"].includes(i.kind));
    let picks = hits.length ? idx.filter(i => hits.includes(i.kind)) : idx.filter(i => i.name.toLowerCase().includes(t.split(" ")[0] || "@@"));
    if (!picks.length) picks = idx.slice(0, 40);
    picks = picks.sort(() => 0.5 - Math.random()).slice(0, 4);
    return { text: "Here are four good places for you. The north is best from spring to early autumn. The south is best from late autumn to winter. Tap a card to see how to get there and where to stay.", picks: picks };
  }


  menuData(tab) {
    if (tab === "Places to Go") return [
      { icon: "#ic-mountain", title: "Gilgit-Baltistan", links: ["Hunza Valley", "Skardu", "Fairy Meadows", "Deosai Plains"] },
      { icon: "#ic-fort", title: "Punjab", links: ["Lahore", "Bahawalpur", "Multan", "Murree"] },
      { icon: "#ic-mosque", title: "Sindh", links: ["Karachi", "Mohenjo-daro", "Thatta", "Kund Malir"] },
      { icon: "#ic-hiker", title: "Khyber Pakhtunkhwa", links: ["Swat Valley", "Chitral", "Kumrat Valley", "Peshawar"] },
      { icon: "#ic-compass", title: "Balochistan", links: ["Quetta", "Gwadar", "Hingol National Park", "Astola Island"] },
      { icon: "#ic-pin", title: "Islamabad & AJK", links: ["Islamabad", "Neelum Valley", "Ratti Gali Lake", "Muzaffarabad"] }
    ];
    if (tab === "Travel Guide") return [
      { icon: "#ic-compass", title: "Plan Your Trip", links: ["Trip ideas", "Itineraries", "Road trips"] },
      { icon: "#ic-bus", title: "Getting There", links: ["Flights", "Buses and trains", "Jeep rates", "Driving times"] },
      { icon: "#ic-bed", title: "Where to Stay", links: ["Hotels", "Guest houses", "Camping pods"] },
      { icon: "#ic-shield", title: "Permits & Safety", links: ["Permits and papers", "Stay safe", "Road status"] },
      { icon: "#ic-calendar", title: "Best Time to Visit", links: ["Season guide", "Festival dates", "Snow and ski"] },
      { icon: "#ic-bulb", title: "Local Tips", links: ["Money and SIMs", "Culture and manners", "What to pack"] }
    ];
    return [
      { icon: "#ic-fort", title: "History & Heritage", links: ["Forts & Palaces", "Ancient Sites", "Museums", "Historic Buildings"] },
      { icon: "#ic-mountain", title: "Nature & Scenic Places", links: ["Lakes & Waterfalls", "Valleys & Viewpoints", "Beaches & Coast", "Deserts"] },
      { icon: "#ic-hiker", title: "Outdoor Activities", links: ["Hiking Trails", "Trekking Routes", "Camping Sites"] },
      { icon: "#ic-mosque", title: "Religious Sites", links: ["Mosques", "Shrines & Darbars", "Temples", "Gurdwaras", "Churches"] },
      { icon: "#ic-family", title: "Parks & Family Places", links: ["Parks & Gardens", "Picnic Spots", "Zoos & Wildlife Parks", "Amusement Parks"] },
      { icon: "#ic-food", title: "Food & Local Culture", links: ["Food Streets", "Traditional Bazaars", "Craft Markets"] }
    ];
  }

  mapData = {"paths": {"Gilgit-Baltistan": "M454.0 32.0 L534.0 25.4 L623.6 93.6 L598.0 128.8 L550.0 133.2 L521.2 120.0 L498.8 115.6 L479.6 120.0 L463.6 102.4 L450.8 80.4 L457.2 54.0Z", "Khyber Pakhtunkhwa": "M425.2 32.0 L454.0 32.0 L457.2 54.0 L450.8 80.4 L463.6 102.4 L479.6 120.0 L470.0 137.6 L450.8 164.0 L434.8 177.2 L431.6 212.4 L406.0 252.0 L383.6 278.4 L370.8 252.0 L380.4 221.2 L351.6 203.6 L374.0 164.0 L409.2 155.2 L409.2 128.8 L425.2 93.6 L418.8 71.6Z", "Azad Jammu & Kashmir": "M470.0 137.6 L479.6 120.0 L498.8 115.6 L521.2 120.0 L511.6 150.8 L505.2 181.6 L495.6 194.8 L486.0 181.6 L473.2 168.4Z", "Punjab": "M431.6 212.4 L434.8 177.2 L450.8 164.0 L470.0 137.6 L473.2 168.4 L486.0 181.6 L495.6 194.8 L505.2 203.6 L518.0 216.8 L530.8 243.2 L521.2 265.2 L514.8 287.2 L498.8 296.0 L502.0 313.6 L470.0 340.0 L438.0 366.4 L409.2 406.0 L390.0 428.0 L374.0 423.6 L354.8 406.0 L361.2 370.8 L370.8 318.0 L383.6 278.4 L406.0 252.0Z", "Sindh": "M374.0 423.6 L390.0 428.0 L402.8 436.8 L380.4 472.0 L377.2 511.6 L380.4 533.6 L374.0 560.0 L358.0 595.2 L322.8 612.8 L290.8 599.6 L284.4 564.4 L268.4 538.0 L268.4 511.6 L284.4 489.6 L294.0 450.0 L310.0 428.0 L335.6 414.8 L354.8 406.0Z", "Balochistan": "M82.8 340.0 L114.8 357.6 L150.0 357.6 L185.2 362.0 L217.2 353.2 L255.6 340.0 L258.8 296.0 L303.6 269.6 L342.0 260.8 L370.8 252.0 L383.6 278.4 L370.8 318.0 L361.2 370.8 L354.8 406.0 L335.6 414.8 L310.0 428.0 L294.0 450.0 L284.4 489.6 L268.4 511.6 L268.4 538.0 L252.4 538.0 L207.6 542.4 L166.0 542.4 L127.6 546.8 L105.2 546.8 L105.2 502.8 L127.6 489.6 L156.4 458.8 L143.6 414.8 L111.6 392.8 L86.0 366.4Z"}, "pins": {"Hunza": {"x": 521.2, "y": 58.4, "r": "Gilgit-Baltistan"}, "Skardu": {"x": 553.2, "y": 102.4, "r": "Gilgit-Baltistan"}, "Swat": {"x": 450.8, "y": 106.8, "r": "Khyber Pakhtunkhwa"}, "Peshawar": {"x": 422.0, "y": 159.6, "r": "Khyber Pakhtunkhwa"}, "Muzaffarabad": {"x": 486.0, "y": 142.0, "r": "Azad Jammu & Kashmir"}, "Islamabad": {"x": 473.2, "y": 172.8, "r": "Punjab"}, "Lahore": {"x": 511.6, "y": 267.4, "r": "Punjab"}, "Bahawalpur": {"x": 428.4, "y": 362.0, "r": "Punjab"}, "Quetta": {"x": 278.0, "y": 326.8, "r": "Balochistan"}, "Gwadar": {"x": 127.6, "y": 551.2, "r": "Balochistan"}, "Karachi": {"x": 278.0, "y": 560.0, "r": "Sindh"}, "Mohenjo-daro": {"x": 313.2, "y": 454.4, "r": "Sindh"}}};
  mapRegionInfo = {
    "Gilgit-Baltistan": { fill: "var(--tp-color-46)", lab: [655, 40], anc: [568, 85], desc: "Majestic mountains, crystal clear lakes and unforgettable adventures.", tags: "mountains,lake", lock: 61, picks: "Hunza, Skardu, Fairy Meadows" },
    "Khyber Pakhtunkhwa": { fill: "var(--tp-color-47)", lab: [14, 70], anc: [452, 120], desc: "Green valleys, ancient Gandhara ruins and warm mountain hospitality.", tags: "valley,river", lock: 62, picks: "Swat, Kumrat, Chitral" },
    "Azad Jammu & Kashmir": { fill: "var(--tp-color-48)", lab: [655, 150], anc: [508, 142], desc: "Emerald river valleys, alpine lakes and lush forests.", tags: "kashmir,lake", lock: 63, picks: "Neelum Valley, Ratti Gali, Rawalakot" },
    "Punjab": { fill: "var(--tp-color-49)", lab: [655, 290], anc: [518, 285], desc: "Mughal forts, grand mosques, shrines and the best food in the country.", tags: "mosque,lahore", lock: 64, picks: "Lahore, Bahawalpur, Multan" },
    "Sindh": { fill: "var(--tp-color-50)", lab: [655, 470], anc: [350, 480], desc: "Ancient Indus ruins, shrines, the sea and a lively port city.", tags: "ruins,desert", lock: 65, picks: "Karachi, Mohenjo-daro, Thatta" },
    "Balochistan": { fill: "var(--tp-color-51)", lab: [14, 330], anc: [215, 380], desc: "Wild coastline, dramatic rock formations and wide open desert.", tags: "coast,desert", lock: 66, picks: "Gwadar, Hingol, Quetta" }
  };
  mapRegionList(sel) {
    return Object.keys(this.mapRegionInfo).map(n => {
      const i = this.mapRegionInfo[n], on = n === sel, left = i.lab[0] < 100;
      const lx = i.lab[0], ly = i.lab[1];
      const ex = left ? lx + 7 + n.length * 8.4 : lx - 6;
      return {
        name: n, d: this.mapData.paths[n], fill: on ? "var(--tp-color-4)" : i.fill, tf: on ? "var(--tp-color-4)" : "var(--tp-color-3)",
        lx: lx, ly: ly, lpx: (lx / 940 * 100) + "%", tpx: (ly / 640 * 100) + "%", ax: i.anc[0], ay: i.anc[1],
        line: [i.anc[0], i.anc[1], ex, ly - 5].join(","),
        onClick: () => this.setState({ mapSel: n })
      };
    });
  }
  mapPinList(sel) {
    return Object.keys(this.mapData.pins).map(n => {
      const p = this.mapData.pins[n], on = p.r === sel;
      return { name: on ? n : "", x: p.x, y: p.y, lpx: (p.x / 940 * 100) + "%", tpx: ((p.y + 7) / 640 * 100) + "%", ring: on ? 7 : 5.5, dot: on ? "var(--tp-color-4)" : "var(--tp-color-19)", onClick: () => this.setState({ mapSel: p.r }) };
    });
  }
  featured(sel) {
    const base = this.mapRegionInfo[sel];
    const wpInfo = (this.dynamic.regionInfo || {})[sel];
    const i = wpInfo ? { ...base, desc: wpInfo.desc || base.desc, picks: wpInfo.picks || base.picks } : base;
    const r = this.region(sel === "Azad Jammu & Kashmir" ? "Gilgit-Baltistan" : sel), reg = this.regions.find(x => x.name === sel);
    const dn = reg ? Object.keys(reg.divisions) : [];
    const nd = reg ? dn.reduce((a, d) => a + reg.divisions[d].length, 0) : 0;
    return {
      name: sel, desc: i.desc, picks: i.picks, slot: "map-" + this.slug(sel),
      meta: reg ? dn.length + " divisions · " + nd + " districts" : "Region guide coming soon",
      img: wpInfo?.img || this.photo(sel, this.img(i.tags, i.lock, 1000, 900)),
      onExplore: () => { if (reg) this.setState({ region: sel, division: dn[0], district: (reg.divisions[dn[0]] || [])[0] }); const el = document.getElementById("explorer"); if (el) el.scrollIntoView({ behavior: "smooth" }); }
    };
  }

  renderVals() {
    const s = this.state;
    const reg = this.region(s.region);
    const divNames = Object.keys(reg.divisions);
    const division = divNames.includes(s.division) ? s.division : divNames[0];
    const dists = reg.divisions[division];
    const district = dists.includes(s.district) ? s.district : dists[0];
    const atts = this.parse(district);
    const ai = s.mode === "ai";
    const go = (patch) => () => this.setState(patch);

    const sel = (on) => on
      ? { bg: "var(--tp-color-4)", fg: "var(--tp-color-1)", bd: "var(--tp-color-4)" }
      : { bg: "var(--tp-color-1)", fg: "var(--tp-color-3)", bd: "var(--tp-color-7)" };

    const q = s.query.trim().toLowerCase();
    const results = (!ai && q.length > 1)
      ? this.index().filter(i => i.name.toLowerCase().includes(q)).slice(0, 8).map(i => ({
          kind: i.kind, name: i.name, where: i.where,
          onClick: go({ region: i.region, division: i.division, district: i.district, query: "" })
        }))
      : [];

    const interest = s.interest;
    const wpPopular = Array.isArray(this.dynamic.popular) ? this.dynamic.popular : [];
    const popularDefs = wpPopular.length
      ? wpPopular.map(p => ({
          name: p.name, where: p.where, tag: p.tag, season: p.season || "",
          k: this.interestDefs.map(d => d.key).includes(p.typeName) ? [p.typeName] : [],
          tags: "pakistan,travel", imgOverride: p.img || null, link: p.link || null
        }))
      : this.popularDefs;
    const popular = popularDefs
      .filter(p => interest === "All" || p.k.includes(interest))
      .slice(0, 8)
      .map((p, i) => ({
        name: p.name, where: p.where, tag: p.tag, season: p.season,
        slot: "att-" + this.slug(p.name),
        img: p.imgOverride || this.photo(p.name, this.img(p.tags, 100 + i, 640, 420)),
        favColor: s.favs[p.name] ? "var(--tp-color-13)" : "var(--tp-color-52)",
        onFav: () => this.setState(st => ({ favs: Object.assign({}, st.favs, { [p.name]: !st.favs[p.name] }) }))
      }));

    const interestLabel = (this.interestDefs.find(i => i.key === interest) || {}).label || "All places";

    const wpBanner = this.dynamic.banner || null;
    const wpSeasons = Array.isArray(this.dynamic.timeToGo) && this.dynamic.timeToGo.length ? this.dynamic.timeToGo : null;
    return {
      banner: wpBanner,
      homeHeadings: {
        likeHeading: wpBanner?.likeHeading || "",
        likeDescription: wpBanner?.likeDescription || "",
        mapBadge: wpBanner?.mapBadge || "",
        mapHeading: wpBanner?.mapHeading || "",
        mapDescription: wpBanner?.mapDescription || "",
        attractionsBadge: wpBanner?.attractionsBadge || "",
        popularHeading: wpBanner?.attractionsTitle || "",
        timeToGoHeading: wpBanner?.timeToGoHeading || "",
        timeToGoDescription: wpBanner?.timeToGoDescription || ""
      },
      menuOpen: s.menuOpen,
      favCount: Object.values(s.favs).filter(Boolean).length + " saved",
      favN: Object.values(s.favs).filter(Boolean).length,
      navItems: ["Places to Go", "Things to Do", "Travel Guide"].map(l => ({
        label: l, fg: s.menuOpen === l ? "var(--tp-color-4)" : "var(--tp-color-3)",
        bg: s.menuOpen === l ? "var(--tp-color-5)" : "transparent", ul: s.menuOpen === l ? "var(--tp-color-13)" : "transparent",
        onClick: () => this.setState(st => ({ menuOpen: st.menuOpen === l ? false : l }))
      })),
      menuColumns: this.menuData(s.menuOpen).map((c, i) => Object.assign({}, c, { br: (i % 3 === 2) ? "0" : "1px solid var(--tp-color-2)", bb: i < 3 ? "1px solid var(--tp-color-2)" : "0" })),
      menuCta: s.menuOpen === "Things to Do" ? "Find things to do →" : s.menuOpen === "Places to Go" ? "Find places to go →" : "Plan my trip →",
      menuAll: s.menuOpen === "Things to Do" ? "View all things to do →" : s.menuOpen === "Places to Go" ? "View all places →" : "View all travel guides →",
      heroChips: [{ label: "Bahawalpur", pin: true }, { label: "Gilgit" }, { label: "Skardu" }].map(c => Object.assign(c, { onClick: () => this.setState({ query: c.label, ai: null }) })),
      mapRegions: this.mapRegionList(s.mapSel),
      mapPins: this.mapPinList(s.mapSel),
      feat: this.featured(s.mapSel),
      stats: [{ n: "7", l: "Regions" }, { n: "37", l: "Divisions" }, { n: "170+", l: "Districts" }, { n: "900+", l: "Places" }],
      modes: [
        Object.assign({ label: "Search a place", onClick: go({ mode: "search", ai: null }) }, s.mode === "search" ? { bg: "var(--tp-color-4)", fg: "var(--tp-color-1)" } : { bg: "var(--tp-color-18)", fg: "var(--tp-color-9)" }),
        Object.assign({ label: "✦ Ask AI", onClick: go({ mode: "ai", query: "" }) }, ai ? { bg: "var(--tp-color-4)", fg: "var(--tp-color-24)" } : { bg: "var(--tp-color-18)", fg: "var(--tp-color-9)" })
      ],
      placeholder: ai ? "Tell us what you want. Like: four days near Islamabad, lakes, easy walks" : "Type a region, district or place name",
      submitLabel: ai ? "Ask" : "Search",
      query: s.query,
      onQuery: (e) => this.setState({ query: e.target.value, ai: null }),
      onSubmit: () => { if (ai && s.query.trim()) this.setState({ ai: this.runAi(s.query) }); else if (results.length) results[0].onClick(); },
      showResults: results.length > 0,
      results,
      aiAnswer: s.ai,
      suggestChips: (ai
        ? ["Cool weather, no long walks", "Desert forts in three days", "Family trip with lakes", "Sea trip from Karachi"]
        : ["Hunza", "Skardu", "Swat", "Cholistan", "Neelum Valley", "Gwadar"]
      ).map(c => ({ label: c, onClick: () => this.setState({ query: c, ai: null }) })),

      interests: this.interestDefs.map((i, n) => Object.assign({
        label: i.label, glyph: i.glyph, count: i.count,
        slot: "int-" + this.slug(i.label),
        img: this.photo(i.label, this.img(i.tags, 300 + n, 400, 260)),
        onClick: go({ interest: i.key })
      }, s.interest === i.key
        ? { bd: "var(--tp-color-4)", fg: "var(--tp-color-1)", scrim: "linear-gradient(to top,var(--tp-color-53),var(--tp-color-54))" }
        : { bd: "var(--tp-color-7)", fg: "var(--tp-color-1)", scrim: "linear-gradient(to top,var(--tp-color-55),var(--tp-color-17))" })),

      regionTabs: this.regions.map(r => Object.assign({ name: r.name, meta: r.meta, onClick: go({ region: r.name, division: Object.keys(r.divisions)[0], district: (r.divisions[Object.keys(r.divisions)[0]] || [])[0] }) }, sel(r.name === s.region))),
      divisionItems: divNames.map(d => Object.assign({ name: d, n: reg.divisions[d].length, onClick: go({ division: d, district: reg.divisions[d][0] }) }, d === division ? { bg: "var(--tp-color-3)", fg: "var(--tp-color-1)", w: "700" } : { bg: "transparent", fg: "var(--tp-color-11)", w: "500" })),
      districtItems: dists.map(d => Object.assign({ name: d, tag: (this.parse(d).length || 0) + " places", onClick: go({ district: d }) }, d === district ? { bg: "var(--tp-color-13)", fg: "var(--tp-color-1)", w: "700", tagFg: "var(--tp-color-56)" } : { bg: "transparent", fg: "var(--tp-color-11)", w: "500", tagFg: "var(--tp-color-13)" })),
      districtTitle: district,
      districtAttractions: atts.length ? atts : [{ name: "Nothing added yet", type: "Add a place" }],
      districtFootnote: district + " · " + division + " Division · " + reg.name + " — " + atts.length + " places listed",
      breadcrumb: reg.name + " › " + division + " › " + district,

      popularTitle: interest === "All" ? "Most loved places in Pakistan" : interestLabel + " people love",
      popular,
      heroImg: this.photo("$hero", this.img("lake,mountains", 7, 1600, 900)),
      nearImg: this.photo("$near", this.img("desert,dunes", 33, 900, 600)),
      footerImg: this.photo("$footer", this.img("mountain,snow", 45, 1600, 700)),
      districtImg: this.photo(district, this.img("valley,green", 21, 1200, 800)),
      routes: [
        { name: "The mountain highway", days: "7 days · Islamabad to Khunjerab", stops: "Besham · Chilas · Gilgit · Hunza · Passu", slot: "route-kkh", img: this.photo("The mountain highway", this.img("karakoram,mountain,road", 501, 900, 620)) },
        { name: "Desert and old palaces", days: "4 days · around Bahawalpur", stops: "Noor Mahal · Derawar · Lal Suhanra · Uch Sharif", slot: "route-cholistan", img: this.photo("Desert and old palaces", this.img("desert,fort,palace", 502, 900, 620)) },
        { name: "Drive by the sea", days: "5 days · Karachi to Gwadar", stops: "Kund Malir · Hingol · Ormara · Astola", slot: "route-makran", img: this.photo("Drive by the sea", this.img("coast,sea,road", 503, 900, 620)) }
      ],
      utilities: [
        { glyph: "♥", title: "Your saved places", body: "Save any place you like. Come back and make a trip from them.", cta: "See saved" },
        { glyph: "⛰", title: "Papers and passes", body: "Some areas need a permit. See which ones, and which roads are open.", cta: "Check now" },
        { glyph: "⌁", title: "How to get there", body: "Flights, buses, jeep rates and how long each drive takes.", cta: "See travel help" }
      ],
      seasons: wpSeasons || [
        { months: "April to June", where: "Gilgit-Baltistan, Swat", note: "Flowers and open valleys" },
        { months: "July to September", where: "Deosai, Neelum, Kumrat", note: "All high roads open" },
        { months: "October to November", where: "Hunza, Skardu", note: "Best colours, less crowd" },
        { months: "December to February", where: "Malam Jabba, Murree", note: "Snow time and ski" },
        { months: "November to February", where: "Cholistan, Thar, Makran", note: "Desert and sea feel nice" },
        { months: "All year", where: "Lahore, Islamabad, Karachi", note: "Old city walks and food" }
      ],
      footerColumns: [
        { title: "Regions", links: this.regions.map(r => r.name) },
        { title: "Top districts", links: ["Hunza", "Skardu", "Swat", "Chitral", "Neelum", "Mansehra", "Bahawalpur", "Lasbela"] },
        { title: "Things to do", links: ["Walks and treks", "Old places", "Snow and ski", "Food trips", "Desert safari", "Animal parks"] },
        { title: "Plan", links: ["Trip ideas", "Permits", "Where to sleep", "How to travel", "Stay safe", "Festival dates"] },
        { title: "About", links: ["About us", "Add a place", "Tell us a change", "Contact", "Privacy", "Terms"] }
      ]
    };
  }
}
