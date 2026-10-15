/**
 * CHHOTE LAL PROPERTY DEALER - CONFIGURATION & CONSTANTS
 * Location: Near Sai Ideal Public Academy, Varanasi, UP, India
 * Phone: 9664280667 | WhatsApp: https://wa.me/919664280667
 */

const APP_CONFIG = {
  business: {
    name: "Chhote Lal Property Dealer",
    hindiName: "छोटे लाल प्रॉपर्टी डीलर",
    tagline: "Varanasi's Trusted Plot & House Dealer",
    location: "Near Sai Ideal Public Academy, Varanasi, Uttar Pradesh, India",
    phone: "9664280667",
    phoneDisplay: "+91 96642 80667",
    phoneLink: "tel:9664280667",
    whatsappNumber: "919664280667",
    whatsappLink: "https://wa.me/919664280667",
    disclaimer: "सूचना: यह वेबसाइट केवल प्रॉपर्टी की प्राथमिक जानकारी प्रदान करती है। किसी भी सौदे, बयाने या भुगतान से पूर्व सभी राजस्व दस्तावेजों, टाइटल, सीमाओं और स्वामित्व की स्वयं प्रत्यक्ष जांच अवश्य करें।"
  },
  
  // Supabase Configuration
  // Can be filled with your actual Supabase Project URL and Anon Key
  supabase: {
    url: window.__ENV?.SUPABASE_URL || localStorage.getItem('CL_SUPABASE_URL') || "",
    anonKey: window.__ENV?.SUPABASE_ANON_KEY || localStorage.getItem('CL_SUPABASE_KEY') || "",
    storageBucket: "property-images"
  },

  // Security Credentials for Demo/Offline fallback
  // In live production, authentication is handled via Supabase Auth
  adminSessionKey: "cl_admin_authenticated_session"
};

/**
 * Generate a clean, properly URL-encoded WhatsApp link
 * @param {string} message - Text message to encode
 * @returns {string} - Full WhatsApp URL
 */
function createWhatsAppLink(message) {
  const base = APP_CONFIG.business.whatsappLink;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message.trim())}`;
}

/**
 * Generate a prefilled WhatsApp inquiry message for a specific property
 * @param {Object} prop - Property object
 * @returns {string} - Full WhatsApp URL
 */
function getPropertyWhatsAppLink(prop) {
  const priceDisplay = prop.priceOnRequest ? "कीमत पूछें (Price on Request)" : `₹${prop.priceText || prop.price}`;
  const msg = `नमस्ते छोटे लाल जी, मुझे आपकी वेबसाइट पर लिस्टेड प्रॉपर्टी के बारे में जानकारी चाहिए:
- प्रॉपर्टी आईडी: ${prop.id}
- शीर्षक: ${prop.title}
- प्रकार: ${prop.type}
- स्थान: ${prop.locality}
- कीमत: ${priceDisplay}
कृपया उपलब्ध समय और विज़िट की प्रक्रिया बताएं।`;
  return createWhatsAppLink(msg);
}

// Export for usage across scripts
window.APP_CONFIG = APP_CONFIG;
window.createWhatsAppLink = createWhatsAppLink;
window.getPropertyWhatsAppLink = getPropertyWhatsAppLink;
