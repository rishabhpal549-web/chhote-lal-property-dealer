/**
 * CHHOTE LAL PROPERTY DEALER - PROPERTY DETAILS CONTROLLER
 * Loads single property details, photo gallery, specs, facilities, enquiry form, and similar properties
 */

document.addEventListener('DOMContentLoaded', async () => {
  await initPropertyDetailsPage();
});

async function initPropertyDetailsPage() {
  const container = document.getElementById('property-details-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const propId = urlParams.get('id');

  if (!propId) {
    showNotFoundState(container, "कोई प्रॉपर्टी आईडी निर्दिष्ट नहीं की गई है।");
    return;
  }

  try {
    const prop = await window.db.getPropertyById(propId);
    if (!prop) {
      showNotFoundState(container, "यह प्रॉपर्टी उपलब्ध नहीं है या हटा दी गई है।");
      return;
    }

    // Update document title for SEO
    document.title = `${prop.title} | Chhote Lal Property Dealer Varanasi`;

    // Render Property Details
    renderPropertyDetails(prop, container);

    // Setup interactive photo gallery thumbnails
    setupGallery();

    // Setup property-specific enquiry form
    setupEnquiryForm(prop);

    // Load similar properties
    loadSimilarProperties(prop);

  } catch (err) {
    console.error("Error loading property:", err);
    showNotFoundState(container, "विवरण लोड करने में समस्या आई।");
  }
}

function showNotFoundState(container, message) {
  container.innerHTML = `
    <div class="empty-state-box" style="margin: 60px auto;">
      <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <h2 class="empty-state-title">प्रॉपर्टी नहीं मिली (Property Not Found)</h2>
      <p class="empty-state-desc">${message}</p>
      <div style="display:flex; justify-content:center; gap:12px; margin-top:20px;">
        <a href="properties.html" class="btn btn-navy">सभी प्रॉपर्टीज देखें</a>
        <a href="index.html" class="btn btn-gold">होम पेज पर जाएं</a>
      </div>
    </div>
  `;
}

function renderPropertyDetails(prop, container) {
  const statusClass = prop.status === 'Available' ? 'status-available' : prop.status === 'Under Discussion' ? 'status-discussion' : 'status-sold';
  const statusLabel = prop.statusHindi || (prop.status === 'Available' ? 'उपलब्ध' : prop.status === 'Under Discussion' ? 'बातचीत जारी' : 'बिक चुका है');
  const priceDisplay = prop.priceOnRequest ? "कीमत पूछें (Price on Request)" : `₹${prop.priceText || prop.price.toLocaleString('en-IN')}`;

  const whatsappUrl = window.getPropertyWhatsAppLink(prop);

  // Facilities list HTML
  let facilitiesHTML = '';
  if (prop.facilities && prop.facilities.length > 0) {
    facilitiesHTML = `
      <div style="margin-top: 32px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--navy-primary); margin-bottom: 14px;">पुष्टीकृत सुविधाएं एवं विशेषताएं (Confirmed Facilities)</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">* केवल वही सुविधाएं सूचीबद्ध हैं जिनकी डीलर/मालिक द्वारा पुष्टि की गई है।</p>
        <ul class="facilities-list">
          ${prop.facilities.map(f => `
            <li class="facility-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // House specs (Bedrooms / Bathrooms)
  let houseSpecsHTML = '';
  if (prop.type === 'House' && prop.bedrooms) {
    houseSpecsHTML = `
      <div class="detail-spec-box">
        <span class="label">कमरे (Bedrooms)</span>
        <span class="value">${prop.bedrooms} BHK</span>
      </div>
      <div class="detail-spec-box">
        <span class="label">शौचालय (Bathrooms)</span>
        <span class="value">${prop.bathrooms || 'विवरण कन्फर्म होना शेष'}</span>
      </div>
    `;
  }

  // Images gallery
  const mainImage = prop.images && prop.images[0] ? prop.images[0] : 'images/plot-sample.jpg';
  const illustrativeNotice = prop.isIllustrative ? `
    <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; padding: 12px 16px; border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: 24px; display: flex; align-items: center; gap: 10px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span><strong>सूचना:</strong> यह फोटो केवल सांकेतिक डिजाइन पूर्वावलोकन (Illustrative Design Preview) है। वास्तविक साइट फोटो या प्रत्यक्ष निरीक्षण के लिए डीलर से संपर्क करें।</span>
    </div>
  ` : '';

  container.innerHTML = `
    <!-- Breadcrumb -->
    <div class="breadcrumb-nav" style="margin-bottom: 24px;">
      <a href="index.html">होम</a>
      <span>/</span>
      <a href="properties.html">प्रॉपर्टीज</a>
      <span>/</span>
      <span>${prop.typeHindi || prop.type}</span>
      <span>/</span>
      <span style="color:var(--text-muted);">${prop.id}</span>
    </div>

    <!-- Main Detail Grid -->
    <div class="detail-layout-grid">
      
      <!-- Left Column: Media & Full Specs -->
      <div>
        <div class="gallery-main">
          <img id="active-gallery-image" src="${mainImage}" alt="${prop.title}">
          <span class="property-badge-type gallery-badge">${prop.typeHindi || prop.type}</span>
          <span class="property-badge-status ${statusClass}" style="position:absolute; top:16px; right:16px;">${statusLabel}</span>
        </div>

        ${illustrativeNotice}

        <!-- Title & Location Bar -->
        <div style="margin-bottom: 24px;">
          <h1 style="font-size: 1.85rem; font-weight: 800; color: var(--navy-primary); line-height: 1.3; margin-bottom: 10px;">
            ${prop.title}
          </h1>
          <div style="display:flex; align-items:center; gap:8px; color: var(--text-muted); font-size: 0.95rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${prop.locality}</span>
          </div>
        </div>

        <!-- Specs Card -->
        <div class="detail-specs-card">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <span style="font-size: 0.8rem; text-transform:uppercase; color:var(--text-muted); font-weight:600;">मांग / अपेक्षित मूल्य</span>
              <div style="font-size: 1.8rem; font-weight: 800; color: var(--navy-primary);">${priceDisplay}</div>
            </div>
            <span class="admin-badge ${statusClass}" style="padding: 6px 14px; font-size: 0.85rem;">${statusLabel}</span>
          </div>

          <div class="detail-specs-grid">
            <div class="detail-spec-box">
              <span class="label">प्रॉपर्टी श्रेणी</span>
              <span class="value">${prop.typeHindi || prop.type}</span>
            </div>
            <div class="detail-spec-box">
              <span class="label">क्षेत्रफल (Area)</span>
              <span class="value">${prop.area} ${prop.areaUnit || 'वर्ग फीट'}</span>
            </div>
            <div class="detail-spec-box">
              <span class="label">प्रॉपर्टी आईडी</span>
              <span class="value" style="font-family:monospace; color:var(--gold-hover);">${prop.id}</span>
            </div>
            <div class="detail-spec-box">
              <span class="label">लोकेशन क्षेत्र</span>
              <span class="value">${prop.localityArea || prop.locality}</span>
            </div>
            ${houseSpecsHTML}
          </div>

          <!-- Detailed Description -->
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--navy-primary); margin-bottom: 12px;">विस्तृत विवरण (Description)</h3>
          <p style="font-size: 0.95rem; line-height: 1.7; color: var(--text-charcoal); white-space: pre-line;">
            ${prop.description || 'डीलर द्वारा अतिरिक्त विवरण बातचीत के दौरान साझा किया जाएगा।'}
          </p>

          ${facilitiesHTML}
        </div>

        <!-- Strict Legal Disclaimer Box -->
        <div class="footer-disclaimer-box" style="margin-top: 24px; background-color: var(--pure-white); border-color: var(--border-grey); color: var(--text-charcoal);">
          <strong style="color: var(--navy-primary);">कानूनी एवं सत्यापन सूचना (Verification Disclaimer):</strong><br>
          छोटे लाल प्रॉपर्टी डीलर द्वारा यह जानकारी मालिक/विक्रेता के आधार पर प्रदर्शित की गई है। किसी भी स्वामित्व, खतौनी, बैनामा, सीमांकन अथवा सरकारी अनुमतियों की कानूनी गारंटी डीलर द्वारा नहीं दी जाती है। इच्छुक खरीदार को परामर्श दिया जाता है कि वे लेनदेन पूर्व अपने स्तर पर मूल राजस्व अभिलेखों की जांच अवश्य कर लें।
        </div>
      </div>

      <!-- Right Column: Sticky Contact & Enquiry Form -->
      <div class="sticky-sidebar">
        <div class="contact-card-sidebar">
          
          <div class="dealer-mini-profile">
            <div class="dealer-avatar">CL</div>
            <div>
              <div class="dealer-name">Chhote Lal Property Dealer</div>
              <div class="dealer-role">Near Sai Ideal Public Academy, Varanasi</div>
            </div>
          </div>

          <div class="sidebar-actions">
            <a href="tel:9664280667" class="btn btn-navy btn-lg" style="width:100%;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>कॉल करें: 9664280667</span>
            </a>

            <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-lg" style="width:100%;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              <span>WhatsApp पर पूछताछ करें</span>
            </a>
          </div>

          <hr style="border:none; border-top:1px solid var(--border-grey); margin: 24px 0;">

          <!-- Direct Enquiry Form for this property -->
          <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--navy-primary); margin-bottom: 8px;">
            इस प्रॉपर्टी के बारे में संदेश भेजें
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">
            अपनी जानकारी भेजें, डीलर आपसे शीघ्र संपर्क करेंगे।
          </p>

          <div id="property-enquiry-banner" class="feedback-banner"></div>

          <form id="property-detail-enquiry-form">
            <input type="hidden" name="propertyId" value="${prop.id}">
            <input type="hidden" name="propertyTitle" value="${prop.title}">
            <input type="hidden" name="propertyType" value="${prop.type}">

            <!-- Anti-spam Honeypot -->
            <input type="text" name="website_url_check" style="display:none;" tabindex="-1" autocomplete="off">

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label" for="detail-enq-name">आपका नाम *</label>
              <input type="text" id="detail-enq-name" name="name" class="form-control" required placeholder="अपना पूरा नाम लिखें">
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label" for="detail-enq-phone">फ़ोन नंबर (Phone) *</label>
              <input type="tel" id="detail-enq-phone" name="phone" class="form-control" required placeholder="10-अंकीय मोबाइल नंबर" pattern="[0-9]{10}">
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label" for="detail-enq-msg">संदेश / सवाल (Optional)</label>
              <textarea id="detail-enq-msg" name="message" class="form-control" rows="3" placeholder="उदा. क्या साइट विजिट कल संभव है?"></textarea>
            </div>

            <div style="margin-bottom: 18px;">
              <label class="form-checkbox-label">
                <input type="checkbox" name="consent" required checked>
                <span>मैं सहमत हूँ कि छोटे लाल प्रॉपर्टी डीलर इस प्रॉपर्टी के बारे में मुझसे फ़ोन या WhatsApp पर संपर्क कर सकते हैं।</span>
              </label>
            </div>

            <button type="submit" id="detail-enq-submit-btn" class="btn btn-gold btn-md" style="width:100%;">
              पूछताछ भेजें (Submit Enquiry)
            </button>
          </form>

        </div>
      </div>

    </div>

    <!-- Similar Listings Section -->
    <div id="similar-properties-section" style="margin-top: 64px;">
      <div class="section-header" style="text-align:left; margin-bottom: 28px;">
        <span class="section-tag">संबंधित विकल्प</span>
        <h2 class="section-title">इसी श्रेणी की अन्य प्रॉपर्टीज (Similar Properties)</h2>
      </div>
      <div id="similar-properties-grid" class="property-grid">
        <!-- Rendered via JS -->
      </div>
    </div>
  `;
}

function setupGallery() {
  // If multiple images are supported in future, attach thumbnail click listeners
  const thumbs = document.querySelectorAll('.gallery-thumb-item');
  const mainImg = document.getElementById('active-gallery-image');
  if (!thumbs.length || !mainImg) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const targetSrc = thumb.getAttribute('data-full-img');
      if (targetSrc) mainImg.src = targetSrc;
    });
  });
}

