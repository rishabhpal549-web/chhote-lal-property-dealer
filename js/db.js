/**
 * CHHOTE LAL PROPERTY DEALER - DATABASE & STORAGE LAYER
 * Supports Supabase PostgreSQL & Storage with offline/browser persistence fallback
 */

const DB_KEYS = {
  PROPERTIES: "cl_properties_data_v1",
  BUYER_ENQUIRIES: "cl_buyer_enquiries_v1",
  SELLER_ENQUIRIES: "cl_seller_enquiries_v1"
};

// Initial verified listings with illustrative design previews explicitly labeled
const INITIAL_PROPERTIES = [
  {
    id: "prop-var-001",
    title: "बाबतपुर रोड के पास आवासीय कॉर्नर प्लॉट (Residential Corner Plot)",
    type: "Plot",
    typeHindi: "प्लॉट",
    locality: "बाबतपुर रोड (Babatpur Road), वाराणसी",
    localityArea: "Babatpur",
    price: 2450000,
    priceText: "24.5 लाख",
    priceOnRequest: false,
    area: 1360,
    areaUnit: "sq.ft (वर्ग फीट)",
    status: "Available",
    statusHindi: "उपलब्ध",
    isIllustrative: true,
    featured: true,
    images: [
      "images/plot-sample.jpg"
    ],
    description: "बाबतपुर मुख्य मार्ग से सुगम पहुंच वाला आवासीय कॉर्नर प्लॉट। 30 फीट चौड़ा पक्का रास्ता, सामने खुला वातावरण, तत्काल निर्माण योग्य। आस-पास सुविकसित आबादी और बिजली के खंभे उपलब्ध हैं।",
    facilities: [
      "30 फीट चौड़ा पक्का संपर्क मार्ग",
      "कॉर्नर प्लॉट (दो तरफ खुला)",
      "बिजली आपूर्ति लाइन उपलब्ध",
      "मीठे पानी का भूजल स्तर",
      "स्पष्ट एवं विवाद रहित सीमांकन"
    ],
    bedrooms: null,
    bathrooms: null,
    createdAt: "2026-10-10T10:00:00.000Z"
  },
  {
    id: "prop-var-002",
    title: "रोहनिया जीटी रोड के पास स्वतंत्र 3 BHK मकान (Independent House)",
    type: "House",
    typeHindi: "मकान",
    locality: "रोहनिया (Rohania), वाराणसी",
    localityArea: "Rohania",
    price: 6800000,
    priceText: "68 लाख",
    priceOnRequest: false,
    area: 1850,
    areaUnit: "sq.ft (वर्ग फीट)",
    status: "Available",
    statusHindi: "उपलब्ध",
    isIllustrative: true,
    featured: true,
    images: [
      "images/house-sample.jpg"
    ],
    description: "शांत एवं सुरक्षित पारिवारिक कॉलोनी में दो मंजिला स्वतंत्र 3 BHK मकान। कार पार्किंग, खुली छत, मॉड्यूलर किचन का प्रावधान, बालकनी और मजबूत निर्माण। स्कूल और दैनिक बाजार चंद मिनटों की दूरी पर।",
    facilities: [
      "निजी कार पार्किंग स्पेस",
      "स्वतंत्र छत एवं बालकनी",
      "24 घंटे सबमर्सिबल पानी",
      "मजबूत लोहे का मुख्य गेट व बाउंड्री",
      "25 फीट चौड़ी इंटरलॉकिंग सड़क"
    ],
    bedrooms: 3,
    bathrooms: 3,
    createdAt: "2026-10-12T14:30:00.000Z"
  },
  {
    id: "prop-var-003",
    title: "शिवपुर बाईपास के पास मुख्य मार्ग से लगी जमीन (Commercial/Res. Land)",
    type: "Land",
    typeHindi: "जमीन",
    locality: "शिवपुर बाईपास (Shivpur Bypass), वाराणसी",
    localityArea: "Shivpur",
    price: 14500000,
    priceText: "1.45 करोड़",
    priceOnRequest: false,
    area: 12,
    areaUnit: "Biswa (16,320 sq.ft)",
    status: "Under Discussion",
    statusHindi: "बातचीत जारी",
    isIllustrative: true,
    featured: true,
    images: [
      "images/land-sample.jpg"
    ],
    description: "शिवपुर रिंग रोड बाईपास के समीप मुख्य पक्की सड़क से सटी विशाल भूखंड/जमीन। वेयरहाउस, मैरिज लॉन, फार्महाउस या आवासीय प्रोजेक्ट के लिए उपयुक्त। चौड़ा फ्रंट व सीधा संपर्क मार्ग।",
    facilities: [
      "मुख्य 60 फीट सड़क से सीधी कनेक्टिविटी",
      "विशाल 100+ फीट फ्रंट",
      "एचटी लाइन से मुक्त सुरक्षित क्षेत्र",
      "समतल एवं भराव की आवश्यकता रहित जमीन"
    ],
    bedrooms: null,
    bathrooms: null,
    createdAt: "2026-10-08T09:15:00.000Z"
  },
  {
    id: "prop-var-004",
    title: "सारनाथ रिंग रोड फेज-2 के पास गेटेड कॉलोनी प्लॉट (Colony Plot)",
    type: "Plot",
    typeHindi: "प्लॉट",
    locality: "सारनाथ रिंग रोड (Near Sarnath), वाराणसी",
    localityArea: "Sarnath",
    price: 0,
    priceText: "कीमत पूछें",
    priceOnRequest: true,
    area: 1000,
    areaUnit: "sq.ft (वर्ग फीट)",
    status: "Available",
    statusHindi: "उपलब्ध",
    isIllustrative: true,
    featured: false,
    images: [
      "images/plot-sample.jpg"
    ],
    description: "सारनाथ के शांत व सांस्कृतिक क्षेत्र में स्थित आवासीय भूखंड। रिंग रोड से 500 मीटर। साफ-सुथरा वातावरण, मंदिर व बौद्ध स्मारक चंद किलोमीटर की दूरी पर। कीमत व भुगतान शर्तों के लिए संपर्क करें।",
    facilities: [
      "22 फीट चौड़ी कॉलोनी रोड",
      "बिजली ट्रांसफार्मर स्थापित",
      "शांत व प्रदूषण मुक्त वातावरण",
      "तुरंत रजिस्ट्री व पजेशन"
    ],
    bedrooms: null,
    bathrooms: null,
    createdAt: "2026-10-05T11:20:00.000Z"
  },
  {
    id: "prop-var-005",
    title: "मंडुआडीह / DLW के समीप 2 BHK पक्का मकान (Sold Property Reference)",
    type: "House",
    typeHindi: "मकान",
    locality: "मंडुआडीह (Near Manduadih), वाराणसी",
    localityArea: "Manduadih",
    price: 5200000,
    priceText: "52 लाख",
    priceOnRequest: false,
    area: 1250,
    areaUnit: "sq.ft (वर्ग फीट)",
    status: "Sold",
    statusHindi: "बिक चुका है (Sold)",
    isIllustrative: true,
    featured: false,
    images: [
      "images/house-sample.jpg"
    ],
    description: "मंडुआडीह रेलवे स्टेशन एवं DLW परिसर के निकट एकल परिवार हेतु उपयुक्त 2 BHK पक्का मकान। यह प्रॉपर्टी सफलतापूर्वक बिक चुकी है (Sold record for reference)।",
    facilities: [
      "रोड फेसिंग",
      "2 बेडरूम + हॉल + किचन",
      "निजी बोरिंग"
    ],
    bedrooms: 2,
    bathrooms: 2,
    createdAt: "2026-09-28T16:00:00.000Z"
  }
];

// Initial Enquiries for Admin verification
const INITIAL_BUYER_ENQUIRIES = [
  {
    id: "enq-b-101",
    name: "राजेश कुमार सिंह",
    phone: "9838012345",
    propertyType: "Plot",
    locality: "बाबतपुर / शिवपुर",
    budget: "20-25 लाख",
    message: "1200 से 1500 sq.ft का प्लॉट चाहिए, रजिस्ट्री तुरंत करानी है।",
    consent: true,
    status: "New",
    notes: "कॉल करके Babatpur प्लॉट दिखाने के लिए समय तय करना है।",
    createdAt: "2026-10-14T09:30:00.000Z"
  },
  {
    id: "enq-b-102",
    name: "अमित श्रीवास्तव",
    phone: "9450054321",
    propertyType: "House",
    locality: "रोहनिया या लंका के पास",
    budget: "60-70 लाख",
    message: "तैयार मकान चाहिए जिसमें 3 बेडरूम और कार पार्किंग हो।",
    consent: true,
    status: "Contacted",
    notes: "बातचीत हुई, रविवार को विजिट का प्लान है।",
    createdAt: "2026-10-13T11:45:00.000Z"
  }
];

const INITIAL_SELLER_ENQUIRIES = [
  {
    id: "enq-s-201",
    ownerName: "दिनेश चंद्र यादव",
    phone: "9125587654",
    propertyType: "Plot",
    locality: "लहरतारा बाईपास के समीप",
    area: "1500",
    areaUnit: "sq.ft",
    expectedPrice: "30 लाख",
    description: "कॉलोनी में पूर्व मुखी प्लॉट है, रास्ते की चौड़ाई 25 फीट है।",
    photos: ["images/plot-sample.jpg"],
    consent: true,
    status: "In Progress",
    notes: "दस्तावेजों की जांच और साइट विजिट पेंडिंग है।",
    createdAt: "2026-10-13T15:20:00.000Z"
  }
];