function setupEnquiryForm(prop) {
  const form = document.getElementById('property-detail-enquiry-form');
  const banner = document.getElementById('property-enquiry-banner');
  const submitBtn = document.getElementById('detail-enq-submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check Honeypot field
    const honeypot = form.querySelector('[name="website_url_check"]');
    if (honeypot && honeypot.value !== '') {
      console.warn("Spam submission prevented.");
      return;
    }

    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      propertyType: prop.type,
      propertyId: prop.id,
      propertyTitle: prop.title,
      locality: prop.locality,
      message: formData.get('message'),
      consent: formData.get('consent') === 'on'
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "सबमिट हो रहा है...";

    try {
      const saved = await window.db.addBuyerEnquiry(data);
      banner.className = "feedback-banner success";
      banner.innerHTML = `<strong>धन्यवाद ${saved.name}!</strong> आपकी पूछताछ सफलतापूर्वक प्राप्त हो गई है। छोटे लाल जी शीघ्र ही आपसे <strong>${saved.phone}</strong> पर संपर्क करेंगे।`;
      form.reset();
    } catch (err) {
      banner.className = "feedback-banner error";
      banner.innerHTML = `त्रुटि: ${err.message || 'पूछताछ दर्ज करने में समस्या आई।'}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "पूछताछ भेजें (Submit Enquiry)";
    }
  });
}

async function loadSimilarProperties(currentProp) {
  const grid = document.getElementById('similar-properties-grid');
  const section = document.getElementById('similar-properties-section');
  if (!grid || !section) return;

  try {
    const list = await window.db.getProperties({ type: currentProp.type, status: 'Available' });
    const similar = list.filter(p => p.id !== currentProp.id).slice(0, 3);

    if (similar.length === 0) {
      section.style.display = 'none';
      return;
    }

    grid.innerHTML = similar.map(p => window.renderPropertyCardHTML(p)).join('');
  } catch (err) {
    console.error("Error loading similar:", err);
    section.style.display = 'none';
  }
}