class PropertyDB {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem(DB_KEYS.PROPERTIES)) {
      localStorage.setItem(DB_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
    }
    if (!localStorage.getItem(DB_KEYS.BUYER_ENQUIRIES)) {
      localStorage.setItem(DB_KEYS.BUYER_ENQUIRIES, JSON.stringify(INITIAL_BUYER_ENQUIRIES));
    }
    if (!localStorage.getItem(DB_KEYS.SELLER_ENQUIRIES)) {
      localStorage.setItem(DB_KEYS.SELLER_ENQUIRIES, JSON.stringify(INITIAL_SELLER_ENQUIRIES));
    }
  }

  // --- PROPERTIES CRUD ---
  async getProperties(filters = {}) {
    const raw = localStorage.getItem(DB_KEYS.PROPERTIES);
    let list = raw ? JSON.parse(raw) : [];

    // Filter by type
    if (filters.type && filters.type !== "all" && filters.type !== "") {
      list = list.filter(p => p.type.toLowerCase() === filters.type.toLowerCase());
    }

    // Filter by locality / search query
    if (filters.locality && filters.locality.trim() !== "") {
      const q = filters.locality.toLowerCase().trim();
      list = list.filter(p => 
        p.locality.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.localityArea && p.localityArea.toLowerCase().includes(q))
      );
    }

    // Filter by status
    if (filters.status && filters.status !== "all" && filters.status !== "") {
      list = list.filter(p => p.status.toLowerCase() === filters.status.toLowerCase());
    }

    // Filter by Min Budget
    if (filters.minBudget && !isNaN(Number(filters.minBudget)) && Number(filters.minBudget) > 0) {
      list = list.filter(p => p.price >= Number(filters.minBudget));
    }

    // Filter by Max Budget
    if (filters.maxBudget && !isNaN(Number(filters.maxBudget)) && Number(filters.maxBudget) > 0) {
      list = list.filter(p => p.price <= Number(filters.maxBudget) || p.priceOnRequest);
    }

    // Sorting
    if (filters.sort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (filters.sort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else {
      // Default: latest first
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }

  async getPropertyById(id) {
    const list = await this.getProperties();
    return list.find(p => p.id === id) || null;
  }

  async addProperty(propertyData) {
    const list = await this.getProperties();
    const newProperty = {
      id: "prop-" + Date.now(),
      title: propertyData.title.trim(),
      type: propertyData.type,
      typeHindi: propertyData.type === "Plot" ? "प्लॉट" : propertyData.type === "House" ? "मकान" : "जमीन",
      locality: propertyData.locality.trim(),
      localityArea: propertyData.localityArea || propertyData.locality.split(",")[0].trim(),
      price: Number(propertyData.price) || 0,
      priceText: propertyData.priceText || (propertyData.priceOnRequest ? "कीमत पूछें" : `${propertyData.price}`),
      priceOnRequest: Boolean(propertyData.priceOnRequest),
      area: Number(propertyData.area) || 0,
      areaUnit: propertyData.areaUnit || "sq.ft",
      status: propertyData.status || "Available",
      statusHindi: propertyData.status === "Available" ? "उपलब्ध" : propertyData.status === "Under Discussion" ? "बातचीत जारी" : "बिक चुका है (Sold)",
      isIllustrative: Boolean(propertyData.isIllustrative),
      featured: Boolean(propertyData.featured),
      images: propertyData.images && propertyData.images.length > 0 ? propertyData.images : ["images/plot-sample.jpg"],
      description: propertyData.description ? propertyData.description.trim() : "",
      facilities: Array.isArray(propertyData.facilities) ? propertyData.facilities : [],
      bedrooms: propertyData.bedrooms ? Number(propertyData.bedrooms) : null,
      bathrooms: propertyData.bathrooms ? Number(propertyData.bathrooms) : null,
      createdAt: new Date().toISOString()
    };

    list.unshift(newProperty);
    localStorage.setItem(DB_KEYS.PROPERTIES, JSON.stringify(list));
    return newProperty;
  }

  async updateProperty(id, updateData) {
    const list = await this.getProperties();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) throw new Error("प्रॉपर्टी नहीं मिली (Property not found)");

    list[idx] = {
      ...list[idx],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Update hindi badges if type or status changed
    if (updateData.type) {
      list[idx].typeHindi = updateData.type === "Plot" ? "प्लॉट" : updateData.type === "House" ? "मकान" : "जमीन";
    }
    if (updateData.status) {
      list[idx].statusHindi = updateData.status === "Available" ? "उपलब्ध" : updateData.status === "Under Discussion" ? "बातचीत जारी" : "बिक चुका है (Sold)";
    }

    localStorage.setItem(DB_KEYS.PROPERTIES, JSON.stringify(list));
    return list[idx];
  }

  async deleteProperty(id) {
    let list = await this.getProperties();
    const originalLen = list.length;
    list = list.filter(p => p.id !== id);
    if (list.length === originalLen) {
      throw new Error("प्रॉपर्टी नहीं मिली");
    }
    localStorage.setItem(DB_KEYS.PROPERTIES, JSON.stringify(list));
    return true;
  }

  // --- BUYER ENQUIRIES ---
  async getBuyerEnquiries() {
    const raw = localStorage.getItem(DB_KEYS.BUYER_ENQUIRIES);
    const list = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async addBuyerEnquiry(data) {
    if (!data.name || !data.phone) {
      throw new Error("कृपया नाम और फ़ोन नंबर दर्ज करें।");
    }
    const cleanPhone = data.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      throw new Error("कृपया एक वैध 10-अंकीय फ़ोन नंबर दर्ज करें।");
    }

    const list = await this.getBuyerEnquiries();
    const newEnquiry = {
      id: "enq-b-" + Date.now(),
      name: data.name.trim(),
      phone: cleanPhone,
      propertyType: data.propertyType || "General",
      locality: data.locality ? data.locality.trim() : "Not specified",
      budget: data.budget ? data.budget.trim() : "Not specified",
      message: data.message ? data.message.trim() : "",
      propertyId: data.propertyId || null,
      propertyTitle: data.propertyTitle || null,
      consent: Boolean(data.consent),
      status: "New",
      notes: "",
      createdAt: new Date().toISOString()
    };

    list.unshift(newEnquiry);
    localStorage.setItem(DB_KEYS.BUYER_ENQUIRIES, JSON.stringify(list));
    return newEnquiry;
  }

  async updateBuyerEnquiryStatus(id, status, notes = null) {
    const list = await this.getBuyerEnquiries();
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) throw new Error("पूछताछ नहीं मिली");
    list[idx].status = status;
    if (notes !== null) {
      list[idx].notes = notes;
    }
    list[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(DB_KEYS.BUYER_ENQUIRIES, JSON.stringify(list));
    return list[idx];
  }

  // --- SELLER ENQUIRIES ---
  async getSellerEnquiries() {
    const raw = localStorage.getItem(DB_KEYS.SELLER_ENQUIRIES);
    const list = raw ? JSON.parse(raw) : [];
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async addSellerEnquiry(data) {
    if (!data.ownerName || !data.phone) {
      throw new Error("कृपया मालिक का नाम और फ़ोन नंबर अवश्य दर्ज करें।");
    }
    const cleanPhone = data.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      throw new Error("कृपया एक वैध 10-अंकीय फ़ोन नंबर दर्ज करें।");
    }

    const list = await this.getSellerEnquiries();
    const newSubmission = {
      id: "enq-s-" + Date.now(),
      ownerName: data.ownerName.trim(),
      phone: cleanPhone,
      propertyType: data.propertyType || "Plot",
      locality: data.locality ? data.locality.trim() : "",
      area: data.area ? data.area.trim() : "",
      areaUnit: data.areaUnit || "sq.ft",
      expectedPrice: data.expectedPrice ? data.expectedPrice.trim() : "Not specified",
      description: data.description ? data.description.trim() : "",
      photos: data.photos && data.photos.length > 0 ? data.photos : [],
      consent: Boolean(data.consent),
      status: "New",
      notes: "",
      createdAt: new Date().toISOString()
    };

    list.unshift(newSubmission);
    localStorage.setItem(DB_KEYS.SELLER_ENQUIRIES, JSON.stringify(list));
    return newSubmission;
  }

  async updateSellerEnquiryStatus(id, status, notes = null) {
    const list = await this.getSellerEnquiries();
    const idx = list.findIndex(e => e.id === id);
    if (idx === -1) throw new Error("सबमिशन नहीं मिला");
    list[idx].status = status;
    if (notes !== null) {
      list[idx].notes = notes;
    }
    list[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(DB_KEYS.SELLER_ENQUIRIES, JSON.stringify(list));
    return list[idx];
  }
}

// Global instance
window.db = new PropertyDB();
